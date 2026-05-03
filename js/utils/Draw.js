import { COLORS, TILE_SIZE } from '../constants.js';

const S = TILE_SIZE;

function tile(g, fn) {
    g.clear();
    fn(g);
}

export function generateTextures(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    // ─── TILES ──────────────────────────────────────────────────────────────
    // Grass — layered greens with grass blades
    tile(g, g => {
        g.fillStyle(0x2d6a35); g.fillRect(0, 0, S, S);
        g.fillStyle(0x3a7d44); g.fillRect(0, 4, S, S - 8);
        // Grass blades (lighter)
        g.fillStyle(0x5aab64);
        g.fillRect(3, 8, 1, 4); g.fillRect(7, 14, 1, 5); g.fillRect(13, 6, 1, 4);
        g.fillRect(19, 12, 1, 5); g.fillRect(24, 8, 1, 4); g.fillRect(28, 18, 1, 4);
        // Tiny flowers
        g.fillStyle(0xffee44); g.fillRect(10, 10, 2, 2); g.fillRect(22, 22, 2, 2);
        // Darker patches
        g.fillStyle(0x265c2c, 0.5);
        g.fillRect(5, 20, 6, 3); g.fillRect(20, 4, 5, 3);
    });
    g.generateTexture('tile_grass', S, S);

    // Stone path — more detailed brick pattern
    tile(g, g => {
        g.fillStyle(0x6b6b75); g.fillRect(0, 0, S, S);
        // Cobblestone bricks
        g.fillStyle(0x7d7d8a);
        g.fillRect(1, 1, 14, 7);  g.fillRect(17, 1, 14, 7);
        g.fillRect(1, 16, 6, 7);  g.fillRect(9, 16, 14, 7); g.fillRect(25, 16, 6, 7);
        g.fillRect(1, 24, 14, 7); g.fillRect(17, 24, 14, 7);
        // Highlights
        g.fillStyle(0x9999a6, 0.5);
        g.fillRect(2, 2, 12, 1); g.fillRect(18, 2, 12, 1);
        g.fillRect(2, 17, 4, 1); g.fillRect(10, 17, 12, 1); g.fillRect(26, 17, 4, 1);
        // Cracks
        g.fillStyle(0x44444c, 0.6);
        g.fillRect(0, 8, S, 1); g.fillRect(0, 23, S, 1);
        g.fillRect(15, 0, 1, 8); g.fillRect(7, 16, 1, 8); g.fillRect(23, 16, 1, 8);
    });
    g.generateTexture('tile_stone', S, S);

    // Water — animated-looking with ripples and depth
    tile(g, g => {
        g.fillStyle(0x12477f); g.fillRect(0, 0, S, S);
        g.fillStyle(0x1a5fa8); g.fillRect(0, 2, S, S - 4);
        g.fillStyle(0x2a7fc8); g.fillRect(0, 6, S, S - 12);
        // Ripples
        g.fillStyle(0x88c5f0, 0.7);
        g.fillRect(3, 8, 8, 1); g.fillRect(15, 6, 6, 1); g.fillRect(22, 12, 7, 1);
        g.fillRect(2, 18, 7, 1); g.fillRect(13, 20, 8, 1); g.fillRect(24, 24, 5, 1);
        // Sparkles
        g.fillStyle(0xeeffff, 0.85);
        g.fillRect(7, 9, 2, 1); g.fillRect(20, 13, 1, 1); g.fillRect(11, 21, 2, 1);
    });
    g.generateTexture('tile_water', S, S);

    tile(g, g => {
        g.fillStyle(COLORS.WALL); g.fillRect(0, 0, S, S);
        g.fillStyle(0x333333);
        for (let row = 0; row < 4; row++) {
            const off = (row % 2) * 8;
            for (let col = 0; col < 3; col++) g.fillRect(off + col * 16, row * 8, 14, 7);
        }
        g.fillStyle(0x777777, 0.3); g.fillRect(1, 1, S - 2, 3);
    });
    g.generateTexture('tile_wall', S, S);

    // Tree — more detailed canopy + trunk shadow
    tile(g, g => {
        // Grass background
        g.fillStyle(0x2d6a35); g.fillRect(0, 0, S, S);
        g.fillStyle(0x3a7d44); g.fillRect(0, 4, S, S - 8);
        // Trunk shadow on ground
        g.fillStyle(0x1a3d20, 0.4); g.fillRect(8, 24, 16, 6);
        // Trunk
        g.fillStyle(0x4a2d18); g.fillRect(13, 18, 6, 12);
        g.fillStyle(0x5c3a1e); g.fillRect(14, 18, 4, 12);
        g.fillStyle(0x6b4520, 0.6); g.fillRect(15, 19, 1, 10);
        // Canopy — layered
        g.fillStyle(0x1f4a22); g.fillRect(3, 5, 26, 16);
        g.fillStyle(0x2d6a2d); g.fillRect(5, 4, 22, 16);
        g.fillStyle(0x3d8b3d); g.fillRect(7, 6, 18, 12);
        g.fillStyle(0x4ea84e, 0.7); g.fillRect(9, 7, 6, 5); g.fillRect(18, 9, 6, 4);
        // Highlights
        g.fillStyle(0x6cc66c, 0.5); g.fillRect(10, 8, 3, 2); g.fillRect(20, 10, 3, 2);
    });
    g.generateTexture('tile_tree', S, S);

    tile(g, g => {
        g.fillStyle(0x4a3222); g.fillRect(0, 0, S, S);
        g.fillStyle(0x6b4c2a);
        g.fillRect(2, 2, S - 4, S - 4);
        g.fillStyle(0xd4af37, 0.8);
        g.fillRect(4, 14, 24, 4); g.fillRect(14, 4, 4, 24);
    });
    g.generateTexture('tile_door', S, S);

    tile(g, g => {
        g.fillStyle(COLORS.GRASS); g.fillRect(0, 0, S, S);
        g.fillStyle(COLORS.PORTAL);
        g.fillRect(8, 2, 16, 28);
        g.fillRect(2, 8, 28, 16);
        g.fillStyle(0xcc88ff, 0.7);
        g.fillRect(10, 4, 12, 24); g.fillRect(4, 10, 24, 12);
        g.fillStyle(0xffffff, 0.4); g.fillRect(13, 7, 6, 18);
    });
    g.generateTexture('tile_portal', S, S);

    tile(g, g => {
        g.fillStyle(COLORS.CHEST); g.fillRect(4, 10, 24, 18);
        g.fillStyle(0x5a4008); g.fillRect(4, 10, 24, 4);
        g.fillStyle(0xffd700); g.fillRect(13, 16, 6, 6);
        g.fillStyle(0x8b6914, 0.5); g.fillRect(4, 10, 24, 1);
    });
    g.generateTexture('tile_chest', S, S);

    tile(g, g => {
        g.fillStyle(COLORS.SAND); g.fillRect(0, 0, S, S);
        g.fillStyle(0xc49040, 0.4);
        g.fillRect(3, 5, 5, 3); g.fillRect(14, 15, 6, 3); g.fillRect(22, 7, 4, 5);
        g.fillStyle(0xe8c060, 0.3); g.fillRect(8, 20, 8, 3);
    });
    g.generateTexture('tile_sand', S, S);

    tile(g, g => {
        g.fillStyle(COLORS.DARK_GRASS); g.fillRect(0, 0, S, S);
        g.fillStyle(0x1a4a22, 0.6);
        g.fillRect(4, 8, 5, 3); g.fillRect(16, 18, 4, 5); g.fillRect(22, 6, 6, 3);
        g.fillStyle(0x3d7040, 0.3); g.fillRect(10, 25, 5, 3);
    });
    g.generateTexture('tile_dark_grass', S, S);

    tile(g, g => {
        g.fillStyle(COLORS.MOUNTAIN); g.fillRect(0, 0, S, S);
        g.fillStyle(0x888899, 0.5);
        g.fillRect(0, 20, S, S - 20);
        g.fillStyle(0x444455);
        g.fillTriangle(16, 2, 2, 28, 30, 28);
        g.fillStyle(0xaaaacc, 0.4); g.fillRect(14, 4, 6, 8);
    });
    g.generateTexture('tile_mountain', S, S);

    tile(g, g => {
        g.fillStyle(COLORS.SNOW); g.fillRect(0, 0, S, S);
        g.fillStyle(0xccccdd, 0.6);
        g.fillRect(4, 8, 8, 4); g.fillRect(18, 16, 6, 6); g.fillRect(10, 24, 10, 4);
        g.fillStyle(0xffffff, 0.3); g.fillRect(2, 2, S - 4, 4);
    });
    g.generateTexture('tile_snow', S, S);

    tile(g, g => {
        g.fillStyle(COLORS.CAVE); g.fillRect(0, 0, S, S);
        g.fillStyle(0x3a3344, 0.5);
        g.fillRect(2, 2, S - 4, S - 4);
        g.fillStyle(0x1a1122, 0.4);
        g.fillRect(4, 12, 10, 8); g.fillRect(18, 5, 8, 10);
    });
    g.generateTexture('tile_cave', S, S);

    // ─── SPRITES ────────────────────────────────────────────────────────────
    // Default player sprite (24×32) — overridden later by buildPlayerSprite()
    buildPlayerSprite(scene, { gender: 'male', skin: 'light', hair: 'brown', robe: 'blue' });

    // Elemental monster sprites
    drawAirSprite   (g, 22, 24, 'sprite_air_wisp',         0xaaccff, 'small');
    drawAirSprite   (g, 26, 30, 'sprite_air_sylph',        0xddeeff, 'tall');
    drawEarthSprite (g, 30, 30, 'sprite_earth_golem',      0x886633, 'block');
    drawEarthSprite (g, 24, 30, 'sprite_earth_dryad',      0x44773a, 'tree');
    drawLightSprite (g, 22, 22, 'sprite_light_spark',      0xffee88, 'small');
    drawLightSprite (g, 28, 30, 'sprite_light_prism',      0xffffcc, 'crystal');
    drawFireSprite  (g, 26, 28, 'sprite_fire_phoenix',     0xff6622, 'bird');
    drawFireSprite  (g, 30, 24, 'sprite_fire_salamander',  0xcc2200, 'lizard');
    drawWaterSprite (g, 30, 22, 'sprite_water_serpent',    0x3388ff, 'wave');
    drawWaterSprite (g, 32, 30, 'sprite_water_leviathan',  0x114488, 'beast');
    drawShadowSprite(g, 26, 32, 'sprite_shadow_specter',   0x6633aa, 'wraith');
    drawShadowSprite(g, 28, 32, 'sprite_shadow_lich',      0x331155, 'lich');

    // NPC quest-giver (gold robe)
    g.clear();
    g.fillStyle(0xf4c27f); g.fillRect(8, 0, 12, 11);
    g.fillStyle(0xd4af37); g.fillRect(6, 11, 16, 12);    // gold robe
    g.fillStyle(0xaa8800); g.fillRect(6, 23, 7, 9); g.fillRect(13, 23, 7, 9);
    g.fillStyle(0x8b5e3c); g.fillRect(2, 13, 4, 8); g.fillRect(22, 13, 4, 8);
    g.fillStyle(0x000000); g.fillRect(10, 3, 3, 3); g.fillRect(15, 3, 3, 3);
    g.fillStyle(0xffffff); g.fillRect(9, 8, 10, 2);
    g.generateTexture('sprite_npc', 24, 32);

    // NPC merchant (green apron, different colors)
    g.clear();
    g.fillStyle(0xf4c27f); g.fillRect(8, 0, 12, 11);
    g.fillStyle(0x44aa66); g.fillRect(6, 11, 16, 12);    // green apron
    g.fillStyle(0x226633); g.fillRect(6, 23, 7, 9); g.fillRect(13, 23, 7, 9);
    g.fillStyle(0x8b5e3c); g.fillRect(2, 13, 4, 8); g.fillRect(22, 13, 4, 8);
    g.fillStyle(0x000000); g.fillRect(10, 3, 3, 3); g.fillRect(15, 3, 3, 3);
    g.fillStyle(0xffffff); g.fillRect(9, 8, 10, 2);
    g.fillStyle(0xffaa00); g.fillRect(11, 14, 6, 3);     // gold coin chest accent
    g.generateTexture('sprite_npc_shop', 24, 32);

    // Items
    g.clear(); g.fillStyle(0xff4444); g.fillRect(4, 2, 10, 18); g.fillStyle(0xff8888); g.fillRect(6, 4, 6, 8);
    g.generateTexture('item_potion_red', 18, 22);
    g.clear(); g.fillStyle(0x4444ff); g.fillRect(4, 2, 10, 18); g.fillStyle(0x8888ff); g.fillRect(6, 4, 6, 8);
    g.generateTexture('item_potion_blue', 18, 22);
    g.clear(); g.fillStyle(0xd4a040); g.fillRect(2, 2, 20, 18); g.fillStyle(0x8b6020); g.fillRect(2, 2, 20, 3);
    g.generateTexture('item_scroll', 24, 22);

    g.destroy();
}

