/**
 * Environmental Note / Journal Viewer for "Don't Wake the Ghost"
 */

import React from 'react';
import { X } from 'lucide-react';

interface NoteModalProps {
  note: { title: string; content: string } | null;
  onClose: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({ note, onClose }) => {
  if (!note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs select-none p-4">
      <div className="relative w-full max-w-md bg-[#13171e] border border-amber-900/30 rounded-xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[10px] uppercase tracking-widest text-amber-500/80 block mb-1">
          Environmental Clue
        </span>
        <h3 className="text-base font-serif font-semibold text-slate-100 mb-4 border-b border-slate-800 pb-2">
          {note.title}
        </h3>

        <div className="bg-[#0b0e14] border border-slate-800/60 rounded-lg p-4 font-serif text-sm italic text-amber-100/90 leading-relaxed">
          {note.content}
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-serif uppercase tracking-wider text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors cursor-pointer"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
