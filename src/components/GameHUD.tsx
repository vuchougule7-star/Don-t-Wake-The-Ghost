/**
 * Minimalist Cinematic HUD for "Don't Wake the Ghost"
 */

import React from 'react';
import { InventoryItem, MonsterState } from '../types/game';
import { Volume2, VolumeX, Flashlight, HelpCircle, Pause } from 'lucide-react';

interface GameHUDProps {
  chapterTitle: string;
  objectiveText: string;
  activePrompt: string | null;
  heldItem: InventoryItem | null;
  flashlightOn: boolean;
  isMuted: boolean;
  monsterState?: MonsterState;
  arrivalTelegraphActive?: boolean;
  arrivalWarningTimer?: number;
  isHiding?: boolean;
  onToggleFlashlight: () => void;
  onToggleMute: () => void;
  onOpenControls: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  chapterTitle,
  objectiveText,
  activePrompt,
  heldItem,
  flashlightOn,
  isMuted,
  monsterState,
  arrivalTelegraphActive = false,
  arrivalWarningTimer = 0,
  isHiding = false,
  onToggleFlashlight,
  onToggleMute,
  onOpenControls,
  onPause,
}) => {
  const isChasing = monsterState === 'CHASE';

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Dynamic Red/Dark Tension Vignette when monster is hunting or chasing */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
          isChasing
            ? 'opacity-100 shadow-[inset_0_0_120px_rgba(220,38,38,0.45)]'
            : arrivalTelegraphActive
            ? 'opacity-80 shadow-[inset_0_0_100px_rgba(245,158,11,0.3)] animate-pulse'
            : monsterState === 'INVESTIGATE' || monsterState === 'SEARCH'
            ? 'opacity-60 shadow-[inset_0_0_80px_rgba(245,158,11,0.2)]'
            : 'opacity-0'
        }`}
      />

      {/* Top Threat / Stealth Banner */}
      {arrivalTelegraphActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-30">
          <div className="bg-red-950/90 border border-amber-500/80 px-5 py-2.5 rounded-lg shadow-2xl flex items-center space-x-3 animate-bounce">
            <span className="text-amber-400 font-bold text-xs md:text-sm">⚠️ FOOTSTEPS AT THE DOOR!</span>
            <span className="text-xs text-amber-200">
              The Caretaker enters in {Math.ceil(arrivalWarningTimer)}s — Hide in the Armoire or Bed!
            </span>
          </div>
        </div>
      )}

      {isHiding && !arrivalTelegraphActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-30">
          <div className="bg-slate-950/90 border border-emerald-500/70 px-4 py-2 rounded-lg shadow-xl flex items-center space-x-2 text-emerald-300 text-xs font-serif tracking-wide">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>HIDDEN & SAFE — Peeking through slats. Stay still until he turns his back.</span>
          </div>
        </div>
      )}

      {isChasing && !isHiding && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-30">
          <div className="bg-red-950/95 border border-red-500 px-5 py-2 rounded-lg shadow-2xl flex items-center space-x-2 text-red-200 text-xs font-bold animate-pulse">
            <span>HE HAS SEEN YOU! RUN AND HIDE IN THE ARMOIRE!</span>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="absolute top-4 left-6 right-6 flex items-start justify-between pointer-events-auto">
        {/* Left: Chapter & Objective */}
        <div className="flex flex-col space-y-1 max-w-md">
          <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-medium">
            {chapterTitle}
          </span>
          <div className="flex items-center space-x-2 text-xs md:text-sm text-slate-300 font-serif">
            <span>{objectiveText}</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2 bg-slate-950/70 backdrop-blur-xs border border-slate-800/80 rounded-lg p-1.5 shadow-md">
          <button
            onClick={onToggleFlashlight}
            title="Toggle Flashlight (F)"
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              flashlightOn
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flashlight className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            title="Toggle Sound (M)"
            className="p-2 text-slate-400 hover:text-slate-200 rounded-md transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenControls}
            title="Controls & Guide (H)"
            className="p-2 text-slate-400 hover:text-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onPause}
            title="Pause (Esc / P)"
            className="p-2 text-slate-400 hover:text-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Held Item Slot Indicator (Bottom Left) */}
      {heldItem && (
        <div className="absolute bottom-6 left-6 pointer-events-auto">
          <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur-xs border border-slate-800/90 rounded-lg px-3 py-2 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Held Item</span>
              <span className="text-xs font-serif text-slate-200 font-medium">{heldItem.name}</span>
            </div>
            {heldItem.isThrowable && (
              <span className="text-[10px] text-amber-300/80 border border-amber-500/30 rounded px-1.5 py-0.5 ml-1">
                Q / G to Throw
              </span>
            )}
          </div>
        </div>
      )}

      {/* Center Contextual Prompt ("E — Open Door", "E — Hide", etc.) */}
      {activePrompt && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-slate-950/90 backdrop-blur-xs border border-slate-700/80 px-4 py-2 rounded-md shadow-2xl flex items-center space-x-2 animate-bounce">
            <span className="text-xs md:text-sm font-medium tracking-wide text-slate-100">
              {activePrompt}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