// ─────────────────────────────────────────────────────────────────────────
// Elemental sprite generators. Use ONLY fillStyle + fillRect for maximum
// reliability with Phaser's generateTexture pipeline. Coordinates are
// rounded to integers to avoid sub-pixel rendering artifacts.
// ─────────────────────────────────────────────────────────────────────────

function shade(color, factor) {
    const r = Math.min(255, Math.max(0, Math.floor(((color >> 16) & 0xff) * factor)));
    const g = Math.min(255, Math.max(0, Math.floor(((color >> 8)  & 0xff) * factor)));
    const b = Math.min(255, Math.max(0, Math.floor((color & 0xff) * factor)));
    return (r << 16) | (g << 8) | b;
}

function px(g, color, x, y, w, h) {
    g.fillStyle(color, 1);
    g.fillRect(Math.floor(x), Math.floor(y), Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)));
}

// AIR — ethereal wisp / winged sylph
function drawAirSprite(g, w, h, key, color, variant) {
    g.clear();
    const dark = shade(color, 0.65);
    const light = shade(color, 1.4);
    if (variant === 'small') {
        // wisp: rounded body
        px(g, dark,  w / 2 - 8, 4,    16, h - 8);
        px(g, color, w / 2 - 7, 5,    14, h - 10);
        px(g, light, w / 2 - 5, 7,    10, 4);
        px(g, 0x000000, w / 2 - 4, h / 2 - 1, 2, 2);
        px(g, 0x000000, w / 2 + 2, h / 2 - 1, 2, 2);
        px(g, light, w / 2 - 1, h / 2 + 4, 2, 1);
        // small floating particles
        px(g, light, 2, h / 2, 2, 2);
        px(g, light, w - 4, h / 2, 2, 2);
    } else {
        // sylph: head + robe + wings
        px(g, dark,  w / 2 - 5, 1, 10, 9);
        px(g, color, w / 2 - 4, 2, 8, 7);
        px(g, 0x000000, w / 2 - 3, 4, 2, 2);
        px(g, 0x000000, w / 2 + 1, 4, 2, 2);
        // robe
        px(g, dark,  w / 2 - 6, 10, 12, h - 12);
        px(g, color, w / 2 - 5, 11, 10, h - 14);
        px(g, light, w / 2 - 1, 13, 2, h - 18);
        // wings
        px(g, light, 0, 9, 6, 6);
        px(g, light, w - 6, 9, 6, 6);
    }
    g.generateTexture(key, w, h);
}

