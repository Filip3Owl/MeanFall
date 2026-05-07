// MeanFall — Item Catalog
// Each item is either a 'consumable' (used from inventory) or 'equipment'
// (worn in a slot, applies passive bonuses while equipped).

export const ITEMS = {

    // ─── CONSUMÍVEIS ──────────────────────────────────────────────────────────
    health_potion: {
        id: 'health_potion', name: 'Poção de Vida', type: 'consumable', rarity: 'common',
        description: 'Restaura 30 HP.', effect: { hp: 30 }, value: 20, icon: 'item_potion_red',
    },
    greater_health_potion: {
        id: 'greater_health_potion', name: 'Poção de Vida Maior', type: 'consumable', rarity: 'uncommon',
        description: 'Restaura 70 HP.', effect: { hp: 70 }, value: 50, icon: 'item_potion_red',
    },
    focus_potion: {
        id: 'focus_potion', name: 'Poção de Foco', type: 'consumable', rarity: 'common',
        description: 'Restaura 20 de Foco.', effect: { focus: 20 }, value: 15, icon: 'item_potion_blue',
    },
    data_scroll: {
        id: 'data_scroll', name: 'Pergaminho de Dados', type: 'consumable', rarity: 'common',
        description: 'Restaura 10 HP e 10 Foco.', effect: { hp: 10, focus: 10 }, value: 25, icon: 'item_scroll',
    },

    // ─── CABEÇA ───────────────────────────────────────────────────────────────
    leather_cap: {
        id: 'leather_cap', name: 'Capuz de Couro', type: 'equipment', slot: 'head', rarity: 'common',
        description: '+5 HP máximo.', bonuses: { maxHp: 5 }, value: 30, icon: 'item_helm',
    },
    mage_hat: {
        id: 'mage_hat', name: 'Chapéu do Mago', type: 'equipment', slot: 'head', rarity: 'uncommon',
        description: '+3 INT, +10 Foco máx.', bonuses: { intelligence: 3, maxFocus: 10 }, value: 80, icon: 'item_helm',
    },
    crown_of_insight: {
        id: 'crown_of_insight', name: 'Coroa do Conhecimento', type: 'equipment', slot: 'head', rarity: 'rare',
        element: 'normal',
        description: '+5 INT, +15 Foco máx, +1 todos atributos.',
        bonuses: { intelligence: 5, maxFocus: 15, strength: 1, agility: 1, vitality: 1 }, value: 200, icon: 'item_helm',
    },
    crown_of_archmage: {
        id: 'crown_of_archmage', name: 'Coroa do Arquimago', type: 'equipment', slot: 'head', rarity: 'legendary',
        element: 'shadow',
        description: '+10 INT, +30 Foco máx, +3 em todos, +20 HP máx.',
        bonuses: { intelligence: 10, maxFocus: 30, strength: 3, agility: 3, vitality: 3, maxHp: 20 },
        value: 800, icon: 'item_helm',
    },

    // ─── PEITO ────────────────────────────────────────────────────────────────
    leather_armor: {
        id: 'leather_armor', name: 'Armadura de Couro', type: 'equipment', slot: 'chest', rarity: 'common',
        description: '+10 HP máx, +1 VIT.', bonuses: { maxHp: 10, vitality: 1 }, value: 50, icon: 'item_armor',
    },
    chain_mail: {
        id: 'chain_mail', name: 'Cota de Malha', type: 'equipment', slot: 'chest', rarity: 'uncommon',
        description: '+25 HP máx, +2 VIT.', bonuses: { maxHp: 25, vitality: 2 }, value: 120, icon: 'item_armor',
    },
    plate_armor: {
        id: 'plate_armor', name: 'Armadura de Placas', type: 'equipment', slot: 'chest', rarity: 'rare',
        element: 'earth',
        description: '+50 HP máx, +4 VIT, +2 FOR.',
        bonuses: { maxHp: 50, vitality: 4, strength: 2 }, value: 250, icon: 'item_armor',
    },
    dragonscale_mail: {
        id: 'dragonscale_mail', name: 'Cota de Escamas', type: 'equipment', slot: 'chest', rarity: 'epic',
        element: 'fire',
        description: '+80 HP máx, +6 VIT, +3 FOR. Resistência a Fogo.',
        bonuses: { maxHp: 80, vitality: 6, strength: 3 }, value: 500, icon: 'item_armor',
    },

    // ─── PERNAS ───────────────────────────────────────────────────────────────
    cloth_pants: {
        id: 'cloth_pants', name: 'Calças de Pano', type: 'equipment', slot: 'legs', rarity: 'common',
        description: '+1 AGI.', bonuses: { agility: 1 }, value: 25, icon: 'item_legs',
    },
    leather_greaves: {
        id: 'leather_greaves', name: 'Grevas de Couro', type: 'equipment', slot: 'legs', rarity: 'uncommon',
        description: '+10 HP máx, +2 AGI.', bonuses: { maxHp: 10, agility: 2 }, value: 70, icon: 'item_legs',
    },

    // ─── PÉS ──────────────────────────────────────────────────────────────────
    worn_boots: {
        id: 'worn_boots', name: 'Botas Gastas', type: 'equipment', slot: 'feet', rarity: 'common',
        description: '+1 AGI.', bonuses: { agility: 1 }, value: 20, icon: 'item_boots',
    },
    boots_agility: {
        id: 'boots_agility', name: 'Botas da Agilidade', type: 'equipment', slot: 'feet', rarity: 'uncommon',
        description: '+3 AGI.', bonuses: { agility: 3 }, value: 80, icon: 'item_boots',
    },

    // ─── MÃOS ─────────────────────────────────────────────────────────────────
    wooden_sword: {
        id: 'wooden_sword', name: 'Espada de Madeira', type: 'equipment', slot: 'rightHand', rarity: 'common',
        description: '+2 FOR. Dano instável (Uniforme).', 
        bonuses: { strength: 2 }, 
        damageDistribution: 'uniform', damageRange: [0.7, 1.3],
        value: 40, icon: 'item_sword',
    },
    iron_blade: {
        id: 'iron_blade', name: 'Lâmina de Ferro', type: 'equipment', slot: 'rightHand', rarity: 'uncommon',
        description: '+5 FOR. Dano consistente (Normal).', 
        bonuses: { strength: 5 },
        damageDistribution: 'normal', damageRange: [0.8, 1.2],
        value: 110, icon: 'item_sword',
    },
    elemental_staff: {
        id: 'elemental_staff', name: 'Cajado Elemental', type: 'equipment', slot: 'rightHand', rarity: 'rare',
        element: 'shadow',
        description: '+4 INT, +3 FOR, +10 Foco máx. Dano instável (Uniforme).',
        bonuses: { intelligence: 4, strength: 3, maxFocus: 10 },
        damageDistribution: 'uniform', damageRange: [0.5, 1.5],
        value: 220, icon: 'item_staff',
    },
    blade_of_inference: {
        id: 'blade_of_inference', name: 'Lâmina da Inferência', type: 'equipment', slot: 'rightHand', rarity: 'legendary',
        element: 'shadow',
        description: '+12 FOR, +6 INT, +20 Foco máx. Dano muito preciso (Normal).',
        bonuses: { strength: 12, intelligence: 6, maxFocus: 20 },
        damageDistribution: 'normal', damageRange: [0.9, 1.1],
        value: 1200, icon: 'item_sword',
    },
    wooden_shield: {
        id: 'wooden_shield', name: 'Escudo de Madeira', type: 'equipment', slot: 'leftHand', rarity: 'common',
        description: '+8 HP máx, +1 VIT.', bonuses: { maxHp: 8, vitality: 1 }, value: 35, icon: 'item_shield',
    },
    iron_shield: {
        id: 'iron_shield', name: 'Escudo de Ferro', type: 'equipment', slot: 'leftHand', rarity: 'uncommon',
        description: '+20 HP máx, +3 VIT.', bonuses: { maxHp: 20, vitality: 3 }, value: 120, icon: 'item_shield',
    },

    // ─── ACESSÓRIOS ───────────────────────────────────────────────────────────
    copper_ring: {
        id: 'copper_ring', name: 'Anel de Cobre', type: 'equipment', slot: 'ring', rarity: 'common',
        description: '+1 INT.', bonuses: { intelligence: 1 }, value: 30, icon: 'item_ring',
    },
    ring_of_focus: {
        id: 'ring_of_focus', name: 'Anel do Foco', type: 'equipment', slot: 'ring', rarity: 'rare',
        description: '+3 INT, +20 Foco máx.', bonuses: { intelligence: 3, maxFocus: 20 }, value: 180, icon: 'item_ring',
    },
    stats_amulet: {
        id: 'stats_amulet', name: 'Amuleto Estatístico', type: 'equipment', slot: 'amulet', rarity: 'rare',
        element: 'normal',
        description: '+2 em todos atributos.',
        bonuses: { strength: 2, intelligence: 2, agility: 2, vitality: 2 }, value: 250, icon: 'item_amulet',
    },
    talisman_of_legends: {
        id: 'talisman_of_legends', name: 'Talismã das Lendas', type: 'equipment', slot: 'amulet', rarity: 'legendary',
        element: 'water',
        description: '+5 todos atributos, +30 HP máx, +20 Foco máx.',
        bonuses: { strength: 5, intelligence: 5, agility: 5, vitality: 5, maxHp: 30, maxFocus: 20 },
        value: 1000, icon: 'item_amulet',
    },
    amulet_of_clarity: {
        id: 'amulet_of_clarity', name: 'Amuleto da Clareza', type: 'equipment', slot: 'amulet', rarity: 'uncommon',
        description: '+2 INT, +15 Foco máx.', bonuses: { intelligence: 2, maxFocus: 15 }, value: 100, icon: 'item_amulet',
    },
};

