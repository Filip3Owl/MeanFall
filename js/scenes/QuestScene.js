import { QuestSystem } from '../systems/QuestSystem.js';
import { BountySystem } from '../systems/BountySystem.js';
import { QUESTS, questProgress, questTarget } from '../data/quests.js';
import { ITEMS, RARITY_COLORS } from '../data/items.js';
import EventBus from '../utils/EventBus.js';

const W = 544, H = 480;
const CARD_W = 504;
const CARD_X = 20;

const AREA_NAMES = {
    village: 'Aldeia', meadows: 'Prados', forest: 'Floresta',
    plains: 'Planícies', mountains: 'Montanhas', dungeon: 'Masmorra',
};

export class QuestScene extends Phaser.Scene {
    constructor() { super('Quest'); }

    create() {
        this._player = this.registry.get('player');
        QuestSystem.init(this._player);
        QuestSystem.refresh(this._player);
        BountySystem.init(this._player);

        this._tab = 'bounties'; // 'bounties' | 'quests'
        this._buildChrome();
        this._render();

        const close = () => this._close();
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', close);
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q).on('down', close);

        EventBus.on('bounty-claimed', () => { this._player = this.registry.get('player') || this._player; this._render(); });
    }

    // ── Static chrome (drawn once) ────────────────────────────────────────────

    _buildChrome() {
        // Background
        this.add.rectangle(0, 0, W, H, 0x000000, 0.92).setOrigin(0);
        this.add.rectangle(10, 10, W - 20, H - 20, 0x0d0a03, 1).setOrigin(0);
        this.add.rectangle(10, 10, W - 20, H - 20, 0xd4af37, 0).setOrigin(0).setStrokeStyle(2, 0xd4af37);

        this.add.text(W / 2, 22, 'D I Á R I O   D E   M I S S Õ E S', {
            fontSize: '16px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0);

        // Close button
        this.add.rectangle(504, 14, 22, 22, 0x330000, 1).setOrigin(0).setInteractive()
            .on('pointerdown', () => this._close());
        this.add.text(515, 25, 'X', { fontSize: '15px', color: '#ff4444', fontFamily: 'Courier New' }).setOrigin(0.5);

        // Tabs
        this._tabBountyBg = this.add.rectangle(20, 40, 240, 22, 0x2a1e08, 1).setOrigin(0)
            .setInteractive().on('pointerdown', () => this._switchTab('bounties'));
        this._tabBountyTx = this.add.text(140, 51, 'BÔNUS DIÁRIOS', {
            fontSize: '13px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5);

        this._tabQuestBg = this.add.rectangle(264, 40, 260, 22, 0x111111, 1).setOrigin(0)
            .setInteractive().on('pointerdown', () => this._switchTab('quests'));
        this._tabQuestTx = this.add.text(394, 51, 'MISSÕES', {
            fontSize: '13px', color: '#888', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(W / 2, 458, 'Q ou ESC para fechar', {
            fontSize: '15px', color: '#444444', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0);

        // Scrollable content container
        this._listContainer = this.add.container(0, 0);
    }

    _switchTab(tab) {
        this._tab = tab;
        // Update tab visuals
        this._tabBountyBg.setFillStyle(tab === 'bounties' ? 0x2a1e08 : 0x111111);
        this._tabBountyTx.setColor(tab === 'bounties' ? '#ffd700' : '#888');
        this._tabQuestBg.setFillStyle(tab === 'quests' ? 0x2a1e08 : 0x111111);
        this._tabQuestTx.setColor(tab === 'quests' ? '#ffd700' : '#888');
        this._render();
    }

    _render() {
        this._listContainer.removeAll(true);
        if (this._tab === 'bounties') this._renderBounties();
        else                          this._renderQuests();
    }

    // ── Bounties tab ──────────────────────────────────────────────────────────

    _renderBounties() {
        const slots = BountySystem.getSlots(this._player);
        const reset = BountySystem.timeUntilReset();

        // Timer header
        this._listContainer.add(
            this.add.text(W / 2, 70, `Renova em  ${reset}`, {
                fontSize: '12px', color: '#555533', fontFamily: 'Courier New',
            }).setOrigin(0.5, 0)
        );

        if (!slots.length) {
            this._listContainer.add(
                this.add.text(W / 2, 240, 'Nenhum bônus disponível hoje.', {
                    fontSize: '14px', color: '#555', fontFamily: 'Courier New',
                }).setOrigin(0.5)
            );
            return;
        }

        let y = 88;
        slots.forEach((slot, idx) => {
            const cardH  = 80;
            const color  = this._bountyColor(slot.status);
            const hexCol = this._bountyColorHex(slot.status);

            const card = this.add.rectangle(CARD_X, y, CARD_W, cardH, 0x110e04, 1).setOrigin(0)
                .setStrokeStyle(1, color);

            // Area tag
            const areaTx = this.add.text(CARD_X + 8, y + 8, AREA_NAMES[slot.area] || slot.area, {
                fontSize: '11px', color: '#443322', fontFamily: 'Courier New',
            }).setOrigin(0);

            // Status badge
            const badge   = this.add.rectangle(CARD_X + 8, y + 22, 74, 14, color, 0.25).setOrigin(0);
            const badgeTx = this.add.text(CARD_X + 45, y + 29, this._bountyLabel(slot.status), {
                fontSize: '12px', color: hexCol, fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0.5);

            const title = this.add.text(CARD_X + 90, y + 22, slot.label, {
                fontSize: '14px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0);

            const desc = this.add.text(CARD_X + 8, y + 40, slot.desc, {
                fontSize: '13px', color: '#aaaaaa', fontFamily: 'Courier New',
            }).setOrigin(0);

            // Progress bar
            const pct   = slot.count > 0 ? Math.min(1, slot.progress / slot.count) : 0;
            const barBg = this.add.rectangle(CARD_X + 8, y + 60, 340, 7, 0x222222).setOrigin(0);
            const barFg = this.add.rectangle(CARD_X + 8, y + 60, Math.max(2, Math.floor(340 * pct)), 7, color).setOrigin(0);
            const barTx = this.add.text(CARD_X + 356, y + 60, `${slot.progress}/${slot.count}`, {
                fontSize: '13px', color: '#cccccc', fontFamily: 'Courier New',
            }).setOrigin(0);

            // Reward
            const rewTx = this.add.text(CARD_X + 8, y + 68, `Recompensa: +${slot.reward.xp} XP  +${slot.reward.gold} ouro`, {
                fontSize: '12px', color: '#88ccff', fontFamily: 'Courier New',
            }).setOrigin(0);

            this._listContainer.add([card, areaTx, badge, badgeTx, title, desc, barBg, barFg, barTx, rewTx]);

            // Claim button
            if (slot.status === 'complete') {
                const btn = this.add.rectangle(CARD_X + 404, y + 8, 90, 24, 0x1a3a1a, 1).setOrigin(0)
                    .setInteractive()
                    .on('pointerover', () => btn.setFillStyle(0x2a5a2a))
                    .on('pointerout',  () => btn.setFillStyle(0x1a3a1a))
                    .on('pointerdown', () => this._claimBounty(idx));
                const btnTx = this.add.text(CARD_X + 449, y + 20, 'COLETAR', {
                    fontSize: '14px', color: '#88ff88', fontFamily: 'Courier New', fontStyle: 'bold',
                }).setOrigin(0.5);
                this._listContainer.add([btn, btnTx]);
            }

            y += cardH + 6;
        });
    }

    _claimBounty(idx) {
        BountySystem.claim(this._player, idx);
        this.registry.set('player', this._player);
        EventBus.emit('player-stats-changed', { player: this._player });
        EventBus.emit('player-hp-change',     { player: this._player });
        this._render();
    }

    _bountyColor(status) {
        return status === 'complete' ? 0x44ff88 : status === 'claimed' ? 0x444444 : 0xd4af37;
    }

    _bountyColorHex(status) {
        return status === 'complete' ? '#44ff88' : status === 'claimed' ? '#666666' : '#d4af37';
    }

    _bountyLabel(status) {
        return status === 'complete' ? 'PRONTO' : status === 'claimed' ? 'COLETADO' : 'ATIVO';
    }

    // ── Quests tab ────────────────────────────────────────────────────────────

    _renderQuests() {
        const log   = this._player.questLog || {};
        const known = Object.entries(log)
            .map(([id, status]) => ({ id, status, quest: QUESTS[id] }))
            .filter(x => x.quest);

        if (known.length === 0) {
            this._listContainer.add(
                this.add.text(W / 2, 240, 'Nenhuma missão ativa.\nFale com NPCs para receber missões.', {
                    fontSize: '15px', color: '#666666', fontFamily: 'Courier New', align: 'center',
                }).setOrigin(0.5)
            );
            return;
        }

        let y = 70;
        for (const entry of known) {
            const cardH = 88;
            const card  = this.add.rectangle(CARD_X, y, CARD_W, cardH, 0x110e04, 1).setOrigin(0)
                .setStrokeStyle(1, this._statusColor(entry.status));

            const badge   = this.add.rectangle(CARD_X + 8, y + 8, 80, 16, this._statusColor(entry.status), 0.3).setOrigin(0);
            const badgeTx = this.add.text(CARD_X + 48, y + 16, this._statusLabel(entry.status), {
                fontSize: '15px', fontFamily: 'Courier New', fontStyle: 'bold',
                color: this._statusColorHex(entry.status),
            }).setOrigin(0.5);

            const name = this.add.text(CARD_X + 96, y + 12, entry.quest.name, {
                fontSize: '15px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0);

            const desc = this.add.text(CARD_X + 8, y + 30, entry.quest.description, {
                fontSize: '14px', color: '#aaaaaa', fontFamily: 'Courier New', wordWrap: { width: 480 },
            }).setOrigin(0);

            const cur   = questProgress(this._player, entry.quest);
            const tgt   = questTarget(entry.quest);
            const pct   = Math.min(1, cur / tgt);
            const barBg = this.add.rectangle(CARD_X + 8, y + 60, 360, 8, 0x222222).setOrigin(0);
            const barFg = this.add.rectangle(CARD_X + 8, y + 60, Math.floor(360 * pct), 8, this._statusColor(entry.status)).setOrigin(0);
            const barTx = this.add.text(CARD_X + 374, y + 60, `${cur}/${tgt}`, {
                fontSize: '14px', color: '#cccccc', fontFamily: 'Courier New',
            }).setOrigin(0);

            this._listContainer.add([card, badge, badgeTx, name, desc, barBg, barFg, barTx]);

            const r          = entry.quest.reward || {};
            const basicRewards = [r.xp ? `+${r.xp} XP` : '', r.gold ? `+${r.gold} ouro` : ''].filter(t => t).join(' · ');
            const rewLbl     = this.add.text(CARD_X + 8, y + 74, 'Recompensa: ' + basicRewards, {
                fontSize: '13px', color: '#88ccff', fontFamily: 'Courier New',
            }).setOrigin(0);
            this._listContainer.add(rewLbl);

            if (r.items?.length) {
                let itemX = rewLbl.x + rewLbl.width + (basicRewards ? 8 : 0);
                r.items.forEach(it => {
                    const item = ITEMS[it.itemId];
                    if (!item) return;
                    const itTx = this.add.text(itemX, y + 74, (it.qty > 1 ? `×${it.qty} ` : '') + item.name, {
                        fontSize: '13px', color: RARITY_COLORS[item.rarity] || '#88ccff', fontFamily: 'Courier New',
                    }).setOrigin(0);
                    this._listContainer.add(itTx);
                    itemX = itTx.x + itTx.width + 10;
                });
            }

            if (entry.status === 'complete') {
                const btn = this.add.rectangle(CARD_X + 404, y + 8, 110, 24, 0x1a3a1a, 1).setOrigin(0)
                    .setInteractive()
                    .on('pointerover', () => btn.setFillStyle(0x2a5a2a))
                    .on('pointerout',  () => btn.setFillStyle(0x1a3a1a))
                    .on('pointerdown', () => this._claimQuest(entry.id));
                const btnTx = this.add.text(CARD_X + 459, y + 20, 'COLETAR', {
                    fontSize: '15px', color: '#88ff88', fontFamily: 'Courier New', fontStyle: 'bold',
                }).setOrigin(0.5);
                this._listContainer.add([btn, btnTx]);
            }

            y += cardH + 6;
            if (y > 430) break;
        }
    }

    _claimQuest(questId) {
        QuestSystem.claim(this._player, questId);
        this.registry.set('player', this._player);
        EventBus.emit('player-stats-changed', { player: this._player });
        EventBus.emit('player-hp-change',     { player: this._player });
        this._render();
    }

    _statusColor(status) {
        return status === 'complete' ? 0x44ff88 : status === 'active' ? 0xffaa44 : status === 'claimed' ? 0x666666 : 0xaaaaaa;
    }

    _statusColorHex(status) {
        return status === 'complete' ? '#44ff88' : status === 'active' ? '#ffaa44' : status === 'claimed' ? '#888888' : '#cccccc';
    }

    _statusLabel(status) {
        return status === 'complete' ? 'PRONTO' : status === 'active' ? 'ATIVA' : status === 'claimed' ? 'FEITA' : 'NOVA';
    }

    // ── Close ─────────────────────────────────────────────────────────────────

    _close() {
        EventBus.off('bounty-claimed');
        this.scene.stop('Quest');
        const world = this.scene.get('World');
        if (world?.resumeFromOverlay) world.resumeFromOverlay();
    }
}