// EARTH — golem / dryad
function drawEarthSprite(g, w, h, key, color, variant) {
    g.clear();
    const dark  = shade(color, 0.55);
    const light = shade(color, 1.35);
    if (variant === 'block') {
        // golem: blocky armor
        px(g, dark,  0, 4, w, h - 4);
        px(g, color, 2, 6, w - 4, h - 8);
        px(g, light, 4, 7, w - 8, 3);
        px(g, dark,  4, 12, w - 8, 2);
        // crystal eyes
        px(g, 0x66ddff, w / 2 - 6, 14, 3, 3);
        px(g, 0x66ddff, w / 2 + 3, 14, 3, 3);
        // mouth slit
        px(g, dark, w / 2 - 4, 20, 8, 2);
        // legs
        px(g, dark, 4, h - 4, 6, 4);
        px(g, dark, w - 10, h - 4, 6, 4);
    } else {
        // dryad: trunk + foliage
        px(g, 0x5c3a1e, w / 2 - 3, h * 0.55, 6, h * 0.45);
        px(g, dark,    1, 1, w - 2, h * 0.55);
        px(g, color,   2, 2, w - 4, h * 0.5);
        px(g, light,   4, 3, w - 8, 4);
        px(g, light,   3, 8, 4, 4);
        px(g, light,   w - 7, 9, 4, 4);
        px(g, 0x000000, w / 2 - 4, h * 0.3, 2, 2);
        px(g, 0x000000, w / 2 + 2, h * 0.3, 2, 2);
        px(g, 0xffaa44, w / 2 - 1, h * 0.42, 2, 1);
    }
    g.generateTexture(key, w, h);
}

