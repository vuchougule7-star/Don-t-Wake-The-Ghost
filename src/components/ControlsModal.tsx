/**
 * Controls & Survival Guide Modal for "Don't Wake the Ghost"
 */

import React from 'react';
import { X } from 'lucide-react';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const keyMap = [
    { key: 'A / D  or  ← / →', action: 'Walk left / right' },
    { key: 'Hold SHIFT', action: 'Run (faster movement, but creates loud footsteps!)' },
    { key: 'C  or  CTRL  or  ↓', action: 'Crouch (silent sneak, avoid creaky boards, crawl under gaps)' },
    { key: 'SPACE  or  W  or  ↑', action: 'Jump / Climb onto furniture or ladders' },
    { key: 'E', action: 'Interact / Push Furniture / Hide in Wardrobe / Open Door' },
    { key: 'F', action: 'Toggle Flashlight (subtle ambient beam)' },
    { key: 'Q  or  G', action: 'Throw carried distraction object to divert the creature' },
    { key: 'ESC  or  P', action: 'Pause / Resume' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs select-none p-4">
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-serif font-semibold text-slate-100 mb-1">
          Controls & Survival Guide
        </h3>
        <span className="text-xs text-slate-400 block mb-4">
          Stealth, patience, and environmental awareness are essential to survive.
        </span>

        <div className="space-y-2 text-xs">
          {keyMap.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 border-b border-slate-900"
            >
              <kbd className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 font-mono text-[11px]">
                {item.key}
              </kbd>
              <span className="text-slate-300 text-right">{item.action}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <p>• The creature cannot detect you when hidden inside wardrobes or covered tables unless it saw you enter.</p>
          <p>• Walking is quiet; running or stepping on loose floorboards alerts the creature.</p>
          <p>• Throwing a brass goblet or music box creates a noisy distraction.</p>
        </div>
      </div>
    </div>
  );
};
