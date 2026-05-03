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

    // Generic monster drawer helper
    drawMonsterSprite(g, 0x44aa44, 22, 26, 'sprite_data_goblin', true);
    drawMonsterSprite(g, 0x228822, 24, 28, 'sprite_data_shaman', true);
    drawMonsterSprite(g, 0x885522, 28, 28, 'sprite_mean_troll', false);
    drawMonsterSprite(g, 0xcc4422, 20, 24, 'sprite_median_imp', true);
    drawMonsterSprite(g, 0x556677, 26, 20, 'sprite_spread_wolf', false);
    drawMonsterSprite(g, 0x334455, 30, 26, 'sprite_deviation_dragon', false);
    drawMonsterSprite(g, 0xaaaa22, 22, 28, 'sprite_prob_specter', true);
    drawMonsterSprite(g, 0x887722, 30, 30, 'sprite_chance_golem', false);
    drawMonsterSprite(g, 0x7755aa, 24, 30, 'sprite_normal_lich', true);
    drawMonsterSprite(g, 0x553377, 28, 30, 'sprite_zscore_sentinel', false);
    drawMonsterSprite(g, 0xaa2222, 28, 32, 'sprite_hypothesis_demon', true);
    drawMonsterSprite(g, 0x661111, 26, 30, 'sprite_pvalue_wraith', true);

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

function drawMonsterSprite(g, color, w, h, key, hasEyes) {
    g.clear();
    const r = Math.floor(((color >> 16) & 0xff) * 0.7);
    const gr = Math.floor(((color >> 8) & 0xff) * 0.7);
    const b = Math.floor((color & 0xff) * 0.7);
    const darkColor = (r << 16) | (gr << 8) | b;

    g.fillStyle(color); g.fillRect(2, h * 0.3, w - 4, h * 0.5);  // body
    g.fillStyle(color); g.fillRect(3, 0, w - 6, h * 0.35);        // head
    g.fillStyle(darkColor); g.fillRect(0, h * 0.35, 4, h * 0.3);  // left arm
    g.fillRect(w - 4, h * 0.35, 4, h * 0.3);                       // right arm
    g.fillRect(4, h * 0.78, (w - 8) / 2 - 1, h * 0.22);          // left leg
    g.fillRect(w / 2 + 1, h * 0.78, (w - 8) / 2 - 1, h * 0.22); // right leg

    if (hasEyes) {
        g.fillStyle(0xff2222);
        g.fillRect(Math.floor(w * 0.28), Math.floor(h * 0.08), 3, 3);
        g.fillRect(Math.floor(w * 0.58), Math.floor(h * 0.08), 3, 3);
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
