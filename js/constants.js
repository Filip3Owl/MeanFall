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
    ROOF:       13,
    WINDOW:     14,
    SIGN:       15,
    FENCE:      16,
    BOOKSHELF:  17,
    TABLE:      18,
    RUG:        19,
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
    13: false,// roof
    14: false,// window
    15: false,// sign
    16: false,// fence
    17: false,// bookshelf
    18: false,// table
    19: true, // rug
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

// Difficulty levels — affects balance and question weights.
export const DIFFICULTIES = {
    easy: {
        id: 'easy', name: 'Fácil', color: '#88ff88',
        monsterDamage: 0.7, monsterHp: 0.8, rewardMult: 1.2,
        desc: 'Para quem quer aprender sem pressão.'
    },
    medium: {
        id: 'medium', name: 'Média', color: '#ffff88',
        monsterDamage: 1.0, monsterHp: 1.0, rewardMult: 1.0,
        desc: 'A experiência equilibrada original.'
    },
    hard: {
        id: 'hard', name: 'Difícil', color: '#ffaa44',
        monsterDamage: 1.3, monsterHp: 1.2, rewardMult: 0.9,
        desc: 'Desafio aumentado para veteranos.'
    },
    very_hard: {
        id: 'very_hard', name: 'Muito Difícil', color: '#ff5555',
        monsterDamage: 1.6, monsterHp: 1.5, rewardMult: 0.8,
        desc: 'Exige domínio total dos conceitos.'
    },
    improbable: {
        id: 'improbable', name: 'Improvável', color: '#bb44ff',
        monsterDamage: 2.0, monsterHp: 2.0, rewardMult: 0.7,
        desc: 'Uma anomalia na curva. Boa sorte.'
    },
};

export const PLAYER_DEFAULTS = {
    name: 'Aventureiro',
    difficulty: 'medium',
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
    elementalMastery: {
        fire:   { level: 1, xp: 0, totalCorrect: 0 },
        earth:  { level: 1, xp: 0, totalCorrect: 0 },
        water:  { level: 1, xp: 0, totalCorrect: 0 },
        ice:    { level: 1, xp: 0, totalCorrect: 0 },
        shadow: { level: 1, xp: 0, totalCorrect: 0 },
        normal: { level: 1, xp: 0, totalCorrect: 0 },
    },
    defeatedMonsters: {},
    openedChests: {},
    availableStatPoints: 0,
    playTime: 0,
    appearance: { gender: 'male', skin: 'light', hair: 'brown', robe: 'blue' },
    skills: [],         // chosen skill ids
    seenTutorials: {},  // tutorialId -> true
    questLog: {},
    questStats: { kills: {}, killsByArea: {}, killsByElement: {} },
    bookLibrary: {},
    discoveredTiles: {}, // areaId -> { "x,y": true }
    pendingItemAlert: false, // set when new item drops; cleared on inventory open
};

export const XP_TABLE = Array.from({ length: 50 }, (_, i) =>
    Math.floor(100 * Math.pow(i + 1, 1.5))
);

export const VERSION = {
    label: 'BETA',
    number: '0.9.0',
    author: 'Filipe Rangel',
};

// Six elements. Each maps to a stats topic AND participates in a damage matrix.
// `air` = generic/Normal-equivalent (no advantage/disadvantage by default).
export const ELEMENTS = {
    fire:   { id: 'fire',   name: 'Fogo',   symbol: 'F', color: 0xff4422, accent: 0xff9966, dark: 0x882211, topic: 'probability',      topicLabel: 'Probabilidade' },
    earth:  { id: 'earth',  name: 'Terra',  symbol: 'T', color: 0x886633, accent: 0xc69b5b, dark: 0x4a3820, topic: 'mean_median_mode', topicLabel: 'Tendência Central' },
    water:  { id: 'water',  name: 'Água',   symbol: 'A', color: 0x3388ff, accent: 0x88ccff, dark: 0x114488, topic: 'distributions',    topicLabel: 'Distribuições' },
    ice:    { id: 'ice',    name: 'Gelo',   symbol: 'G', color: 0x88ddee, accent: 0xccf2ff, dark: 0x336677, topic: 'spread',           topicLabel: 'Dispersão' },
    shadow: { id: 'shadow', name: 'Trevas', symbol: 'S', color: 0x6633aa, accent: 0xaa66dd, dark: 0x331155, topic: 'inference',        topicLabel: 'Inferência' },
    normal: { id: 'normal', name: 'Normal', symbol: 'N', color: 0xaaccff, accent: 0xeef6ff, dark: 0x6688aa, topic: 'data_types',       topicLabel: 'Tipos de Dados' },
};