// LIGHT — spark / prism
function drawLightSprite(g, w, h, key, color, variant) {
    g.clear();
    const dark = shade(color, 0.5);
    if (variant === 'small') {
        // diamond-shaped spark
        const cx = w / 2, cy = h / 2;
        // outer rays as cross
        px(g, color, cx - 1, 1, 2, h - 2);
        px(g, color, 1, cy - 1, w - 2, 2);
        px(g, dark, cx - 2, cy - 2, 4, 4);
        px(g, color, cx - 4, cy - 4, 8, 8);
        px(g, 0xffffff, cx - 2, cy - 2, 4, 4);
        px(g, 0xffaa00, cx - 1, cy - 1, 2, 2);
    } else {
        // prism: triangular crystal (built from rectangles)
        const cx = w / 2;
        for (let row = 0; row < h; row++) {
            const halfWidth = Math.floor((row / h) * (w / 2 - 1));
            const c = row < 4 ? 0xffffff : (row % 4 === 0 ? dark : color);
            px(g, c, cx - halfWidth, row, halfWidth * 2 + 1, 1);
        }
        px(g, 0xffffff, cx - 2, h * 0.3, 4, 3);
        px(g, 0xff8800, cx - 1, h * 0.55, 2, 2);
    }
    g.generateTexture(key, w, h);
}

