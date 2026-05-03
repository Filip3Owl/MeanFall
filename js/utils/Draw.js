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

    // NPC (24×32)
    g.clear();
    g.fillStyle(0xf4c27f); g.fillRect(8, 0, 12, 11);
    g.fillStyle(0xd4af37); g.fillRect(6, 11, 16, 12);    // gold robe
    g.fillStyle(0xaa8800); g.fillRect(6, 23, 7, 9); g.fillRect(13, 23, 7, 9);
    g.fillStyle(0x8b5e3c); g.fillRect(2, 13, 4, 8); g.fillRect(22, 13, 4, 8);
    g.fillStyle(0x000000); g.fillRect(10, 3, 3, 3); g.fillRect(15, 3, 3, 3);
    g.fillStyle(0xffffff); g.fillRect(9, 8, 10, 2);
    g.generateTexture('sprite_npc', 24, 32);

    // Items
    g.clear(); g.fillStyle(0xff4444); g.fillRect(4, 2, 10, 18); g.fillStyle(0xff8888); g.fillRect(6, 4, 6, 8);
    g.generateTexture('item_potion_red', 18, 22);
    g.clear(); g.fillStyle(0x4444ff); g.fillRect(4, 2, 10, 18); g.fillStyle(0x8888ff); g.fillRect(6, 4, 6, 8);
    g.generateTexture('item_potion_blue', 18, 22);
    g.clear(); g.fillStyle(0xd4a040); g.fillRect(2, 2, 20, 18); g.fillStyle(0x8b6020); g.fillRect(2, 2, 20, 3);
    g.generateTexture('item_scroll', 24, 22);

    g.destroy();
}

function shade(color, factor) {
    const r = Math.floor(((color >> 16) & 0xff) * factor);
    const g = Math.floor(((color >> 8)  & 0xff) * factor);
    const b = Math.floor((color & 0xff) * factor);
    return (Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b);
}

function drawAura(g, w, h, color, intensity = 0.25) {
    g.fillStyle(color, intensity);
    g.fillCircle(w / 2, h / 2, Math.max(w, h) / 2 + 2);
    g.fillStyle(color, intensity * 0.5);
    g.fillCircle(w / 2, h / 2, Math.max(w, h) / 2 + 5);
}

// AIR — ethereal wisp / winged sylph
function drawAirSprite(g, w, h, key, color, variant) {
    g.clear();
    drawAura(g, w, h, color, 0.3);
    const dark = shade(color, 0.6);
    if (variant === 'small') {
        g.fillStyle(color, 0.9);
        g.fillCircle(w / 2, h / 2, w / 2 - 2);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(w / 2 - 3, h / 2 - 2, 2);
        g.fillStyle(0x000000); g.fillCircle(w / 2 - 2, h / 2, 1);
        g.fillCircle(w / 2 + 4, h / 2, 1);
    } else {
        // tall sylph: head, robe, wings
        g.fillStyle(color, 0.85);
        g.fillRect(w / 2 - 4, 2, 8, 8);                       // head
        g.fillTriangle(w / 2 - 6, 8, w / 2 + 6, 8, w / 2, h - 2); // robe
        g.fillStyle(0xffffff, 0.6);
        g.fillTriangle(0, 8, w / 2 - 5, 12, w / 2 - 5, 18);     // left wing
        g.fillTriangle(w, 8, w / 2 + 5, 12, w / 2 + 5, 18);     // right wing
        g.fillStyle(0x000000); g.fillRect(w / 2 - 2, 5, 1, 1); g.fillRect(w / 2 + 1, 5, 1, 1);
        g.fillStyle(dark); g.fillRect(w / 2 - 1, 7, 2, 1);
    }
    g.generateTexture(key, w, h);
}

// EARTH — golem / dryad
function drawEarthSprite(g, w, h, key, color, variant) {
    g.clear();
    drawAura(g, w, h, color, 0.18);
    const dark  = shade(color, 0.55);
    const light = shade(color, 1.4);
    if (variant === 'block') {
        // golem: blocky body
        g.fillStyle(dark);  g.fillRect(0, h * 0.18, w, h * 0.82);
        g.fillStyle(color); g.fillRect(2, h * 0.22, w - 4, h * 0.74);
        g.fillStyle(light, 0.5); g.fillRect(4, h * 0.25, w - 8, 4);
        g.fillStyle(0x442200); g.fillRect(4, h * 0.32, w - 8, 2);
        // crystal eyes
        g.fillStyle(0x66ddff); g.fillRect(w * 0.28, h * 0.42, 3, 3); g.fillRect(w * 0.58, h * 0.42, 3, 3);
        g.fillStyle(dark); g.fillRect(w * 0.2, h * 0.8, w * 0.25, h * 0.2);
        g.fillRect(w * 0.55, h * 0.8, w * 0.25, h * 0.2);
    } else {
        // dryad: tree-like with leaves
        g.fillStyle(0x5c3a1e); g.fillRect(w / 2 - 3, h * 0.5, 6, h * 0.5);  // trunk
        g.fillStyle(color);    g.fillCircle(w / 2, h * 0.32, w * 0.4);     // foliage
        g.fillStyle(light, 0.5); g.fillCircle(w / 2 - 4, h * 0.25, w * 0.18);
        g.fillStyle(0x000000); g.fillRect(w / 2 - 3, h * 0.32, 2, 2); g.fillRect(w / 2 + 1, h * 0.32, 2, 2);
        g.fillStyle(0xffaa00); g.fillRect(w / 2 - 1, h * 0.42, 2, 1);
    }
    g.generateTexture(key, w, h);
}

