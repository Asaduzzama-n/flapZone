
"use client";

import { useEffect, useRef, useState } from 'react';
import { GameEngine, ActionMode } from '@/lib/game-engine';
import { SetupOverlay } from './SetupOverlay';
import { GameOverOverlay } from './GameOverOverlay';

export function GameContainer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<GameEngine | null>(null);
    const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'GAMEOVER'>('SETUP');
    const [currentScore, setCurrentScore] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<ActionMode>('jump');

    useEffect(() => {
        if (canvasRef.current) {
            const updateSize = () => {
                if (canvasRef.current) {
                    canvasRef.current.width = window.innerWidth;
                    canvasRef.current.height = window.innerHeight;
                    if (!engineRef.current) {
                        engineRef.current = new GameEngine(canvasRef.current);
                    }
                }
            };

            updateSize();
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }
    }, []);

    useEffect(() => {
        const handleInteraction = (e: KeyboardEvent | MouseEvent | TouchEvent) => {
            if (gameState === 'PLAYING') {
                if (e instanceof KeyboardEvent && e.code !== 'Space') return;
                engineRef.current?.performAction(selectedMode);
            }
        };

        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('mousedown', handleInteraction);

        const interval = setInterval(() => {
            if (engineRef.current && gameState === 'PLAYING') {
                const state = engineRef.current.getState();
                setCurrentScore(state.score);
                if (state.isGameOver) {
                    setGameState('GAMEOVER');
                }
            }
        }, 100);

        return () => {
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('mousedown', handleInteraction);
            clearInterval(interval);
        };
    }, [gameState, selectedMode]);

    const handleStart = (image: string, mode: ActionMode) => {
        setSelectedImage(image);
        setSelectedMode(mode);
        setGameState('PLAYING');
        if (engineRef.current) {
            engineRef.current.setBirdImage(image);
            engineRef.current.start();
        }
    };

    const handleRetry = () => {
        setGameState('PLAYING');
        engineRef.current?.start();
    };

    const handleChangeSetup = () => {
        setGameState('SETUP');
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black group select-none">
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
            />

            {/* Live HUD */}
            {gameState === 'PLAYING' && (
                <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none z-20">
                    <div className="bg-white/5 backdrop-blur-xl px-12 py-4 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in duration-500">
                        <span className="text-6xl font-black text-white drop-shadow-2xl tabular-nums">{currentScore}</span>
                    </div>
                </div>
            )}

            {/* Interactive Overlay for Touch */}
            {gameState === 'PLAYING' && (
                <div
                    className="absolute inset-0 z-10"
                    onTouchStart={(e) => {
                        e.preventDefault();
                        engineRef.current?.performAction(selectedMode);
                    }}
                />
            )}

            {gameState === 'SETUP' && (
                <SetupOverlay onStart={handleStart} />
            )}

            {gameState === 'GAMEOVER' && (
                <GameOverOverlay
                    score={currentScore}
                    onRetry={handleRetry}
                    onChangeSetup={handleChangeSetup}
                />
            )}
        </div>
    );
}

