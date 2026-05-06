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

    // Improved Wall: More variety and highlights
    tile(g, g => {
        g.fillStyle(0x666666); g.fillRect(0, 0, S, S);
        for (let row = 0; row < 4; row++) {
            const off = (row % 2) * 8;
            for (let col = 0; col < 3; col++) {
                const bx = off + col * 16;
                const by = row * 8;
                g.fillStyle(0x444444); g.fillRect(bx, by, 14, 7);
                g.fillStyle(0x777777, 0.4); g.fillRect(bx, by, 14, 1); // top highlight
            }
        }
        // Random grit
        g.fillStyle(0x333333, 0.3);
        g.fillRect(5, 5, 2, 2); g.fillRect(20, 20, 2, 2);
    });
    g.generateTexture('tile_wall', S, S);

    tile(g, g => {
        g.fillStyle(0x2d6a35); g.fillRect(0, 0, S, S);
        g.fillStyle(0x3a7d44); g.fillRect(0, 4, S, S - 8);
...
    g.generateTexture('tile_tree', S, S);

    // Improved Door: Panel detail and knob
    tile(g, g => {
        g.fillStyle(0x4a2d18); g.fillRect(0, 0, S, S);
        g.fillStyle(0x5c3a1e); g.fillRect(3, 3, S - 6, S - 6);
        // Panels
        g.fillStyle(0x4a2d18, 0.5);
        g.fillRect(6, 6, 8, 8); g.fillRect(18, 6, 8, 8);
        g.fillRect(6, 18, 8, 10); g.fillRect(18, 18, 8, 10);
        // Knob
        g.fillStyle(0xd4af37); g.fillRect(22, 14, 3, 3);
    });
    g.generateTexture('tile_door', S, S);

    // ROOF: Terracotta shingles
    tile(g, g => {
        g.fillStyle(0x6b221a); g.fillRect(0, 0, S, S);
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cx = col * 8;
                const cy = row * 8;
                g.fillStyle(0x882211); g.fillRect(cx, cy, 7, 7);
                g.fillStyle(0xaa3322, 0.3); g.fillRect(cx, cy, 7, 2);
            }
        }
    });
    g.generateTexture('tile_roof', S, S);

    // WINDOW: Glowing pane
    tile(g, g => {
        g.fillStyle(0x444444); g.fillRect(0, 0, S, S); // frame
        g.fillStyle(0xffee88); g.fillRect(4, 4, S-8, S-8); // light
        g.fillStyle(0xffaa00, 0.4); g.fillRect(4, 4, S-8, (S-8)/2); // reflection
        // Grid
        g.fillStyle(0x333333, 0.8);
        g.fillRect(S/2 - 1, 4, 2, S-8);
        g.fillRect(4, S/2 - 1, S-8, 2);
    });
    g.generateTexture('tile_window', S, S);

    // SIGN: Wooden board
    tile(g, g => {
        g.fillStyle(0x5c3a1e); g.fillRect(2, 6, S-4, 16); // board
        g.fillStyle(0x4a2d18); g.fillRect(2, 6, S-4, 2); // shadow
        // Symbols (placeholder gold dots)
        g.fillStyle(0xd4af37); g.fillRect(8, 12, 4, 4); g.fillRect(20, 12, 4, 4);
    });
    g.generateTexture('tile_sign', S, S);

    // FENCE: Post and rail
    tile(g, g => {
        g.clear(); // Transparent background
        g.fillStyle(0x5c3a1e);
        g.fillRect(6, 0, 4, S); // Left post
        g.fillRect(22, 0, 4, S); // Right post
        g.fillRect(0, 8, S, 3); // Top rail
        g.fillRect(0, 20, S, 3); // Bottom rail
    });
    g.generateTexture('tile_fence', S, S);

    // BOOKSHELF: Small books
    tile(g, g => {
        g.fillStyle(0x4a2d18); g.fillRect(0, 0, S, S); // wood
        const colors = [0xcc2222, 0x2266ff, 0x228822, 0xeeeeee, 0xffaa00];
        for (let row = 0; row < 2; row++) {
            const by = 4 + row * 12;
            g.fillStyle(0x2d1a08); g.fillRect(2, by, S-4, 8); // shelf void
            for (let i = 0; i < 5; i++) {
                g.fillStyle(colors[Math.floor(Math.random()*colors.length)]);
                g.fillRect(4 + i * 5, by + 1, 4, 7);
            }
        }
    });
    g.generateTexture('tile_bookshelf', S, S);

    // TABLE: Plain wood
    tile(g, g => {
        g.fillStyle(0x5c3a1e); g.fillRect(2, 2, S-4, S-4);
        g.fillStyle(0x7a4c2a); g.fillRect(4, 4, S-8, S-8);
        g.fillStyle(0x4a2d18, 0.6); g.fillRect(2, 2, S-4, 2);
    });
    g.generateTexture('tile_table', S, S);

    // RUG: Ornate pattern
    tile(g, g => {
        g.fillStyle(0x882222); g.fillRect(0, 0, S, S);
        g.fillStyle(0xaa7711, 0.4);
        g.fillRect(4, 4, S-8, S-8);
        g.fillStyle(0x882222); g.fillRect(8, 8, S-16, S-16);
        // Fringe
        g.fillStyle(0xaa7711, 0.6);
        for(let i=0; i<S; i+=4) { g.fillRect(i, 0, 2, 2); g.fillRect(i, S-2, 2, 2); }
    });
    g.generateTexture('tile_rug', S, S);

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

    // Wall Shadow
    tile(g, g => {
        g.fillStyle(0x000000, 0.25);
        g.fillRect(0, 0, S, S / 2);
    });
    g.generateTexture('tile_wall_shadow', S, S);

    // Entity Shadow (Universal oval)
    tile(g, g => {
        g.fillStyle(0x000000, 0.35);
        g.fillEllipse(S/2, S/2, S*0.8, S*0.4);
    });
    g.generateTexture('entity_shadow', S, S);

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

    drawNPCSprites(g);
    drawElementIcons(g);

    // ─── ITEM ICONS (24×24) ────────────────────────────────────────────────
    
    // Potions
    const drawPotion = (key, color) => {
        g.clear();
        const dark = shade(color, 0.4);
        const light = shade(color, 1.5);
        px(g, 0x6b452e, 10, 3, 4, 3);   // cork
        px(g, dark,      7, 6, 10, 13); // bottle outline
        px(g, color,     8, 7, 8, 11);  // liquid
        px(g, light,     9, 8, 3, 4);   // sparkle
        g.generateTexture(key, 24, 24);
    };
    drawPotion('item_potion_red', 0xcc2222);
    drawPotion('item_potion_blue', 0x2244cc);

    // Scroll
    g.clear();
    px(g, 0x5c3a1e, 3, 6, 18, 12);  // backing
    px(g, 0xf0d8a0, 4, 7, 16, 10);  // paper
    px(g, 0xc8a060, 4, 7, 1, 10);   // left roll
    px(g, 0xc8a060, 19, 7, 1, 10);  // right roll
    px(g, 0x8b5c2e, 10, 8, 4, 1);   // seal
    g.generateTexture('item_scroll', 24, 24);

    // Helm: Silver bucket
    g.clear();
    px(g, 0x999999, 6, 4, 12, 14); // helmet body
    px(g, 0xbbbbbb, 8, 5, 8, 4);   // top highlight
    px(g, 0x222222, 7, 10, 10, 2); // visor slit
    px(g, 0x777777, 6, 17, 12, 1); // bottom edge
    g.generateTexture('item_helm', 24, 24);

    // Armor: Chestplate
    g.clear();
    px(g, 0x999999, 4, 6, 16, 12); // main body
    px(g, 0xbbbbbb, 6, 7, 12, 3);  // top light
    px(g, 0x777777, 4, 6, 1, 12);  // left edge shadow
    px(g, 0x777777, 19, 6, 1, 12); // right edge shadow
    px(g, 0x999999, 2, 6, 4, 4);   // shoulder left
    px(g, 0x999999, 18, 6, 4, 4);  // shoulder right
    g.generateTexture('item_armor', 24, 24);

    // Legs: Greaves
    g.clear();
    px(g, 0x999999, 6, 4, 5, 16);  // left leg
    px(g, 0x999999, 13, 4, 5, 16); // right leg
    px(g, 0xbbbbbb, 7, 5, 3, 10);  // highlights
    px(g, 0xbbbbbb, 14, 5, 3, 10);
    px(g, 0x777777, 6, 4, 12, 2);  // waist top
    g.generateTexture('item_legs', 24, 24);

    // Boots: Leather
    g.clear();
    px(g, 0x5a3a1e, 4, 10, 6, 10); // left boot
    px(g, 0x5a3a1e, 4, 17, 10, 3); // left sole
    px(g, 0x5a3a1e, 14, 10, 6, 10); // right boot
    px(g, 0x5a3a1e, 14, 17, 10, 3); // right sole
    px(g, 0x7a4a2a, 5, 11, 3, 4);  // highlights
    px(g, 0x7a4a2a, 15, 11, 3, 4);
    g.generateTexture('item_boots', 24, 24);

    // Sword: Vertical
    g.clear();
    px(g, 0xaaaaaa, 11, 2, 2, 14); // blade
    px(g, 0xcccccc, 11, 2, 1, 14); // blade light
    px(g, 0xd4af37, 8, 16, 8, 2);  // guard
    px(g, 0x5a3a1e, 11, 18, 2, 4); // hilt
    g.generateTexture('item_sword', 24, 24);

    // Staff
    g.clear();
    px(g, 0x5a3a1e, 11, 4, 2, 18); // pole
    px(g, 0x3388ff, 10, 2, 4, 4);  // gem
    px(g, 0x88ccff, 11, 3, 2, 2);  // gem light
    g.generateTexture('item_staff', 24, 24);

    // Shield
    g.clear();
    px(g, 0x5a3a1e, 4, 4, 16, 16); // wood
    px(g, 0x999999, 4, 4, 16, 2);  // top iron
    px(g, 0x999999, 4, 18, 16, 2); // bottom iron
    px(g, 0x999999, 4, 4, 2, 16);  // left iron
    px(g, 0x999999, 18, 4, 2, 16); // right iron
    px(g, 0xbbbbbb, 11, 11, 2, 2); // center stud
    g.generateTexture('item_shield', 24, 24);

    // Ring
    g.clear();
    px(g, 0xd4af37, 8, 10, 8, 8);  // outer ring
    px(g, 0x000000, 10, 12, 4, 4); // inner hole
    px(g, 0xff4444, 11, 9, 2, 2);  // gem
    g.generateTexture('item_ring', 24, 24);

    // Amulet
    g.clear();
    px(g, 0xcccccc, 7, 4, 10, 1);  // top chain
    px(g, 0xcccccc, 6, 5, 1, 6);   // side chain L
    px(g, 0xcccccc, 17, 5, 1, 6);  // side chain R
    px(g, 0xcccccc, 8, 11, 8, 1);  // bottom chain V
    px(g, 0x33ccff, 10, 12, 4, 6); // pendant
    px(g, 0xffffff, 11, 13, 2, 2); // sparkle
    g.generateTexture('item_amulet', 24, 24);

    // ─── MAP DECORATIONS (32×32) ───────────────────────────────────────────
    
    // Flowers
    const drawFlower = (key, color) => {
        g.clear();
        px(g, 0x2d6a35, 15, 20, 2, 10); // stem
        px(g, 0x3d8b3d, 12, 22, 3, 2);  // leaf L
        px(g, 0x3d8b3d, 17, 24, 3, 2);  // leaf R
        px(g, color, 13, 14, 6, 6);     // petals
        px(g, 0xffd700, 15, 16, 2, 2);  // center
        g.generateTexture(key, 32, 32);
    };
    drawFlower('deco_flower_red',   0xcc2222);
    drawFlower('deco_flower_blue',  0x2266ff);
    drawFlower('deco_flower_white', 0xeeeeee);

    // Rocks
    tile(g, g => {
        px(g, 0x555555, 10, 20, 12, 8);  // base
        px(g, 0x777777, 12, 21, 8, 6);   // mid
        px(g, 0x999999, 14, 22, 4, 2);   // highlight
    });
    g.generateTexture('deco_rock_small', 32, 32);

    tile(g, g => {
        px(g, 0x444444, 6, 15, 20, 14);  // shadow/base
        px(g, 0x666666, 8, 16, 16, 12);  // body
        px(g, 0x888888, 10, 18, 10, 6);  // mid
        px(g, 0xaaaaaa, 12, 19, 4, 2);   // top
    });
    g.generateTexture('deco_rock_large', 32, 32);

    // Grass Tuft
    tile(g, g => {
        g.fillStyle(0x5aab64);
        g.fillRect(10, 22, 2, 8);
        g.fillRect(15, 18, 2, 12);
        g.fillRect(20, 24, 2, 6);
        g.fillRect(12, 25, 8, 1); // connector
    });
    g.generateTexture('deco_grass_tuft', 32, 32);

    // Bones (Dungeon)
    tile(g, g => {
        px(g, 0xddccaa, 12, 14, 8, 4);   // skull
        px(g, 0x000000, 14, 15, 1, 1);   // eye L
        px(g, 0x000000, 17, 15, 1, 1);   // eye R
        px(g, 0xddccaa, 8, 20, 16, 2);   // long bone
        px(g, 0xccbbaa, 8, 19, 2, 4);    // bone end L
        px(g, 0xccbbaa, 22, 19, 2, 4);   // bone end R
    });
    g.generateTexture('deco_bones', 32, 32);

    // Cracks (Walls/Stone)
    tile(g, g => {
        g.fillStyle(0x000000, 0.4);
        g.fillRect(10, 5, 2, 10);
        g.fillRect(11, 12, 8, 2);
        g.fillRect(18, 10, 2, 15);
        g.fillRect(5, 13, 10, 1);
    });
    g.generateTexture('deco_cracks', 32, 32);

    // Cacti (Sand)
    tile(g, g => {
        px(g, 0x2a5a22, 13, 10, 6, 20);  // main trunk
        px(g, 0x2a5a22, 8, 15, 5, 4);    // arm L
        px(g, 0x2a5a22, 8, 11, 3, 4);    // arm L up
        px(g, 0x2a5a22, 19, 18, 5, 4);   // arm R
        px(g, 0x2a5a22, 21, 14, 3, 4);   // arm R up
        px(g, 0x1f4a18, 14, 11, 1, 18);  // shadow line
    });
    g.generateTexture('deco_cactus', 32, 32);

    // Ice Crystals (Snow)
    tile(g, g => {
        px(g, 0x88ccff, 12, 12, 8, 8);   // center
        px(g, 0xccf0ff, 14, 8, 4, 16);   // vertical
        px(g, 0xccf0ff, 8, 14, 16, 4);   // horizontal
        px(g, 0xffffff, 15, 15, 2, 2);   // sparkle
    });
    g.generateTexture('deco_ice_crystal', 32, 32);

    // Snow Mound
    tile(g, g => {
        px(g, 0xeeeeff, 8, 22, 16, 6);   // body
        px(g, 0xffffff, 10, 20, 12, 4);  // top
        px(g, 0xccccdd, 12, 24, 8, 2);   // shadow
    });
    g.generateTexture('deco_snow_mound', 32, 32);

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

