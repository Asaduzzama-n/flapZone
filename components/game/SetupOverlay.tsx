
"use client";

import { useState } from 'react';
import { ActionMode } from '@/lib/game-engine';
import { Upload, Play } from '@phosphor-icons/react';

interface SetupOverlayProps {
    onStart: (image: string, mode: ActionMode) => void;
}

export function SetupOverlay({ onStart }: SetupOverlayProps) {
    const [image, setImage] = useState<string | null>(null);
    const [mode, setMode] = useState<ActionMode>('jump');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const actionOptions: { value: ActionMode; label: string; description: string }[] = [
        { value: 'jump', label: 'Jump', description: 'Standard upward boost' },
        { value: 'punch', label: 'Punch', description: 'Medium boost + Screen Shake' },
        { value: 'kick', label: 'Kick', description: 'Strong boost' },
        { value: 'slap', label: 'Slap', description: 'Chaotic boost' },
    ];

    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-white z-50 backdrop-blur-sm">
            <h1 className="text-5xl font-black mb-8 tracking-tighter bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent animate-pulse">
                FLAPP ACTION
            </h1>

            <div className="w-full max-w-md space-y-8 bg-zinc-900/50 p-8 rounded-3xl border border-white/10 shadow-2xl">
                {/* Image Upload */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-zinc-400">UPLOAD CHARACTER</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:bg-zinc-800/50 transition-all hover:border-pink-500/50 group">
                            {image ? (
                                <img src={image} alt="Preview" className="w-24 h-24 object-contain rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-3 text-zinc-500 group-hover:text-pink-500" />
                                    <p className="text-xs text-zinc-500">Drop your PNG/JPG here</p>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>

                {/* Action Selector */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-zinc-400 uppercase tracking-widest">Select Action Style</label>
                    <div className="grid grid-cols-2 gap-3">
                        {actionOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setMode(opt.value)}
                                className={`p-4 rounded-2xl border transition-all text-left ${mode === opt.value
                                        ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                    }`}
                            >
                                <div className="font-bold text-lg">{opt.label}</div>
                                <div className="text-[10px] opacity-70 leading-tight">{opt.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => image && onStart(image, mode)}
                    disabled={!image}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black text-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                >
                    <Play weight="fill" className="group-hover:translate-x-1 transition-transform" />
                    START GAME
                </button>
            </div>
        </div>
    );
}
