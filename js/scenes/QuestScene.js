import { QuestSystem } from '../systems/QuestSystem.js';
import { QUESTS, questProgress, questTarget } from '../data/quests.js';
import { ITEMS, RARITY_COLORS } from '../data/items.js';
import EventBus from '../utils/EventBus.js';

/**
 * Quest journal. Shows all known quests with their status and progress bars.
 * Allows claiming completed quests.
 */
export class QuestScene extends Phaser.Scene {
    constructor() { super('Quest'); }

    create() {
        this._player = this.registry.get('player');
        QuestSystem.init(this._player);
        QuestSystem.refresh(this._player);

        this._buildUI();
        this._render();

        const close = () => this._close();
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', close);
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q).on('down', close);
    }

    _buildUI() {
        const W = 544, H = 480;
        this.add.rectangle(0, 0, W, H, 0x000000, 0.92).setOrigin(0, 0);
        this.add.rectangle(10, 10, W - 20, H - 20, 0x0d0a03, 1).setOrigin(0, 0);
        this.add.rectangle(10, 10, W - 20, H - 20, 0xd4af37, 0).setOrigin(0, 0).setStrokeStyle(2, 0xd4af37);

        this.add.text(W / 2, 22, 'D I Á R I O   D E   M I S S Õ E S', {
            fontSize: '16px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0);

        this.add.rectangle(504, 14, 22, 22, 0x330000, 1).setOrigin(0, 0).setInteractive()
            .on('pointerdown', () => this._close());
        this.add.text(515, 25, 'X', { fontSize: '15px', color: '#ff4444', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5);

        this._listContainer = this.add.container(0, 0);

        this.add.text(W / 2, 458, 'Q ou ESC para fechar', { fontSize: '15px', color: '#444444', fontFamily: 'Courier New' }).setOrigin(0.5, 0);
    }

    _render() {
        this._listContainer.removeAll(true);
        const log = this._player.questLog || {};
        const known = Object.entries(log)
            .map(([id, status]) => ({ id, status, quest: QUESTS[id] }))
            .filter(x => x.quest);

        if (known.length === 0) {
            const empty = this.add.text(272, 240, 'Nenhuma missão ativa.\nFale com NPCs para receber missões.', {
                fontSize: '15px', color: '#666666', fontFamily: 'Courier New', align: 'center',
            }).setOrigin(0.5, 0.5);
            this._listContainer.add(empty);
            return;
        }

        let y = 50;
        for (const entry of known) {
            const cardH = 88;
            const card  = this.add.rectangle(20, y, 504, cardH, 0x110e04, 1).setOrigin(0, 0)
                .setStrokeStyle(1, this._statusColor(entry.status));

            // Status badge
            const badge = this.add.rectangle(28, y + 8, 80, 16, this._statusColor(entry.status), 0.3).setOrigin(0, 0);
            const badgeTx = this.add.text(68, y + 16, this._statusLabel(entry.status), {
                fontSize: '15px', fontFamily: 'Courier New', fontStyle: 'bold',
                color: this._statusColorHex(entry.status),
            }).setOrigin(0.5, 0.5);

            const name = this.add.text(116, y + 12, entry.quest.name, {
                fontSize: '15px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0, 0);
            const desc = this.add.text(28, y + 30, entry.quest.description, {
                fontSize: '16px', color: '#aaaaaa', fontFamily: 'Courier New', wordWrap: { width: 480 },
            }).setOrigin(0, 0);

            // Progress bar
            const cur = questProgress(this._player, entry.quest);
            const tgt = questTarget(entry.quest);
            const pct = Math.min(1, cur / tgt);
            const barBg = this.add.rectangle(28, y + 60, 360, 8, 0x222222).setOrigin(0, 0);
            const barFg = this.add.rectangle(28, y + 60, Math.floor(360 * pct), 8, this._statusColor(entry.status)).setOrigin(0, 0);
            const barTx = this.add.text(394, y + 60, `${cur}/${tgt}`, {
                fontSize: '16px', color: '#cccccc', fontFamily: 'Courier New',
            }).setOrigin(0, 0);

            this._listContainer.add([card, badge, badgeTx, name, desc, barBg, barFg, barTx]);

            // Reward summary
            const r = entry.quest.reward || {};
            const xpText = r.xp ? `+${r.xp} XP` : '';
            const goldText = r.gold ? `+${r.gold} ouro` : '';
            const basicRewards = [xpText, goldText].filter(t => t).join(' · ');
            
            const rewLbl = this.add.text(28, y + 74, 'Recompensa: ' + basicRewards, {
                fontSize: '15px', color: '#88ccff', fontFamily: 'Courier New',
            }).setOrigin(0, 0);
            this._listContainer.add(rewLbl);

            if (r.items?.length) {
                let itemX = rewLbl.x + rewLbl.width + (basicRewards ? 8 : 0);
                r.items.forEach(it => {
                    const item = ITEMS[it.itemId];
                    if (!item) return;
                    const icon = this.add.image(itemX + 8, y + 78, item.icon || 'item_potion_red').setScale(0.5);
                    const itTx = this.add.text(itemX + 18, y + 74, (it.qty > 1 ? `×${it.qty} ` : '') + item.name, {
                        fontSize: '15px', color: RARITY_COLORS[item.rarity] || '#88ccff', fontFamily: 'Courier New',
                    }).setOrigin(0, 0);
                    this._listContainer.add([icon, itTx]);
                    itemX = itTx.x + itTx.width + 10;
                });
            }

            // Claim button if complete
            if (entry.status === 'complete') {
                const btn = this.add.rectangle(404, y + 8, 110, 24, 0x1a3a1a, 1).setOrigin(0, 0).setInteractive()
                    .on('pointerover', () => btn.setFillStyle(0x2a5a2a))
                    .on('pointerout',  () => btn.setFillStyle(0x1a3a1a))
                    .on('pointerdown', () => this._claim(entry.id));
                const btnTx = this.add.text(459, y + 20, 'COLETAR', {
                    fontSize: '17px', color: '#88ff88', fontFamily: 'Courier New', fontStyle: 'bold',
                }).setOrigin(0.5, 0.5);
                this._listContainer.add([btn, btnTx]);
            }

            y += cardH + 6;
            if (y > 430) break;
        }
    }

    _claim(questId) {
        QuestSystem.claim(this._player, questId);
        this.registry.set('player', this._player);
        EventBus.emit('player-stats-changed', { player: this._player });
        EventBus.emit('player-hp-change',     { player: this._player });
        this._render();
    }

    _statusColor(status) {
        return status === 'complete' ? 0x44ff88
            :  status === 'active'   ? 0xffaa44
            :  status === 'claimed'  ? 0x666666
            :  0xaaaaaa;
    }

    _statusColorHex(status) {
        return status === 'complete' ? '#44ff88'
            :  status === 'active'   ? '#ffaa44'
            :  status === 'claimed'  ? '#888888'
            :  '#cccccc';
    }

    _statusLabel(status) {
        return status === 'complete' ? 'PRONTO'
            :  status === 'active'   ? 'ATIVA'
            :  status === 'claimed'  ? 'FEITA'
            :  'NOVA';
    }

    _close() {
        this.scene.stop('Quest');
        const world = this.scene.get('World');
        if (world?.resumeFromOverlay) world.resumeFromOverlay();
    }
}