// ─────────────────────────────────────────────────────────────────────────
// NPC SPRITES  (24×32 each, one unique texture per npcId)
// ─────────────────────────────────────────────────────────────────────────
function drawNPCSprites(g) {

    // Shared base: layered humanoid (24×32).
    // skin/hair/body/legs are hex; accent is belt color or null.
    function humanBase(g, skin, hair, body, legs, accent) {
        const bDark  = shade(body, 0.60);
        const bLight = shade(body, 1.28);
        const sDark  = shade(skin, 0.78);

        // Hair
        px(g, shade(hair, 0.75), 7,  0, 10, 1);
        px(g, hair,              7,  1, 10, 3);
        px(g, shade(hair, 1.22), 8,  1,  4, 1);

        // Head (sides in shadow, center lit)
        px(g, sDark,  7, 3,  1, 8);
        px(g, skin,   8, 3,  8, 8);
        px(g, sDark, 16, 3,  1, 8);

        // Eyebrows
        px(g, shade(hair, 0.88),  9, 4, 2, 1);
        px(g, shade(hair, 0.88), 13, 4, 2, 1);

        // Eyes: white sclera + dark pupil + bright highlight
        px(g, 0xffffff,  9, 5, 2, 2);  px(g, 0xffffff, 13, 5, 2, 2);
        px(g, 0x222222, 10, 5, 1, 2);  px(g, 0x222222, 14, 5, 1, 2);
        px(g, 0xffffff,  9, 5, 1, 1);  px(g, 0xffffff, 13, 5, 1, 1);

        // Nose & mouth
        px(g, sDark, 11, 7, 2, 2);
        px(g, shade(skin, 0.72), 10, 9, 4, 1);

        // Neck
        px(g, skin, 10, 11, 4, 2);

        // Torso (shadow wrap + main + center fold highlight)
        px(g, bDark,  5, 12, 14, 11);
        px(g, body,   6, 12, 12, 10);
        px(g, bLight, 10, 13,  4,  8);
        if (accent) px(g, accent, 6, 17, 12, 2);

        // Arms + hands
        px(g, bDark,  1, 13, 5, 8);  px(g, body,  2, 13, 4, 8);
        px(g, skin,   2, 19, 3, 4);
        px(g, bDark, 18, 13, 5, 8);  px(g, body, 18, 13, 4, 8);
        px(g, skin,  19, 19, 3, 4);

        // Legs + boots
        px(g, shade(legs, 0.65),  5, 22, 6, 10);
        px(g, legs,               6, 22, 5,  9);
        px(g, shade(legs, 0.65), 13, 22, 6, 10);
        px(g, legs,              13, 22, 5,  9);
        const boot = shade(legs, 0.48);
        px(g, boot,  5, 29, 7, 3);  px(g, boot, 12, 29, 7, 3);
        px(g, shade(legs, 0.38),  5, 31, 2, 1);
        px(g, shade(legs, 0.38), 18, 31, 2, 1);
    }

    // ── ELDER — white hair + beard, deep-blue robe, golden staff
    g.clear();
    humanBase(g, 0xf0c07a, 0xdddddd, 0x1a2d88, 0x0e1a55, 0xd4af37);
    px(g, 0xcccccc,  6,  0, 12,  4);   // wide white hair
    px(g, 0xeeeeee,  7,  1, 10,  3);
    px(g, 0xcccccc,  8,  9,  8,  3);   // beard top
    px(g, 0xdddddd,  9, 10,  6,  3);   // beard body
    px(g, 0xbbbbbb, 10, 12,  4,  1);   // beard fade
    px(g, shade(0xf0c07a, 0.82),  9, 6, 1, 2);  // left wrinkle
    px(g, shade(0xf0c07a, 0.82), 14, 6, 1, 2);  // right wrinkle
    px(g, 0x0e1a55,  7, 11, 10,  2);   // robe collar shadow
    px(g, 0x7a4c1e, 20,  4,  3, 27);   // staff shaft
    px(g, 0x9a6030, 21,  4,  1, 27);   // shaft highlight
    px(g, 0xd4af37, 18,  2,  7,  4);   // staff head
    px(g, 0xffee44, 20,  2,  3,  3);   // gem glow
    px(g, 0xffffff, 20,  2,  1,  1);   // gem sparkle
    g.generateTexture('sprite_npc_elder', 24, 32);

    // ── SCHOLAR — purple robe, wire glasses, scroll in right hand
    g.clear();
    humanBase(g, 0xf4c27f, 0x6b3d1e, 0x7744bb, 0x3d1e77, 0x9966ee);
    px(g, 0x999999,  8, 5, 3, 3);  px(g, 0x999999, 13, 5, 3, 3);  // frames
    px(g, 0x88aaee,  9, 5, 2, 2);  px(g, 0x88aaee, 13, 5, 2, 2);  // lenses
    px(g, 0x777777, 11, 6, 2, 1);   // nose bridge
    px(g, 0xf0d8a0, 19, 13, 4, 9);  // scroll body
    px(g, 0xc8a060, 19, 13, 1, 9);  px(g, 0xc8a060, 22, 13, 1, 9); // edges
    px(g, 0xc8a060, 19, 13, 4, 1);  px(g, 0xc8a060, 19, 21, 4, 1); // caps
    px(g, 0x4422aa, 20, 15, 2, 1);  // rune line 1
    px(g, 0x4422aa, 20, 17, 1, 1);  // rune line 2
    px(g, 0x4422aa, 21, 19, 1, 1);  // rune line 3
    g.generateTexture('sprite_npc_scholar', 24, 32);

    // ── MERCHANT — green apron over brown shirt, coin pouch, wide smile
    g.clear();
    humanBase(g, 0xf4c27f, 0x8b4513, 0xaa6633, 0x5c3010, 0xd4af37);
    px(g, 0x33884d,  7, 13, 10, 10);  // apron
    px(g, 0x44aa66,  8, 14,  8,  8);
    px(g, 0x66cc88, 10, 15,  4,  6);  // apron highlight
    px(g, 0x226633,  7, 13, 10,  1);  // apron top stitch
    px(g, 0x226633,  6, 12,  2,  3);  // strap left
    px(g, 0x226633, 16, 12,  2,  3);  // strap right
    px(g, 0x6b3010,  6, 19,  4,  4);  // coin pouch
    px(g, 0xd4af37,  7, 20,  2,  2);  // gold coins
    px(g, 0xd4af37,  2, 17,  3,  3);  // coin in hand
    px(g, 0xffdd44,  3, 18,  1,  1);
    px(g, 0xcc7744,  9,  9,  6,  1);  // smile
    px(g, 0xffe8c0, 10,  9,  4,  1);  // teeth
    g.generateTexture('sprite_npc_merchant', 24, 32);

    // ── SAGE — deep hood, teal robe with gold trim, glowing hands/eyes
    g.clear();
    const sageRobe = 0x156060;
    const sageDark = 0x0a3a3a;
    const sageLt   = 0x2a9090;
    px(g, sageDark,  4,  0, 16, 14);  // hood outer
    px(g, sageRobe,  6,  1, 12, 12);  // hood inner
    px(g, sageLt,    9,  2,  6,  2);  // hood highlight
    px(g, 0xc09060,  8,  4,  8,  7);  // shadowed face
    px(g, shade(0xc09060, 0.78),  8, 4, 1, 7);
    px(g, shade(0xc09060, 0.78), 15, 4, 1, 7);
    px(g, 0x004444,  9,  6,  2,  2);  px(g, 0x004444, 13, 6, 2, 2);  // eye base
    px(g, 0x00ffcc, 10,  6,  1,  1);  px(g, 0x00ffcc, 14, 6, 1, 1);  // glow
    px(g, 0xc09060, 10, 11,  4,  2);  // neck
    px(g, 0xd4af37,  8, 11,  8,  2);  // gold collar
    px(g, sageDark,  5, 12, 14, 11);
    px(g, sageRobe,  6, 12, 12, 10);
    px(g, sageLt,   10, 13,  4,  8);
    px(g, 0xd4af37,  6, 12, 12,  1);  // trim top
    px(g, 0xd4af37,  6, 17, 12,  1);  // trim belt
    px(g, sageDark,  1, 13,  5,  8);  px(g, sageRobe,  2, 13, 4, 8);
    px(g, sageDark, 18, 13,  5,  8);  px(g, sageRobe, 18, 13, 4, 8);
    px(g, 0x66ffdd,  2, 19,  3,  4);  px(g, 0x66ffdd, 19, 19, 3, 4);  // glowing hands
    px(g, 0x00ffcc,  3, 21,  1,  1);  px(g, 0x00ffcc, 20, 21, 1, 1);
    px(g, sageDark,  4, 22, 16, 10);  // wide robe hem
    px(g, sageRobe,  5, 22, 14,  9);
    px(g, sageLt,    9, 24,  6,  6);
    px(g, 0xd4af37,  5, 30, 14,  2);  // gold hem
    g.generateTexture('sprite_npc_sage', 24, 32);

    // ── SMITH — tanned, red bandana, thick leather apron, hammer
    g.clear();
    const smSkin = 0xcc8855;
    humanBase(g, smSkin, 0x2a1400, 0x8b5c2e, 0x3d2810, 0x661100);
    px(g, 0xcc2200,  7,  0, 10,  4);  // red bandana
    px(g, 0xee3311,  8,  0,  5,  2);
    px(g, 0xaa1100,  7,  3, 10,  1);  // bandana fold
    px(g, 0xaa1100, 16,  0,  3,  3);  // bandana knot
    px(g, shade(0x8b5c2e, 0.55),  0, 12, 6, 9);  // wide left arm
    px(g, 0x8b5c2e,               1, 12, 5, 9);
    px(g, smSkin,                  1, 18, 4, 4);
    px(g, shade(0x8b5c2e, 0.55), 18, 12, 6, 9);
    px(g, 0x8b5c2e,              18, 12, 5, 9);
    px(g, smSkin,                19, 18, 4, 4);
    px(g, 0x5c3010,  6, 13, 12, 10);  // leather apron
    px(g, 0x7a4a1a,  7, 14, 10,  8);
    px(g, 0x9a6030, 10, 15,  4,  6);  // apron highlight
    px(g, 0x3d2008,  6, 13, 12,  1);  // stitch top
    px(g, 0x3d2008,  6, 22, 12,  1);  // stitch bottom
    px(g, 0xd4af37,  7, 14,  2,  2);  px(g, 0xd4af37, 15, 14, 2, 2);  // rivets
    px(g, 0xd4af37,  7, 21,  2,  2);  px(g, 0xd4af37, 15, 21, 2, 2);
    px(g, 0x888888, 20, 14,  3,  9);  // hammer handle
    px(g, 0x9a9a9a, 21, 14,  1,  8);
    px(g, 0x777777, 17, 12,  8,  4);  // hammer head
    px(g, 0xcccccc, 18, 12,  3,  2);  // head highlight
    px(g, 0x444444, 17, 15,  8,  1);  // shadow under head
    g.generateTexture('sprite_npc_smith', 24, 32);

    // ── HERMIT — weathered skin, wild hair, ragged earth cloak, rope belt
    g.clear();
    humanBase(g, 0xc87840, 0x554433, 0x5a3c1e, 0x2e1c08, 0x9a7040);
    px(g, 0x443322,  5,  0, 14,  5);  // wild hair mass
    px(g, 0x665544,  5,  0,  5,  3);  // left tuft
    px(g, 0x665544, 14,  1,  5,  4);  // right tuft
    px(g, 0x443322,  4,  3,  3,  2);  // stray left
    px(g, 0x443322, 17,  2,  3,  3);  // stray right
    px(g, 0xaaaaaa,  8,  1,  2,  3);  // gray streak left
    px(g, 0xaaaaaa, 14,  2,  2,  2);  // gray streak right
    px(g, 0x775544,  9,  9,  6,  2);  // stubble
    px(g, 0x885544,  9, 10,  6,  3);  // beard start
    px(g, 0x2e1c08,  4, 18,  2,  5);  // ragged cloak left
    px(g, 0x2e1c08, 18, 19,  2,  4);  // ragged cloak right
    px(g, 0x2e1c08,  5, 29,  2,  3);  // torn hem left
    px(g, 0x2e1c08, 17, 30,  2,  2);  // torn hem right
    px(g, 0xc89040,  5, 18, 14,  2);  // rope belt
    px(g, 0xa07030,  6, 18,  3,  1);  // rope knot
    px(g, 0x2d6a35,  1, 14,  3,  4);  // vine left
    px(g, 0x3d8b3d,  2, 15,  2,  2);
    px(g, 0x2d6a35, 20, 16,  3,  3);  // vine right
    g.generateTexture('sprite_npc_hermit', 24, 32);

    // ── GAMBLER — dark brim hat with gold band, red vest, playing cards
    g.clear();
    humanBase(g, 0xf4c27f, 0x1a0a00, 0xaa1111, 0x1a0800, 0xffcc00);
    px(g, 0x2a0a0a,  3,  2, 18,  2);  // hat brim
    px(g, 0x550f0f,  7,  0, 10,  4);  // hat crown
    px(g, 0x881111,  8,  0,  4,  2);  // crown highlight
    px(g, 0xffcc00,  6,  3, 12,  1);  // gold hat band
    px(g, 0xffffff,  9, 11,  6,  3);  // white collar
    px(g, 0xffffff,  2, 18,  3,  3);  // left cuff
    px(g, 0xffffff, 19, 18,  3,  3);  // right cuff
    px(g, 0x881111,  7, 13,  4,  8);  // vest lapel left
    px(g, 0x881111, 13, 13,  4,  8);  // vest lapel right
    px(g, 0xcc1111,  8, 14,  3,  6);
    px(g, 0xcc1111, 13, 14,  3,  6);
    px(g, 0xffffff,  0, 15,  3,  6);  // card fan
    px(g, 0xcc2222,  0, 15,  1,  2);  // red suit
    px(g, 0xcc2222,  0, 20,  1,  2);
    px(g, 0x222222,  1, 16,  1,  1);  // pip
    px(g, 0x222222,  0, 18,  1,  1);
    px(g, 0xd4af37, 10, 18,  4,  1);  // watch chain
    g.generateTexture('sprite_npc_gambler', 24, 32);

    // ── TRADER — floppy travel hat, tan cloak, backpack
    g.clear();
    humanBase(g, 0xf4c27f, 0x5c3a1e, 0x996633, 0x5a3a1a, 0x7a5020);
    px(g, 0x5c3a10,  2,  3, 20,  2);  // hat brim
    px(g, 0x7a5020,  6,  0, 12,  4);  // hat crown
    px(g, 0x9a6830,  7,  0,  5,  2);  // crown highlight
    px(g, 0x5c3a1e, 18, 11,  6, 12);  // backpack
    px(g, 0x7a5020, 19, 12,  5, 10);
    px(g, 0x9a6830, 20, 13,  2,  4);  // pack highlight
    px(g, 0xd4af37, 20, 17,  3,  2);  // pack buckle
    px(g, 0x5c3a1e,  6, 12,  2, 10);  // pack strap
    px(g, 0x5c3a1e,  5, 19,  4,  4);  // belt pouch
    px(g, 0x7a5020,  6, 20,  2,  2);
    px(g, 0x9a7040,  5, 28,  7,  4);  // dusty boots
    px(g, 0x9a7040, 12, 28,  7,  4);
    px(g, 0xccaa66,  6, 31,  3,  1);
    px(g, 0xccaa66, 13, 31,  3,  1);
    g.generateTexture('sprite_npc_trader', 24, 32);

    // ── ASTRONOMER — pointed hat with stars, dark navy cloak, telescope
    g.clear();
    humanBase(g, 0xf4c27f, 0x1a1a44, 0x0e0e55, 0x080833, 0x3333aa);
    px(g, 0x080833,  9,  0,  6,  3);  // hat cone
    px(g, 0x0e0e55,  8,  1,  8,  1);  // cone mid
    px(g, 0x0e0e55,  5,  3, 14,  2);  // hat brim
    px(g, 0x3333aa,  6,  4, 12,  1);  // brim highlight
    px(g, 0xffdd44, 10,  1,  1,  1);  // hat star
    px(g, 0xaaccff,  7,  4,  1,  1);  // hat sparkle
    px(g, 0xffdd44, 15,  3,  1,  1);
    px(g, 0xffdd44,  8, 14,  1,  1);  // cloak stars
    px(g, 0xaaccff, 14, 18,  1,  1);
    px(g, 0xffdd44,  7, 22,  1,  1);
    px(g, 0xaaccff, 15, 25,  1,  1);
    px(g, 0xffdd44, 10, 27,  1,  1);
    px(g, 0xaa8833, 18, 16,  6,  3);  // telescope body
    px(g, 0xd4af37, 18, 16,  6,  1);  // top edge gold
    px(g, 0xd4af37, 18, 18,  6,  1);  // bottom edge gold
    px(g, 0x88aaff, 23, 16,  2,  3);  // objective lens
    g.generateTexture('sprite_npc_astronomer', 24, 32);

    // ── ORACLE — ethereal, silver hair, lavender robe, glowing eyes, third eye
    g.clear();
    const oRobe = 0xbbaaee;
    const oDark = 0x7755bb;
    const oLt   = 0xddd0ff;
    px(g, 0x9966ff,  0,  8,  2,  2);  // floating wisps
    px(g, 0xaaaaff, 22, 12,  2,  2);
    px(g, 0x9966ff,  1, 22,  2,  1);
    px(g, 0xaaaaff, 21, 25,  2,  1);
    px(g, 0xaabbcc,  5,  0, 14,  2);  // silver hair
    px(g, 0xddeeff,  6,  1, 12,  4);
    px(g, 0xffffff,  7,  1,  5,  2);  // hair highlight
    px(g, 0xbbccdd, 14,  0,  5,  4);
    px(g, 0xccddee,  6,  8,  2,  3);  // hair strands
    px(g, 0xccddee, 16,  8,  2,  3);
    px(g, 0xe8d8ff,  8,  3,  8,  8);  // pale face
    px(g, shade(0xe8d8ff, 0.82),  8, 3, 1, 8);
    px(g, shade(0xe8d8ff, 0.82), 15, 3, 1, 8);
    px(g, 0xffaaff, 11,  4,  2,  1);  // third eye
    px(g, 0xff88ff, 11,  4,  1,  1);
    px(g, 0xcc99ff,  9,  5,  2,  2);  px(g, 0xcc99ff, 13, 5, 2, 2);  // glowing eyes
    px(g, 0xffffff, 10,  5,  1,  1);  px(g, 0xffffff, 14, 5, 1, 1);
    px(g, 0xccddff,  9,  4,  2,  1);  px(g, 0xccddff, 13, 4, 2, 1);  // eyebrows
    px(g, shade(0xe8d8ff, 0.85), 11, 7, 2, 2);  // faint nose
    px(g, 0xcc99ee, 10,  9,  4,  1);  // mouth
    px(g, 0xe8d8ff, 10, 11,  4,  2);  // neck
    px(g, 0xd4af37,  7, 11, 10,  2);  // gem collar
    px(g, 0xffeeaa, 11, 11,  2,  2);  // center gem
    px(g, oDark,     4, 12, 16, 11);  // body
    px(g, oRobe,     5, 12, 14, 10);
    px(g, oLt,      10, 13,  4,  8);
    px(g, 0xd4af37,  5, 12, 14,  1);  // gold trim top
    px(g, oDark,     1, 13,  5,  8);  px(g, oRobe,  2, 13, 4, 8);  // arms
    px(g, 0xe8d8ff,  2, 19,  3,  4);
    px(g, oDark,    18, 13,  5,  8);  px(g, oRobe, 18, 13, 4, 8);
    px(g, 0xe8d8ff, 19, 19,  3,  4);
    px(g, oDark,     3, 22, 18, 10);  // wide floating hem
    px(g, oRobe,     4, 22, 16,  9);
    px(g, oLt,       9, 24,  6,  6);
    px(g, 0xd4af37,  4, 30, 16,  2);  // gold hem
    px(g, 0xffffff, 11, 26,  2,  2);  // center rune
    px(g, 0xdd99ff, 11, 27,  2,  1);
    g.generateTexture('sprite_npc_oracle', 24, 32);

    // ── Legacy fallback textures (used when npcId has no dedicated sprite)
    g.clear();
    humanBase(g, 0xf0c07a, 0xdddddd, 0x1a2d88, 0x0e1a55, 0xd4af37);
    px(g, 0xcccccc, 6, 0, 12, 4);
    g.generateTexture('sprite_npc', 24, 32);

    g.clear();
    humanBase(g, 0xf4c27f, 0x8b4513, 0x44aa66, 0x225533, 0xd4af37);
    g.generateTexture('sprite_npc_shop', 24, 32);
}

