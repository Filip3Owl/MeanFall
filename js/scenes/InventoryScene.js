import { CombatSystem }            from '../systems/CombatSystem.js';
import { ITEMS, RARITY_COLORS }    from '../data/items.js';
import EventBus                    from '../utils/EventBus.js';
import { Sound }                   from '../utils/SoundSystem.js';

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
        this.add.rectangle(302, 44, 228, 246, 0x080604, 1).setOrigin(0, 0);
        this.add.text(416, 50, 'Detalhes', { fontSize: '11px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

        this._detName    = this.add.text(308, 70,  '', { fontSize: '12px', color: '#ffd700', fontFamily: 'Courier New', wordWrap: { width: 160 } }).setOrigin(0, 0);
        this._detRarity  = this.add.text(308, 88,  '', { fontSize: '10px', color: '#aaaaaa', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this._detType    = this.add.text(308, 102, '', { fontSize: '10px', color: '#888888', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this._detDesc    = this.add.text(308, 120, '', { fontSize: '11px', color: '#cccccc', fontFamily: 'Courier New', wordWrap: { width: 216 }, lineSpacing: 3 }).setOrigin(0, 0);
        this._detCompare = this.add.text(308, 200, '', { fontSize: '9px', color: '#88ccff', fontFamily: 'Courier New', wordWrap: { width: 216 }, lineSpacing: 2 }).setOrigin(0, 0);
        this._detIcon    = this.add.image(490, 85, '').setScale(2.5).setVisible(false);

        // Action buttons
        this._useBg = this.add.rectangle(308, 250, 100, 26, 0x1a3a1a, 1).setOrigin(0, 0).setInteractive()
            .on('pointerover', () => this._useBg.setFillStyle(0x2a5a2a))
            .on('pointerout',  () => this._useBg.setFillStyle(0x1a3a1a))
            .on('pointerdown', () => this._useSelected())
            .setVisible(false);
        this._useTx = this.add.text(358, 263, 'USAR', { fontSize: '11px', color: '#88ff88', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5).setVisible(false);

        this._eqBg = this.add.rectangle(418, 250, 106, 26, 0x1a1a3a, 1).setOrigin(0, 0).setInteractive()
            .on('pointerover', () => this._eqBg.setFillStyle(0x2a2a5a))
            .on('pointerout',  () => this._eqBg.setFillStyle(0x1a1a3a))
            .on('pointerdown', () => this._equipSelected())
            .setVisible(false);
        this._eqTx = this.add.text(471, 263, 'EQUIPAR', { fontSize: '11px', color: '#8888ff', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5).setVisible(false);

        this._actionMsg = this.add.text(416, 282, '', { fontSize: '10px', fontFamily: 'Courier New', wordWrap: { width: 216 } }).setOrigin(0.5, 0);

        // Equipped panel
        this.add.rectangle(302, 296, 228, 140, 0x080604, 1).setOrigin(0, 0);
        this.add.text(416, 302, 'Equipado', { fontSize: '11px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0.5, 0);
        this._slotRows = {};
        this._renderEquipped();

        this.add.text(W / 2, 456, 'I ou ESC para fechar  ·  clique no slot equipado p/ desequipar', {
            fontSize: '9px', color: '#444444', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0);
    }

    _renderList() {
        this._rows.forEach(r => { if (r.bg.destroy) { r.bg.destroy(); r.tx.destroy(); r.qty.destroy(); if (r.icon) r.icon.destroy(); } });
        this._rows = [];

        const inv = this._player.inventory || [];
        if (inv.length === 0) {
            const empty = this.add.text(154, 240, 'Inventário vazio', { fontSize: '11px', color: '#444444', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5);
            this._rows.push({ bg: empty, tx: empty, qty: empty });
            return;
        }

        for (let i = 0; i < inv.length; i++) {
            const { itemId, qty } = inv[i];
            const item = ITEMS[itemId];
            if (!item) continue;

            const isEq   = Object.values(this._player.equipment).includes(itemId);
            const color  = RARITY_COLORS[item.rarity] || '#cccccc';
            const y      = 66 + i * 22;

            const bg = this.add.rectangle(16, y, 276, 20, 0x111111, 1).setOrigin(0, 0)
                .setInteractive()
                .on('pointerover', () => { if (this._selectedIdx !== i) bg.setFillStyle(0x1a1a22); })
                .on('pointerout',  () => { if (this._selectedIdx !== i) bg.setFillStyle(0x111111); })
                .on('pointerdown', () => this._selectItem(i));

            const icon = this.add.image(28, y + 10, item.icon || 'item_potion_red').setScale(0.65);
            const tx = this.add.text(42, y + 10, item.name, {
                fontSize: '10px', color, fontFamily: 'Courier New',
            }).setOrigin(0, 0.5);
            const qtyTxt = this.add.text(284, y + 10, qty > 1 ? `×${qty}` : (isEq ? '[E]' : ''), {
                fontSize: '10px', color: isEq ? '#aaaaff' : '#666666', fontFamily: 'Courier New',
            }).setOrigin(1, 0.5);

            this._rows.push({ bg, tx, qty: qtyTxt, icon, idx: i });
        }
    }

    _renderEquipped() {
        // Clear old rows
        Object.values(this._slotRows).forEach(r => r.forEach(o => o.destroy()));
        this._slotRows = {};

        const SLOTS = [
            ['head',      'Cabeça'],
            ['chest',     'Peito'],
            ['legs',      'Pernas'],
            ['feet',      'Pés'],
            ['leftHand',  'M.Esq'],
            ['rightHand', 'M.Dir'],
            ['ring',      'Anel'],
            ['amulet',    'Amul'],
        ];

        SLOTS.forEach(([slot, label], i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x   = 308 + col * 108;
            const y   = 320 + row * 26;
            const itemId = this._player.equipment[slot];
            const item     = itemId ? ITEMS[itemId] : null;
            const itemName = item ? item.name : '—';
            const color    = item ? (RARITY_COLORS[item.rarity] || '#aaaaff') : '#444444';
            const fillBg   = itemId ? 0x1a1a2a : 0x0a0a0a;

            const bg = this.add.rectangle(x, y, 104, 24, fillBg, 1).setOrigin(0, 0);
            let icon = null;
            if (itemId) {
                bg.setInteractive()
                    .on('pointerover', () => bg.setFillStyle(0x331111))
                    .on('pointerout',  () => bg.setFillStyle(fillBg))
                    .on('pointerdown', () => this._unequip(slot));
                icon = this.add.image(x + 90, y + 12, item.icon || 'item_potion_red').setScale(0.5).setAlpha(0.6);
            }
            const lblTxt  = this.add.text(x + 3, y + 2,  label,    { fontSize: '8px',  color: '#666666', fontFamily: 'Courier New' }).setOrigin(0, 0);
            const itemTxt = this.add.text(x + 3, y + 12, itemName, { fontSize: '9px',  color, fontFamily: 'Courier New' }).setOrigin(0, 0);
            this._slotRows[slot] = [bg, lblTxt, itemTxt];
            if (icon) this._slotRows[slot].push(icon);
        });
    }

    _selectItem(idx) {
        if (this._selectedIdx >= 0 && this._rows[this._selectedIdx]?.bg?.setFillStyle) {
            this._rows[this._selectedIdx].bg.setFillStyle(0x111111);
        }

        const invItem = this._player.inventory[idx];
        if (!invItem) {
            this._selectedIdx = -1;
            this._clearDetail();
            return;
        }

        this._selectedIdx = idx;
        if (this._rows[idx]?.bg?.setFillStyle) this._rows[idx].bg.setFillStyle(0x1a1a33);

        const { itemId } = invItem;
        const item = ITEMS[itemId];
        if (!item) return;

        const rarityColor = RARITY_COLORS[item.rarity] || '#aaaaaa';
        this._detName.setText(item.name).setColor(rarityColor);
        this._detRarity.setText((item.rarity || 'common').toUpperCase()).setColor(rarityColor);
        this._detType.setText(item.type === 'consumable' ? 'Consumível' : `Equipamento — ${item.slot}`);
        this._detDesc.setText(item.description || '');
        this._detIcon.setTexture(item.icon || 'item_potion_red').setVisible(true);

        // Comparison with currently equipped (if equipment)
        if (item.type === 'equipment' && item.slot) {
            const currentId = this._player.equipment[item.slot];
            if (currentId && currentId !== itemId) {
                const cur = ITEMS[currentId];
                this._detCompare.setText(`Substituirá:\n  ${cur.name}\n  (${cur.description})`);
            } else if (currentId === itemId) {
                this._detCompare.setText('Já equipado.');
            } else {
                this._detCompare.setText('Slot vazio.');
            }
        } else {
            this._detCompare.setText('');
        }

        const isConsumable = item.type === 'consumable';
        const isEquipment  = item.type === 'equipment' && this._player.equipment[item.slot] !== itemId;
        this._useBg.setVisible(isConsumable); this._useTx.setVisible(isConsumable);
        this._eqBg.setVisible(isEquipment);   this._eqTx.setVisible(isEquipment);
        this._actionMsg.setText('');
    }

    _useSelected() {
        if (this._selectedIdx < 0) return;
        const invItem = this._player.inventory[this._selectedIdx];
        if (!invItem) return;

        const { itemId } = invItem;
        const ok = CombatSystem.useItem(this._player, itemId, ITEMS);
        if (ok) {
            Sound.useItem();
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
        const invItem = this._player.inventory[this._selectedIdx];
        if (!invItem) return;

        const { itemId } = invItem;
        const ok = CombatSystem.equipItem(this._player, itemId, ITEMS);
        if (ok) {
            Sound.equip();
            this._actionMsg.setColor('#8888ff').setText('Equipado!');
            EventBus.emit('player-stats-changed', { player: this._player });
            EventBus.emit('player-hp-change',     { player: this._player });
            this.registry.set('player', this._player);
            this._renderEquipped();
            this._renderList();
            this._selectItem(this._selectedIdx);
        } else {
            this._actionMsg.setColor('#ff4444').setText('Não foi possível equipar.');
        }
    }

    _unequip(slot) {
        const ok = CombatSystem.unequipItem(this._player, slot, ITEMS);
        if (ok) {
            Sound.unequip();
            this._actionMsg.setColor('#ffaa44').setText('Item desequipado.');
            EventBus.emit('player-stats-changed', { player: this._player });
            EventBus.emit('player-hp-change',     { player: this._player });
            this.registry.set('player', this._player);
            this._renderEquipped();
            this._renderList();
        }
    }

    _clearDetail() {
        this._detName.setText('');
        this._detRarity.setText('');
        this._detType.setText('');
        this._detDesc.setText('');
        this._detCompare.setText('');
        this._detIcon.setVisible(false);
        this._useBg.setVisible(false); this._useTx.setVisible(false);
        this._eqBg.setVisible(false);  this._eqTx.setVisible(false);
    }

    _close() {
        this.registry.set('player', this._player);
        this.scene.stop('Inventory');
        const world = this.scene.get('World');
        if (world?.resumeFromOverlay) world.resumeFromOverlay();
    }
}