// FIRE — phoenix / salamander
function drawFireSprite(g, w, h, key, color, variant) {
    g.clear();
    const dark = shade(color, 0.55);
    const light = shade(color, 1.3);
    if (variant === 'bird') {
        // phoenix: triangular body + wing flares
        const cx = w / 2;
        // body
        px(g, dark,  cx - 5, 6, 10, h - 10);
        px(g, color, cx - 4, 7, 8, h - 12);
        // crest
        px(g, 0xffaa00, cx - 1, 1, 2, 5);
        px(g, 0xffff00, cx, 0, 1, 4);
        // wings
        px(g, color, 0, h * 0.35, 6, 8);
        px(g, color, w - 6, h * 0.35, 6, 8);
        px(g, light, 1, h * 0.4, 4, 5);
        px(g, light, w - 5, h * 0.4, 4, 5);
        // tail flames
        px(g, 0xffaa00, cx - 3, h - 4, 6, 4);
        px(g, 0xffff00, cx - 1, h - 2, 2, 2);
        // eyes + beak
        px(g, 0xffffff, cx - 3, 9, 2, 2);
        px(g, 0xffffff, cx + 1, 9, 2, 2);
        px(g, 0x000000, cx - 2, 10, 1, 1);
        px(g, 0x000000, cx + 2, 10, 1, 1);
        px(g, 0xffaa00, cx, 12, 2, 1);
    } else {
        // salamander: low body + back flames
        // body
        px(g, dark,  2, h * 0.45, w - 4, h * 0.5);
        px(g, color, 3, h * 0.48, w - 6, h * 0.42);
        // head
        px(g, dark,  w - 9, h * 0.3, 8, h * 0.25);
        px(g, color, w - 8, h * 0.32, 6, h * 0.2);
        // back flames
        px(g, 0xffaa00, 4,         h * 0.32, 3, 5);
        px(g, 0xffff00, 9,         h * 0.28, 3, 6);
        px(g, 0xffaa00, 14,        h * 0.32, 3, 5);
        // legs
        px(g, dark, 1, h - 3, 4, 3);
        px(g, dark, w - 5, h - 3, 4, 3);
        // eye
        px(g, 0xffff00, w - 5, h * 0.36, 2, 2);
        px(g, 0x000000, w - 4, h * 0.37, 1, 1);
    }
    g.generateTexture(key, w, h);
}

