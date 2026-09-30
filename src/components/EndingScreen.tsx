/**
 * Victory / Ending Screen for "Don't Wake the Ghost"
 */

import React from 'react';

interface EndingScreenProps {
  onPlayAgain: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({ onPlayAgain }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070c14] text-slate-100 select-none px-6">
      {/* Cold blue moonbeam background gradient */}
      <div className="absolute inset-0 bg-radial from-blue-950/20 via-[#070c14] to-[#04070b] pointer-events-none" />

      <div className="relative text-center max-w-lg space-y-6">
        <span className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-medium">
          Chapter V — Escape
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-wider text-slate-100 drop-shadow-md">
          FREEDOM BEYOND THE GATES
        </h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mx-auto" />

        <div className="space-y-3 text-sm font-serif italic text-slate-300">
          <p>
            You sprint past the heavy iron threshold into the rain-soaked mist.
          </p>
          <p>
            Behind you, the Caretaker reaches the doorway and halts—bound forever to the confines of the decaying manor.
          </p>
          <p>
            The quiet woods welcome your trembling breath. You survived the night.
          </p>
        </div>

        <div className="pt-6">
          <button
            onClick={onPlayAgain}
            className="px-8 py-3 text-xs uppercase tracking-widest font-medium text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-lg shadow-lg transition-all duration-200 cursor-pointer"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