// ─────────────────────────────────────────────────────────────────────────
// ELEMENTAL ICONS (24×24)
// Blends statistical symbols with RPG motifs.
// ─────────────────────────────────────────────────────────────────────────
function drawElementIcons(g) {
    const S = 24;

    // ── FIRE: Dice + Flames (Probability)
    g.clear();
    // Flames
    px(g, 0xff4400, 4, 2, 16, 16);
    px(g, 0xffaa00, 6, 4, 12, 12);
    px(g, 0xffff00, 10, 6, 4, 8);
    // Dice (D6)
    px(g, 0xeeeeee, 6, 10, 12, 12); // face
    px(g, 0xcccccc, 18, 10, 1, 12); // right edge
    px(g, 0xcccccc, 6, 22, 12, 1);  // bottom edge
    // Pips (3)
    px(g, 0x333333, 8, 12, 2, 2);
    px(g, 0x333333, 11, 15, 2, 2);
    px(g, 0x333333, 14, 18, 2, 2);
    g.generateTexture('icon_element_fire', S, S);

    // ── EARTH: Bar Chart + Stone (Mean/Median/Mode)
    g.clear();
    px(g, 0x4a3820, 2, 20, 20, 2); // Base
    // Bar 1 (Mean)
    px(g, 0x886633, 4, 14, 4, 6);
    px(g, 0xc69b5b, 5, 15, 2, 5);
    // Bar 2 (Mode - Tallest)
    px(g, 0x886633, 10, 6, 4, 14);
    px(g, 0xc69b5b, 11, 7, 2, 13);
    // Bar 3 (Median)
    px(g, 0x886633, 16, 10, 4, 10);
    px(g, 0xc69b5b, 17, 11, 2, 9);
    // Stone Cracks
    px(g, 0x332211, 12, 14, 1, 4);
    px(g, 0x332211, 11, 16, 2, 1);
    g.generateTexture('icon_element_earth', S, S);

    // ── WATER: Gauss Curve + Ripple (Distributions)
    g.clear();
    // Gauss Curve (The "Bell")
    px(g, 0x3388ff, 2, 18, 2, 2);   // start
    px(g, 0x3388ff, 4, 16, 3, 3);
    px(g, 0x3388ff, 7, 10, 3, 7);
    px(g, 0x3388ff, 10, 4, 4, 14);  // peak
    px(g, 0x3388ff, 14, 10, 3, 7);
    px(g, 0x3388ff, 17, 16, 3, 3);
    px(g, 0x3388ff, 20, 18, 2, 2);  // end
    // Peak highlight
    px(g, 0x88ccff, 11, 5, 2, 4);
    // Wave ripple at bottom
    px(g, 0x114488, 2, 21, 20, 1);
    px(g, 0x88ccff, 4, 20, 4, 1);
    px(g, 0x88ccff, 14, 20, 6, 1);
    g.generateTexture('icon_element_water', S, S);

    // ── ICE: Scatter Plot + Crystals (Spread)
    g.clear();
    // Main Crystal
    px(g, 0x336677, 10, 2, 4, 20); // vertical
    px(g, 0x336677, 4, 10, 16, 4); // horizontal
    px(g, 0x88ddee, 11, 3, 2, 18);
    px(g, 0x88ddee, 5, 11, 14, 2);
    // Scatter points as smaller crystals
    px(g, 0xccf2ff, 4, 4, 2, 2);
    px(g, 0xccf2ff, 18, 6, 2, 2);
    px(g, 0xccf2ff, 6, 18, 2, 2);
    px(g, 0xccf2ff, 17, 16, 2, 2);
    px(g, 0xffffff, 11, 11, 2, 2); // center sparkle
    g.generateTexture('icon_element_ice', S, S);

    // ── SHADOW: Inference Eye / Lens (Hypothesis Testing)
    g.clear();
    // Outer shadow ring
    px(g, 0x331155, 6, 6, 12, 12);
    px(g, 0x6633aa, 8, 8, 8, 8);
    // The "Eye" of Inference
    px(g, 0x000000, 10, 10, 4, 4); // pupil
    px(g, 0xaa66dd, 10, 10, 1, 1);  // glow
    // Handle (like a magnifying glass)
    px(g, 0x331155, 16, 16, 6, 6);
    px(g, 0xaa66dd, 17, 17, 4, 4);
    // Spark of doubt
    px(g, 0xffffff, 8, 8, 1, 1);
    g.generateTexture('icon_element_shadow', S, S);

    // ── NORMAL: Data Scroll / Table (Data Types)
    g.clear();
    // Scroll paper
    px(g, 0x6688aa, 4, 4, 16, 18); // outline
    px(g, 0xeef6ff, 5, 5, 14, 16); // paper
    // Table lines
    px(g, 0xaaccff, 7, 8, 10, 1);
    px(g, 0xaaccff, 7, 11, 10, 1);
    px(g, 0xaaccff, 7, 14, 10, 1);
    px(g, 0xaaccff, 11, 8, 1, 7); // vertical
    // Categories (A, B, C)
    px(g, 0x6688aa, 7, 7, 2, 1);
    px(g, 0x6688aa, 12, 7, 2, 1);
    g.generateTexture('icon_element_normal', S, S);
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
    13: 'tile_roof',
    14: 'tile_window',
    15: 'tile_sign',
    16: 'tile_fence',
    17: 'tile_bookshelf',
    18: 'tile_table',
    19: 'tile_rug',
};
