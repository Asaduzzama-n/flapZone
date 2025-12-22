import { GameContainer } from "@/components/game/GameContainer";

export default function Page() {
    return (
        <main className="fixed inset-0 bg-[#0a0a0c] overflow-hidden">
            <div className="absolute top-6 left-6 z-20 pointer-events-none opacity-50">
                <h1 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Action Framework v1.0</h1>
            </div>

            <GameContainer />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-zinc-600 text-[10px] uppercase tracking-widest flex gap-8 pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    Space / Click to Action
                </div>
            </div>
        </main>
    );
}