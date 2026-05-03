import { CombatSystem } from '../systems/CombatSystem.js';
import { ITEMS }        from '../data/items.js';
import EventBus         from '../utils/EventBus.js';

export class InventoryScene extends Phaser.Scene {
    constructor() { super('Inventory'); }

    create() {
        this._player      = JSON.parse(JSON.stringify(this.registry.get('player')));
        this._selectedIdx = -1;
        this._rows        = [];

        this._buildUI();
        this._renderList();

        const close = () => this._close();
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', close);
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I).on('down', close);
    }

    // ─── UI CONSTRUCTION ──────────────────────────────────────────────────────

    _buildUI() {
        const W = 544, H = 480;

        this.add.rectangle(0, 0, W, H, 0x000000, 0.92).setOrigin(0, 0);
        this.add.rectangle(10, 10, W - 20, H - 20, 0x0d0a03, 1).setOrigin(0, 0);
        this.add.rectangle(10, 10, W - 20, H - 20, 0xd4af37, 0).setOrigin(0, 0).setStrokeStyle(1, 0xd4af37);

        this.add.text(W / 2, 22, 'I N V E N T Á R I O', {
            fontSize: '14px', color: '#ffd700', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0);

        // Close button
        this.add.rectangle(504, 14, 22, 22, 0x330000, 1).setOrigin(0, 0)
            .setInteractive().on('pointerdown', () => this._close());
        this.add.text(515, 25, 'X', { fontSize: '12px', color: '#ff4444', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5);

        // Item list panel (left)
        this.add.rectangle(14, 44, 280, 392, 0x080604, 1).setOrigin(0, 0);
        this.add.text(154, 50, 'Itens', { fontSize: '11px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

        // Detail panel (right)
        this.add.rectangle(302, 44, 228, 392, 0x080604, 1).setOrigin(0, 0);
        this.add.text(416, 50, 'Detalhes', { fontSize: '11px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

        // Detail texts
        this._detName  = this.add.text(308, 70, '', { fontSize: '12px', color: '#ffd700', fontFamily: 'Courier New', wordWrap: { width: 216 } }).setOrigin(0, 0);
        this._detType  = this.add.text(308, 90, '', { fontSize: '10px', color: '#888888', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this._detDesc  = this.add.text(308, 108, '', { fontSize: '11px', color: '#cccccc', fontFamily: 'Courier New', wordWrap: { width: 216 }, lineSpacing: 3 }).setOrigin(0, 0);

        // Action buttons
        this._useBg  = this.add.rectangle(308, 330, 100, 26, 0x1a3a1a, 1).setOrigin(0, 0).setInteractive()
            .on('pointerover', () => this._useBg.setFillStyle(0x2a5a2a))
            .on('pointerout',  () => this._useBg.setFillStyle(0x1a3a1a))
            .on('pointerdown', () => this._useSelected())
            .setVisible(false);
        this._useTx  = this.add.text(358, 343, 'USAR', { fontSize: '11px', color: '#88ff88', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5).setVisible(false);

        this._eqBg   = this.add.rectangle(418, 330, 106, 26, 0x1a1a3a, 1).setOrigin(0, 0).setInteractive()
            .on('pointerover', () => this._eqBg.setFillStyle(0x2a2a5a))
            .on('pointerout',  () => this._eqBg.setFillStyle(0x1a1a3a))
            .on('pointerdown', () => this._equipSelected())
            .setVisible(false);
        this._eqTx   = this.add.text(471, 343, 'EQUIPAR', { fontSize: '11px', color: '#8888ff', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5).setVisible(false);

        this._actionMsg = this.add.text(416, 368, '', { fontSize: '10px', fontFamily: 'Courier New', wordWrap: { width: 216 } }).setOrigin(0.5, 0);

        // Equipped slots
        this.add.text(308, 394, 'Equipado:', { fontSize: '10px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this._eqSlotsTx = this.add.text(308, 410, '', { fontSize: '9px', color: '#888888', fontFamily: 'Courier New', wordWrap: { width: 216 }, lineSpacing: 3 }).setOrigin(0, 0);
        this._refreshEquipSlots();

        this.add.text(W / 2, 456, 'I ou ESC para fechar', { fontSize: '10px', color: '#444444', fontFamily: 'Courier New' }).setOrigin(0.5, 0);
    }

    // ─── ITEM LIST ────────────────────────────────────────────────────────────

    _renderList() {
        this._rows.forEach(r => { r.bg.destroy(); r.tx.destroy(); r.qty.destroy(); });
        this._rows = [];

        const inv = this._player.inventory;
        if (inv.length === 0) {
            this.add.text(154, 240, 'Inventário vazio', { fontSize: '11px', color: '#444444', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5);
            return;
        }

        for (let i = 0; i < inv.length; i++) {
            const { itemId, qty } = inv[i];
            const item   = ITEMS[itemId];
            if (!item) continue;

            const isEq   = Object.values(this._player.equipment).includes(itemId);
            const color  = isEq ? '#aaaaff' : '#cccccc';
            const y      = 66 + i * 26;

            const bg = this.add.rectangle(16, y, 276, 24, 0x111111, 1).setOrigin(0, 0)
                .setInteractive()
                .on('pointerover', () => { if (this._selectedIdx !== i) bg.setFillStyle(0x1a1a22); })
                .on('pointerout',  () => { if (this._selectedIdx !== i) bg.setFillStyle(0x111111); })
                .on('pointerdown', () => this._selectItem(i));

            const tx  = this.add.text(22, y + 12, item.name, { fontSize: '11px', color, fontFamily: 'Courier New' }).setOrigin(0, 0.5);
            const qty_ = this.add.text(284, y + 12, qty > 1 ? `×${qty}` : (isEq ? '[E]' : ''), { fontSize: '10px', color: '#666666', fontFamily: 'Courier New' }).setOrigin(1, 0.5);

            this._rows.push({ bg, tx, qty: qty_, idx: i });
        }
    }

    _selectItem(idx) {
        if (this._selectedIdx >= 0 && this._rows[this._selectedIdx]) {
            this._rows[this._selectedIdx].bg.setFillStyle(0x111111);
        }
        this._selectedIdx = idx;
        if (this._rows[idx]) this._rows[idx].bg.setFillStyle(0x1a1a33);

        const { itemId } = this._player.inventory[idx];
        const item = ITEMS[itemId];
        if (!item) return;

        this._detName.setText(item.name);
        this._detType.setText(item.type === 'consumable' ? 'Consumível' : `Equipamento — slot: ${item.slot}`);
        this._detDesc.setText(item.description || '');

        const isConsumable = item.type === 'consumable';
        const isEquipment  = item.type === 'equipment';
        this._useBg.setVisible(isConsumable); this._useTx.setVisible(isConsumable);
        this._eqBg.setVisible(isEquipment);   this._eqTx.setVisible(isEquipment);
        this._actionMsg.setText('');
    }

    // ─── ACTIONS ──────────────────────────────────────────────────────────────

    _useSelected() {
        if (this._selectedIdx < 0) return;
        const { itemId } = this._player.inventory[this._selectedIdx];
        const ok = CombatSystem.useItem(this._player, itemId, ITEMS);
        if (ok) {
            this._actionMsg.setColor('#88ff88').setText('Item usado!');
            EventBus.emit('player-hp-change', { player: this._player });
            this.registry.set('player', this._player);
            this._selectedIdx = -1;
            this._clearDetail();
            this._renderList();
        } else {
            this._actionMsg.setColor('#ff4444').setText('Não foi possível usar.');
        }
    }

    _equipSelected() {
        if (this._selectedIdx < 0) return;
        const { itemId } = this._player.inventory[this._selectedIdx];
        const ok = CombatSystem.equipItem(this._player, itemId, ITEMS);
        if (ok) {
            this._actionMsg.setColor('#8888ff').setText('Equipado!');
            EventBus.emit('player-stats-changed', { player: this._player });
            this.registry.set('player', this._player);
            this._refreshEquipSlots();
            this._renderList();
        } else {
            this._actionMsg.setColor('#ff4444').setText('Não foi possível equipar.');
        }
    }

    _clearDetail() {
        this._detName.setText('');
        this._detType.setText('');
        this._detDesc.setText('');
        this._useBg.setVisible(false); this._useTx.setVisible(false);
        this._eqBg.setVisible(false);  this._eqTx.setVisible(false);
    }

    _refreshEquipSlots() {
        const eq    = this._player.equipment;
        const lines = Object.entries(eq)
            .filter(([, v]) => v)
            .map(([slot, id]) => `${slot}: ${ITEMS[id]?.name || id}`)
            .join('\n');
        this._eqSlotsTx.setText(lines || 'Nenhum item equipado');
    }

    _close() {
        this.registry.set('player', this._player);
        this.scene.stop('Inventory');
        const world = this.scene.get('World');
        if (world?.resumeFromOverlay) world.resumeFromOverlay();
    }
}
