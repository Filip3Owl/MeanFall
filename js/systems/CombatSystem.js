export const CombatSystem = {

    calcPlayerDamage(player, monster, streak = 0) {
        const base   = 10 + (player.level * 1.5);
        const intBonus   = player.intelligence * 0.5;
        const strBonus   = player.strength * 0.3;
        const streakBonus = Math.min(streak * 2, 20);
        const raw = Math.floor(base + intBonus + strBonus + streakBonus);
        return Math.max(1, raw - (monster.defense || 0));
    },

    calcMonsterDamage(monster, player) {
        const agiRed = Math.floor(player.agility * 0.3);
        // Dodge chance: agility / 100
        if (Math.random() < player.agility * 0.01) return 0;
        return Math.max(1, (monster.attackDamage || 10) - agiRed);
    },

    rollDrops(monsterId, dropTables) {
        const table = dropTables[monsterId] || [];
        return table
            .filter(entry => Math.random() < entry.chance)
            .map(entry => entry.itemId);
    },

    addToInventory(player, itemId) {
        if (player.inventory.length >= 32) return false;
        const existing = player.inventory.find(i => i.itemId === itemId);
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            player.inventory.push({ itemId, qty: 1 });
        }
        return true;
    },

    useItem(player, itemId, ITEMS) {
        const slot = player.inventory.find(i => i.itemId === itemId);
        if (!slot) return false;
        const item = ITEMS[itemId];
        if (!item || item.type !== 'consumable') return false;

        const e = item.effect;
        if (e.hp)    player.hp    = Math.min(player.maxHp,    player.hp    + e.hp);
        if (e.focus) player.focus = Math.min(player.maxFocus, player.focus + e.focus);

        slot.qty--;
        if (slot.qty <= 0) player.inventory = player.inventory.filter(i => i.itemId !== itemId);
        return true;
    },

    equipItem(player, itemId, ITEMS) {
        const item = ITEMS[itemId];
        if (!item || item.type !== 'equipment') return false;
        const slot = item.slot;

        // Remove old bonuses
        const old = player.equipment[slot];
        if (old) {
            const oldItem = ITEMS[old];
            if (oldItem?.bonuses) applyBonuses(player, oldItem.bonuses, -1);
        }

        player.equipment[slot] = itemId;
        if (item.bonuses) applyBonuses(player, item.bonuses, 1);
        return true;
    },
};

function applyBonuses(player, bonuses, sign) {
    for (const [key, val] of Object.entries(bonuses)) {
        player[key] = (player[key] || 0) + sign * val;
    }
}