// Drop tables: 'guaranteed' always drops; 'chance' rolls independently.
export const DROP_TABLES = {
    // ── Vila ────────────────────────────────────────────────────────────────
    air_wisp:          [{ itemId: 'health_potion',         guaranteed: true }, { itemId: 'cloth_pants',       chance: 0.30 }, { itemId: 'copper_ring',       chance: 0.15 }],
    air_sylph:         [{ itemId: 'focus_potion',          guaranteed: true }, { itemId: 'leather_cap',       chance: 0.35 }, { itemId: 'worn_boots',        chance: 0.30 }],
    data_imp:          [{ itemId: 'health_potion',         guaranteed: true }, { itemId: 'worn_boots',        chance: 0.25 }, { itemId: 'copper_ring',       chance: 0.10 }],
    type_specter:      [{ itemId: 'focus_potion',          guaranteed: true }, { itemId: 'cloth_pants',       chance: 0.30 }, { itemId: 'leather_cap',       chance: 0.20 }],

    // ── Prados ───────────────────────────────────────────────────────────────
    earth_golem:       [{ itemId: 'health_potion',         guaranteed: true }, { itemId: 'wooden_sword',      chance: 0.30 }, { itemId: 'wooden_shield',     chance: 0.25 }],
    earth_dryad:       [{ itemId: 'data_scroll',           guaranteed: true }, { itemId: 'leather_armor',     chance: 0.30 }, { itemId: 'leather_cap',       chance: 0.20 }],
    mean_gnome:        [{ itemId: 'health_potion',         guaranteed: true }, { itemId: 'wooden_shield',     chance: 0.28 }, { itemId: 'leather_greaves',   chance: 0.18 }],
    mode_treant:       [{ itemId: 'data_scroll',           guaranteed: true }, { itemId: 'leather_armor',     chance: 0.25 }, { itemId: 'worn_boots',        chance: 0.22 }],

    // ── Floresta ─────────────────────────────────────────────────────────────
    light_spark:       [{ itemId: 'focus_potion',          guaranteed: true }, { itemId: 'mage_hat',          chance: 0.20 }, { itemId: 'leather_greaves',   chance: 0.25 }],
    light_prism:       [{ itemId: 'health_potion',         guaranteed: true }, { itemId: 'iron_blade',        chance: 0.18 }, { itemId: 'amulet_of_clarity', chance: 0.15 }],
    std_wisp:          [{ itemId: 'focus_potion',          guaranteed: true }, { itemId: 'leather_greaves',   chance: 0.22 }, { itemId: 'mage_hat',          chance: 0.18 }],
    range_crystal:     [{ itemId: 'health_potion',         guaranteed: true }, { itemId: 'amulet_of_clarity', chance: 0.20 }, { itemId: 'iron_blade',        chance: 0.15 }],

    // ── Planícies ────────────────────────────────────────────────────────────
    fire_phoenix:      [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'iron_shield',       chance: 0.25 }, { itemId: 'boots_agility',     chance: 0.20 }],
    fire_salamander:   [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'iron_blade',        chance: 0.30 }, { itemId: 'chain_mail',        chance: 0.18 }],
    prob_imp:          [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'boots_agility',     chance: 0.22 }, { itemId: 'iron_shield',       chance: 0.18 }],
    bayes_harpy:       [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'chain_mail',        chance: 0.20 }, { itemId: 'iron_blade',        chance: 0.22 }],

    // ── Montanhas ────────────────────────────────────────────────────────────
    water_serpent:     [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'amulet_of_clarity', chance: 0.30 }, { itemId: 'iron_shield',       chance: 0.20 }],
    water_leviathan:   [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'plate_armor',       chance: 0.18 }, { itemId: 'ring_of_focus',     chance: 0.15 }],
    binomial_crab:     [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'iron_shield',       chance: 0.25 }, { itemId: 'amulet_of_clarity', chance: 0.18 }],
    poisson_jellyfish: [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'ring_of_focus',     chance: 0.18 }, { itemId: 'plate_armor',       chance: 0.15 }],

    // ── Calabouço ────────────────────────────────────────────────────────────
    shadow_specter:    [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'elemental_staff',   chance: 0.20 }, { itemId: 'stats_amulet',      chance: 0.10 }],
    shadow_lich:       [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'crown_of_archmage', chance: 0.10 }, { itemId: 'blade_of_inference', chance: 0.08 }, { itemId: 'talisman_of_legends', chance: 0.07 }, { itemId: 'plate_armor', chance: 0.30 }, { itemId: 'stats_amulet', chance: 0.30 }],
    type_ii_shade:     [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'stats_amulet',      chance: 0.15 }, { itemId: 'elemental_staff',   chance: 0.15 }],
    alpha_vampire:     [{ itemId: 'greater_health_potion', guaranteed: true }, { itemId: 'blade_of_inference', chance: 0.12 }, { itemId: 'crown_of_archmage', chance: 0.10 }, { itemId: 'talisman_of_legends', chance: 0.08 }],
};

export const RARITY_COLORS = {
    common:    '#aaaaaa',
    uncommon:  '#44cc44',
    rare:      '#4488ff',
    epic:      '#bb44ff',
    legendary: '#ffaa22',
};
