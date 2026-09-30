/**
 * Handcrafted Cinematic 2D Renderer for "Don't Wake the Ghost"
 * High visual fidelity, rich layered furniture silhouettes, warm & cool lighting,
 * and an expressive small child-like protagonist in an enormous, beautiful Victorian bedroom.
 */

import { Player, Monster, RoomData, MovableObject, Interactable, Particle, Difficulty } from '../types/game';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dustMotes: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; phase: number }[] = [];
  private rainDrops: { x: number; y: number; speed: number; len: number }[] = [];
  private candleFlicker: number = 0;
  private clockPendulum: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.initAtmosphere();
  }

  private initAtmosphere() {
    for (let i = 0; i < 70; i++) {
      this.dustMotes.push({
        x: Math.random() * 2400,
        y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.15 - Math.random() * 0.25,
        size: 1.2 + Math.random() * 2.4,
        alpha: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
      });
    }

    for (let i = 0; i < 50; i++) {
      this.rainDrops.push({
        x: Math.random() * 2400,
        y: Math.random() * 900,
        speed: 10 + Math.random() * 8,
        len: 12 + Math.random() * 16,
      });
    }
  }

  public render(
    room: RoomData,
    player: Player,
    monster: Monster | null,
    cameraX: number,
    cameraY: number,
    distractionItem: any,
    steamActive: boolean,
    difficulty: Difficulty,
    viewWidth: number,
    viewHeight: number,
    arrivalTelegraphActive: boolean = false,
    arrivalWarningTimer: number = 0
  ) {
    const ctx = this.ctx;
    ctx.save();

    // Base background: Deep twilight slate
    ctx.fillStyle = '#101726';
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    // Camera transform
    ctx.translate(-cameraX, -cameraY);

    // 1. BACKGROUND LAYER: Deep blue-gray damask wallpaper, ceiling molding, and wainscoting
    this.renderWallArchitecture(ctx, room);

    // 2. WINDOW LAYER: Grand Gothic arched window with full moon, clouds, rain, and velvet curtains
    this.renderWindowAndCurtains(ctx, room);

    // 3. WALL DECOR & FURNITURE BACKGROUND: Gilded paintings with picture lights, grandfather clock
    this.renderWallDecorations(ctx, room);

    // 4. FLOOR & RUG: Rich wood planks, nailheads, and ornate distressed Persian runner rug
    this.renderFloorAndRugs(ctx, room);

    // 5. MIDGROUND FURNITURE: Ornate bed, towering armoire, writing desk, chair, high shelf
    this.renderBedroomFurniture(ctx, room, player);

    // 6. MOVABLE OBJECTS: Steamer trunk with brass corners and leather straps
    this.renderMovables(ctx, room.movables);

    // 7. INTERACTIVE PROMPTS & KEY ITEM: Glowing brass bedroom key on the high shelf, locked door
    this.renderInteractiveObjects(ctx, room.interactables, player, arrivalTelegraphActive, arrivalWarningTimer);

    // 8. PLAYER CHARACTER: Small child-like protagonist with expressive animations
    this.renderPlayer(ctx, player);

    // 8.5 MONSTER RENDERING: The Caretaker - Towering figure with swinging lantern and dark coat
    if (monster) {
      this.renderMonster(ctx, monster, player, cameraX, cameraY, viewWidth, viewHeight);
    }

    // 9. ATMOSPHERIC PARTICLES: Floating luminous dust motes in light beams
    this.renderAtmosphericDust(ctx, room);

    // 10. LIGHTING OVERLAY: Volumetric cool moonlight ray + warm amber lamp glows + lantern cutouts
    this.renderCinematicLighting(ctx, room, player, monster, cameraX, cameraY, viewWidth, viewHeight);

    // 11. FOREGROUND FRAMING: Ceiling timber trusses, hanging brass chains, subtle vignetting
    this.renderForegroundArchitecture(ctx, room, cameraX, cameraY, viewWidth, viewHeight);

    // 12. DIRECTIONAL THREAT INDICATORS & ARRIVAL ALERTS
    this.renderThreatIndicators(ctx, monster, cameraX, cameraY, viewWidth, viewHeight, arrivalTelegraphActive, arrivalWarningTimer);

    ctx.restore();
  }

  /**
   * Layer 1: Victorian wallpaper with ornamental damask pattern & carved wainscoting
   */
  private renderWallArchitecture(ctx: CanvasRenderingContext2D, room: RoomData) {
    // Upper wall background gradient (Steel-blue / twilight slate)
    const wallGrad = ctx.createLinearGradient(0, 0, 0, 520);
    wallGrad.addColorStop(0, '#162032');
    wallGrad.addColorStop(0.7, '#1c283d');
    wallGrad.addColorStop(1, '#23324c');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, room.width, 520);

    // Ornamental Damask pattern
    ctx.save();
    ctx.strokeStyle = 'rgba(45, 62, 92, 0.45)';
    ctx.lineWidth = 1.5;
    const spacing = 70;
    for (let x = 30; x < room.width; x += spacing) {
      for (let y = 30; y < 510; y += spacing) {
        // Damask fleur-de-lis / acanthus curl
        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.bezierCurveTo(x + 12, y - 6, x + 14, y + 8, x, y + 16);
        ctx.bezierCurveTo(x - 14, y + 8, x - 12, y - 6, x, y - 12);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y + 2, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Ceiling Crown Molding
    ctx.fillStyle = '#2d2218';
    ctx.fillRect(0, 0, room.width, 18);
    ctx.fillStyle = '#423223';
    ctx.fillRect(0, 18, room.width, 8);
    ctx.fillStyle = '#1c150e';
    ctx.fillRect(0, 26, room.width, 4);

    // Lower Wainscoting (Carved dark mahogany wood paneling)
    ctx.fillStyle = '#261b13';
    ctx.fillRect(0, 520, room.width, 190);

    // Chair rail top molding with decorative bevels
    ctx.fillStyle = '#4d3725';
    ctx.fillRect(0, 514, room.width, 6);
    ctx.fillStyle = '#3a291b';
    ctx.fillRect(0, 520, room.width, 6);
    ctx.fillStyle = '#19110a';
    ctx.fillRect(0, 526, room.width, 4);

    // Recessed carved wood panels along the wall
    for (let x = 60; x < room.width; x += 150) {
      // Outer bevel
      ctx.fillStyle = '#1b120c';
      ctx.fillRect(x, 540, 115, 155);
      ctx.strokeStyle = '#432f1f';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, 540, 115, 155);

      // Inner raised panel
      ctx.fillStyle = '#2d1f14';
      ctx.fillRect(x + 8, 548, 99, 139);
      ctx.strokeStyle = '#180f08';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 8, 548, 99, 139);

      // Subtle vertical wood grain
      ctx.strokeStyle = 'rgba(75, 52, 35, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 35, 552);
      ctx.lineTo(x + 35, 680);
      ctx.moveTo(x + 75, 552);
      ctx.lineTo(x + 75, 680);
      ctx.stroke();
    }

    // Wainscoting baseboard trim
    ctx.fillStyle = '#19100a';
    ctx.fillRect(0, 700, room.width, 10);
    ctx.fillStyle = '#3a2718';
    ctx.fillRect(0, 696, room.width, 4);
  }

  /**
   * Layer 2: Gothic Arched Window, Full Moon, Rain, and Layered Draped Curtains
   */
  private renderWindowAndCurtains(ctx: CanvasRenderingContext2D, room: RoomData) {
    if (!room.windows) return;

    room.windows.forEach((win) => {
      // Carved stone window frame with arch
      ctx.fillStyle = '#2a3547';
      ctx.beginPath();
      ctx.roundRect(win.x - 12, win.y - 12, win.w + 24, win.h + 24, [110, 110, 0, 0]);
      ctx.fill();
      ctx.strokeStyle = '#41526b';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Stone keystone at top arch center
      ctx.fillStyle = '#4c5e79';
      ctx.fillRect(win.x + win.w / 2 - 14, win.y - 18, 28, 20);
      ctx.strokeStyle = '#1e2838';
      ctx.lineWidth = 2;
      ctx.strokeRect(win.x + win.w / 2 - 14, win.y - 18, 28, 20);

      // Night sky with moonlight through window glass
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(win.x, win.y, win.w, win.h, [100, 100, 0, 0]);
      ctx.clip();

      const skyGrad = ctx.createLinearGradient(win.x, win.y, win.x, win.y + win.h);
      skyGrad.addColorStop(0, '#0c1626');
      skyGrad.addColorStop(0.5, '#162844');
      skyGrad.addColorStop(1, '#0e1b2f');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(win.x, win.y, win.w, win.h);

      // Luminous Full Moon
      const moonX = win.x + win.w * 0.48;
      const moonY = win.y + 90;

      // Soft lunar outer glow
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 80);
      moonGlow.addColorStop(0, 'rgba(215, 235, 255, 0.75)');
      moonGlow.addColorStop(0.4, 'rgba(165, 205, 255, 0.35)');
      moonGlow.addColorStop(1, 'rgba(165, 205, 255, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 80, 0, Math.PI * 2);
      ctx.fill();

      // Moon disc
      ctx.fillStyle = '#f0f6ff';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Moon craters (subtle grey-blue textural dabs)
      ctx.fillStyle = '#cfddf2';
      ctx.beginPath();
      ctx.arc(moonX - 8, moonY - 6, 7, 0, Math.PI * 2);
      ctx.arc(moonX + 10, moonY - 4, 9, 0, Math.PI * 2);
      ctx.arc(moonX - 2, moonY + 12, 11, 0, Math.PI * 2);
      ctx.arc(moonX + 12, moonY + 14, 5, 0, Math.PI * 2);
      ctx.fill();

      // Drifting clouds across moon
      ctx.fillStyle = 'rgba(28, 44, 72, 0.65)';
      ctx.beginPath();
      ctx.ellipse(moonX - 20, moonY + 18, 45, 12, 0.1, 0, Math.PI * 2);
      ctx.ellipse(moonX + 35, moonY - 10, 35, 10, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Distant dark pine tree treeline silhouette
      ctx.fillStyle = '#080d16';
      for (let tx = win.x - 10; tx < win.x + win.w + 10; tx += 22) {
        ctx.beginPath();
        ctx.moveTo(tx, win.y + win.h);
        ctx.lineTo(tx + 11, win.y + win.h - 55 - (tx % 17) * 2);
        ctx.lineTo(tx + 22, win.y + win.h);
        ctx.fill();
      }

      // Rain droplets running down glass
      ctx.strokeStyle = 'rgba(190, 220, 255, 0.4)';
      ctx.lineWidth = 1.2;
      this.rainDrops.forEach((drop) => {
        drop.y += drop.speed * 0.2;
        if (drop.y > win.y + win.h) drop.y = win.y;
        if (drop.x >= win.x && drop.x <= win.x + win.w) {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.len);
          ctx.stroke();
        }
      });

      // Leaded Diamond Lattice Glass Panes
      ctx.strokeStyle = '#2b3648';
      ctx.lineWidth = 2;
      const step = 28;
      for (let x = win.x - win.h; x < win.x + win.w + win.h; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, win.y);
        ctx.lineTo(x + win.h, win.y + win.h);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, win.y + win.h);
        ctx.lineTo(x + win.h, win.y);
        ctx.stroke();
      }

      // Main heavy Gothic mullions (Vertical center + horizontal dividers)
      ctx.strokeStyle = '#1b2332';
      ctx.lineWidth = 5;
      ctx.beginPath();
      // Center vertical bar
      ctx.moveTo(win.x + win.w / 2, win.y);
      ctx.lineTo(win.x + win.w / 2, win.y + win.h);
      // Horizontal crossbars
      ctx.moveTo(win.x, win.y + win.h * 0.4);
      ctx.lineTo(win.x + win.w, win.y + win.h * 0.4);
      ctx.moveTo(win.x, win.y + win.h * 0.72);
      ctx.lineTo(win.x + win.w, win.y + win.h * 0.72);
      ctx.stroke();

      ctx.restore();

      // Deep Velvet Window Curtains (Draped and gathered with golden ropes)
      // Left Curtain
      ctx.fillStyle = '#481c25'; // Rich deep wine red
      ctx.beginPath();
      ctx.moveTo(win.x - 30, win.y - 15);
      ctx.lineTo(win.x + 35, win.y - 15);
      ctx.bezierCurveTo(win.x + 40, win.y + 120, win.x + 10, win.y + 240, win.x - 15, win.y + win.h + 20);
      ctx.lineTo(win.x - 45, win.y + win.h + 20);
      ctx.closePath();
      ctx.fill();

      // Left curtain deep shadow folds
      ctx.fillStyle = '#2f0f16';
      ctx.beginPath();
      ctx.moveTo(win.x - 10, win.y - 15);
      ctx.lineTo(win.x + 10, win.y - 15);
      ctx.bezierCurveTo(win.x + 15, win.y + 120, win.x - 5, win.y + 240, win.x - 25, win.y + win.h + 20);
      ctx.lineTo(win.x - 35, win.y + win.h + 20);
      ctx.closePath();
      ctx.fill();

      // Right Curtain
      ctx.fillStyle = '#481c25';
      ctx.beginPath();
      ctx.moveTo(win.x + win.w - 35, win.y - 15);
      ctx.lineTo(win.x + win.w + 30, win.y - 15);
      ctx.lineTo(win.x + win.w + 45, win.y + win.h + 20);
      ctx.bezierCurveTo(win.x + win.w - 10, win.y + 240, win.x + win.w - 40, win.y + 120, win.x + win.w - 35, win.y - 15);
      ctx.closePath();
      ctx.fill();

      // Right curtain folds
      ctx.fillStyle = '#2f0f16';
      ctx.beginPath();
      ctx.moveTo(win.x + win.w - 10, win.y - 15);
      ctx.lineTo(win.x + win.w + 10, win.y - 15);
      ctx.lineTo(win.x + win.w + 25, win.y + win.h + 20);
      ctx.bezierCurveTo(win.x + win.w + 5, win.y + 240, win.x + win.w - 15, win.y + 120, win.x + win.w - 10, win.y - 15);
      ctx.closePath();
      ctx.fill();

      // Golden tieback cords and tassels
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Left tie
      ctx.arc(win.x + 8, win.y + win.h * 0.62, 16, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();
      ctx.fillStyle = '#e8c454';
      ctx.fillRect(win.x - 2, win.y + win.h * 0.62, 6, 14);

      // Right tie
      ctx.beginPath();
      ctx.arc(win.x + win.w - 8, win.y + win.h * 0.62, 16, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
      ctx.fillRect(win.x + win.w - 4, win.y + win.h * 0.62, 6, 14);

      // Wooden curtain rod across top with carved brass finials
      ctx.fillStyle = '#614828';
      ctx.fillRect(win.x - 45, win.y - 20, win.w + 90, 8);
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(win.x - 48, win.y - 16, 7, 0, Math.PI * 2);
      ctx.arc(win.x + win.w + 48, win.y - 16, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Layer 3: Paintings with picture sconces & grandfather clock
   */
  private renderWallDecorations(ctx: CanvasRenderingContext2D, room: RoomData) {
    // 1. Ornate Baroque Oil Painting (Center-Right wall)
    const px = 1040;
    const py = 220;
    const pw = 120;
    const ph = 155;

    // Gilded Frame with layered molded relief
    ctx.fillStyle = '#8a6e2f';
    ctx.fillRect(px - 10, py - 10, pw + 20, ph + 20);
    ctx.fillStyle = '#d4b04c';
    ctx.fillRect(px - 6, py - 6, pw + 12, ph + 12);
    ctx.fillStyle = '#4c3912';
    ctx.fillRect(px - 2, py - 2, pw + 4, ph + 4);

    // Dark oil canvas
    ctx.fillStyle = '#12171e';
    ctx.fillRect(px, py, pw, ph);

    // Classical portrait sketch: Eerie aristocratic figure with high lace ruff
    ctx.fillStyle = '#222b39';
    ctx.beginPath();
    ctx.ellipse(px + pw / 2, py + ph * 0.42, 22, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    // Lace ruff collar
    ctx.fillStyle = '#3a4659';
    ctx.beginPath();
    ctx.ellipse(px + pw / 2, py + ph * 0.62, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Coat shoulders
    ctx.fillStyle = '#171e29';
    ctx.fillRect(px + 15, py + ph * 0.66, pw - 30, ph * 0.34);

    // Subtle faint eyes in portrait that reflect light
    ctx.fillStyle = 'rgba(235, 215, 175, 0.45)';
    ctx.fillRect(px + pw / 2 - 7, py + ph * 0.4 - 2, 4, 3);
    ctx.fillRect(px + pw / 2 + 3, py + ph * 0.4 - 2, 4, 3);

    // Brass Picture Sconce Lamp mounted above frame
    ctx.strokeStyle = '#c49e42';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + pw / 2, py - 10);
    ctx.lineTo(px + pw / 2, py - 26);
    ctx.lineTo(px + pw / 2, py - 32);
    ctx.stroke();

    // Horizontal lamp shade
    ctx.fillStyle = '#e8c454';
    ctx.fillRect(px + pw / 2 - 22, py - 35, 44, 7);

    // Picture lamp soft warm downward glow
    const picLight = ctx.createLinearGradient(px + pw / 2, py - 30, px + pw / 2, py + ph);
    picLight.addColorStop(0, 'rgba(255, 215, 120, 0.35)');
    picLight.addColorStop(0.5, 'rgba(255, 215, 120, 0.12)');
    picLight.addColorStop(1, 'rgba(255, 215, 120, 0)');
    ctx.fillStyle = picLight;
    ctx.beginPath();
    ctx.moveTo(px + pw / 2 - 20, py - 28);
    ctx.lineTo(px + pw / 2 + 20, py - 28);
    ctx.lineTo(px + pw + 10, py + ph);
    ctx.lineTo(px - 10, py + ph);
    ctx.closePath();
    ctx.fill();

    // 2. Grandfather Clock (Standing near the wall)
    this.renderGrandfatherClock(ctx, 1550, 410);
  }

  private renderGrandfatherClock(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.clockPendulum = Math.sin(Date.now() * 0.0028) * 0.26;

    // Clock Base & Trunk
    ctx.fillStyle = '#24170d';
    ctx.fillRect(x - 26, y + 20, 52, 280);
    ctx.strokeStyle = '#432c1b';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 26, y + 20, 52, 280);

    // Plinth bottom
    ctx.fillStyle = '#362315';
    ctx.fillRect(x - 32, y + 280, 64, 20);

    // Bonnet Head with broken arch pediment
    ctx.fillStyle = '#3a2517';
    ctx.fillRect(x - 30, y - 30, 60, 55);
    ctx.strokeStyle = '#5a3d25';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x - 30, y - 30, 60, 55);

    // Brass Finial on top
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(x, y - 36, 6, 0, Math.PI * 2);
    ctx.fill();

    // Clock Face Dial
    ctx.fillStyle = '#f2ecd9';
    ctx.beginPath();
    ctx.arc(x, y - 2, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#291b0f';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hour markers (tiny dots)
    ctx.fillStyle = '#22150b';
    for (let h = 0; h < 12; h++) {
      const rad = (h * Math.PI) / 6;
      ctx.fillRect(x + Math.sin(rad) * 15 - 1, y - 2 - Math.cos(rad) * 15 - 1, 2.5, 2.5);
    }

    // Hands stopped at 11:58
    ctx.strokeStyle = '#180e07';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 2);
    ctx.lineTo(x - 2, y - 14); // Hour hand near 12
    ctx.moveTo(x, y - 2);
    ctx.lineTo(x - 4, y - 18); // Minute hand
    ctx.stroke();

    // Pendulum Glass Chamber
    ctx.fillStyle = '#140c06';
    ctx.fillRect(x - 18, y + 65, 36, 175);
    ctx.strokeStyle = '#442d1b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 18, y + 65, 36, 175);

    // Swinging Brass Pendulum
    ctx.save();
    ctx.translate(x, y + 75);
    ctx.rotate(this.clockPendulum);

    ctx.strokeStyle = '#c49a35';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 115);
    ctx.stroke();

    // Brass Bob disc
    ctx.fillStyle = '#e8c454';
    ctx.beginPath();
    ctx.arc(0, 115, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7c5a15';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Layer 4: Floorboards, knots, and frayed Persian runner rug
   */
  private renderFloorAndRugs(ctx: CanvasRenderingContext2D, room: RoomData) {
    // Rich wooden floorboards
    ctx.fillStyle = '#251b14';
    ctx.fillRect(0, 710, room.width, 90);

    // Planks dividers
    ctx.strokeStyle = '#150f0b';
    ctx.lineWidth = 2;
    for (let px = 0; px < room.width; px += 85) {
      ctx.beginPath();
      ctx.moveTo(px, 710);
      ctx.lineTo(px, 800);
      ctx.stroke();

      // Nail pegs at plank ends
      ctx.fillStyle = '#0c0806';
      ctx.fillRect(px + 6, 716, 2.5, 2.5);
      ctx.fillRect(px + 6, 792, 2.5, 2.5);

      // Subtle horizontal wood grain lines
      ctx.strokeStyle = 'rgba(64, 46, 33, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 10, 740);
      ctx.lineTo(px + 75, 740);
      ctx.moveTo(px + 12, 765);
      ctx.lineTo(px + 78, 765);
      ctx.stroke();
    }

    // Top floor highlight line
    ctx.fillStyle = '#3e2d21';
    ctx.fillRect(0, 710, room.width, 4);

    // Ornate Distressed Persian Runner Rug
    const rx = 340;
    const ry = 712;
    const rw = 980;
    const rh = 16;

    // Rug Base (Deep Crimson)
    ctx.fillStyle = '#5c1f26';
    ctx.fillRect(rx, ry, rw, rh);

    // Cream / Gold floral border stripe
    ctx.fillStyle = '#cfb584';
    ctx.fillRect(rx + 15, ry + 2, rw - 30, 3);
    ctx.fillRect(rx + 15, ry + rh - 5, rw - 30, 3);

    // Diamond medallion center pattern
    ctx.fillStyle = '#2e1115';
    for (let mx = rx + 35; mx < rx + rw - 35; mx += 40) {
      ctx.beginPath();
      ctx.moveTo(mx, ry + rh / 2 - 4);
      ctx.lineTo(mx + 6, ry + rh / 2);
      ctx.lineTo(mx, ry + rh / 2 + 4);
      ctx.lineTo(mx - 6, ry + rh / 2);
      ctx.closePath();
      ctx.fill();
    }

    // Frayed fringe at left and right ends
    ctx.strokeStyle = '#ded0b4';
    ctx.lineWidth = 1;
    for (let fy = ry; fy <= ry + rh; fy += 2.5) {
      ctx.beginPath();
      ctx.moveTo(rx, fy);
      ctx.lineTo(rx - 8, fy);
      ctx.moveTo(rx + rw, fy);
      ctx.lineTo(rx + rw + 8, fy);
      ctx.stroke();
    }
  }

  /**
   * Layer 5: Handcrafted Bedroom Furniture
   * - Four-poster / carved antique bed with crumpled quilt & pillows
   * - Nightstand with melting candle
   * - Towering Victorian Armoire / Wardrobe
   * - Writing desk with cabriole legs & desktop clutter
   * - High wall shelves with antique books
   */
  private renderBedroomFurniture(ctx: CanvasRenderingContext2D, room: RoomData, player: Player) {
    // ==========================================
    // 1. ORNATE CARVED VICTORIAN BED (Left side)
    // ==========================================
    const bedX = 140;
    const bedY = 510;

    // Shadow underneath bed
    ctx.fillStyle = 'rgba(10, 7, 5, 0.75)';
    ctx.fillRect(bedX + 15, 690, 180, 20);

    // Tall Carved Headboard
    ctx.fillStyle = '#342215';
    ctx.beginPath();
    ctx.roundRect(bedX - 10, bedY, 32, 195, [16, 16, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#523722';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Carved crest ornament on headboard
    ctx.fillStyle = '#5c3e27';
    ctx.fillRect(bedX - 6, bedY + 15, 24, 60);
    ctx.strokeStyle = '#22150c';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bedX - 6, bedY + 15, 24, 60);

    // Turned wooden finial on headboard post
    ctx.fillStyle = '#6e4b30';
    ctx.beginPath();
    ctx.arc(bedX + 6, bedY - 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Footboard (Right side of bed)
    ctx.fillStyle = '#342215';
    ctx.fillRect(bedX + 195, bedY + 80, 20, 115);
    ctx.strokeStyle = '#523722';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bedX + 195, bedY + 80, 20, 115);
    // Footboard finial
    ctx.fillStyle = '#6e4b30';
    ctx.beginPath();
    ctx.arc(bedX + 205, bedY + 74, 6, 0, Math.PI * 2);
    ctx.fill();

    // Bed Wooden Frame / Rails
    ctx.fillStyle = '#26180e';
    ctx.fillRect(bedX + 20, 675, 175, 18);

    // Turned Wooden Bed Legs
    ctx.fillStyle = '#1e130b';
    ctx.fillRect(bedX + 18, 690, 12, 20);
    ctx.fillRect(bedX + 180, 690, 12, 20);

    // Plush Propped Pillows
    ctx.fillStyle = '#e5dfd3';
    ctx.beginPath();
    ctx.ellipse(bedX + 38, 618, 22, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8ad9a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Secondary smaller pillow
    ctx.fillStyle = '#f5efe4';
    ctx.beginPath();
    ctx.ellipse(bedX + 50, 624, 18, 10, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Crumpled Quilted Duvet / Blanket (Navy-Slate with layered folds)
    ctx.fillStyle = '#263449';
    ctx.beginPath();
    ctx.moveTo(bedX + 30, 630);
    ctx.lineTo(bedX + 195, 630);
    ctx.bezierCurveTo(bedX + 205, 645, bedX + 195, 665, bedX + 190, 680);
    ctx.lineTo(bedX + 30, 680);
    ctx.bezierCurveTo(bedX + 25, 660, bedX + 25, 640, bedX + 30, 630);
    ctx.closePath();
    ctx.fill();

    // Diamond quilt stitched pattern on blanket
    ctx.strokeStyle = '#384d6b';
    ctx.lineWidth = 1;
    for (let qx = bedX + 45; qx < bedX + 185; qx += 24) {
      ctx.beginPath();
      ctx.moveTo(qx, 632);
      ctx.lineTo(qx + 18, 678);
      ctx.moveTo(qx + 18, 632);
      ctx.lineTo(qx, 678);
      ctx.stroke();
    }

    // Folded quilt top rim (rich plum-burgundy fold)
    ctx.fillStyle = '#4c2632';
    ctx.beginPath();
    ctx.roundRect(bedX + 32, 626, 65, 14, 5);
    ctx.fill();
    ctx.strokeStyle = '#6e3849';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // If player is hiding under the bed, show small yellow hood with cute peeking eyes
    if (player.isHiding && player.hidingSpotId === 'hiding_bed_ch1') {
      ctx.save();
      // Peeking under the dust ruffle at bedX + 100, y: 686
      ctx.fillStyle = '#eab308'; // Yellow hood
      ctx.beginPath();
      ctx.arc(bedX + 110, 688, 7.5, 0, Math.PI * 2);
      ctx.fill();
      // Glowing peeking eyes
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.ellipse(bedX + 108, 688, 1.8, 2.2, 0, 0, Math.PI * 2);
      ctx.ellipse(bedX + 113, 688, 1.8, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ==========================================
    // 2. NIGHTSTAND TABLE & CANDLE (Beside Bed)
    // ==========================================
    const nsX = 350;
    const nsY = 620;

    // Small wooden table
    ctx.fillStyle = '#2d1e13';
    ctx.fillRect(nsX, nsY, 48, 90);
    ctx.strokeStyle = '#4a3321';
    ctx.lineWidth = 2;
    ctx.strokeRect(nsX, nsY, 48, 90);

    // Drawer with brass drop knob
    ctx.fillStyle = '#3a2719';
    ctx.fillRect(nsX + 6, nsY + 12, 36, 24);
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(nsX + 24, nsY + 24, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Table legs
    ctx.fillStyle = '#1c120a';
    ctx.fillRect(nsX + 4, nsY + 70, 8, 20);
    ctx.fillRect(nsX + 36, nsY + 70, 8, 20);

    // Lace doily cloth
    ctx.fillStyle = '#f0ebdc';
    ctx.fillRect(nsX + 5, nsY - 2, 38, 4);

    // Brass Candle Holder saucer with finger loop
    ctx.fillStyle = '#c49a35';
    ctx.beginPath();
    ctx.ellipse(nsX + 24, nsY - 2, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(nsX + 22, nsY - 8, 4, 6);

    // Tallow candle with dripping wax
    ctx.fillStyle = '#e8dec8';
    ctx.fillRect(nsX + 21, nsY - 26, 6, 18);
    // Wax drips
    ctx.beginPath();
    ctx.arc(nsX + 20, nsY - 14, 2, 0, Math.PI * 2);
    ctx.arc(nsX + 28, nsY - 18, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Candle flame with flicker
    this.candleFlicker = Math.sin(Date.now() * 0.009) * 1.5;
    const flameX = nsX + 24 + this.candleFlicker * 0.4;
    const flameY = nsY - 32 + this.candleFlicker * 0.5;

    // Outer warm flame
    ctx.fillStyle = '#ff981a';
    ctx.beginPath();
    ctx.ellipse(flameX, flameY, 4.5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.fillStyle = '#fff7d6';
    ctx.beginPath();
    ctx.ellipse(flameX, flameY + 1, 2, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // 3. TOWERING VICTORIAN ARMOIRE / WARDROBE
    // ==========================================
    const wX = 400;
    const wY = 450;
    const wW = 95;
    const wH = 260;

    // Armoire main body
    ctx.fillStyle = '#22150d';
    ctx.fillRect(wX, wY, wW, wH);
    ctx.strokeStyle = '#432c1b';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(wX, wY, wW, wH);

    // Carved Pediment Cornice Crown on top
    ctx.fillStyle = '#382315';
    ctx.beginPath();
    ctx.moveTo(wX - 8, wY);
    ctx.lineTo(wX + wW / 2, wY - 24);
    ctx.lineTo(wX + wW + 8, wY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5a3d25';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Brass Finial on center crest
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(wX + wW / 2, wY - 26, 5, 0, Math.PI * 2);
    ctx.fill();

    // Double Doors with molded bevel panels
    const doorW = (wW - 6) / 2;
    // Left door
    ctx.fillStyle = '#2b1b11';
    ctx.fillRect(wX + 3, wY + 6, doorW, wH - 12);
    ctx.strokeStyle = '#150c07';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wX + 3, wY + 6, doorW, wH - 12);
    // Left door upper panel
    ctx.fillStyle = '#1c1109';
    ctx.fillRect(wX + 8, wY + 18, doorW - 10, 95);
    ctx.strokeStyle = '#442d1b';
    ctx.strokeRect(wX + 8, wY + 18, doorW - 10, 95);
    // Left door lower panel
    ctx.fillRect(wX + 8, wY + 128, doorW - 10, 110);
    ctx.strokeRect(wX + 8, wY + 128, doorW - 10, 110);

    // Right door
    ctx.fillStyle = '#2b1b11';
    ctx.fillRect(wX + 3 + doorW, wY + 6, doorW, wH - 12);
    ctx.strokeStyle = '#150c07';
    ctx.strokeRect(wX + 3 + doorW, wY + 6, doorW, wH - 12);
    // Right door upper panel
    ctx.fillStyle = '#1c1109';
    ctx.fillRect(wX + 8 + doorW, wY + 18, doorW - 10, 95);
    ctx.strokeStyle = '#442d1b';
    ctx.strokeRect(wX + 8 + doorW, wY + 18, doorW - 10, 95);
    // Right door lower panel
    ctx.fillRect(wX + 8 + doorW, wY + 128, doorW - 10, 110);
    ctx.strokeRect(wX + 8 + doorW, wY + 128, doorW - 10, 110);

    // Brass Filigree Keyhole Escutcheon & Drop Handles
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(wX + wW / 2 - 5, wY + wH * 0.48, 10, 16);
    ctx.fillStyle = '#140c06';
    ctx.beginPath();
    ctx.arc(wX + wW / 2, wY + wH * 0.48 + 6, 2, 0, Math.PI * 2);
    ctx.fill();

    // Drop handles
    ctx.fillStyle = '#e8c454';
    ctx.fillRect(wX + wW / 2 - 8, wY + wH * 0.48 + 5, 2.5, 9);
    ctx.fillRect(wX + wW / 2 + 5.5, wY + wH * 0.48 + 5, 2.5, 9);

    // If player is hiding inside, render peeking eye slit
    if (player.isHiding && player.hidingSpotId === 'wardrobe_ch1') {
      ctx.fillStyle = '#060a0f';
      ctx.fillRect(wX + wW / 2 - 2, wY + wH * 0.42, 4, 30);
      ctx.fillStyle = '#ffd56b';
      ctx.beginPath();
      ctx.arc(wX + wW / 2, wY + wH * 0.46, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // ==========================================
    // 4. HIGH CARVED WALL SHELF & VINTAGE BOOKS
    // ==========================================
    const sX = 880;
    const sY = 520;
    const sW = 220;
    const sH = 26;

    // Shelf sturdy polished wood plank
    ctx.fillStyle = '#3a2517';
    ctx.fillRect(sX, sY, sW, sH);
    ctx.strokeStyle = '#5a3d25';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(sX, sY, sW, sH);

    // Under-shelf carved ornamental brackets (Corbels)
    ctx.fillStyle = '#26170e';
    ctx.beginPath();
    ctx.moveTo(sX + 15, sY + sH);
    ctx.lineTo(sX + 35, sY + sH);
    ctx.lineTo(sX + 15, sY + sH + 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(sX + sW - 35, sY + sH);
    ctx.lineTo(sX + sW - 15, sY + sH);
    ctx.lineTo(sX + sW - 15, sY + sH + 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Books on the shelf (Leather bound with ribbed spines)
    const bookColors = ['#5a1820', '#1c3d28', '#1f3452', '#5e4318', '#3d204d'];
    let bx = sX + 14;
    for (let b = 0; b < 6; b++) {
      const bw = 10 + (b % 3) * 3;
      const bh = 42 + (b % 4) * 4;
      ctx.fillStyle = bookColors[b % bookColors.length];
      ctx.fillRect(bx, sY - bh, bw, bh);
      ctx.strokeStyle = '#120d09';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, sY - bh, bw, bh);

      // Gold spine embossing bands
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(bx + 1, sY - bh + 6, bw - 2, 2);
      ctx.fillRect(bx + 1, sY - bh + 12, bw - 2, 2);
      ctx.fillRect(bx + 1, sY - 10, bw - 2, 2);
      bx += bw + 3;
    }

    // Tilted book leaning against the stack
    ctx.save();
    ctx.translate(bx + 16, sY);
    ctx.rotate(0.24);
    ctx.fillStyle = '#7a2228';
    ctx.fillRect(-6, -45, 12, 45);
    ctx.strokeStyle = '#120d09';
    ctx.strokeRect(-6, -45, 12, 45);
    ctx.restore();

    // Small glass specimen bottle on shelf
    ctx.fillStyle = 'rgba(180, 220, 245, 0.4)';
    ctx.fillRect(sX + sW - 36, sY - 26, 14, 26);
    ctx.strokeStyle = '#a4cde8';
    ctx.lineWidth = 1;
    ctx.strokeRect(sX + sW - 36, sY - 26, 14, 26);
    // Cork stopper
    ctx.fillStyle = '#9e7344';
    ctx.fillRect(sX + sW - 34, sY - 32, 10, 6);

    // ==========================================
    // 5. ANTIQUE WRITING DESK & UPHOLSTERED CHAIR
    // ==========================================
    const dX = 1220;
    const dY = 600;
    const dW = 190;
    const dH = 110;

    // Desk top wooden surface
    ctx.fillStyle = '#3a2517';
    ctx.fillRect(dX, dY, dW, 20);
    ctx.strokeStyle = '#5a3d25';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(dX, dY, dW, 20);

    // Desk drawers section (Left and Right pedestals)
    // Left pedestal
    ctx.fillStyle = '#26180e';
    ctx.fillRect(dX + 10, dY + 20, 50, 75);
    ctx.strokeStyle = '#432c1b';
    ctx.strokeRect(dX + 10, dY + 20, 50, 75);
    // Drawers with brass drop handles
    for (let dr = 0; dr < 3; dr++) {
      ctx.fillStyle = '#342215';
      ctx.fillRect(dX + 14, dY + 24 + dr * 22, 42, 18);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(dX + 31, dY + 31 + dr * 22, 8, 3.5);
    }

    // Right pedestal
    ctx.fillStyle = '#26180e';
    ctx.fillRect(dX + dW - 60, dY + 20, 50, 75);
    ctx.strokeRect(dX + dW - 60, dY + 20, 50, 75);
    for (let dr = 0; dr < 3; dr++) {
      ctx.fillStyle = '#342215';
      ctx.fillRect(dX + dW - 56, dY + 24 + dr * 22, 42, 18);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(dX + dW - 39, dY + 31 + dr * 22, 8, 3.5);
    }

    // Turned wooden feet
    ctx.fillStyle = '#1e130b';
    ctx.fillRect(dX + 14, dY + 95, 10, 15);
    ctx.fillRect(dX + 46, dY + 95, 10, 15);
    ctx.fillRect(dX + dW - 56, dY + 95, 10, 15);
    ctx.fillRect(dX + dW - 24, dY + 95, 10, 15);

    // Desktop Clutter:
    // 1. Antique Banker's Lamp (Brass stand with emerald-green / amber glass shade)
    const lampX = dX + 140;
    const lampY = dY - 4;
    ctx.strokeStyle = '#c49a35';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lampX, lampY);
    ctx.lineTo(lampX, lampY - 26);
    ctx.lineTo(lampX - 8, lampY - 32);
    ctx.stroke();

    // Curved glass shade
    ctx.fillStyle = '#2d6a4f'; // Emerald green shade
    ctx.beginPath();
    ctx.ellipse(lampX - 10, lampY - 32, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c49a35';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Open Antique Book with sketched diagrams on desk
    ctx.fillStyle = '#f0ebd8';
    ctx.beginPath();
    ctx.moveTo(dX + 40, dY - 1);
    ctx.lineTo(dX + 65, dY - 5);
    ctx.lineTo(dX + 90, dY - 1);
    ctx.lineTo(dX + 90, dY + 3);
    ctx.lineTo(dX + 65, dY - 1);
    ctx.lineTo(dX + 40, dY + 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5c4832';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Ink scribbles on pages
    ctx.strokeStyle = '#3d3023';
    ctx.beginPath();
    ctx.moveTo(dX + 46, dY - 2);
    ctx.lineTo(dX + 60, dY - 3);
    ctx.moveTo(dX + 70, dY - 3);
    ctx.lineTo(dX + 84, dY - 2);
    ctx.stroke();

    // 3. Inkwell with Raven Quill
    ctx.fillStyle = '#1c1512';
    ctx.fillRect(dX + 105, dY - 8, 10, 8);
    // White / grey feather quill
    ctx.strokeStyle = '#e2ded5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dX + 110, dY - 8);
    ctx.lineTo(dX + 118, dY - 28);
    ctx.stroke();

    // 4. Miniature Hourglass
    ctx.fillStyle = '#bfa14c';
    ctx.fillRect(dX + 22, dY - 16, 8, 2);
    ctx.fillRect(dX + 22, dY - 2, 8, 2);
    ctx.strokeStyle = '#a4cde8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dX + 23, dY - 14);
    ctx.lineTo(dX + 29, dY - 4);
    ctx.moveTo(dX + 29, dY - 14);
    ctx.lineTo(dX + 23, dY - 4);
    ctx.stroke();

    // High-back Upholstered Desk Chair
    const chX = dX - 35;
    const chY = 615;

    // Chair Legs
    ctx.fillStyle = '#22150d';
    ctx.fillRect(chX + 4, chY + 50, 6, 45);
    ctx.fillRect(chX + 32, chY + 50, 6, 45);

    // Button-tufted cushion seat (burgundy leather)
    ctx.fillStyle = '#4c1e26';
    ctx.fillRect(chX, chY + 42, 42, 12);
    ctx.strokeStyle = '#d4af37'; // Brass nailhead studs
    ctx.lineWidth = 1;
    ctx.strokeRect(chX, chY + 42, 42, 12);

    // Carved backrest & arms
    ctx.fillStyle = '#342215';
    ctx.fillRect(chX - 4, chY, 8, 48);
    ctx.fillStyle = '#4c1e26';
    ctx.fillRect(chX, chY + 4, 18, 38);
    ctx.strokeStyle = '#5a3d25';
    ctx.lineWidth = 2;
    ctx.strokeRect(chX, chY + 4, 18, 38);
  }

  /**
   * Layer 6: Movable Antique Steamer Trunk (Brass corners, leather straps, buckles)
   */
  private renderMovables(ctx: CanvasRenderingContext2D, movables: MovableObject[]) {
    movables.forEach((m) => {
      // Steamer trunk body (Warm polished mahogany/walnut wood slats)
      ctx.fillStyle = '#3a2618';
      ctx.fillRect(m.x, m.y, m.w, m.h);
      ctx.strokeStyle = '#5a3e28';
      ctx.lineWidth = 3;
      ctx.strokeRect(m.x, m.y, m.w, m.h);

      // Wood slats horizontal lines
      ctx.strokeStyle = '#22150d';
      ctx.lineWidth = 1.5;
      for (let sy = m.y + 16; sy < m.y + m.h; sy += 16) {
        ctx.beginPath();
        ctx.moveTo(m.x, sy);
        ctx.lineTo(m.x + m.w, sy);
        ctx.stroke();
      }

      // Heavy Leather Straps with brass buckles
      ctx.fillStyle = '#1c1008';
      ctx.fillRect(m.x + 18, m.y, 10, m.h);
      ctx.fillRect(m.x + m.w - 28, m.y, 10, m.h);

      // Brass Buckles
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(m.x + 17, m.y + m.h * 0.45, 12, 8);
      ctx.fillRect(m.x + m.w - 29, m.y + m.h * 0.45, 12, 8);

      // Riveted Brass Corner Brackets
      const corners = [
        { x: m.x, y: m.y },
        { x: m.x + m.w - 12, y: m.y },
        { x: m.x, y: m.y + m.h - 12 },
        { x: m.x + m.w - 12, y: m.y + m.h - 12 },
      ];
      ctx.fillStyle = '#d4af37';
      corners.forEach((c) => {
        ctx.fillRect(c.x, c.y, 12, 12);
        ctx.fillStyle = '#1a1006';
        ctx.fillRect(c.x + 4, c.y + 4, 3, 3);
        ctx.fillStyle = '#d4af37';
      });

      // Center Heavy Brass Lock Latch
      ctx.fillStyle = '#e8c454';
      ctx.fillRect(m.x + m.w / 2 - 8, m.y + m.h * 0.4, 16, 18);
      ctx.fillStyle = '#1e1408';
      ctx.beginPath();
      ctx.arc(m.x + m.w / 2, m.y + m.h * 0.4 + 9, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Side leather carry handle
      ctx.strokeStyle = '#180e08';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(m.x - 2, m.y + m.h / 2, 7, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    });
  }

  /**
   * Layer 7: Interactive Objects:
   * - Glowing Brass Bedroom Key on the high shelf
   * - Heavy Oak Bedroom Exit Door with iron hinges
   */
  private renderInteractiveObjects(
    ctx: CanvasRenderingContext2D,
    interactables: Interactable[],
    player: Player,
    arrivalTelegraphActive: boolean = false,
    arrivalWarningTimer: number = 0
  ) {
    interactables.forEach((item) => {
      // 1. Glowing Brass Key on High Shelf
      if (item.type === 'item_pickup' && !item.isUsed) {
        const bob = Math.sin(Date.now() * 0.005) * 3.5;
        const kX = item.x + item.w / 2;
        const kY = item.y + item.h / 2 + bob;

        ctx.save();
        ctx.translate(kX, kY);

        // Radiant golden aura
        const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
        aura.addColorStop(0, 'rgba(255, 225, 130, 0.7)');
        aura.addColorStop(0.5, 'rgba(255, 195, 70, 0.3)');
        aura.addColorStop(1, 'rgba(255, 195, 70, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        // Detailed Brass Skeleton Key
        ctx.fillStyle = '#ffe072';
        ctx.strokeStyle = '#b88924';
        ctx.lineWidth = 1.5;

        // Key bow (circular loop with clover filigree)
        ctx.beginPath();
        ctx.arc(-8, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#22150d';
        ctx.beginPath();
        ctx.arc(-8, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Key shank & bit
        ctx.fillStyle = '#ffe072';
        ctx.fillRect(-2, -2.5, 20, 5);
        ctx.strokeRect(-2, -2.5, 20, 5);
        // Bit notches
        ctx.fillRect(10, 2.5, 4, 6);
        ctx.fillRect(15, 2.5, 3, 5);

        // Twinkle sparkle
        const sparkle = Math.sin(Date.now() * 0.008) > 0.8;
        if (sparkle) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(10, -4, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 2. Heavy Oak Bedroom Door
      else if (item.type === 'door') {
        const shake = arrivalTelegraphActive ? Math.sin(Date.now() * 0.05) * 3 : 0;
        ctx.save();
        ctx.translate(shake, 0);

        // Doorway Arch Surround
        ctx.fillStyle = '#1c130c';
        ctx.fillRect(item.x - 8, item.y - 8, item.w + 16, item.h + 8);
        ctx.strokeStyle = '#3e2c1e';
        ctx.lineWidth = 4;
        ctx.strokeRect(item.x - 8, item.y - 8, item.w + 16, item.h + 8);

        // Solid Oak Planks Door Body
        ctx.fillStyle = '#2e1e13';
        ctx.fillRect(item.x, item.y, item.w, item.h);

        // Vertical plank lines
        ctx.strokeStyle = '#18100a';
        ctx.lineWidth = 2;
        for (let dx = item.x + 20; dx < item.x + item.w; dx += 22) {
          ctx.beginPath();
          ctx.moveTo(dx, item.y);
          ctx.lineTo(dx, item.y + item.h);
          ctx.stroke();
        }

        // Heavy Forged Wrought-Iron Strap Hinges
        ctx.fillStyle = '#10141a';
        ctx.fillRect(item.x - 4, item.y + 35, item.w * 0.75, 12);
        ctx.fillRect(item.x - 4, item.y + item.h - 45, item.w * 0.75, 12);

        // Hinge spearhead tips
        ctx.beginPath();
        ctx.moveTo(item.x + item.w * 0.75 - 4, item.y + 31);
        ctx.lineTo(item.x + item.w * 0.75 + 10, item.y + 41);
        ctx.lineTo(item.x + item.w * 0.75 - 4, item.y + 51);
        ctx.fill();

        // Round Iron Rivet Studs
        ctx.fillStyle = '#222b39';
        for (let sy = item.y + 15; sy < item.y + item.h; sy += 45) {
          ctx.beginPath();
          ctx.arc(item.x + 8, sy, 3, 0, Math.PI * 2);
          ctx.arc(item.x + item.w - 8, sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ornate Brass Escutcheon Plate & Skeleton Keyhole
        ctx.fillStyle = item.isUnlocked ? '#48bb78' : '#d4af37';
        ctx.fillRect(item.x + item.w - 22, item.y + item.h * 0.5 - 14, 14, 28);
        ctx.strokeStyle = '#8a6e2f';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(item.x + item.w - 22, item.y + item.h * 0.5 - 14, 14, 28);

        // Keyhole
        ctx.fillStyle = '#140c06';
        ctx.beginPath();
        ctx.arc(item.x + item.w - 15, item.y + item.h * 0.5 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(item.x + item.w - 16, item.y + item.h * 0.5 - 3, 2, 8);

        // Brass drop latch handle
        ctx.fillStyle = '#e8c454';
        ctx.beginPath();
        ctx.arc(item.x + item.w - 24, item.y + item.h * 0.5 - 4, 4, 0, Math.PI * 2);
        ctx.fill();

        // If door is rattling, draw dust motes shaking down & golden hallway light under door!
        if (arrivalTelegraphActive) {
          ctx.fillStyle = 'rgba(230, 210, 180, 0.45)';
          for (let i = 0; i < 4; i++) {
            const dx = item.x + (i * 22) + Math.sin(Date.now() * 0.01 + i) * 6;
            const dy = item.y + (Date.now() * 0.06 + i * 45) % 210;
            ctx.beginPath();
            ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Golden lantern light leaking under door cracks
          ctx.fillStyle = 'rgba(255, 195, 60, 0.85)';
          ctx.fillRect(item.x - 4, item.y + item.h - 3, item.w + 8, 5);

          // Glowing keyhole light
          ctx.fillStyle = 'rgba(255, 220, 100, 0.9)';
          ctx.beginPath();
          ctx.arc(item.x + item.w - 15, item.y + item.h * 0.5 - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });
  }

  /**
   * Layer 8: PROTAGONIST RENDERING:
   * Small child-like explorer in iconic bright YELLOW hooded coat,
   * messy dark hair wisps, cute expressive glowing eyes, glowing amber charm on neck.
   */
  private renderPlayer(ctx: CanvasRenderingContext2D, player: Player) {
    if (player.isHiding) return;

    ctx.save();
    ctx.translate(player.x + player.w / 2, player.y + player.h);

    const facingLeft = player.facing === 'left';
    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    const t = player.animTimer;
    const isWaking = player.action === 'waking';
    const isSwinging = player.action === 'swinging' || player.isSwinging;
    const isRunning = player.isRunning && (player.action === 'run' || player.action === 'walk');
    const isWalking = !player.isRunning && (player.action === 'walk');
    const isCrouching = player.isCrouching;

    // Wake-up cinematic animation in bedroom
    if (isWaking) {
      const p = Math.min(1, player.wakeTimer / 2.5);
      if (p < 0.4) {
        // Lying down flat on bed in yellow coat
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-12, -8, 24, 8);
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(-8, -8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      } else if (p < 0.75) {
        // Sitting up, rubbing eyes
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-8, -20, 16, 20);
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(0, -25, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dbeafe';
        ctx.beginPath();
        ctx.ellipse(2, -25, 1.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }
    }

    let bodyY = 0;
    let legCycle = 0;
    let coatFlap = 0;

    if (isSwinging) {
      // Dynamic swinging pose gripping curtain
      bodyY = -6;
      legCycle = 4;
      coatFlap = -14;
    } else if (isRunning) {
      bodyY = -Math.abs(Math.sin(t * 14)) * 3.5;
      legCycle = Math.sin(t * 14) * 9;
      coatFlap = -11;
    } else if (isWalking) {
      bodyY = -Math.abs(Math.sin(t * 8)) * 1.8;
      legCycle = Math.sin(t * 8) * 5.5;
      coatFlap = -4;
    } else {
      // Idle breathing
      bodyY = Math.sin(t * 2.5) * 1.2;
    }

    if (isCrouching) {
      bodyY += 9;
    }

    // Shadow on floor (if not swinging high in the air)
    if (!isSwinging) {
      ctx.fillStyle = 'rgba(10, 7, 5, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 0, player.w * 0.75, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Small dark boots
    ctx.fillStyle = '#1c1917';
    if (!isCrouching) {
      if (isSwinging) {
        // Tucked legs for swinging
        ctx.fillRect(-8, bodyY - 12, 6, 8);
        ctx.fillRect(-1, bodyY - 10, 6, 8);
      } else {
        ctx.fillRect(-6 - legCycle * 0.45, bodyY - 10, 5, 10);
        ctx.fillRect(2 + legCycle * 0.45, bodyY - 10, 5, 10);
      }
    }

    // Iconic Bright YELLOW Cloak / Raincoat
    const coatHeight = isCrouching ? 18 : 26;
    const coatTopY = bodyY - coatHeight - 8;

    ctx.fillStyle = '#facc15'; // Bright golden yellow
    ctx.beginPath();
    ctx.moveTo(-1, coatTopY);
    ctx.lineTo(9, coatTopY + 3);
    ctx.lineTo(9 + (isCrouching ? 4 : 2), bodyY - 4);
    ctx.lineTo(-12 + coatFlap, bodyY - 3);
    ctx.lineTo(-10, coatTopY + 5);
    ctx.closePath();
    ctx.fill();

    // Darker yellow fold shadows
    ctx.fillStyle = '#ca8a04'; // Warm amber-yellow shadow
    ctx.beginPath();
    ctx.moveTo(-4, coatTopY + 4);
    ctx.lineTo(2, coatTopY + 6);
    ctx.lineTo(-4 + coatFlap * 0.5, bodyY - 4);
    ctx.closePath();
    ctx.fill();

    // Dark horn toggle buttons on yellow coat
    ctx.fillStyle = '#291e0a';
    ctx.fillRect(4, coatTopY + 10, 3, 2);
    ctx.fillRect(4, coatTopY + 16, 3, 2);

    // Yellow Hood / Head
    const headRadius = isCrouching ? 9.5 : 11;
    const headCenterY = coatTopY - 2;

    ctx.fillStyle = '#eab308'; // Hood main yellow
    ctx.beginPath();
    ctx.arc(0, headCenterY, headRadius + 1, 0, Math.PI * 2);
    ctx.fill();

    // Cowl rim highlight
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Messy dark hair wisps peeking out from hood
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(3, headCenterY - 10);
    ctx.quadraticCurveTo(10, headCenterY - 14, 11, headCenterY - 6);
    ctx.moveTo(-2, headCenterY - 11);
    ctx.quadraticCurveTo(-7, headCenterY - 15, -8, headCenterY - 7);
    ctx.stroke();

    // Shadowed face cavity inside hood
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(2, headCenterY, headRadius * 0.82, -Math.PI * 0.35, Math.PI * 0.55);
    ctx.fill();

    // Glowing cute eyes under hood
    const eyeY = headCenterY - 0.5;
    const eyeBlink = Math.sin(t * 0.8) > 0.96 ? 0.2 : 1;
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.ellipse(3.5, eyeY, 2.2, 2.8 * eyeBlink, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(7.5, eyeY, 2.2, 2.8 * eyeBlink, 0, 0, Math.PI * 2);
    ctx.fill();

    // Small Glowing Amber Charm Pendant around neck
    const charmY = coatTopY + 8;
    ctx.strokeStyle = '#c49742';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(1, coatTopY + 2);
    ctx.lineTo(3, charmY);
    ctx.stroke();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(3, charmY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    const gemHalo = ctx.createRadialGradient(3, charmY, 1, 3, charmY, 12);
    gemHalo.addColorStop(0, 'rgba(249, 115, 22, 0.7)');
    gemHalo.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = gemHalo;
    ctx.beginPath();
    ctx.arc(3, charmY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Small hands holding item, pushing, or swinging
    if (isSwinging) {
      // Reaching up both hands gripping the curtain
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(4, coatTopY - 12, 6, 8);
      ctx.fillRect(8, coatTopY - 14, 6, 8);
    } else if (player.heldItem) {
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(9, coatTopY + 11, 6, 6);
    } else if (player.isPushing) {
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(9, coatTopY + 9, 7, 5);
    }

    ctx.restore();

    // When swinging, render the dynamic swinging curtain connecting from anchor to hands!
    if (isSwinging) {
      ctx.save();
      const anchorX = 710;
      const anchorY = 150;
      const handX = player.x + player.w / 2;
      const handY = player.y + 10;

      // Heavy draped velvet curtain following the swing arc
      ctx.strokeStyle = '#481c25';
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.quadraticCurveTo((anchorX + handX) / 2 + 10, (anchorY + handY) / 2, handX, handY + 15);
      ctx.stroke();

      // Shadow fold along curtain
      ctx.strokeStyle = '#2f0f16';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.quadraticCurveTo((anchorX + handX) / 2 + 5, (anchorY + handY) / 2, handX - 4, handY + 15);
      ctx.stroke();

      // Golden tieback cord around top
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(anchorX, anchorY + 30, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  /**
   * Layer 9: Atmospheric Floating Dust Motes in Light Beams
   */
  private renderAtmosphericDust(ctx: CanvasRenderingContext2D, room: RoomData) {
    this.dustMotes.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += 0.02;

      if (p.y < 0) {
        p.y = room.height;
        p.x = Math.random() * room.width;
      }
      if (p.x < 0) p.x = room.width;
      if (p.x > room.width) p.x = 0;

      const alpha = p.alpha * (0.6 + Math.sin(p.phase) * 0.4);
      ctx.fillStyle = `rgba(225, 240, 255, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Layer 10: CINEMATIC DYNAMIC LIGHTING:
   * Substantially brighter ambient tone, volumetric moonbeam shaft,
   * warm golden radial light from bedside candle & desk banker lamp.
   */
  private renderCinematicLighting(
    ctx: CanvasRenderingContext2D,
    room: RoomData,
    player: Player,
    monster: Monster | null,
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number
  ) {
    ctx.save();

    // 1. Soft atmospheric shadow mask (much brighter than previous pitch black!)
    // Using a light, transparent slate-blue wash (30% darkness)
    ctx.fillStyle = 'rgba(12, 18, 28, 0.32)';
    ctx.fillRect(cameraX, cameraY, viewWidth, viewHeight);

    // 2. Cutout soft warm pools with destination-out
    ctx.globalCompositeOperation = 'destination-out';

    // Bedside Candle Light Pool
    const candleCut = ctx.createRadialGradient(374, 615, 6, 374, 615, 175);
    candleCut.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    candleCut.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
    candleCut.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = candleCut;
    ctx.beginPath();
    ctx.arc(374, 615, 175, 0, Math.PI * 2);
    ctx.fill();

    // Writing Desk Banker's Lamp Light Pool
    const deskCut = ctx.createRadialGradient(1350, 570, 8, 1350, 570, 210);
    deskCut.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    deskCut.addColorStop(0.55, 'rgba(0, 0, 0, 0.45)');
    deskCut.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = deskCut;
    ctx.beginPath();
    ctx.arc(1350, 570, 210, 0, Math.PI * 2);
    ctx.fill();

    // Player's Personal Ambient Glow & Amber Charm
    if (!player.isHiding) {
      const px = player.x + player.w / 2;
      const py = player.y + player.h / 2;

      const playerCut = ctx.createRadialGradient(px, py, 4, px, py, 130);
      playerCut.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
      playerCut.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
      playerCut.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = playerCut;
      ctx.beginPath();
      ctx.arc(px, py, 130, 0, Math.PI * 2);
      ctx.fill();

      // Soft Optional Flashlight Beam
      if (player.flashlightOn) {
        const dir = player.facing === 'left' ? -1 : 1;
        const beamDist = 220;
        const beamWidth = 85;

        const flashGrad = ctx.createRadialGradient(px, py, 12, px + dir * beamDist * 0.8, py, beamDist);
        flashGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
        flashGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
        flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.moveTo(px, py - 6);
        ctx.lineTo(px + dir * beamDist, py - beamWidth * 0.5);
        ctx.lineTo(px + dir * beamDist, py + beamWidth * 0.5);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Caretaker's Swinging Hurricane Lantern Light Cutout
    if (monster) {
      const dir = monster.facing === 'left' ? -1 : 1;
      const lx = monster.x + (dir === -1 ? -16 : monster.w + 16);
      const ly = monster.y + 40;

      // Radial lantern cutout
      const lanternCut = ctx.createRadialGradient(lx, ly, 4, lx, ly, 220);
      lanternCut.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      lanternCut.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
      lanternCut.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lanternCut;
      ctx.beginPath();
      ctx.arc(lx, ly, 220, 0, Math.PI * 2);
      ctx.fill();

      // Sweeping cone beam projecting forward from the lantern
      const beamDist = 380;
      const beamSpread = 160;
      const coneCut = ctx.createRadialGradient(lx, ly, 10, lx + dir * beamDist * 0.7, ly, beamDist);
      coneCut.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      coneCut.addColorStop(0.6, 'rgba(0, 0, 0, 0.4)');
      coneCut.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coneCut;
      ctx.beginPath();
      ctx.moveTo(lx, ly - 15);
      ctx.lineTo(lx + dir * beamDist, ly - beamSpread * 0.4);
      ctx.lineTo(lx + dir * beamDist, ly + beamSpread * 0.6);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // 3. Volumetric Moonlight Ray from Window (Lighter blend)
    if (room.moonlightRay) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const ray = room.moonlightRay;
      const rayGrad = ctx.createLinearGradient(ray.x, ray.y, ray.x + 280, ray.y + 550);
      rayGrad.addColorStop(0, 'rgba(195, 225, 255, 0.28)');
      rayGrad.addColorStop(0.4, 'rgba(175, 210, 255, 0.16)');
      rayGrad.addColorStop(1, 'rgba(175, 210, 255, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(ray.x - ray.w * 0.45, ray.y);
      ctx.lineTo(ray.x + ray.w * 0.45, ray.y);
      ctx.lineTo(ray.x + ray.w * 0.45 + 320, ray.y + 560);
      ctx.lineTo(ray.x - ray.w * 0.45 + 260, ray.y + 560);
      ctx.closePath();
      ctx.fill();

      // Warm Amber halos on lamps
      const candleHalo = ctx.createRadialGradient(374, 615, 2, 374, 615, 110);
      candleHalo.addColorStop(0, 'rgba(255, 180, 80, 0.28)');
      candleHalo.addColorStop(1, 'rgba(255, 180, 80, 0)');
      ctx.fillStyle = candleHalo;
      ctx.beginPath();
      ctx.arc(374, 615, 110, 0, Math.PI * 2);
      ctx.fill();

      const deskHalo = ctx.createRadialGradient(1350, 570, 4, 1350, 570, 140);
      deskHalo.addColorStop(0, 'rgba(255, 205, 105, 0.32)');
      deskHalo.addColorStop(1, 'rgba(255, 205, 105, 0)');
      ctx.fillStyle = deskHalo;
      ctx.beginPath();
      ctx.arc(1350, 570, 140, 0, Math.PI * 2);
      ctx.fill();

      // Monster Lantern Volumetric Beam & Halos
      if (monster) {
        const dir = monster.facing === 'left' ? -1 : 1;
        const lx = monster.x + (dir === -1 ? -16 : monster.w + 16);
        const ly = monster.y + 40;

        // Warm amber glow halo around lantern
        const lanternHalo = ctx.createRadialGradient(lx, ly, 2, lx, ly, 160);
        lanternHalo.addColorStop(0, 'rgba(255, 190, 70, 0.35)');
        lanternHalo.addColorStop(0.5, 'rgba(255, 150, 40, 0.15)');
        lanternHalo.addColorStop(1, 'rgba(255, 150, 40, 0)');
        ctx.fillStyle = lanternHalo;
        ctx.beginPath();
        ctx.arc(lx, ly, 160, 0, Math.PI * 2);
        ctx.fill();

        // Forward golden light shaft
        const beamDist = 380;
        const beamSpread = 160;
        const beamGrad = ctx.createLinearGradient(lx, ly, lx + dir * beamDist, ly);
        beamGrad.addColorStop(0, 'rgba(255, 210, 100, 0.35)');
        beamGrad.addColorStop(0.7, 'rgba(255, 180, 60, 0.15)');
        beamGrad.addColorStop(1, 'rgba(255, 180, 60, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(lx, ly - 12);
        ctx.lineTo(lx + dir * beamDist, ly - beamSpread * 0.4);
        ctx.lineTo(lx + dir * beamDist, ly + beamSpread * 0.6);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Layer 11: Foreground Framing Silhouettes (Ceiling beams, dangling chains)
   */
  private renderForegroundArchitecture(
    ctx: CanvasRenderingContext2D,
    room: RoomData,
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number
  ) {
    ctx.save();
    ctx.fillStyle = '#080d16';

    // Top ceiling rafter beam
    ctx.fillRect(cameraX, 0, viewWidth, 22);

    // Arch truss rafters
    for (let bx = Math.floor(cameraX / 420) * 420; bx < cameraX + viewWidth + 420; bx += 420) {
      ctx.beginPath();
      ctx.moveTo(bx, 22);
      ctx.lineTo(bx + 45, 22);
      ctx.lineTo(bx + 75, 75);
      ctx.lineTo(bx - 30, 75);
      ctx.closePath();
      ctx.fill();

      // Hanging cobweb
      ctx.strokeStyle = 'rgba(200, 220, 245, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx, 22);
      ctx.quadraticCurveTo(bx + 20, 58, bx + 40, 22);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Layer 8.5: THE CARETAKER - Towering atmospheric monster
   * Tall, elongated Victorian silhouette with tattered greatcoat,
   * broad-brimmed fedora, glowing piercing eyes, and swinging brass hurricane lantern.
   */
  private renderMonster(
    ctx: CanvasRenderingContext2D,
    monster: Monster,
    player: Player,
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number
  ) {
    ctx.save();

    const m = monster;
    const facingLeft = m.facing === 'left';
    const isChasing = m.state === 'CHASE';
    const isAlert = m.state === 'NOTICE';
    const isSearching = m.state === 'SEARCH';
    const walkCycle = Math.sin(m.animTimer * (isChasing ? 9 : 4.5));
    const stepBob = Math.abs(Math.cos(m.animTimer * (isChasing ? 9 : 4.5))) * 3.5;

    // Contact Floor Shadow
    ctx.fillStyle = 'rgba(6, 10, 16, 0.55)';
    ctx.beginPath();
    ctx.ellipse(m.x + m.w / 2, m.y + m.h + 2, 28 + (isChasing ? 8 : 0), 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Transform to monster base center
    ctx.translate(m.x + m.w / 2, m.y + m.h - stepBob);
    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    const t = m.animTimer;

    // 1. Spindly Legs in charcoal trousers
    ctx.strokeStyle = '#121924';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    const legSpread = isChasing ? 18 : 10;
    const leftLegAngle = walkCycle * legSpread;
    const rightLegAngle = -walkCycle * legSpread;

    // Left (Back) Leg & Boot
    ctx.beginPath();
    ctx.moveTo(-4, -42);
    ctx.lineTo(-4 + Math.sin(leftLegAngle * 0.05) * 22, -18);
    ctx.lineTo(-4 + Math.sin(leftLegAngle * 0.05) * 35, 0);
    ctx.stroke();
    // Back Boot
    ctx.fillStyle = '#090d13';
    ctx.fillRect(-6 + Math.sin(leftLegAngle * 0.05) * 35, -4, 12, 5);

    // Right (Front) Leg & Boot
    ctx.beginPath();
    ctx.moveTo(6, -42);
    ctx.lineTo(6 + Math.sin(rightLegAngle * 0.05) * 22, -18);
    ctx.lineTo(6 + Math.sin(rightLegAngle * 0.05) * 35, 0);
    ctx.stroke();
    // Front Boot
    ctx.fillRect(4 + Math.sin(rightLegAngle * 0.05) * 35, -4, 13, 5);

    // 2. Ragged Victorian Greatcoat / Trench Tail Folds (Flowing Behind)
    const coatTailSway = -walkCycle * (isChasing ? 14 : 7);
    ctx.fillStyle = '#101722';
    ctx.beginPath();
    ctx.moveTo(-10, -75);
    ctx.lineTo(12, -75);
    ctx.lineTo(14, -45);
    ctx.lineTo(12 + coatTailSway * 0.4, -20);
    ctx.lineTo(-16 + coatTailSway, -12);
    ctx.lineTo(-12, -50);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1b2636';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Torso, Slender Shoulders & Waist
    const hunch = isChasing ? 12 : isAlert ? -4 : 4;
    ctx.fillStyle = '#161f2c';
    ctx.beginPath();
    ctx.roundRect(-9 + hunch * 0.2, -78, 20, 38, 4);
    ctx.fill();

    // Dark Vest and button seams
    ctx.fillStyle = '#0d131c';
    ctx.fillRect(-4 + hunch * 0.2, -74, 9, 32);
    // Brass pocket watch chain
    ctx.strokeStyle = '#c49a35';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0 + hunch * 0.2, -58, 6, 0.2, Math.PI * 0.85);
    ctx.stroke();

    // High stiff undertaker collar
    ctx.fillStyle = '#1c2838';
    ctx.beginPath();
    ctx.moveTo(-7 + hunch * 0.3, -80);
    ctx.lineTo(12 + hunch * 0.3, -80);
    ctx.lineTo(14 + hunch * 0.3, -86);
    ctx.lineTo(-9 + hunch * 0.3, -86);
    ctx.closePath();
    ctx.fill();

    // 4. Head & Broad-Brimmed Undertaker Fedora Hat
    const headTilt = m.headTilt || 0;
    const headX = 2 + hunch * 0.4;
    const headY = -92;

    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(headTilt);

    // Void shadow face
    ctx.fillStyle = '#06090e';
    ctx.beginPath();
    ctx.arc(0, 4, 9, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Eerie Piercing Eyes under the hat shadow!
    const eyeGlow = isChasing ? '#ef4444' : isAlert ? '#fbbf24' : '#fef08a';
    ctx.fillStyle = eyeGlow;
    const eyeBlink = Math.sin(t * 0.4) > 0.97 ? 0.2 : 1;
    ctx.beginPath();
    ctx.ellipse(3, 3, 2.2, 2.8 * eyeBlink, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(7, 3, 2.0, 2.6 * eyeBlink, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Eye glow halo
    const eyeHalo = ctx.createRadialGradient(5, 3, 1, 5, 3, 10);
    eyeHalo.addColorStop(0, isChasing ? 'rgba(239, 68, 68, 0.5)' : 'rgba(254, 240, 138, 0.4)');
    eyeHalo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = eyeHalo;
    ctx.beginPath();
    ctx.arc(5, 3, 10, 0, Math.PI * 2);
    ctx.fill();

    // Broad Hat Brim casting deep shadow
    ctx.fillStyle = '#0b0f16';
    ctx.beginPath();
    ctx.ellipse(1, -1, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#18212e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hat Crown (Tall tapered cylindrical fedora)
    ctx.fillStyle = '#0e141d';
    ctx.beginPath();
    ctx.moveTo(-11, -2);
    ctx.lineTo(-8, -22);
    ctx.lineTo(9, -22);
    ctx.lineTo(12, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1b2535';
    ctx.stroke();

    // Dark maroon silk hatband
    ctx.fillStyle = '#4c1d24';
    ctx.fillRect(-10, -6, 21, 4);

    ctx.restore(); // Restore head transform

    // 5. Off-hand: Antique Brass Key Ring & Iron Walking Cane
    ctx.strokeStyle = '#090d14';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-6, -74);
    ctx.lineTo(-14, -58);
    ctx.lineTo(-12, -35);
    ctx.stroke();

    // Heavy Brass Skeleton Key Ring dangling in off-hand
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-12, -32, 5, 0, Math.PI * 2);
    ctx.stroke();
    // Dangling key blades
    ctx.fillStyle = '#c49a35';
    ctx.fillRect(-14, -27, 2, 9);
    ctx.fillRect(-11, -27, 2, 11);
    ctx.fillRect(-9, -27, 2, 8);

    // 6. Forward Arm holding Swinging Iron Hurricane Lantern
    const armRaise = isAlert ? -18 : isSearching ? -8 : isChasing ? 6 : 0;
    const handX = 16 + (isAlert ? 6 : 0);
    const handY = -62 + armRaise;

    ctx.strokeStyle = '#161f2c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(8, -75);
    ctx.lineTo(handX - 4, handY + 6);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Spindly skeletal hand
    ctx.fillStyle = '#c5cfdc';
    ctx.beginPath();
    ctx.arc(handX, handY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic Lantern Chain Swaying
    const chainSwing = Math.sin(t * (isChasing ? 8 : 4)) * (isChasing ? 0.35 : 0.18) + (m.lanternAngle || 0.1);
    const chainLen = 22;
    const lanternCenterX = handX + Math.sin(chainSwing) * chainLen;
    const lanternCenterY = handY + Math.cos(chainSwing) * chainLen;

    // Lantern Iron Chain links
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(lanternCenterX, lanternCenterY - 14);
    ctx.stroke();

    // --- DETAILED VICTORIAN BRASS & IRON HURRICANE LANTERN ---
    ctx.save();
    ctx.translate(lanternCenterX, lanternCenterY);
    ctx.rotate(chainSwing * 0.7);

    // Lantern Roof / Cap
    ctx.fillStyle = '#261e14';
    ctx.beginPath();
    ctx.moveTo(-10, -12);
    ctx.lineTo(0, -19);
    ctx.lineTo(10, -12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b48c36';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Brass Top Loop Ring
    ctx.strokeStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(0, -19, 3, 0, Math.PI * 2);
    ctx.stroke();

    // Glass Chamber Base & Frame
    ctx.fillStyle = '#261e14';
    ctx.fillRect(-9, 12, 18, 5);

    // Glowing Glass Cylinder
    const glassGlow = ctx.createLinearGradient(-8, -10, 8, 10);
    glassGlow.addColorStop(0, 'rgba(255, 230, 150, 0.95)');
    glassGlow.addColorStop(0.5, 'rgba(255, 180, 50, 0.9)');
    glassGlow.addColorStop(1, 'rgba(245, 130, 30, 0.85)');
    ctx.fillStyle = glassGlow;
    ctx.fillRect(-8, -12, 16, 24);

    // Iron protective wire cage struts
    ctx.strokeStyle = '#18120c';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-8, -12, 16, 24);
    ctx.beginPath();
    ctx.moveTo(-3, -12);
    ctx.lineTo(-3, 12);
    ctx.moveTo(3, -12);
    ctx.lineTo(3, 12);
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.stroke();

    // Internal Dancing Flame
    const flameFlicker = Math.sin(t * 12) * 1.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 2 + flameFlicker * 0.3, 2, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Radiant Lantern Halo (Screen Blend)
    const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, 38);
    halo.addColorStop(0, 'rgba(255, 220, 120, 0.7)');
    halo.addColorStop(0.4, 'rgba(255, 160, 40, 0.35)');
    halo.addColorStop(1, 'rgba(255, 160, 40, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Restore lantern transform

    ctx.restore(); // Restore monster transform
  }

  /**
   * Layer 12: Directional Off-screen Threat Indicators and Arrival Warnings
   */
  private renderThreatIndicators(
    ctx: CanvasRenderingContext2D,
    monster: Monster | null,
    cameraX: number,
    cameraY: number,
    viewWidth: number,
    viewHeight: number,
    arrivalTelegraphActive: boolean,
    arrivalWarningTimer: number
  ) {
    // 1. Arrival warning indicator on right edge if outside door
    if (arrivalTelegraphActive) {
      const pulse = 0.7 + Math.sin(Date.now() * 0.008) * 0.3;
      const rightX = cameraX + viewWidth - 28;
      const centerY = cameraY + viewHeight * 0.55;

      ctx.save();
      // Amber Warning Beacon Pulse
      ctx.fillStyle = `rgba(245, 158, 11, ${pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(rightX, centerY, 36, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing arrow pointing right
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(rightX - 10, centerY - 14);
      ctx.lineTo(rightX + 12, centerY);
      ctx.lineTo(rightX - 10, centerY + 14);
      ctx.closePath();
      ctx.fill();

      // Door Rattle text tag
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`FOOTSTEPS OUTSIDE (${Math.ceil(arrivalWarningTimer)}s)`, rightX - 22, centerY + 4);
      ctx.restore();
      return;
    }

    // 2. Off-screen Indicator if monster is in the room but outside viewport
    if (!monster) return;

    const screenX = monster.x - cameraX;
    const isOffScreenLeft = screenX < 20;
    const isOffScreenRight = screenX > viewWidth - 20;

    if (isOffScreenLeft || isOffScreenRight) {
      const pulse = 0.65 + Math.sin(Date.now() * 0.006) * 0.35;
      const isChasing = monster.state === 'CHASE';
      const edgeX = isOffScreenLeft ? cameraX + 30 : cameraX + viewWidth - 30;
      const edgeY = Math.min(cameraY + viewHeight - 70, Math.max(cameraY + 80, monster.y - 20));

      ctx.save();
      // Glowing indicator ring
      ctx.fillStyle = isChasing
        ? `rgba(239, 68, 68, ${pulse * 0.45})`
        : `rgba(245, 158, 11, ${pulse * 0.35})`;
      ctx.beginPath();
      ctx.arc(edgeX, edgeY, 26, 0, Math.PI * 2);
      ctx.fill();

      // Directional arrow
      ctx.fillStyle = isChasing ? '#fca5a5' : '#fef08a';
      ctx.beginPath();
      if (isOffScreenLeft) {
        ctx.moveTo(edgeX + 8, edgeY - 10);
        ctx.lineTo(edgeX - 8, edgeY);
        ctx.lineTo(edgeX + 8, edgeY + 10);
      } else {
        ctx.moveTo(edgeX - 8, edgeY - 10);
        ctx.lineTo(edgeX + 8, edgeY);
        ctx.lineTo(edgeX - 8, edgeY + 10);
      }
      ctx.closePath();
      ctx.fill();

      // Threat text
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = isOffScreenLeft ? 'left' : 'right';
      ctx.fillStyle = isChasing ? '#f87171' : '#fef08a';
      const textX = isOffScreenLeft ? edgeX + 18 : edgeX - 18;
      ctx.fillText(isChasing ? 'CHASING' : 'THE CARETAKER', textX, edgeY + 4);

      ctx.restore();
    }
  }
}