// WATER — serpent / leviathan
function drawWaterSprite(g, w, h, key, color, variant) {
    g.clear();
    const dark  = shade(color, 0.5);
    const light = shade(color, 1.5);
    if (variant === 'wave') {
        // serpent: 4 body segments arranged in wave
        const segments = [
            { x: 1,        y: h * 0.3 },
            { x: w * 0.25, y: h * 0.55 },
            { x: w * 0.5,  y: h * 0.3 },
            { x: w * 0.75, y: h * 0.55 },
        ];
        for (const s of segments) {
            px(g, dark,  s.x,     s.y,     6, 6);
            px(g, color, s.x + 1, s.y + 1, 4, 4);
        }
        // head (last segment, larger)
        const hx = w - 9, hy = h * 0.35;
        px(g, dark,  hx,     hy,     8, 8);
        px(g, color, hx + 1, hy + 1, 6, 6);
        px(g, light, hx + 2, hy + 2, 4, 2);
        // eye
        px(g, 0xffffff, hx + 5, hy + 3, 2, 2);
        px(g, 0x000000, hx + 6, hy + 4, 1, 1);
    } else {
        // leviathan: armored bulky body
        px(g, dark,  1, 5, w - 2, h - 7);
        px(g, color, 3, 7, w - 6, h - 11);
        // armor plates (alternating)
        for (let i = 0; i < 3; i++) {
            px(g, light, 5 + i * 7, 9, 4, 4);
        }
        // horns
        px(g, dark, w * 0.2, 1, 3, 5);
        px(g, dark, w * 0.7, 1, 3, 5);
        // eyes
        px(g, 0x88ddff, w * 0.3, h * 0.4, 3, 3);
        px(g, 0x88ddff, w * 0.6, h * 0.4, 3, 3);
        px(g, 0x000000, w * 0.31, h * 0.41, 1, 1);
        px(g, 0x000000, w * 0.61, h * 0.41, 1, 1);
        // teeth
        px(g, 0xffffff, w * 0.4, h - 4, 1, 2);
        px(g, 0xffffff, w * 0.5, h - 4, 1, 2);
        px(g, 0xffffff, w * 0.6, h - 4, 1, 2);
    }
    g.generateTexture(key, w, h);
}

// SHADOW — specter / lich
function drawShadowSprite(g, w, h, key, color, variant) {
    g.clear();
    const dark   = shade(color, 0.4);
    const accent = shade(color, 1.7);
    if (variant === 'wraith') {
        // wraith: hooded shape
        const cx = w / 2;
        // hood top
        px(g, dark,  cx - 6, 1, 12, 4);
        px(g, color, cx - 5, 2, 10, 3);
        // hood front
        px(g, dark,  cx - 7, 5, 14, 9);
        // void inside hood
        px(g, 0x000000, cx - 4, 7, 8, 5);
        // glowing eyes
        px(g, accent, cx - 3, 8, 2, 2);
        px(g, accent, cx + 1, 8, 2, 2);
        // robe (trapezoid built from rows)
        for (let row = 0; row < h - 14; row++) {
            const widening = Math.floor(row * 0.4);
            const c = row % 3 === 0 ? dark : color;
            px(g, c, cx - 6 - widening, 14 + row, 12 + widening * 2, 1);
        }
        // ethereal trail at bottom
        px(g, accent, cx - 2, h - 2, 4, 1);
    } else {
        // lich: skull + crown + robe
        const cx = w / 2;
        // crown spikes
        px(g, 0xffd700, cx - 5, 0, 2, 3);
        px(g, 0xffd700, cx - 1, 0, 2, 4);
        px(g, 0xffd700, cx + 3, 0, 2, 3);
        // skull
        px(g, 0xddccaa, cx - 5, 3, 10, 8);
        px(g, 0x000000, cx - 4, 5, 3, 3);
        px(g, 0x000000, cx + 1, 5, 3, 3);
        px(g, 0x66ff66, cx - 3, 6, 1, 1);
        px(g, 0x66ff66, cx + 2, 6, 1, 1);
        // jaw
        px(g, 0x000000, cx - 2, 9, 4, 1);
        // robe body
        px(g, dark,  cx - 6, 11, 12, h - 12);
        px(g, color, cx - 5, 12, 10, h - 14);
        // chest gem
        px(g, accent, cx - 2, h * 0.5, 4, 3);
        px(g, 0xffffff, cx - 1, h * 0.5 + 1, 2, 1);
        // arms/staff hint
        px(g, dark, 2, h * 0.45, 3, h * 0.3);
        px(g, 0xffd700, 1, h * 0.4, 5, 3);
    }
    g.generateTexture(key, w, h);
}

