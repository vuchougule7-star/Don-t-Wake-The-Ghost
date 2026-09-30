/**
 * Core Game Engine for "Don't Wake the Ghost"
 * Physics, 7-State Monster AI, Creaky floorboards, Background monster sightings,
 * Wake-up cinematic staging, and Seamless Environmental Puzzles.
 */

import {
  Player,
  Monster,
  RoomData,
  MovableObject,
  Interactable,
  Difficulty,
  InventoryItem,
  NoiseEvent,
  Rect,
} from '../types/game';
import { ROOMS } from './worldData';
import { soundEngine } from '../audio/soundEngine';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  run: boolean;
  crouch: boolean;
  interact: boolean;
  flashlight: boolean;
  throwItem: boolean;
}

export class GameEngine {
  public currentRoom: RoomData;
  public player: Player;
  public monster: Monster | null = null;
  public cameraX: number = 0;
  public cameraY: number = 0;
  public difficulty: Difficulty = 'MEDIUM';
  public inventory: InventoryItem[] = [];
  public activePrompt: string | null = null;
  public activeNote: { title: string; content: string } | null = null;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;
  public steamActive: boolean = false;
  public clockPuzzleWeights: string[] = []; // Sequence of weights pulled in Ch 5
  public arrivalTelegraphActive: boolean = false;
  public arrivalWarningTimer: number = 0;
  private doorRattleTimer: number = 0;
  public thrownItem: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    active: boolean;
    icon: string;
  } | null = null;

  private gravity: number = 0.58;
  private maxFallSpeed: number = 14;
  private lastHeartbeatTime: number = 0;
  private checkpointRoomId: string = 'ch1_bedroom';
  private noiseAccumulator: number = 0;

  constructor(difficulty: Difficulty = 'MEDIUM') {
    this.difficulty = difficulty;
    this.currentRoom = JSON.parse(JSON.stringify(ROOMS['ch1_bedroom']));
    this.player = this.createInitialPlayer(this.currentRoom.spawnPoint.x, this.currentRoom.spawnPoint.y);
    this.initMonster();
  }

  private createInitialPlayer(x: number, y: number): Player {
    return {
      x,
      y,
      w: 20,
      h: 36,
      vx: 0,
      vy: 0,
      isGrounded: true,
      isCrouching: false,
      isRunning: false,
      isClimbing: false,
      facing: 'right',
      action: 'waking',
      animTimer: 0,
      wakeTimer: 0,
      flashlightOn: false,
      isHiding: false,
      hidingSpotId: null,
      heldItem: null,
      isPushing: false,
      pushingObjectId: null,
    };
  }

  public setDifficulty(diff: Difficulty) {
    this.difficulty = diff;
    if (this.monster) {
      this.applyDifficultyToMonster(this.monster);
    }
  }

  private applyDifficultyToMonster(m: Monster) {
    if (this.difficulty === 'EASY') {
      m.speed = 1.35;
      m.hearingSensitivity = 0.6;
    } else if (this.difficulty === 'HARD') {
      m.speed = 2.45;
      m.hearingSensitivity = 1.45;
    } else {
      m.speed = 1.8;
      m.hearingSensitivity = 1.0;
    }
  }

  private initMonster() {
    if (this.currentRoom.monsterStart) {
      const ms = this.currentRoom.monsterStart;
      this.monster = {
        x: ms.x,
        y: ms.y,
        w: 36,
        h: 95,
        vx: 0,
        facing: 'left',
        state: 'PATROL',
        stateTimer: 0,
        patrolLeft: ms.patrolLeft,
        patrolRight: ms.patrolRight,
        targetX: ms.patrolLeft,
        originX: ms.x,
        chaseTimer: 0,
        searchTimer: 0,
        animTimer: 0,
        lanternAngle: 0.2,
        headTilt: 0,
        hearingSensitivity: 1.0,
        speed: 1.8,
        alertLevel: 0,
      };
      this.applyDifficultyToMonster(this.monster);
    } else {
      this.monster = null;
    }
  }

  public restartFromCheckpoint() {
    this.isGameOver = false;
    this.isVictory = false;
    this.activeNote = null;
    this.thrownItem = null;
    this.steamActive = false;
    this.clockPuzzleWeights = [];
    this.arrivalTelegraphActive = false;
    this.arrivalWarningTimer = 0;
    this.doorRattleTimer = 0;
    this.noiseAccumulator = 0;

    // Reload current room data cleanly
    this.currentRoom = JSON.parse(JSON.stringify(ROOMS[this.checkpointRoomId] || ROOMS['ch1_bedroom']));
    this.player = this.createInitialPlayer(this.currentRoom.spawnPoint.x, this.currentRoom.spawnPoint.y);
    if (this.checkpointRoomId !== 'ch1_bedroom') {
      this.player.action = 'idle';
      this.player.wakeTimer = 999;
    }
    this.initMonster();
  }

  public update(inputs: InputState, dt: number, viewWidth: number = 1440, viewHeight: number = 750) {
    if (this.isGameOver || this.isVictory) return;

    this.player.animTimer += 0.05;
    if (this.monster) {
      this.monster.animTimer += 0.05;
    }

    // Wake-up sequence in bedroom
    if (this.player.wakeTimer < 2.5) {
      this.player.wakeTimer += 0.016;
      if (this.player.wakeTimer >= 2.5) {
        this.player.action = 'idle';
      } else {
        return; // Wait for wake up to finish
      }
    }

    // Arrival warning sequence in bedroom
    if (this.arrivalTelegraphActive) {
      this.arrivalWarningTimer -= dt;
      this.doorRattleTimer += dt;
      if (this.doorRattleTimer >= 1.25) {
        this.doorRattleTimer = 0;
        soundEngine.playDoorRattle();
        soundEngine.playMonsterStep(0.35);
      }

      if (this.arrivalWarningTimer <= 0) {
        this.arrivalTelegraphActive = false;
        this.spawnCaretakerInsideRoom();
      }
    }

    // 1. UPDATE PLAYER
    this.updatePlayer(inputs);

    // 2. UPDATE MOVABLE OBJECTS & COLLISIONS
    this.updateMovables();

    // 3. UPDATE THROWN DISTRACTION ITEM
    this.updateThrownItem();

    // 4. UPDATE BACKGROUND MONSTER FORESHADOWING
    this.updateBackgroundMonster();

    // 5. UPDATE MONSTER AI (7 States)
    if (this.monster) {
      this.updateMonsterAI();
    }

    // 6. UPDATE CONTEXTUAL INTERACTION PROMPT
    this.updateInteractionPrompt(inputs);

    // 7. UPDATE CAMERA LERP
    this.updateCamera(viewWidth, viewHeight);

    // 8. AUDIO TENSION & PROXIMITY HEARTBEAT
    this.updateAudioTension();
  }

  private updatePlayer(inputs: InputState) {
    const p = this.player;

    // Flashlight toggle
    if (inputs.flashlight) {
      inputs.flashlight = false;
      p.flashlightOn = !p.flashlightOn;
      soundEngine.playFlashlight();
    }

    // Throw distraction item
    if (inputs.throwItem && p.heldItem && p.heldItem.isThrowable) {
      inputs.throwItem = false;
      this.throwHeldItem();
    }

    // Curtain swing check
    if (p.isSwinging) {
      p.action = 'swinging';
      p.isGrounded = false;
      const swingSpeed = 3.2;
      p.swingAngle = Math.sin(p.animTimer * swingSpeed) * 0.48;

      const anchorX = 710;
      const anchorY = 150;
      const ropeLen = 340;

      p.x = anchorX + Math.sin(p.swingAngle) * ropeLen - p.w / 2;
      p.y = anchorY + Math.cos(p.swingAngle) * ropeLen - p.h;

      // Launch off the curtain on Jump or Interact or Up
      if (inputs.jump || inputs.interact || inputs.up) {
        inputs.jump = false;
        inputs.interact = false;
        inputs.up = false;
        p.isSwinging = false;

        // Calculate launch boost based on swing direction
        const movingRight = Math.cos(p.animTimer * swingSpeed) > 0;
        p.vx = movingRight ? 10.5 : -7.5;
        p.vy = -12.0;
        p.facing = movingRight ? 'right' : 'left';
        soundEngine.playJump();
      }
      return;
    }

    // If hiding inside wardrobe or under table, player cannot move until stepping out
    if (p.isHiding) {
      p.vx = 0;
      p.vy = 0;
      p.action = 'hidden';
      if (inputs.left || inputs.right || inputs.jump || inputs.crouch) {
        this.exitHiding();
      }
      return;
    }

    // Crouch & Run modifiers
    p.isCrouching = inputs.crouch;
    p.isRunning = inputs.run && !p.isCrouching;

    const moveSpeed = p.isCrouching ? 1.5 : p.isRunning ? 5.2 : 3.0;

    // Horizontal Movement
    if (inputs.left) {
      p.vx = -moveSpeed;
      p.facing = 'left';
    } else if (inputs.right) {
      p.vx = moveSpeed;
      p.facing = 'right';
    } else {
      p.vx *= 0.75;
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
    }

    // Ladder climbing
    let onLadder = false;
    for (const plat of this.currentRoom.platforms) {
      if (plat.type === 'ladder' && this.checkOverlap(p, plat)) {
        onLadder = true;
        break;
      }
    }

    // Check movable ladders
    for (const m of this.currentRoom.movables) {
      if (m.canClimb && this.checkOverlap(p, m)) {
        onLadder = true;
        break;
      }
    }

    if (onLadder && (inputs.up || inputs.down)) {
      p.isClimbing = true;
      p.vy = inputs.up ? -3.0 : 3.0;
      p.action = 'climb';
    } else if (p.isClimbing && !onLadder) {
      p.isClimbing = false;
    }

    // High, responsive jumping
    if (inputs.jump && p.isGrounded && !p.isCrouching && !p.isClimbing) {
      p.vy = -13.0; // Higher, responsive jump!
      p.isGrounded = false;
      soundEngine.playJump();
    }

    // Apply gravity
    if (!p.isClimbing) {
      p.vy += this.gravity;
      if (p.vy > this.maxFallSpeed) p.vy = this.maxFallSpeed;
    }

    // Apply velocities with collision resolution
    this.movePlayerX(p.vx);
    this.movePlayerY(p.vy);

    // Footstep audio & noise events
    if (p.isGrounded && Math.abs(p.vx) > 0.5) {
      soundEngine.playFootstep(p.isRunning, p.isCrouching);

      // Running creates noise that can alert the monster
      if (p.isRunning) {
        this.emitNoise(p.x, p.y, 450 * (this.monster ? this.monster.hearingSensitivity : 1), 0.75);
      }
    }

    // Creaky floorboards detection
    if (this.currentRoom.creakyPlanks && p.isGrounded && Math.abs(p.vx) > 0.4 && !p.isCrouching) {
      const now = Date.now();
      for (const plank of this.currentRoom.creakyPlanks) {
        if (this.checkOverlap(p, plank)) {
          if (!plank.lastCreakTime || now - plank.lastCreakTime > 1200) {
            plank.lastCreakTime = now;
            soundEngine.playWoodCreak(0.25);
            // Sharp noise alerting nearby creature
            this.emitNoise(p.x, p.y, 550 * (this.monster ? this.monster.hearingSensitivity : 1), 0.9);
          }
        }
      }
    }

    // Set action animation
    if (!p.isGrounded) {
      p.action = p.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(p.vx) > 0.5) {
      p.action = p.isCrouching ? 'crouch_walk' : p.isRunning ? 'run' : 'walk';
    } else {
      p.action = p.isCrouching ? 'crouch' : 'idle';
    }
  }

  private movePlayerX(vx: number) {
    const p = this.player;
    p.x += vx;

    // Boundary clamp
    if (p.x < 10) p.x = 10;
    if (p.x + p.w > this.currentRoom.width - 10) p.x = this.currentRoom.width - 10 - p.w;

    // Platform solid collisions
    for (const plat of this.currentRoom.platforms) {
      if (plat.type === 'solid' && this.checkOverlap(p, plat)) {
        if (vx > 0) {
          p.x = plat.x - p.w;
        } else if (vx < 0) {
          p.x = plat.x + plat.w;
        }
        p.vx = 0;
      }
    }

    // Movable object collisions (pushing)
    p.isPushing = false;
    p.pushingObjectId = null;

    for (const m of this.currentRoom.movables) {
      if (this.checkOverlap(p, m)) {
        if (p.isGrounded && Math.abs(vx) > 0.2) {
          p.isPushing = true;
          p.pushingObjectId = m.id;
          const pushAmount = (vx > 0 ? 1 : -1) * (1.8 / m.weight);
          m.vx = pushAmount;
          soundEngine.playScrape();

          // Emits noise when dragging heavy furniture
          this.emitNoise(m.x, m.y, 350, 0.5);

          if (vx > 0) {
            p.x = m.x - p.w;
          } else {
            p.x = m.x + m.w;
          }
        } else {
          if (vx > 0) p.x = m.x - p.w;
          else if (vx < 0) p.x = m.x + m.w;
          p.vx = 0;
        }
      }
    }
  }

  private movePlayerY(vy: number) {
    const p = this.player;
    const wasGrounded = p.isGrounded;
    p.y += vy;
    p.isGrounded = false;

    // Platforms
    for (const plat of this.currentRoom.platforms) {
      if (plat.type === 'solid' && this.checkOverlap(p, plat)) {
        if (vy > 0) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.isGrounded = true;
          if (!wasGrounded) soundEngine.playLand();
        } else if (vy < 0) {
          p.y = plat.y + plat.h;
          p.vy = 0;
        }
      }
    }

    // Movable tops (can climb/jump on crates and chairs)
    for (const m of this.currentRoom.movables) {
      if (this.checkOverlap(p, m)) {
        if (vy > 0 && p.y + p.h - vy <= m.y + 12) {
          p.y = m.y - p.h;
          p.vy = 0;
          p.isGrounded = true;
          if (!wasGrounded) soundEngine.playLand();
        }
      }
    }
  }

  private updateMovables() {
    for (const m of this.currentRoom.movables) {
      m.vx *= 0.78;
      if (Math.abs(m.vx) < 0.08) m.vx = 0;
      m.x += m.vx;

      if (m.x < 30) m.x = 30;
      if (m.x + m.w > this.currentRoom.width - 30) m.x = this.currentRoom.width - 30 - m.w;

      for (const plat of this.currentRoom.platforms) {
        if (plat.type === 'solid' && this.checkOverlap(m, plat)) {
          if (m.vx > 0) m.x = plat.x - m.w;
          else if (m.vx < 0) m.x = plat.x + plat.w;
          m.vx = 0;
        }
      }
    }
  }

  private throwHeldItem() {
    const p = this.player;
    if (!p.heldItem) return;

    const dir = p.facing === 'left' ? -1 : 1;
    this.thrownItem = {
      x: p.x + p.w / 2,
      y: p.y + 10,
      vx: dir * 9.5,
      vy: -5.5,
      active: true,
      icon: p.heldItem.icon,
    };

    this.inventory = this.inventory.filter((i) => i.id !== p.heldItem!.id);
    p.heldItem = null;
  }

  private updateThrownItem() {
    if (!this.thrownItem || !this.thrownItem.active) return;
    const item = this.thrownItem;

    item.vy += 0.45;
    item.x += item.vx;
    item.y += item.vy;

    let shattered = false;
    for (const plat of this.currentRoom.platforms) {
      if (plat.type === 'solid' && this.checkPointInRect(item.x, item.y, plat)) {
        shattered = true;
        break;
      }
    }

    if (item.y > 640 || shattered) {
      item.active = false;
      soundEngine.playDistractionShatter();
      this.emitNoise(item.x, item.y, 850, 1.0);
    }
  }

  private updateBackgroundMonster() {
    if (this.currentRoom.hasBackgroundMonster && this.currentRoom.backgroundMonsterPos) {
      const bm = this.currentRoom.backgroundMonsterPos;
      bm.x += bm.dir * 0.45;
      if (bm.x > 2100) bm.dir = -1;
      if (bm.x < 400) bm.dir = 1;
    }
  }

  public triggerCaretakerArrival() {
    if (this.monster || this.arrivalTelegraphActive) return;
    this.arrivalTelegraphActive = true;
    this.arrivalWarningTimer = 5.0; // 5 seconds of advance warning!
    this.doorRattleTimer = 0;

    soundEngine.playBellToll();
    soundEngine.playDoorRattle();

    this.currentRoom.objectiveText = "⚠️ HEAVY FOOTSTEPS OUTSIDE! THE CARETAKER IS COMING... HIDE IN THE ARMOIRE OR UNDER THE BED!";
  }

  public spawnCaretakerInsideRoom() {
    if (this.monster) return;
    soundEngine.playDoor(false);
    soundEngine.playMonsterAlert();

    this.currentRoom.objectiveText = "THE CARETAKER ENTERED! STAY HIDDEN UNTIL HE TURNS AWAY!";

    this.monster = {
      x: 1820,
      y: 615,
      w: 38,
      h: 100,
      vx: 0,
      facing: 'left',
      state: 'INVESTIGATE',
      stateTimer: 0,
      patrolLeft: 460,
      patrolRight: 1820,
      targetX: 520, // Stalks towards armoire and bed
      originX: 1820,
      chaseTimer: 0,
      searchTimer: 0,
      animTimer: 0,
      lanternAngle: 0.35,
      headTilt: 0,
      hearingSensitivity: 1.0,
      speed: 1.15, // Slow, terrifying, deliberate stalker speed giving player time!
      alertLevel: 0,
    };
    this.applyDifficultyToMonster(this.monster);
    soundEngine.playMonsterStep(0.9);
  }

  public emitNoise(x: number, y: number, radius: number, intensity: number) {
    if (!this.monster && !this.arrivalTelegraphActive) {
      if (this.currentRoom.id === 'ch1_bedroom') {
        this.noiseAccumulator = (this.noiseAccumulator || 0) + intensity;
        if (this.noiseAccumulator >= 12.0) {
          this.triggerCaretakerArrival();
        } else if (this.noiseAccumulator >= 6.0) {
          soundEngine.playMonsterStep(0.25);
        }
      }
      return;
    }

    if (!this.monster) return;

    const dx = Math.abs(this.monster.x - x);
    if (dx <= radius) {
      if (this.monster.state !== 'CHASE' && this.monster.state !== 'NOTICE') {
        this.monster.state = 'NOTICE';
        this.monster.targetX = x;
        this.monster.stateTimer = 0;
        this.monster.facing = x < this.monster.x ? 'left' : 'right';
        soundEngine.playMonsterAlert();
      }
    }
  }

  /**
   * 7-State Monster AI State Machine:
   * 1. IDLE: Pauses, listens
   * 2. PATROL: Paces back and forth in designated area
   * 3. NOTICE: Freezes upon hearing a sound or seeing player, raises lantern, tilts head
   * 4. INVESTIGATE: Stalks toward noise/investigation location
   * 5. SEARCH: Checks hiding spots and surroundings
   * 6. CHASE: Lunges into direct pursuit
   * 7. RETURN: Slowly retreats back to patrol bounds with back turned
   */
  private updateMonsterAI() {
    const m = this.monster;
    if (!m) return;

    const p = this.player;
    m.stateTimer += 0.016;

    const distToPlayer = Math.hypot(m.x - p.x, m.y - p.y);
    const mDir = m.facing === 'left' ? -1 : 1;
    const playerInFront = (p.x - m.x) * mDir > 0;

    const visionRange = this.difficulty === 'EASY' ? 220 : this.difficulty === 'HARD' ? 380 : 300;
    const canSeePlayer =
      !p.isHiding &&
      playerInFront &&
      distToPlayer < visionRange &&
      Math.abs(p.y - m.y) < 120 &&
      !(this.steamActive && this.currentRoom.id === 'ch4_basement');

    // Footsteps audio
    const maxAudioDist = 900;
    if (distToPlayer < maxAudioDist) {
      const proximity = 1 - distToPlayer / maxAudioDist;
      if (Math.random() < 0.04) {
        soundEngine.playMonsterStep(proximity);
      }
    }

    switch (m.state) {
      case 'PATROL': {
        m.headTilt = 0;
        m.x += mDir * m.speed;

        if (m.facing === 'left' && m.x <= m.patrolLeft) {
          m.state = 'IDLE';
          m.stateTimer = 0;
          m.facing = 'right';
        } else if (m.facing === 'right' && m.x >= m.patrolRight) {
          m.state = 'IDLE';
          m.stateTimer = 0;
          m.facing = 'left';
        }

        if (canSeePlayer) {
          m.state = 'NOTICE';
          m.stateTimer = 0;
          soundEngine.playMonsterAlert();
        }
        break;
      }

      case 'IDLE': {
        m.vx = 0;
        m.headTilt = Math.sin(m.stateTimer * 2) * 0.22;
        if (m.stateTimer > 2.5) {
          m.state = 'PATROL';
          m.stateTimer = 0;
        }
        if (canSeePlayer) {
          m.state = 'NOTICE';
          m.stateTimer = 0;
          soundEngine.playMonsterAlert();
        }
        break;
      }

      case 'NOTICE': {
        // Freezes on alert, lifts lantern high, listens
        m.vx = 0;
        m.headTilt = -0.15;
        m.lanternAngle = 0.55;
        if (m.stateTimer > 1.2) {
          if (canSeePlayer) {
            this.triggerChase();
          } else {
            m.state = 'INVESTIGATE';
            m.stateTimer = 0;
          }
        }
        break;
      }

      case 'INVESTIGATE': {
        const dx = m.targetX - m.x;
        m.facing = dx < 0 ? 'left' : 'right';
        m.x += (dx < 0 ? -1 : 1) * m.speed;
        m.lanternAngle = 0.35 + Math.sin(m.stateTimer * 3) * 0.1;

        if (Math.abs(dx) < 25 || m.stateTimer > 16.0) {
          m.state = 'SEARCH';
          m.stateTimer = 0;
        }

        if (canSeePlayer) {
          m.state = 'NOTICE';
          m.stateTimer = 0;
          soundEngine.playMonsterAlert();
        }
        break;
      }

      case 'SEARCH': {
        m.vx = 0;
        m.lanternAngle = Math.sin(m.stateTimer * 2.5) * 0.5;
        m.headTilt = Math.cos(m.stateTimer * 2) * 0.25;

        if (Math.floor(m.stateTimer * 1.5) % 2 === 0) {
          m.facing = 'left';
        } else {
          m.facing = 'right';
        }

        if (m.stateTimer > 4.5) {
          m.state = 'RETURN';
          m.stateTimer = 0;
          m.facing = 'right'; // Turns his back towards bedroom door!
          if (this.currentRoom.id === 'ch1_bedroom') {
            this.currentRoom.objectiveText = "The Caretaker's back is turned! Sneak past him and unlock the door.";
          }
        }

        if (canSeePlayer) {
          m.state = 'NOTICE';
          m.stateTimer = 0;
          soundEngine.playMonsterAlert();
        }
        break;
      }

      case 'RETURN': {
        // Retreats back toward origin patrol zone (east door / desk) with back turned!
        const dx = m.originX - m.x;
        m.facing = dx < 0 ? 'left' : 'right';
        m.x += (dx < 0 ? -1 : 1) * (m.speed * 0.85);
        m.lanternAngle = 0.2;

        if (Math.abs(dx) < 30 || m.stateTimer > 12.0) {
          m.state = 'PATROL';
          m.stateTimer = 0;
          m.patrolLeft = 1100;
          m.patrolRight = 1820;
        }

        if (canSeePlayer) {
          m.state = 'NOTICE';
          m.stateTimer = 0;
          soundEngine.playMonsterAlert();
        }
        break;
      }

      case 'CHASE': {
        m.lanternAngle = 0.1;
        m.headTilt = 0.05;
        const chaseSpeed = m.speed * 1.75;
        const chaseDir = p.x < m.x ? -1 : 1;
        m.facing = chaseDir < 0 ? 'left' : 'right';
        m.x += chaseDir * chaseSpeed;

        if (p.isHiding) {
          m.chaseTimer += 0.016;
          if (m.chaseTimer > 2.0) {
            m.state = 'SEARCH';
            m.stateTimer = 0;
            m.chaseTimer = 0;
          }
        } else {
          m.chaseTimer = 0;
        }

        // Caught check
        if (!p.isHiding && distToPlayer < 40) {
          this.triggerGameOver();
        }
        break;
      }
    }
  }

  private triggerChase() {
    if (!this.monster) return;
    this.monster.state = 'CHASE';
    this.monster.stateTimer = 0;
    this.monster.chaseTimer = 0;
    soundEngine.playMonsterAlert();
  }

  private triggerGameOver() {
    this.isGameOver = true;
    soundEngine.playGameOver();
  }

  private updateInteractionPrompt(inputs: InputState) {
    const p = this.player;
    this.activePrompt = null;

    let closestItem: Interactable | null = null;
    let closestDist = 70;

    for (const item of this.currentRoom.interactables) {
      const dist = Math.hypot(p.x + p.w / 2 - (item.x + item.w / 2), p.y + p.h / 2 - (item.y + item.h / 2));
      if (dist < closestDist) {
        closestDist = dist;
        closestItem = item;
      }
    }

    if (closestItem) {
      if (closestItem.type === 'hiding_wardrobe' || closestItem.type === 'hiding_table') {
        this.activePrompt = p.isHiding ? '[E] Step Out of Hiding' : closestItem.promptText;
      } else if (closestItem.type === 'item_pickup' && !closestItem.isUsed) {
        this.activePrompt = closestItem.promptText;
      } else if (closestItem.type === 'door') {
        this.activePrompt = closestItem.promptText;
      } else if (closestItem.type === 'switch' || closestItem.type === 'valve') {
        this.activePrompt = closestItem.promptText;
      } else if (closestItem.type === 'note') {
        this.activePrompt = closestItem.promptText;
      } else if (closestItem.type === 'exit_gate') {
        this.activePrompt = closestItem.isUnlocked ? '[E] Burst Through Gate' : 'Barred by Heavy Chains';
      }

      if (inputs.interact) {
        inputs.interact = false;
        this.handleInteraction(closestItem);
      }
    }
  }

  private handleInteraction(item: Interactable) {
    const p = this.player;

    if (item.id === 'curtain_swing_ch1') {
      p.isSwinging = true;
      p.animTimer = 0;
      soundEngine.playJump();
    } else if (item.type === 'hiding_wardrobe' || item.type === 'hiding_table') {
      if (p.isHiding) {
        this.exitHiding();
      } else {
        p.isHiding = true;
        p.hidingSpotId = item.id;
        p.x = item.x + item.w / 2 - p.w / 2;
        soundEngine.playHide(true);
      }
    } else if (item.type === 'item_pickup' && !item.isUsed) {
      item.isUsed = true;
      const newItem: InventoryItem = {
        id: item.itemId || item.id,
        name: item.itemName || 'Mysterious Object',
        description: item.detailText || '',
        icon: item.itemIcon || 'key',
        isThrowable: item.itemIcon === 'goblet' || item.itemIcon === 'music',
      };
      this.inventory.push(newItem);
      p.heldItem = newItem;
      soundEngine.playPickup();

      // Trigger Caretaker's arrival in the Bedroom!
      if (item.itemId === 'key_rusty_bedroom') {
        this.triggerCaretakerArrival();
      }
    } else if (item.type === 'door') {
      if (item.isUnlocked) {
        this.transitionRoom(item.targetRoomId!, item.targetPlayerPos!);
      } else if (item.requiredItemId) {
        const hasKey = this.inventory.some((i) => i.id === item.requiredItemId);
        if (hasKey) {
          item.isUnlocked = true;
          soundEngine.playUnlock();
          this.transitionRoom(item.targetRoomId!, item.targetPlayerPos!);
        } else {
          soundEngine.playWoodCreak(0.08);
        }
      }
    } else if (item.type === 'fuse_box') {
      const hasFuse = this.inventory.some((i) => i.id === item.requiredItemId);
      if (hasFuse) {
        item.isUsed = true;
        soundEngine.playUnlock();
        const keyItem = this.currentRoom.interactables.find((i) => i.id === 'key_library_ch2');
        if (keyItem) {
          keyItem.isUsed = false;
        }
      }
    } else if (item.type === 'valve') {
      item.isUsed = true;
      this.steamActive = true;
      soundEngine.playUnlock();
    } else if (item.type === 'switch') {
      item.isUsed = true;
      soundEngine.playUnlock();

      if (item.id === 'switch_generator_ch4') {
        const elevator = this.currentRoom.interactables.find((i) => i.id === 'door_ch4_to_ch5');
        if (elevator) {
          elevator.isUnlocked = true;
        }
      } else if (item.id.startsWith('lever_')) {
        if (!this.clockPuzzleWeights.includes(item.id)) {
          this.clockPuzzleWeights.push(item.id);
        }
        if (this.clockPuzzleWeights.length >= 3) {
          const gate = this.currentRoom.interactables.find((i) => i.id === 'gate_escape_ch5');
          if (gate) {
            gate.isUnlocked = true;
            if (this.monster) {
              this.monster.x = 800;
              this.triggerChase();
            }
          }
        }
      }
    } else if (item.type === 'exit_gate') {
      if (item.isUnlocked) {
        this.isVictory = true;
        soundEngine.playVictory();
      }
    } else if (item.type === 'note') {
      this.activeNote = {
        title: item.promptText.replace('[E] ', ''),
        content: item.detailText || '',
      };
      soundEngine.playPickup();
    }
  }

  private exitHiding() {
    this.player.isHiding = false;
    this.player.hidingSpotId = null;
    soundEngine.playHide(false);
  }

  private transitionRoom(targetRoomId: string, spawnPos: { x: number; y: number }) {
    if (!ROOMS[targetRoomId]) return;

    soundEngine.playDoor(true);
    this.checkpointRoomId = targetRoomId;
    this.currentRoom = JSON.parse(JSON.stringify(ROOMS[targetRoomId]));
    this.player.x = spawnPos.x;
    this.player.y = spawnPos.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.action = 'idle';
    this.player.wakeTimer = 999;
    this.initMonster();
  }

  private updateCamera(viewWidth: number, viewHeight: number) {
    // Camera lead: slight look-ahead based on facing direction
    const leadX = (this.player.facing === 'left' ? -1 : 1) * (this.player.isRunning ? 60 : 30);
    const targetX = this.player.x + leadX - viewWidth * 0.45;
    // Ground camera so player sits comfortably in lower third of view
    const targetY = Math.min(this.player.y - viewHeight * 0.65, this.currentRoom.height - viewHeight);

    this.cameraX += (targetX - this.cameraX) * 0.08;
    this.cameraY += (targetY - this.cameraY) * 0.08;

    const maxCamX = Math.max(0, this.currentRoom.width - viewWidth);
    const maxCamY = Math.max(0, this.currentRoom.height - viewHeight);

    if (this.cameraX < 0) this.cameraX = 0;
    if (this.cameraX > maxCamX) this.cameraX = maxCamX;
    if (this.cameraY < 0) this.cameraY = 0;
    if (this.cameraY > maxCamY) this.cameraY = maxCamY;
  }

  private updateAudioTension() {
    if (!this.monster) return;

    const dist = Math.hypot(this.monster.x - this.player.x, this.monster.y - this.player.y);
    const isChasing = this.monster.state === 'CHASE';

    const now = Date.now();
    const interval = isChasing ? 380 : dist < 450 ? 750 : 1500;

    if (now - this.lastHeartbeatTime > interval && (isChasing || dist < 600)) {
      this.lastHeartbeatTime = now;
      const intensity = isChasing ? 1.0 : Math.max(0.2, 1 - dist / 600);
      soundEngine.playHeartbeat(isChasing ? 140 : 80, intensity);
    }
  }

  private checkOverlap(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  private checkPointInRect(px: number, py: number, r: Rect): boolean {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }
}
