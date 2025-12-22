
export type ActionMode = 'jump' | 'punch' | 'kick' | 'slap';

export interface GameState {
    birdY: number;
    birdVelocity: number;
    pipes: Pipe[];
    score: number;
    isGameOver: boolean;
    intensity: number; // For screen shake
    reactions: Reaction[];
}

interface Pipe {
    x: number;
    topHeight: number;
    gapSize: number;
    passed: boolean;
}

interface Reaction {
    id: number;
    text: string;
    x: number;
    y: number;
    opacity: number;
    scale: number;
}

export class GameEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private birdImg: HTMLImageElement | null = null;
    private lastTime: number = 0;
    private frameId: number | null = null;

    // Constants
    private readonly GRAVITY = 0.4;
    private readonly PIPE_SPEED = 3.5;
    private readonly PIPE_SPAWN_RATE = 1600; // ms
    private readonly BIRD_SIZE = 45;

    private state: GameState = {
        birdY: 300,
        birdVelocity: 0,
        pipes: [],
        score: 0,
        isGameOver: false,
        intensity: 0,
        reactions: []
    };

    private lastPipeTime: number = 0;
    private reactionIdCounter = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');
        this.ctx = context;
    }

    private get birdX() {
        return this.canvas.width / 2 - this.BIRD_SIZE / 2;
    }

    setBirdImage(src: string) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            this.birdImg = img;
        };
    }

    start() {
        this.state = {
            birdY: this.canvas.height / 2,
            birdVelocity: 0,
            pipes: [],
            score: 0,
            isGameOver: false,
            intensity: 0,
            reactions: []
        };
        this.lastTime = performance.now();
        this.lastPipeTime = 0;
        if (this.frameId) cancelAnimationFrame(this.frameId);
        this.loop();
    }

    private loop = () => {
        const now = performance.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;

        if (!this.state.isGameOver) {
            this.update(deltaTime);
        }
        this.draw();
        this.frameId = requestAnimationFrame(this.loop);
    };

    private update(dt: number) {
        // Bird physics
        this.state.birdVelocity += this.GRAVITY;
        this.state.birdY += this.state.birdVelocity;

        // Pipe spawning
        this.lastPipeTime += dt;
        if (this.lastPipeTime > this.PIPE_SPAWN_RATE) {
            this.spawnPipe();
            this.lastPipeTime = 0;
        }

        // Pipe update
        this.state.pipes.forEach(pipe => {
            pipe.x -= this.PIPE_SPEED;
        });

        // Remove off-screen pipes
        this.state.pipes = this.state.pipes.filter(p => p.x > -100);

        // Score & Collision
        const bx = this.birdX;
        this.state.pipes.forEach(pipe => {
            // Score
            if (!pipe.passed && pipe.x < bx) {
                pipe.passed = true;
                this.state.score++;
            }

            // Collision
            // Adding a small padding (5px) for fairer collision
            const padding = 8;
            if (
                bx + this.BIRD_SIZE - padding > pipe.x &&
                bx + padding < pipe.x + 60 &&
                (this.state.birdY + padding < pipe.topHeight || this.state.birdY + this.BIRD_SIZE - padding > pipe.topHeight + pipe.gapSize)
            ) {
                this.state.isGameOver = true;
            }
        });

        // Floor/Ceiling collision
        if (this.state.birdY < 0 || this.state.birdY + this.BIRD_SIZE > this.canvas.height) {
            this.state.isGameOver = true;
        }

        // Screen shake decay
        if (this.state.intensity > 0) {
            this.state.intensity *= 0.92;
            if (this.state.intensity < 0.1) this.state.intensity = 0;
        }

        // Reactions update
        this.state.reactions.forEach(r => {
            r.y -= 1.5;
            r.opacity -= 0.015;
            r.scale += 0.005;
        });
        this.state.reactions = this.state.reactions.filter(r => r.opacity > 0);
    }

    private spawnPipe() {
        // Difficulty curve based on score
        const scoreFactor = Math.min(this.state.score / 20, 1); // 0 to 1 over 20 points

        // Start easy (large gap), get harder
        const baseMinGap = 240;
        const baseMaxGap = 300;
        const targetMinGap = 140;
        const targetMaxGap = 180;

        const currentMin = baseMinGap - (baseMinGap - targetMinGap) * scoreFactor;
        const currentMax = baseMaxGap - (baseMaxGap - targetMaxGap) * scoreFactor;

        const gapSize = Math.random() * (currentMax - currentMin) + currentMin;

        const minHeight = 60;
        const maxHeight = this.canvas.height - gapSize - 60;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        this.state.pipes.push({
            x: this.canvas.width + 100,
            topHeight,
            gapSize,
            passed: false
        });
    }

    performAction(mode: ActionMode) {
        if (this.state.isGameOver) return;

        let jumpForce = -7.5;
        let reactionText = "UP!";

        switch (mode) {
            case 'jump':
                jumpForce = -7.5;
                reactionText = "WEEEEE!";
                break;
            case 'punch':
                jumpForce = -6;
                this.state.intensity = 15;
                reactionText = "POW!";
                break;
            case 'kick':
                jumpForce = -9;
                reactionText = "KIAI!";
                break;
            case 'slap':
                jumpForce = -Math.random() * 6 - 3;
                reactionText = "SLAP!";
                break;
        }

        this.state.birdVelocity = jumpForce;
        this.addReaction(reactionText);
    }

    private addReaction(text: string) {
        this.state.reactions.push({
            id: this.reactionIdCounter++,
            text,
            x: this.birdX + this.BIRD_SIZE / 2,
            y: this.state.birdY - 20,
            opacity: 1,
            scale: 1
        });
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        if (this.state.intensity > 0) {
            const dx = (Math.random() - 0.5) * this.state.intensity;
            const dy = (Math.random() - 0.5) * this.state.intensity;
            this.ctx.translate(dx, dy);
        }

        // Draw Background
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#0f0f1a');
        grad.addColorStop(1, '#1b1b2f');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Pipes
        this.state.pipes.forEach(pipe => {
            const pipeWidth = 60;
            const gradPipe = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
            gradPipe.addColorStop(0, '#2dcf9a');
            gradPipe.addColorStop(0.5, '#4ecca3');
            gradPipe.addColorStop(1, '#2dcf9a');

            this.ctx.fillStyle = gradPipe;

            // Top pipe
            this.ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
            this.ctx.strokeStyle = '#1a1a2e';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.topHeight);

            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.topHeight + pipe.gapSize, pipeWidth, this.canvas.height);
            this.ctx.strokeRect(pipe.x, pipe.topHeight + pipe.gapSize, pipeWidth, this.canvas.height);

            // Pipe Cap Detail
            this.ctx.fillStyle = '#3ebc83';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);
            this.ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, pipeWidth + 10, 20);

            this.ctx.fillRect(pipe.x - 5, pipe.topHeight + pipe.gapSize, pipeWidth + 10, 20);
            this.ctx.strokeRect(pipe.x - 5, pipe.topHeight + pipe.gapSize, pipeWidth + 10, 20);
        });

        // Draw Bird
        const bx = this.birdX;
        if (this.birdImg) {
            // Add a subtle rotation based on velocity
            this.ctx.save();
            this.ctx.translate(bx + this.BIRD_SIZE / 2, this.state.birdY + this.BIRD_SIZE / 2);
            this.ctx.rotate(Math.min(Math.max(this.state.birdVelocity * 0.05, -0.5), 0.5));
            this.ctx.drawImage(this.birdImg, -this.BIRD_SIZE / 2, -this.BIRD_SIZE / 2, this.BIRD_SIZE, this.BIRD_SIZE);
            this.ctx.restore();
        } else {
            this.ctx.fillStyle = '#e94560';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = 'rgba(233, 69, 96, 0.5)';
            this.ctx.fillRect(bx, this.state.birdY, this.BIRD_SIZE, this.BIRD_SIZE);
            this.ctx.shadowBlur = 0;
        }

        // Draw Reactions
        this.ctx.textAlign = 'center';
        this.state.reactions.forEach(r => {
            this.ctx.save();
            this.ctx.globalAlpha = r.opacity;
            this.ctx.font = `black ${24 * r.scale}px sans-serif`;
            this.ctx.fillStyle = '#fff';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(r.text, r.x, r.y);
            this.ctx.fillText(r.text, r.x, r.y);
            this.ctx.restore();
        });

        this.ctx.restore();
    }

    getState() {
        return this.state;
    }

    stop() {
        if (this.frameId) cancelAnimationFrame(this.frameId);
    }
}

