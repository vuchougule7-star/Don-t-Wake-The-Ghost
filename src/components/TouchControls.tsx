/**
 * On-Screen Touch Controls for Mobile / Tablets
 * Automatically visible on touch devices, hidden on desktop mice/keyboards.
 */

import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ChevronDown, Hand, Zap, Flashlight } from 'lucide-react';

interface TouchControlsProps {
  onInputDown: (action: string) => void;
  onInputUp: (action: string) => void;
  onInteract: () => void;
  onToggleFlashlight: () => void;
  onThrow: () => void;
  hasThrowable: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputDown,
  onInputUp,
  onInteract,
  onToggleFlashlight,
  onThrow,
  hasThrowable,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-4 px-6 flex justify-between items-end pointer-events-none md:hidden select-none z-30">
      {/* Left: Direction D-Pad */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        <button
          onTouchStart={() => onInputDown('left')}
          onTouchEnd={() => onInputUp('left')}
          onMouseDown={() => onInputDown('left')}
          onMouseUp={() => onInputUp('left')}
          className="w-13 h-13 rounded-full bg-slate-900/80 active:bg-slate-700/90 border border-slate-700/80 flex items-center justify-center text-slate-200 shadow-lg active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onTouchStart={() => onInputDown('right')}
          onTouchEnd={() => onInputUp('right')}
          onMouseDown={() => onInputDown('right')}
          onMouseUp={() => onInputUp('right')}
          className="w-13 h-13 rounded-full bg-slate-900/80 active:bg-slate-700/90 border border-slate-700/80 flex items-center justify-center text-slate-200 shadow-lg active:scale-95 transition-transform"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onTouchStart={() => onInputDown('crouch')}
          onTouchEnd={() => onInputUp('crouch')}
          onMouseDown={() => onInputDown('crouch')}
          onMouseUp={() => onInputUp('crouch')}
          className="w-11 h-11 rounded-full bg-slate-900/70 active:bg-slate-700/90 border border-slate-700/60 flex items-center justify-center text-slate-300 shadow-md ml-1"
          title="Crouch"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Actions Buttons (Jump, Run, Interact, Flashlight, Throw) */}
      <div className="flex flex-col items-end space-y-2 pointer-events-auto">
        <div className="flex items-center space-x-2">
          {hasThrowable && (
            <button
              onClick={onThrow}
              className="w-10 h-10 rounded-full bg-amber-900/80 active:bg-amber-700 border border-amber-600/70 flex items-center justify-center text-amber-200 shadow-md text-xs font-bold"
              title="Throw Distraction"
            >
              Throw
            </button>
          )}

          <button
            onClick={onToggleFlashlight}
            className="w-10 h-10 rounded-full bg-slate-900/70 active:bg-slate-700 border border-slate-700/60 flex items-center justify-center text-slate-300 shadow-md"
            title="Flashlight"
          >
            <Flashlight className="w-4 h-4" />
          </button>

          <button
            onTouchStart={() => onInputDown('run')}
            onTouchEnd={() => onInputUp('run')}
            onMouseDown={() => onInputDown('run')}
            onMouseUp={() => onInputUp('run')}
            className="w-11 h-11 rounded-full bg-slate-900/70 active:bg-slate-700 border border-slate-700/60 flex items-center justify-center text-slate-300 shadow-md text-[11px] font-bold uppercase tracking-wider"
          >
            Run
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onInteract}
            className="w-13 h-13 rounded-full bg-amber-700/80 active:bg-amber-600 border border-amber-500/80 flex items-center justify-center text-amber-100 shadow-lg text-xs font-bold uppercase"
          >
            <Hand className="w-6 h-6" />
          </button>

          <button
            onTouchStart={() => onInputDown('jump')}
            onTouchEnd={() => onInputUp('jump')}
            onMouseDown={() => onInputDown('jump')}
            onMouseUp={() => onInputUp('jump')}
            className="w-13 h-13 rounded-full bg-slate-800/90 active:bg-slate-600 border border-slate-600 flex items-center justify-center text-slate-100 shadow-lg"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
