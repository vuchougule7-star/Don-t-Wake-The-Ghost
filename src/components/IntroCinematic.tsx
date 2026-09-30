/**
 * Cinematic Opening for "Don't Wake the Ghost"
 * Minimal, evocative prologue leading into the bedroom wake-up sequence.
 */

import React, { useState, useEffect } from 'react';
import { Difficulty } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface IntroCinematicProps {
  onStartGame: (difficulty: Difficulty) => void;
}

const STORY_LINES = [
  "You don't remember how you got here.",
  "The front door is locked.",
  "Something is moving downstairs.",
];

export const IntroCinematic: React.FC<IntroCinematicProps> = ({ onStartGame }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');

  useEffect(() => {
    if (lineIndex < STORY_LINES.length) {
      const timer = setTimeout(() => {
        setLineIndex((prev) => prev + 1);
      }, 2400);
      return () => clearTimeout(timer);
    } else {
      setShowPrompt(true);
    }
  }, [lineIndex]);

  const handleStart = () => {
    soundEngine.enableAudio();
    soundEngine.playDoor(false);
    onStartGame(difficulty);
  };

  const handleSkip = () => {
    setLineIndex(STORY_LINES.length);
    setShowPrompt(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05080e] text-slate-100 select-none overflow-hidden px-6 transition-opacity duration-1000">
      {/* Subtle deep blue background glow */}
      <div className="absolute inset-0 bg-radial from-slate-900/25 via-[#060a12] to-[#04060a] pointer-events-none" />

      {/* Main Title */}
      <div className="relative text-center mb-12">
        <span className="text-[11px] uppercase tracking-[0.35em] text-slate-400 block mb-3 font-medium">
          A Cinematic 2D Horror Adventure
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-widest text-slate-100 drop-shadow-lg">
          DON&apos;T WAKE THE GHOST
        </h1>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent mx-auto mt-4" />
      </div>

      {/* Prologue Text Sequence */}
      <div className="relative min-h-[100px] max-w-lg text-center flex flex-col items-center justify-center">
        {!showPrompt ? (
          <div className="space-y-4">
            <p className="text-lg md:text-xl font-serif italic text-slate-300 transition-all duration-700 ease-in-out">
              {STORY_LINES[lineIndex] || ''}
            </p>
            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-widest mt-6 cursor-pointer"
            >
              Skip →
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 w-full animate-fade-in">
            {/* Difficulty selector */}
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs text-slate-400 tracking-wider uppercase font-medium">
                Difficulty
              </span>
              <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      difficulty === d
                        ? 'bg-amber-600/20 text-amber-200 border border-amber-600/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center max-w-xs mt-1">
                {difficulty === 'EASY'
                  ? 'Slower creature reaction and gentle senses.'
                  : difficulty === 'MEDIUM'
                  ? 'Standard stealth, observant creature, and authentic puzzles.'
                  : 'Fast creature sprint, sharp hearing, and unforgiving pursuit.'}
              </p>
            </div>

            {/* Awaken Button */}
            <button
              onClick={handleStart}
              className="px-8 py-3 text-xs font-serif uppercase tracking-widest text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg shadow-xl transition-all duration-200 cursor-pointer"
            >
              Awaken in Bedroom
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-center text-slate-400 text-xs tracking-widest">
        <span>Headphones Recommended</span>
      </div>
    </div>
  );
};
