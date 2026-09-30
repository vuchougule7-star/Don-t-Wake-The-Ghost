/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, InputState } from './engine/gameEngine';
import { GameRenderer } from './engine/renderer';
import { GameState, Difficulty } from './types/game';
import { soundEngine } from './audio/soundEngine';
import { IntroCinematic } from './components/IntroCinematic';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { EndingScreen } from './components/EndingScreen';
import { ControlsModal } from './components/ControlsModal';
import { NoteModal } from './components/NoteModal';
import { TouchControls } from './components/TouchControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const reqAnimRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [isMuted, setIsMuted] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState('CHAPTER I — WAKE UP');
  const [objectiveText, setObjectiveText] = useState('Find a way out of the bedroom.');
  const [heldItem, setHeldItem] = useState<any>(null);
  const [activeNote, setActiveNote] = useState<{ title: string; content: string } | null>(null);
  const [monsterState, setMonsterState] = useState<any>(undefined);
  const [arrivalTelegraphActive, setArrivalTelegraphActive] = useState(false);
  const [arrivalWarningTimer, setArrivalWarningTimer] = useState(0);
  const [isHiding, setIsHiding] = useState(false);

  // Input state refs for zero-latency frame ticks
  const inputsRef = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    run: false,
    crouch: false,
    interact: false,
    flashlight: false,
    throwItem: false,
  });

  // Initialize Game Engine on mount
  useEffect(() => {
    const engine = new GameEngine(difficulty);
    engineRef.current = engine;

    if (canvasRef.current) {
      rendererRef.current = new GameRenderer(canvasRef.current);
    }
  }, []);

  // Sync canvas size to entire viewport
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Main Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const engine = engineRef.current;
      const renderer = rendererRef.current;
      const canvas = canvasRef.current;

      if (engine && renderer && canvas && gameState === 'PLAYING') {
        engine.update(inputsRef.current, dt, canvas.width, canvas.height);

        // Check triggers
        if (engine.isGameOver) {
          setGameState('GAME_OVER');
        } else if (engine.isVictory) {
          setGameState('VICTORY');
        }

        // Sync UI states
        setActivePrompt(engine.activePrompt);
        setChapterTitle(engine.currentRoom.chapterTitle);
        setObjectiveText(engine.currentRoom.objectiveText);
        setHeldItem(engine.player.heldItem);
        setFlashlightOn(engine.player.flashlightOn);
        setActiveNote(engine.activeNote);
        setMonsterState(engine.monster ? engine.monster.state : undefined);
        setArrivalTelegraphActive(engine.arrivalTelegraphActive);
        setArrivalWarningTimer(engine.arrivalWarningTimer);
        setIsHiding(engine.player.isHiding);

        // Render current frame
        renderer.render(
          engine.currentRoom,
          engine.player,
          engine.monster,
          engine.cameraX,
          engine.cameraY,
          engine.thrownItem,
          engine.steamActive,
          engine.difficulty,
          canvas.width,
          canvas.height,
          engine.arrivalTelegraphActive,
          engine.arrivalWarningTimer
        );
      }

      reqAnimRef.current = requestAnimationFrame(loop);
    };

    reqAnimRef.current = requestAnimationFrame(loop);
    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
    };
  }, [gameState]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll defaults
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      const key = e.key.toLowerCase();
      const code = e.code;

      if (code === 'KeyA' || code === 'ArrowLeft') inputsRef.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') inputsRef.current.right = true;
      if (code === 'KeyW' || code === 'ArrowUp') inputsRef.current.up = true;
      if (code === 'KeyS' || code === 'ArrowDown') inputsRef.current.down = true;
      if (code === 'Space') inputsRef.current.jump = true;
      if (e.shiftKey) inputsRef.current.run = true;
      if (code === 'KeyC' || code === 'ControlLeft' || code === 'ControlRight') {
        inputsRef.current.crouch = true;
      }
      if (code === 'KeyE') inputsRef.current.interact = true;
      if (code === 'KeyF') inputsRef.current.flashlight = true;
      if (code === 'KeyQ' || code === 'KeyG') inputsRef.current.throwItem = true;

      // Menu shortcuts
      if (key === 'm') {
        toggleMute();
      }
      if (key === 'h') {
        setIsControlsOpen((prev) => !prev);
      }
      if (key === 'escape' || key === 'p') {
        if (activeNote) {
          if (engineRef.current) engineRef.current.activeNote = null;
          setActiveNote(null);
        } else if (isControlsOpen) {
          setIsControlsOpen(false);
        } else if (gameState === 'PLAYING') {
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') inputsRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') inputsRef.current.right = false;
      if (code === 'KeyW' || code === 'ArrowUp') inputsRef.current.up = false;
      if (code === 'KeyS' || code === 'ArrowDown') inputsRef.current.down = false;
      if (code === 'Space') inputsRef.current.jump = false;
      if (!e.shiftKey) inputsRef.current.run = false;
      if (code === 'KeyC' || code === 'ControlLeft' || code === 'ControlRight') {
        inputsRef.current.crouch = false;
      }
      if (code === 'KeyE') inputsRef.current.interact = false;
      if (code === 'KeyF') inputsRef.current.flashlight = false;
      if (code === 'KeyQ' || code === 'KeyG') inputsRef.current.throwItem = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, activeNote, isControlsOpen]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMute(nextMuted);
  };

  const handleToggleFlashlight = () => {
    inputsRef.current.flashlight = true;
  };

  const handleStartGame = (selectedDiff: Difficulty) => {
    setDifficulty(selectedDiff);
    if (engineRef.current) {
      engineRef.current.setDifficulty(selectedDiff);
      engineRef.current.restartFromCheckpoint();
    }
    setGameState('PLAYING');
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartFromCheckpoint();
    }
    setGameState('PLAYING');
  };

  const handlePlayAgain = () => {
    if (engineRef.current) {
      engineRef.current.restartFromCheckpoint();
    }
    setGameState('INTRO');
  };

  const handleCloseNote = () => {
    if (engineRef.current) {
      engineRef.current.activeNote = null;
    }
    setActiveNote(null);
  };

  // Touch virtual controls
  const handleTouchDown = (action: string) => {
    if (action === 'left') inputsRef.current.left = true;
    if (action === 'right') inputsRef.current.right = true;
    if (action === 'jump') inputsRef.current.jump = true;
    if (action === 'crouch') inputsRef.current.crouch = true;
    if (action === 'run') inputsRef.current.run = true;
  };

  const handleTouchUp = (action: string) => {
    if (action === 'left') inputsRef.current.left = false;
    if (action === 'right') inputsRef.current.right = false;
    if (action === 'jump') inputsRef.current.jump = false;
    if (action === 'crouch') inputsRef.current.crouch = false;
    if (action === 'run') inputsRef.current.run = false;
  };

  const handleTouchInteract = () => {
    inputsRef.current.interact = true;
    setTimeout(() => {
      inputsRef.current.interact = false;
    }, 120);
  };

  const handleTouchThrow = () => {
    inputsRef.current.throwItem = true;
    setTimeout(() => {
      inputsRef.current.throwItem = false;
    }, 120);
  };

  return (
    <div className="relative w-screen h-screen bg-[#070c14] overflow-hidden select-none font-sans">
      {/* Full-Viewport 2D Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block bg-[#070c14]"
      />

        {/* Cinematic Prologue Intro */}
        {gameState === 'INTRO' && <IntroCinematic onStartGame={handleStartGame} />}

        {/* Minimalist Cinematic In-Game HUD */}
        {gameState === 'PLAYING' && (
          <GameHUD
            chapterTitle={chapterTitle}
            objectiveText={objectiveText}
            activePrompt={activePrompt}
            heldItem={heldItem}
            flashlightOn={flashlightOn}
            isMuted={isMuted}
            monsterState={monsterState}
            arrivalTelegraphActive={arrivalTelegraphActive}
            arrivalWarningTimer={arrivalWarningTimer}
            isHiding={isHiding}
            onToggleFlashlight={handleToggleFlashlight}
            onToggleMute={toggleMute}
            onOpenControls={() => setIsControlsOpen(true)}
            onPause={() => setGameState('PAUSED')}
          />
        )}

        {/* Mobile / Tablet Touch Controls Overlay */}
        {gameState === 'PLAYING' && (
          <TouchControls
            onInputDown={handleTouchDown}
            onInputUp={handleTouchUp}
            onInteract={handleTouchInteract}
            onToggleFlashlight={handleToggleFlashlight}
            onThrow={handleTouchThrow}
            hasThrowable={heldItem && heldItem.isThrowable}
          />
        )}

        {/* Pause Modal */}
        {gameState === 'PAUSED' && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs text-slate-100 select-none">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
              <span className="text-xs uppercase tracking-widest text-slate-400">Suspended</span>
              <h2 className="text-2xl font-serif font-bold tracking-wider text-slate-100">
                GAME PAUSED
              </h2>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setGameState('PLAYING')}
                  className="w-full py-2.5 text-xs font-serif uppercase tracking-widest bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-lg transition-colors cursor-pointer"
                >
                  Resume
                </button>
                <button
                  onClick={() => setIsControlsOpen(true)}
                  className="w-full py-2.5 text-xs font-serif uppercase tracking-widest text-slate-400 hover:text-slate-200 bg-transparent hover:bg-slate-900/60 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Controls Guide
                </button>
                <button
                  onClick={toggleMute}
                  className="w-full py-2.5 text-xs font-serif uppercase tracking-widest text-slate-400 hover:text-slate-200 bg-transparent hover:bg-slate-900/60 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {isMuted ? 'Unmute Audio' : 'Mute Audio'}
                </button>
                <button
                  onClick={handleRestart}
                  className="w-full py-2.5 text-xs font-serif uppercase tracking-widest text-red-400/80 hover:text-red-300 bg-transparent hover:bg-red-950/30 border border-red-900/40 rounded-lg transition-colors cursor-pointer"
                >
                  Restart Chapter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal onRestart={handleRestart} chapterTitle={chapterTitle} />
        )}

        {/* Victory Screen */}
        {gameState === 'VICTORY' && <EndingScreen onPlayAgain={handlePlayAgain} />}

        {/* Controls Modal */}
        <ControlsModal isOpen={isControlsOpen} onClose={() => setIsControlsOpen(false)} />

        {/* Environmental Note / Journal Inspection Modal */}
        <NoteModal note={activeNote} onClose={handleCloseNote} />
    </div>
  );
}
