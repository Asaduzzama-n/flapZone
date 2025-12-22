
"use client";

import { useEffect, useState } from 'react';
import { Trophy, ArrowsClockwise, UserGear } from '@phosphor-icons/react';

interface GameOverOverlayProps {
    score: number;
    onRetry: () => void;
    onChangeSetup: () => void;
}

const MOTIVATIONAL_MESSAGES = [
    "You're legally allowed to brag now",
    "Still better than your alarm clock",
    "Gravity is scared of you",
    "This makes you a professional gamer",
    "That was... something",
    "Your bird is disappointed, but I'm not",
    "Legend says you're still falling",
    "Emotional Damage!",
    "Is that all you got?",
    "Maybe try the 'Slap' mode next time"
];

export function GameOverOverlay({ score, onRetry, onChangeSetup }: GameOverOverlayProps) {
    const [bestScore, setBestScore] = useState(0);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem('flapp-best-score');
        const currentBest = saved ? parseInt(saved) : 0;

        if (score > currentBest) {
            localStorage.setItem('flapp-best-score', score.toString());
            setBestScore(score);
        } else {
            setBestScore(currentBest);
        }

        // Pick random message
        setMessage(MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);
    }, [score]);

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-white z-50 backdrop-blur-md animate-in fade-in duration-500">
            <div className="text-zinc-500 font-bold tracking-widest mb-2 uppercase text-sm">Game Over</div>
            <h2 className="text-7xl font-black mb-1 text-white italic tracking-tighter drop-shadow-lg animate-bounce">
                BRUTAL!
            </h2>

            <p className="text-pink-400 font-medium text-lg mb-8 text-center max-w-xs h-12">
                "{message}"
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Score</div>
                    <div className="text-5xl font-black text-white">{score}</div>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                    <Trophy weight="fill" className="text-yellow-500 mb-1" size={16} />
                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Best</div>
                    <div className="text-5xl font-black text-white">{bestScore}</div>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
                <button
                    onClick={onRetry}
                    className="w-full py-4 rounded-2xl bg-white text-black font-black text-xl hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center gap-2 group border-b-4 border-zinc-200 hover:border-pink-600"
                >
                    <ArrowsClockwise weight="bold" className="group-hover:rotate-180 transition-transform duration-500" />
                    RETRY
                </button>
                <button
                    onClick={onChangeSetup}
                    className="w-full py-4 rounded-2xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                >
                    <UserGear weight="bold" />
                    CHANGE SETTINGS
                </button>
            </div>
        </div>
    );
}