// Backwards-compat: existing 'air' (originally categorical) becomes 'normal'.
// Existing 'light' (spread) becomes 'ice'.
export const ELEMENT_ALIASES = {
    air:   'normal',
    light: 'ice',
};

export const TOPIC_TO_ELEMENT = {
    data_types:        'normal',
    mean_median_mode:  'earth',
    spread:            'ice',
    probability:       'fire',
    distributions:     'water',
    inference:         'shadow',
};

// Damage multiplier matrix: ELEMENT_MATRIX[attacker][defender] = multiplier.
// 1.5 = strong against, 0.75 = weak against, 1.0 = neutral.
export const ELEMENT_MATRIX = {
    fire:   { fire: 1.0, earth: 1.5, water: 0.75, ice:    1.5, shadow: 1.0,  normal: 1.0 },
    earth:  { fire: 0.75, earth: 1.0, water: 1.5,  ice:    1.0, shadow: 1.5,  normal: 1.0 },
    water:  { fire: 1.5, earth: 0.75, water: 1.0, ice:    0.75, shadow: 1.0, normal: 1.0 },
    ice:    { fire: 0.75, earth: 1.0, water: 1.5,  ice:    1.0, shadow: 0.75, normal: 1.0 },
    shadow: { fire: 1.0, earth: 0.75, water: 1.0, ice:    1.5, shadow: 1.0,  normal: 1.5 },
    normal: { fire: 1.0, earth: 1.0, water: 1.0,  ice:    1.0, shadow: 0.75, normal: 1.0 },
};

// Rarity tiers — visual + economic + power scaling.
export const RARITIES = {
    common:    { id: 'common',    name: 'Comum',     color: 0xaaaaaa, hex: '#aaaaaa', valueMult: 1.0,  statMult: 1.0  },
    uncommon:  { id: 'uncommon',  name: 'Incomum',   color: 0x44cc44, hex: '#44cc44', valueMult: 2.0,  statMult: 1.4  },
    rare:      { id: 'rare',      name: 'Raro',      color: 0x4488ff, hex: '#4488ff', valueMult: 4.0,  statMult: 1.8  },
    epic:      { id: 'epic',      name: 'Épico',     color: 0xbb44ff, hex: '#bb44ff', valueMult: 8.0,  statMult: 2.5  },
    legendary: { id: 'legendary', name: 'Lendário',  color: 0xffaa22, hex: '#ffaa22', valueMult: 16.0, statMult: 3.5  },
};

// Respawn timing for monsters once defeated (ms).
export const RESPAWN_TIME = 90_000; // 90 seconds

// Out-of-combat passive regeneration (every 3000ms, exploring world).
export const REGEN_INTERVAL_MS = 3000;
export const REGEN_HP_PER_TICK    = 1;
export const REGEN_FOCUS_PER_TICK = 2;

// Penalty for fleeing combat (fraction of current XP lost).
export const FLEE_XP_PENALTY = 0.20;

// UI semantic colors for highlighting keywords inside chat / text.
export const UI_COLORS = {
    damage:    '#ff5555',
    heal:      '#55ff88',
    loot:      '#ffd700',
    level:     '#ffaa44',
    xp:        '#ffaa00',
    gold:      '#ffcc44',
    rarity:    '#bb88ff',
    streak:    '#ffaa44',
    crit:      '#ff88cc',
    hint:      '#88ccff',
    accent:    '#d4af37',
    muted:     '#7a7065',
    dialog:    '#aaccee',
};