// LIGHT — spark / prism
function drawLightSprite(g, w, h, key, color, variant) {
    g.clear();
    drawAura(g, w, h, 0xffffaa, 0.4);
    if (variant === 'small') {
        // radiant spark with rays
        g.fillStyle(0xffffff, 0.9); g.fillCircle(w / 2, h / 2, w * 0.2);
        g.fillStyle(color, 0.85);
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const x1 = w / 2 + Math.cos(a) * w * 0.2;
            const y1 = h / 2 + Math.sin(a) * h * 0.2;
            const x2 = w / 2 + Math.cos(a) * w * 0.45;
            const y2 = h / 2 + Math.sin(a) * h * 0.45;
            g.lineStyle(2, color, 0.9); g.lineBetween(x1, y1, x2, y2);
        }
        g.fillStyle(0xffaa00); g.fillCircle(w / 2, h / 2, 2);
    } else {
        // prism: faceted crystal body
        g.fillStyle(color, 0.9);
        g.fillTriangle(w / 2, 0, 2, h - 2, w - 2, h - 2);
        g.fillStyle(0xffffff, 0.5);
        g.fillTriangle(w / 2, 4, w / 2 - 4, h * 0.6, w / 2 + 4, h * 0.6);
        g.fillStyle(shade(color, 0.6));
        g.lineStyle(1, shade(color, 0.4));
        g.strokeTriangle(w / 2, 0, 2, h - 2, w - 2, h - 2);
        g.fillStyle(0xff8800); g.fillRect(w / 2 - 2, h * 0.5, 1, 1); g.fillRect(w / 2 + 1, h * 0.5, 1, 1);
    }
    g.generateTexture(key, w, h);
}

// FIRE — phoenix / salamander
function drawFireSprite(g, w, h, key, color, variant) {
    g.clear();
    drawAura(g, w, h, 0xff8800, 0.3);
    const dark = shade(color, 0.6);
    if (variant === 'bird') {
        // phoenix
        g.fillStyle(color); g.fillRect(w / 2 - 4, h * 0.35, 8, h * 0.45);  // body
        g.fillStyle(0xffaa00); g.fillTriangle(w / 2, h * 0.1, w / 2 - 3, h * 0.4, w / 2 + 3, h * 0.4); // head crest
        g.fillStyle(color, 0.8);
        g.fillTriangle(0, h * 0.5, w / 2 - 4, h * 0.4, w / 2 - 4, h * 0.7); // left wing
        g.fillTriangle(w, h * 0.5, w / 2 + 4, h * 0.4, w / 2 + 4, h * 0.7); // right wing
        g.fillStyle(0xffff00); g.fillTriangle(w / 2, h, w / 2 - 3, h * 0.8, w / 2 + 3, h * 0.8); // tail flame
        g.fillStyle(0x000000); g.fillRect(w / 2 - 2, h * 0.25, 1, 1); g.fillRect(w / 2 + 1, h * 0.25, 1, 1);
        g.fillStyle(0xffaa00); g.fillRect(w / 2, h * 0.3, 2, 1); // beak
    } else {
        // salamander: low lizard body
        g.fillStyle(color); g.fillRect(2, h * 0.4, w - 4, h * 0.45);     // body
        g.fillStyle(color); g.fillRect(w - 8, h * 0.25, 6, h * 0.2);     // head
        g.fillStyle(dark);  g.fillRect(0, h * 0.55, 4, 3);  g.fillRect(w - 4, h * 0.55, 4, 3); // legs
        g.fillStyle(0xffaa00, 0.7);
        g.fillRect(w * 0.2, h * 0.32, 3, 4); g.fillRect(w * 0.4, h * 0.3, 3, 5); g.fillRect(w * 0.6, h * 0.32, 3, 4); // back flames
        g.fillStyle(0xffff00); g.fillRect(w - 4, h * 0.3, 1, 1); // eye
    }
    g.generateTexture(key, w, h);
}