// ─────────────────────────────────────────────────────────────────────────
// Customizable player sprite. Regenerates 'sprite_player' from a config.
// gender: 'male' | 'female' (changes silhouette)
// skin/hair/robe: ids from data/appearance.js
// ─────────────────────────────────────────────────────────────────────────
export function buildPlayerSprite(scene, appearance) {
    const SKIN_MAP = { pale:0xf5d8a8, light:0xe8b886, medium:0xc89060, tan:0x9c6840, dark:0x6b4222 };
    const HAIR_MAP = { black:0x1a1a1a, brown:0x6b3a1a, blond:0xddbb44, red:0xc04020, white:0xeeeeee, silver:0xaaccdd, green:0x44aa66, purple:0x8855cc };
    const ROBE_MAP = { blue:0x223388, green:0x2a6644, red:0x882222, purple:0x553388, gold:0xaa7711, black:0x222233, white:0xddddee, cyan:0x22aacc };

    const skin = SKIN_MAP[appearance?.skin] ?? SKIN_MAP.light;
    const hair = HAIR_MAP[appearance?.hair] ?? HAIR_MAP.brown;
    const robe = ROBE_MAP[appearance?.robe] ?? ROBE_MAP.blue;
    const robeDark = darkerColor(robe, 0.55);
    const isFemale = appearance?.gender === 'female';

    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    if (scene.textures.exists('sprite_player')) scene.textures.remove('sprite_player');

    // Hair (back layer for female, just on top for male)
    if (isFemale) {
        g.fillStyle(hair); g.fillRect(6, 0, 16, 14);     // long hair flowing past head
    }
    // Head
    g.fillStyle(skin); g.fillRect(8, 1, 12, 10);
    // Hair (front - bangs)
    g.fillStyle(hair);
    if (isFemale) {
        g.fillRect(7, 0, 14, 4);
        g.fillRect(6, 2, 3, 5);
        g.fillRect(19, 2, 3, 5);
    } else {
        g.fillRect(8, 0, 12, 4);
        g.fillRect(7, 1, 1, 3);
        g.fillRect(20, 1, 1, 3);
    }
    // Eyes
    g.fillStyle(0x111111); g.fillRect(10, 5, 2, 2); g.fillRect(16, 5, 2, 2);
    // Mouth
    g.fillStyle(0x882222); g.fillRect(12, 9, 4, 1);

    // Body (robe) — slightly hourglass for female
    g.fillStyle(robeDark);
    if (isFemale) {
        g.fillRect(7, 11, 14, 3);  // shoulders
        g.fillRect(8, 14, 12, 4);  // waist
        g.fillRect(6, 18, 16, 5);  // skirt flare
    } else {
        g.fillRect(6, 11, 16, 12);
    }
    g.fillStyle(robe);
    if (isFemale) {
        g.fillRect(8, 12, 12, 2);
        g.fillRect(9, 14, 10, 3);
        g.fillRect(7, 18, 14, 4);
    } else {
        g.fillRect(7, 12, 14, 10);
    }
    // Belt
    g.fillStyle(0xffd700); g.fillRect(7, 17, 14, 1);
    // Legs
    g.fillStyle(robeDark);
    g.fillRect(8, 23, 6, 9);
    g.fillRect(15, 23, 6, 9);
    // Boots
    g.fillStyle(0x442211);
    g.fillRect(7, 30, 7, 2);
    g.fillRect(15, 30, 7, 2);
    // Arms
    g.fillStyle(skin);
    g.fillRect(3, 14, 3, 7);
    g.fillRect(22, 14, 3, 7);
    g.fillStyle(robe);
    g.fillRect(2, 12, 5, 4);
    g.fillRect(21, 12, 5, 4);

    g.generateTexture('sprite_player', 28, 32);
    g.destroy();
}

function darkerColor(c, factor) {
    const r = Math.floor(((c >> 16) & 0xff) * factor);
    const g = Math.floor(((c >> 8)  & 0xff) * factor);
    const b = Math.floor((c & 0xff) * factor);
    return (r << 16) | (g << 8) | b;
}

export const TILE_TEXTURE_MAP = {
    0: 'tile_grass',
    1: 'tile_stone',
    2: 'tile_water',
    3: 'tile_wall',
    4: 'tile_tree',
    5: 'tile_door',
    6: 'tile_portal',
    7: 'tile_chest',
    8: 'tile_sand',
    9: 'tile_dark_grass',
    10: 'tile_mountain',
    11: 'tile_snow',
    12: 'tile_cave',
};
