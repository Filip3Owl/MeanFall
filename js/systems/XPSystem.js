import { XP_TABLE } from '../constants.js';
import EventBus from '../utils/EventBus.js';

export function awardXP(player, baseXP) {
    const mult = 1 + (player.intelligence * 0.02);
    const earned = Math.floor(baseXP * mult);
    player.xp += earned;

    let leveled = false;
    while (player.xp >= xpToNext(player.level)) {
        player.xp -= xpToNext(player.level);
        levelUp(player);
        leveled = true;
    }

    EventBus.emit('player-xp-change', { player, earned });
    if (leveled) {
        EventBus.emit('player-level-up', { player });
        EventBus.emit('player-stats-changed', { player });
        EventBus.emit('player-hp-change', { player });
    }
    return earned;
}

export function xpToNext(level) {
    return XP_TABLE[Math.min(level - 1, 49)] ?? 999999;
}

function levelUp(player) {
    player.level++;
    player.maxHp += 10 + Math.floor(player.vitality * 0.5);
    player.maxFocus += 5 + Math.floor(player.intelligence * 0.3);
    player.hp = player.maxHp;
    player.focus = player.maxFocus;

    if (player.level % 3 === 0) {
        player.availableStatPoints = (player.availableStatPoints || 0) + 1;
    }
}

export function spendStatPoint(player, stat) {
    if (player.availableStatPoints <= 0) return false;
    if (!['strength', 'intelligence', 'agility', 'vitality'].includes(stat)) return false;
    player[stat]++;
    player.availableStatPoints--;
    if (stat === 'vitality') player.maxHp += 5;
    if (stat === 'intelligence') player.maxFocus += 3;
    EventBus.emit('player-stats-changed', { player });
    return true;
}

export function masteryPercent(mastery) {
    if (!mastery || mastery.attempted === 0) return 0;
    return Math.round((mastery.correct / mastery.attempted) * 100);
}
