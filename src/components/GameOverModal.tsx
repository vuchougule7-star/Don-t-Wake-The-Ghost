/**
 * Clean Game Over Screen for "Don't Wake the Ghost"
 */

import React from 'react';

interface GameOverModalProps {
  onRestart: () => void;
  chapterTitle: string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRestart, chapterTitle }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm text-slate-100 select-none px-6">
      <div className="text-center max-w-md space-y-6">
        <span className="text-xs uppercase tracking-[0.3em] text-red-400/80 font-medium">
          {chapterTitle}
        </span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-widest text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          IT FOUND YOU
        </h2>
        <p className="text-sm font-serif italic text-slate-400">
          The shadows were not deep enough. Listen closer to the creaks of the floor.
        </p>

        <div className="pt-4">
          <button
            onClick={onRestart}
            className="px-6 py-2.5 text-xs uppercase tracking-widest font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-red-500/50 rounded-lg shadow-lg transition-all duration-200 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
