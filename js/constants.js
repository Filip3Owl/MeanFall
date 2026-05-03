export const TILE_SIZE  = 32;
export const TILE_COLS  = 17;
export const TILE_ROWS  = 15;
export const GAME_WIDTH  = TILE_SIZE * TILE_COLS;  // 544
export const GAME_HEIGHT = TILE_SIZE * TILE_ROWS;  // 480

export const TILES = {
    GRASS:      0,
    STONE_PATH: 1,
    WATER:      2,
    WALL:       3,
    TREE:       4,
    DOOR:       5,
    PORTAL:     6,
    CHEST:      7,
    SAND:       8,
    DARK_GRASS: 9,
    MOUNTAIN:   10,
    SNOW:       11,
    CAVE_FLOOR: 12,
};

export const TILE_WALKABLE = {
    0: true,  // grass
    1: true,  // stone path
    2: false, // water
    3: false, // wall
    4: false, // tree
    5: true,  // door
    6: true,  // portal
    7: false, // chest
    8: true,  // sand
    9: true,  // dark grass
    10: false,// mountain
    11: true, // snow
    12: true, // cave floor
};

export const AREAS = {
    VILLAGE:   'village',
    MEADOWS:   'meadows',
    FOREST:    'forest',
    PLAINS:    'plains',
    MOUNTAINS: 'mountains',
    DUNGEON:   'dungeon',
};

export const AREA_INFO = {
    village:   { displayName: 'Vila dos Dados',             topic: 'Tipos de Dados',         bgColor: 0x1a2e10 },
    meadows:   { displayName: 'Prados das Medidas',         topic: 'Media, Mediana e Moda',   bgColor: 0x1a2e10 },
    forest:    { displayName: 'Floresta da Dispersao',      topic: 'Variancia e Desvio Padrao', bgColor: 0x0e1e0e },
    plains:    { displayName: 'Planicies da Probabilidade', topic: 'Probabilidade Basica',    bgColor: 0x2e2010 },
    mountains: { displayName: 'Montanhas da Distribuicao',  topic: 'Distribuicao Normal',     bgColor: 0x1a1a1e },
    dungeon:   { displayName: 'Calabouco da Inferencia',    topic: 'Testes de Hipotese',      bgColor: 0x0e0a0a },
};

export const AREA_UNLOCK = {
    meadows:   { minLevel: 3,  masteryArea: 'village',   masteryPct: 60 },
    forest:    { minLevel: 1,  masteryArea: 'meadows',   masteryPct: 60 },
    plains:    { minLevel: 1,  masteryArea: 'forest',    masteryPct: 60 },
    mountains: { minLevel: 1,  masteryArea: 'plains',    masteryPct: 60 },
    dungeon:   { minLevel: 15, masteryArea: 'mountains', masteryPct: 70 },
};

export const COLORS = {
    GRASS:      0x3a7d44,
    STONE:      0x888888,
    WATER:      0x1a5fa8,
    WALL:       0x555555,
    TREE_TOP:   0x2d6a2d,
    TREE_TRUNK: 0x5c3a1e,
    PORTAL:     0x9944ff,
    CHEST:      0x8b6914,
    SAND:       0xd4a647,
    DARK_GRASS: 0x2a5d34,
    MOUNTAIN:   0x666677,
    SNOW:       0xddddee,
    CAVE:       0x2a2233,
    UI_BG:      0x0d0a03,
    UI_BORDER:  0xd4af37,
    UI_TEXT:    0xffd700,
    HP:         0xff3333,
    FOCUS:      0x3355ff,
    XP:         0xffaa00,
    CORRECT:    0x00cc44,
    WRONG:      0xff2222,
    NEUTRAL:    0xaaaaaa,
};

export const PLAYER_DEFAULTS = {
    name: 'Aventureiro',
    level: 1,
    xp: 0,
    hp: 100,
    maxHp: 100,
    focus: 50,
    maxFocus: 50,
    strength: 5,
    intelligence: 5,
    agility: 5,
    vitality: 5,
    gold: 0,
    currentArea: 'village',
    position: { x: 8, y: 7 },
    lastSafePosition: { x: 8, y: 7 },
    lastSafeArea: 'village',
    inventory: [],
    equipment: { head: null, chest: null, legs: null, feet: null, leftHand: null, rightHand: null, ring: null, amulet: null },
    mastery: {
        village:   { attempted: 0, correct: 0, wrongIds: [] },
        meadows:   { attempted: 0, correct: 0, wrongIds: [] },
        forest:    { attempted: 0, correct: 0, wrongIds: [] },
        plains:    { attempted: 0, correct: 0, wrongIds: [] },
        mountains: { attempted: 0, correct: 0, wrongIds: [] },
        dungeon:   { attempted: 0, correct: 0, wrongIds: [] },
    },
    defeatedMonsters: {},
    openedChests: {},
    availableStatPoints: 0,
    playTime: 0,
};

export const XP_TABLE = Array.from({ length: 50 }, (_, i) =>
    Math.floor(100 * Math.pow(i + 1, 1.5))
);