// WATER — serpent / leviathan
function drawWaterSprite(g, w, h, key, color, variant) {
    g.clear();
    drawAura(g, w, h, 0x88ccff, 0.25);
    const light = shade(color, 1.5);
    const dark  = shade(color, 0.5);
    if (variant === 'wave') {
        // serpent: undulating body
        g.fillStyle(color);
        g.fillCircle(w * 0.15, h * 0.4, h * 0.3);
        g.fillCircle(w * 0.35, h * 0.6, h * 0.3);
        g.fillCircle(w * 0.55, h * 0.4, h * 0.3);
        g.fillCircle(w * 0.78, h * 0.55, h * 0.35);
        g.fillStyle(light, 0.5);
        g.fillCircle(w * 0.78, h * 0.5, h * 0.18); // head highlight
        g.fillStyle(0xffffff); g.fillRect(w * 0.85, h * 0.45, 2, 2);
        g.fillStyle(0x000000); g.fillRect(w * 0.86, h * 0.46, 1, 1);
    } else {
        // leviathan: armored beast
        g.fillStyle(dark); g.fillRect(2, h * 0.3, w - 4, h * 0.6);
        g.fillStyle(color); g.fillRect(4, h * 0.32, w - 8, h * 0.55);
        // armor plates
        g.fillStyle(light, 0.4);
        for (let i = 0; i < 4; i++) g.fillRect(6 + i * 6, h * 0.35, 4, 4);
        // horns
        g.fillStyle(dark);
        g.fillTriangle(w * 0.2, h * 0.3, w * 0.15, h * 0.1, w * 0.25, h * 0.25);
        g.fillTriangle(w * 0.8, h * 0.3, w * 0.85, h * 0.1, w * 0.75, h * 0.25);
        // eyes
        g.fillStyle(0x88ddff); g.fillRect(w * 0.3, h * 0.45, 3, 3); g.fillRect(w * 0.6, h * 0.45, 3, 3);
        g.fillStyle(0x000000); g.fillRect(w * 0.31, h * 0.46, 1, 1); g.fillRect(w * 0.61, h * 0.46, 1, 1);
    }
    g.generateTexture(key, w, h);
}

// SHADOW — specter / lich
function drawShadowSprite(g, w, h, key, color, variant) {
    g.clear();
    drawAura(g, w, h, 0x220033, 0.5);
    drawAura(g, w, h, color, 0.2);
    const accent = shade(color, 1.6);
    if (variant === 'wraith') {
        // floating wraith with hood
        g.fillStyle(color, 0.85);
        g.fillRect(w * 0.2, 2, w * 0.6, h * 0.3);                 // hood top
        g.fillTriangle(w * 0.15, h * 0.25, w * 0.85, h * 0.25, w / 2, h - 2); // robe
        g.fillStyle(0x000000);
        g.fillRect(w * 0.3, h * 0.15, w * 0.4, h * 0.18);          // hood interior shadow
        g.fillStyle(accent);
        g.fillRect(w * 0.36, h * 0.22, 3, 3); g.fillRect(w * 0.55, h * 0.22, 3, 3); // glowing eyes
        g.fillStyle(0xaa66ff, 0.4); g.fillRect(w * 0.3, h * 0.7, w * 0.4, 2); // ethereal trail
    } else {
        // lich: bony figure with crown
        g.fillStyle(color);
        g.fillRect(w * 0.25, h * 0.25, w * 0.5, h * 0.5);          // robe body
        g.fillStyle(0xddccaa); g.fillRect(w * 0.32, h * 0.05, w * 0.36, h * 0.22); // skull
        g.fillStyle(0x000000); g.fillRect(w * 0.36, h * 0.12, 4, 4); g.fillRect(w * 0.56, h * 0.12, 4, 4); // eye sockets
        g.fillStyle(0x66ff66); g.fillRect(w * 0.37, h * 0.13, 2, 2); g.fillRect(w * 0.57, h * 0.13, 2, 2); // green flames in sockets
        g.fillStyle(0xffd700);
        // crown spikes
        g.fillTriangle(w * 0.32, h * 0.05, w * 0.36, 0,  w * 0.4, h * 0.05);
        g.fillTriangle(w * 0.46, h * 0.05, w * 0.5,  0,  w * 0.54, h * 0.05);
        g.fillTriangle(w * 0.6,  h * 0.05, w * 0.64, 0,  w * 0.68, h * 0.05);
        g.fillStyle(accent, 0.6); g.fillRect(w * 0.4, h * 0.45, w * 0.2, 4); // chest gem
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
