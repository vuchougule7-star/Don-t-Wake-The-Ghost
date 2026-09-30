/**
 * Don't Wake the Ghost - Enhanced Game Types & Interfaces
 */

export type GameState = 
  | 'INTRO' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'GAME_OVER' 
  | 'VICTORY';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type PlayerAction = 
  | 'idle' 
  | 'walk' 
  | 'run' 
  | 'crouch' 
  | 'crouch_walk' 
  | 'jump' 
  | 'fall' 
  | 'climb' 
  | 'push' 
  | 'hidden' 
  | 'waking' 
  | 'swinging' 
  | 'caught';

export type MonsterState = 
  | 'IDLE' 
  | 'PATROL' 
  | 'NOTICE' 
  | 'INVESTIGATE' 
  | 'SEARCH' 
  | 'CHASE' 
  | 'RETURN';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Platform extends Rect {
  type: 'solid' | 'one-way' | 'hazard' | 'ladder';
  color?: string;
  texture?: 'wood' | 'stone' | 'metal' | 'carpet' | 'bookshelf';
}

export type InteractableType = 
  | 'door' 
  | 'hiding_wardrobe' 
  | 'hiding_table' 
  | 'item_pickup' 
  | 'push_block' 
  | 'switch' 
  | 'ladder' 
  | 'note' 
  | 'fuse_box' 
  | 'clock_puzzle' 
  | 'valve' 
  | 'exit_gate';

export interface Interactable {
  id: string;
  type: InteractableType;
  x: number;
  y: number;
  w: number;
  h: number;
  promptText: string;
  isUsed?: boolean;
  requiredItemId?: string;
  itemId?: string; // If picking up an item
  itemName?: string;
  itemIcon?: string;
  targetRoomId?: string;
  targetPlayerPos?: Vector2D;
  detailText?: string;
  isOpen?: boolean;
  isUnlocked?: boolean;
  customState?: Record<string, any>;
}

export interface MovableObject extends Rect {
  id: string;
  vx: number;
  vy: number;
  weight: number;
  isGrounded: boolean;
  label?: string;
  canClimb: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  isThrowable?: boolean;
}

export interface NoiseEvent {
  x: number;
  y: number;
  radius: number;
  intensity: number; // 0 to 1
  time: number;
}

export interface CreakyPlank extends Rect {
  lastCreakTime?: number;
}

export interface RoomData {
  id: string;
  chapter: number;
  chapterTitle: string;
  name: string;
  width: number;
  height: number;
  spawnPoint: Vector2D;
  platforms: Platform[];
  interactables: Interactable[];
  movables: MovableObject[];
  creakyPlanks?: CreakyPlank[];
  ambientColor: string;
  moonlightRay?: { x: number; y: number; w: number; angle: number };
  windows?: Rect[];
  lamps?: Vector2D[];
  notes?: { x: number; y: number; title: string; content: string }[];
  monsterStart?: {
    x: number;
    y: number;
    patrolLeft: number;
    patrolRight: number;
  };
  hasBackgroundMonster?: boolean;
  backgroundMonsterPos?: { x: number; y: number; dir: number };
  objectiveText: string;
  hintText?: string;
}

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  isCrouching: boolean;
  isRunning: boolean;
  isClimbing: boolean;
  facing: 'left' | 'right';
  action: PlayerAction;
  animTimer: number;
  wakeTimer: number; // For wake-up cinematic in bedroom
  flashlightOn: boolean;
  isHiding: boolean;
  hidingSpotId: string | null;
  heldItem: InventoryItem | null;
  isPushing: boolean;
  pushingObjectId: string | null;
  isSwinging?: boolean;
  swingAngle?: number;
  swingSpeed?: number;
  swingLength?: number;
}

export interface Monster {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  facing: 'left' | 'right';
  state: MonsterState;
  stateTimer: number;
  patrolLeft: number;
  patrolRight: number;
  targetX: number;
  originX: number;
  chaseTimer: number;
  searchTimer: number;
  animTimer: number;
  lanternAngle: number;
  headTilt: number;
  hearingSensitivity: number; // based on difficulty
  speed: number;
  alertLevel: number; // 0 to 1
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
}
