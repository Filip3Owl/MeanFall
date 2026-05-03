export const ITEMS = {

    health_potion: {
        id: 'health_potion',
        name: 'Poção de Vida',
        type: 'consumable',
        description: 'Restaura 30 HP.',
        effect: { hp: 30 },
        value: 20,
        icon: 'item_potion_red',
    },

    focus_potion: {
        id: 'focus_potion',
        name: 'Poção de Foco',
        type: 'consumable',
        description: 'Restaura 20 pontos de Foco.',
        effect: { focus: 20 },
        value: 15,
        icon: 'item_potion_blue',
    },

    data_scroll: {
        id: 'data_scroll',
        name: 'Pergaminho de Dados',
        type: 'consumable',
        description: 'Revela uma dica extra no próximo combate.',
        effect: { hint_charge: 1 },
        value: 10,
        icon: 'item_scroll',
    },

    leather_armor: {
        id: 'leather_armor',
        name: 'Armadura de Couro',
        type: 'equipment',
        slot: 'chest',
        description: '+10 HP máximo, +1 Vitalidade.',
        bonuses: { maxHp: 10, vitality: 1 },
        value: 50,
        icon: 'item_armor_leather',
    },

    wooden_sword: {
        id: 'wooden_sword',
        name: 'Espada de Madeira',
        type: 'equipment',
        slot: 'rightHand',
        description: '+2 Força.',
        bonuses: { strength: 2 },
        value: 40,
        icon: 'item_sword_wood',
    },

    mage_hat: {
        id: 'mage_hat',
        name: 'Chapéu do Mago',
        type: 'equipment',
        slot: 'head',
        description: '+3 Inteligência, +10 Foco máximo.',
        bonuses: { intelligence: 3, maxFocus: 10 },
        value: 60,
        icon: 'item_hat_mage',
    },

    stats_amulet: {
        id: 'stats_amulet',
        name: 'Amuleto Estatístico',
        type: 'equipment',
        slot: 'amulet',
        description: '+1 em todos os atributos.',
        bonuses: { strength: 1, intelligence: 1, agility: 1, vitality: 1 },
        value: 100,
        icon: 'item_amulet',
    },

    boots_agility: {
        id: 'boots_agility',
        name: 'Botas da Agilidade',
        type: 'equipment',
        slot: 'feet',
        description: '+3 Agilidade.',
        bonuses: { agility: 3 },
        value: 55,
        icon: 'item_boots',
    },
};

// Tabela de drops por monstro
export const DROP_TABLES = {
    air_wisp:       [{ itemId: 'health_potion', chance: 0.3 }, { itemId: 'data_scroll', chance: 0.4 }],
    air_sylph:       [{ itemId: 'health_potion', chance: 0.4 }, { itemId: 'focus_potion', chance: 0.3 }],
    earth_golem:        [{ itemId: 'health_potion', chance: 0.35 }, { itemId: 'wooden_sword', chance: 0.1 }],
    earth_dryad:        [{ itemId: 'focus_potion', chance: 0.4 }, { itemId: 'data_scroll', chance: 0.3 }],
    light_spark:       [{ itemId: 'health_potion', chance: 0.3 }, { itemId: 'leather_armor', chance: 0.08 }],
    light_prism:  [{ itemId: 'health_potion', chance: 0.5 }, { itemId: 'mage_hat', chance: 0.12 }],
    fire_phoenix:      [{ itemId: 'focus_potion', chance: 0.35 }, { itemId: 'data_scroll', chance: 0.25 }],
    fire_salamander:      [{ itemId: 'health_potion', chance: 0.4 }, { itemId: 'stats_amulet', chance: 0.1 }],
    water_serpent:       [{ itemId: 'health_potion', chance: 0.4 }, { itemId: 'focus_potion', chance: 0.3 }],
    water_leviathan:   [{ itemId: 'health_potion', chance: 0.5 }, { itemId: 'boots_agility', chance: 0.1 }],
    shadow_specter:  [{ itemId: 'health_potion', chance: 0.5 }, { itemId: 'focus_potion', chance: 0.4 }],
    shadow_lich:     [{ itemId: 'health_potion', chance: 0.6 }, { itemId: 'stats_amulet', chance: 0.15 }],
};
