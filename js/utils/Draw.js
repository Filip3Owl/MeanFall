import { COLORS, TILE_SIZE } from '../constants.js';

const S = TILE_SIZE;

function tile(g, fn) {
    g.clear();
    fn(g);
}

export function generateTextures(scene) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    // ─── TILES ──────────────────────────────────────────────────────────────
    tile(g, g => {
        g.fillStyle(COLORS.GRASS); g.fillRect(0, 0, S, S);
        g.fillStyle(0x2d6035, 0.6);
        g.fillRect(4, 10, 6, 3); g.fillRect(18, 5, 4, 6); g.fillRect(10, 22, 5, 4);
        g.fillStyle(0x4a9d54, 0.4);
        g.fillRect(8, 2, 3, 5); g.fillRect(22, 18, 4, 4);
    });
    g.generateTexture('tile_grass', S, S);

    tile(g, g => {
        g.fillStyle(COLORS.STONE); g.fillRect(0, 0, S, S);
        g.fillStyle(0x666666);
        g.fillRect(0, 15, S, 2); g.fillRect(16, 0, 2, 15); g.fillRect(8, 17, 2, 15);
        g.fillStyle(0xaaaaaa, 0.3);
        g.fillRect(2, 2, 12, 11); g.fillRect(18, 2, 12, 11);
    });
    g.generateTexture('tile_stone', S, S);

    tile(g, g => {
        g.fillStyle(COLORS.WATER); g.fillRect(0, 0, S, S);
        g.fillStyle(0x2a7fc8, 0.5);
        g.fillRect(2, 6, 28, 4); g.fillRect(4, 18, 24, 4);
        g.fillStyle(0xaaddff, 0.2);
        g.fillRect(6, 8, 8, 2); g.fillRect(18, 20, 6, 2);
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

    tile(g, g => {
        g.fillStyle(COLORS.TREE_TRUNK); g.fillRect(12, 20, 8, 12);
        g.fillStyle(COLORS.TREE_TOP); g.fillRect(4, 8, 24, 16);
        g.fillRect(8, 2, 16, 8); g.fillRect(10, 22, 12, 6);
        g.fillStyle(0x3d8b3d, 0.5); g.fillRect(6, 10, 6, 8); g.fillRect(20, 6, 6, 10);
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
    // Player (24×32)
    g.clear();
    g.fillStyle(0xf4c27f); g.fillRect(8, 0, 12, 11);     // head
    g.fillStyle(0x222288); g.fillRect(6, 11, 16, 12);    // body
    g.fillStyle(0x1a1a66); g.fillRect(6, 23, 7, 9);      // left leg
    g.fillRect(13, 23, 7, 9);                              // right leg
    g.fillStyle(0x8b5e3c); g.fillRect(2, 13, 5, 8);      // left arm
    g.fillRect(21, 13, 5, 8);                              // right arm
    g.fillStyle(0x0d0d44); g.fillRect(10, 3, 3, 3);      // left eye
    g.fillRect(15, 3, 3, 3);                               // right eye
    g.fillStyle(0xffd700); g.fillRect(9, 8, 10, 2);      // mouth/belt
    g.generateTexture('sprite_player', 24, 32);

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
