/**
 * World and Level Data for "Don't Wake the Ghost"
 * Focus on First Room (The Bedroom) with rich dimensions, layered objects, and reachable key.
 */

import { RoomData } from '../types/game';

export const ROOMS: Record<string, RoomData> = {
  // CHAPTER 1: THE BEDROOM - Richly Detailed Victorian Bedroom
  ch1_bedroom: {
    id: 'ch1_bedroom',
    chapter: 1,
    chapterTitle: 'THE BEDROOM',
    name: 'The Forgotten Chamber',
    width: 2000,
    height: 800,
    spawnPoint: { x: 220, y: 640 },
    ambientColor: 'rgba(15, 23, 38, 0.45)', // Substantially brighter, soft atmospheric tint
    objectiveText: 'Explore the bedroom and find the brass key to unlock the door.',
    hintText: 'Push the steamer trunk to jump to the shelf, or swing across on the velvet window curtain!',
    windows: [
      { x: 500, y: 140, w: 220, h: 360 },
    ],
    moonlightRay: { x: 610, y: 150, w: 320, angle: 0.35 },
    lamps: [
      { x: 380, y: 600 }, // Nightstand candle lamp
      { x: 1320, y: 550 }, // Writing desk banker lamp
    ],
    platforms: [
      // Main wooden floor
      { x: 0, y: 710, w: 2000, h: 90, type: 'solid', texture: 'wood' },
      // Left boundary wall
      { x: 0, y: 0, w: 50, h: 710, type: 'solid', texture: 'wood' },
      // Right boundary wall
      { x: 1950, y: 0, w: 50, h: 710, type: 'solid', texture: 'wood' },

      // High carved armoire shelf (holding the brass bedroom key - reachable by trunk jump or curtain swing!)
      { x: 860, y: 540, w: 240, h: 26, type: 'solid', texture: 'wood' },

      // Bed platform surface (where player wakes and can walk on)
      { x: 140, y: 630, w: 210, h: 80, type: 'solid', texture: 'carpet' },

      // Writing desk top surface
      { x: 1220, y: 600, w: 190, h: 25, type: 'solid', texture: 'wood' },

      // Overhead rafters/ceiling beams
      { x: 80, y: 120, w: 550, h: 30, type: 'solid', texture: 'wood' },
      { x: 750, y: 100, w: 600, h: 30, type: 'solid', texture: 'wood' },
      { x: 1450, y: 120, w: 480, h: 30, type: 'solid', texture: 'wood' },
    ],
    creakyPlanks: [
      // Creaky loose floorboard between bed and wardrobe
      { x: 490, y: 708, w: 65, h: 4 },
    ],
    movables: [
      // Antique brass-bound steamer trunk to push under high shelf
      {
        id: 'trunk_ch1',
        x: 640,
        y: 630,
        w: 80,
        h: 80,
        vx: 0,
        vy: 0,
        weight: 1.0,
        isGrounded: true,
        label: 'Antique Steamer Trunk',
        canClimb: true,
      },
    ],
    interactables: [
      // Brass Bedroom Key on the high carved shelf
      {
        id: 'key_ch1',
        type: 'item_pickup',
        x: 960,
        y: 495,
        w: 40,
        h: 40,
        promptText: '[E] Pick up Brass Bedroom Key',
        itemId: 'key_rusty_bedroom',
        itemName: 'Brass Bedroom Key',
        itemIcon: 'key',
        isUsed: false,
      },
      // Velvet Window Curtain Swing Point!
      {
        id: 'curtain_swing_ch1',
        type: 'rope' as any,
        x: 690,
        y: 350,
        w: 55,
        h: 220,
        promptText: '[E] Swing Across on Velvet Curtain',
        isOpen: false,
      },
      // Under-bed crawlspace hiding spot
      {
        id: 'hiding_bed_ch1',
        type: 'hiding_table',
        x: 150,
        y: 640,
        w: 180,
        h: 70,
        promptText: '[E] Hide under Bed',
        isOpen: false,
      },
      // Wardrobe hiding spot (tall Victorian armoire)
      {
        id: 'wardrobe_ch1',
        type: 'hiding_wardrobe',
        x: 400,
        y: 450,
        w: 95,
        h: 260,
        promptText: '[E] Hide inside Armoire',
        isOpen: false,
      },
      // Locked oak exit door
      {
        id: 'door_ch1_exit',
        type: 'door',
        x: 1820,
        y: 490,
        w: 85,
        h: 220,
        promptText: '[E] Unlock Bedroom Door',
        requiredItemId: 'key_rusty_bedroom',
        targetRoomId: 'ch1_bedroom',
        targetPlayerPos: { x: 220, y: 640 },
        isUnlocked: false,
      },
      // Clue letter on the writing desk
      {
        id: 'note_ch1',
        type: 'note',
        x: 1260,
        y: 565,
        w: 36,
        h: 36,
        promptText: '[E] Read Curator’s Journal',
        detailText: '“Fragment XVII: The manor has long forgotten morning. He still roams the quiet floors with his iron lantern, listening for every tremor—running heels, sliding trunks, the ringing chime of old brass. When disturbed, he enters from the east threshold. There is only one sanctuary in this chamber where his cold gaze cannot reach: inside the carved mahogany armoire. If you hear the latch turn, vanish within the dark wood and do not breathe until his heavy steps turn away.”',
      },
    ],
  },
};
