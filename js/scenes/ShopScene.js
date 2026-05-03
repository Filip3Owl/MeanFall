import { ShopSystem }              from '../systems/ShopSystem.js';
import { ITEMS, RARITY_COLORS }    from '../data/items.js';
import { SHOPS }                   from '../data/shops.js';
import { UI_COLORS, RARITIES }     from '../constants.js';
import EventBus                    from '../utils/EventBus.js';

/**
 * Modal shop UI. Launched with { shopId } in scene data.
 * Tabs: Buy | Sell. Click an item to see details, then BUY or SELL.
 */
export class ShopScene extends Phaser.Scene {
    constructor() { super('Shop'); }

    init(data) {
        this._shopId    = data.shopId;
        this._tab       = 'buy';
        this._selected  = null;
    }

    create() {
        this._player = this.registry.get('player');
        this._shop   = SHOPS[this._shopId];
        if (!this._shop) { this._close(); return; }

        this._buildUI();
        this._render();

        const close = () => this._close();
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', close);
    }

    _buildUI() {
        const W = 544, H = 480;
        this.add.rectangle(0, 0, W, H, 0x000000, 0.92).setOrigin(0, 0);
        this.add.rectangle(10, 10, W - 20, H - 20, 0x0d0a03, 1).setOrigin(0, 0);
        this.add.rectangle(10, 10, W - 20, H - 20, 0xd4af37, 0).setOrigin(0, 0).setStrokeStyle(2, 0xd4af37);

        // Title
        this.add.text(W / 2, 20, this._shop.name.toUpperCase(), {
            fontSize: '14px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0);
        this.add.text(W / 2, 38, this._shop.greeting, {
            fontSize: '10px', color: '#aaaaaa', fontFamily: 'Courier New', fontStyle: 'italic',
            wordWrap: { width: W - 60 },
        }).setOrigin(0.5, 0);

        // Close button
        this.add.rectangle(504, 14, 22, 22, 0x330000, 1).setOrigin(0, 0).setInteractive()
            .on('pointerdown', () => this._close());
        this.add.text(515, 25, 'X', { fontSize: '12px', color: '#ff4444', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5);

        // Gold display
        this._goldTxt = this.add.text(W - 30, 60, '', { fontSize: '12px', color: '#ffcc44', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(1, 0);

        // Tabs
        this._buyTab  = this._makeTab(20,  78, 'COMPRAR', () => this._switchTab('buy'));
        this._sellTab = this._makeTab(124, 78, 'VENDER',  () => this._switchTab('sell'));

        // List + detail
        this.add.rectangle(14, 110, 280, 326, 0x080604, 1).setOrigin(0, 0);
        this.add.rectangle(302, 110, 228, 326, 0x080604, 1).setOrigin(0, 0);

        this.add.text(154, 116, 'CATÁLOGO',  { fontSize: '10px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0.5, 0);
        this.add.text(416, 116, 'DETALHES', { fontSize: '10px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

        // Detail texts
        this._detName  = this.add.text(308, 134, '', { fontSize: '12px', color: '#ffd700', fontFamily: 'Courier New', wordWrap: { width: 216 } }).setOrigin(0, 0);
        this._detTier  = this.add.text(308, 154, '', { fontSize: '10px', color: '#aaaaaa', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this._detType  = this.add.text(308, 168, '', { fontSize: '10px', color: '#888888', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this._detDesc  = this.add.text(308, 184, '', { fontSize: '11px', color: '#cccccc', fontFamily: 'Courier New', wordWrap: { width: 216 }, lineSpacing: 3 }).setOrigin(0, 0);
        this._detPrice = this.add.text(308, 280, '', { fontSize: '12px', color: '#ffcc44', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0, 0);

        this._actionBg = this.add.rectangle(308, 360, 216, 32, 0x1a3a1a, 1).setOrigin(0, 0).setInteractive()
            .on('pointerover', () => this._actionBg.setFillStyle(0x2a5a2a))
            .on('pointerout',  () => this._actionBg.setFillStyle(0x1a3a1a))
            .on('pointerdown', () => this._doAction())
            .setVisible(false);
        this._actionTx = this.add.text(416, 376, '', { fontSize: '12px', color: '#88ff88', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0.5, 0.5).setVisible(false);

        this._actionMsg = this.add.text(416, 405, '', { fontSize: '10px', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

        this.add.text(W / 2, 458, 'ESC para fechar', { fontSize: '9px', color: '#444444', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

        this._refreshGold();
    }

    _makeTab(x, y, label, onClick) {
        const bg = this.add.rectangle(x, y, 100, 24, 0x1a1a2a, 1).setOrigin(0, 0).setInteractive()
            .on('pointerdown', onClick);
        const tx = this.add.text(x + 50, y + 12, label, { fontSize: '11px', color: '#aaaaff', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5);
        return { bg, tx };
    }

    _switchTab(tab) {
        this._tab = tab;
        this._selected = null;
        this._render();
        this._clearDetail();
    }

    _refreshGold() {
        this._goldTxt.setText(`Ouro: ${this._player.gold || 0}`);
    }

    _render() {
        // tab visuals
        this._buyTab.bg.setFillStyle(this._tab === 'buy' ? 0x3a3a55 : 0x1a1a2a);
        this._sellTab.bg.setFillStyle(this._tab === 'sell' ? 0x3a3a55 : 0x1a1a2a);
        this._buyTab.tx.setColor(this._tab === 'buy' ? '#ffffff' : '#aaaaff');
        this._sellTab.tx.setColor(this._tab === 'sell' ? '#ffffff' : '#aaaaff');

        // clear old rows
        if (this._rows) this._rows.forEach(r => { r.bg.destroy(); r.tx.destroy(); r.priceTx.destroy(); });
        this._rows = [];

        const list = this._tab === 'buy'
            ? this._shop.stock.map(id => ({ itemId: id, qty: 1 }))
            : (this._player.inventory || []).filter(s => s.qty > 0);

        if (list.length === 0) {
            const empty = this.add.text(154, 270, this._tab === 'buy' ? 'Nada à venda' : 'Você não tem itens', {
                fontSize: '11px', color: '#444444', fontFamily: 'Courier New',
            }).setOrigin(0.5, 0.5);
            this._rows.push({ bg: empty, tx: empty, priceTx: empty });
            return;
        }

        for (let i = 0; i < list.length; i++) {
            const { itemId, qty } = list[i];
            const item = ITEMS[itemId];
            if (!item) continue;
            const color = RARITY_COLORS[item.rarity] || '#cccccc';
            const y     = 134 + i * 22;
            const price = this._tab === 'buy' ? ShopSystem.buyPrice(itemId) : ShopSystem.sellPrice(itemId);

            const bg = this.add.rectangle(18, y, 272, 20, 0x111111, 1).setOrigin(0, 0).setInteractive()
                .on('pointerover', () => { if (this._selected !== i) bg.setFillStyle(0x1a1a22); })
                .on('pointerout',  () => { if (this._selected !== i) bg.setFillStyle(0x111111); })
                .on('pointerdown', () => this._selectIdx(i));

            const tx = this.add.text(24, y + 10, qty > 1 ? `${item.name} ×${qty}` : item.name, {
                fontSize: '10px', color, fontFamily: 'Courier New',
            }).setOrigin(0, 0.5);

            const priceTx = this.add.text(284, y + 10, `${price}g`, {
                fontSize: '10px', color: '#ffcc44', fontFamily: 'Courier New',
            }).setOrigin(1, 0.5);

            this._rows.push({ bg, tx, priceTx, idx: i, itemId });
        }
    }

    _selectIdx(i) {
        if (this._selected !== null && this._rows[this._selected]?.bg.setFillStyle) {
            this._rows[this._selected].bg.setFillStyle(0x111111);
        }
        this._selected = i;
        if (this._rows[i]?.bg.setFillStyle) this._rows[i].bg.setFillStyle(0x1a1a33);

        const itemId = this._rows[i].itemId;
        const item   = ITEMS[itemId];
        const rColor = RARITY_COLORS[item.rarity] || '#aaaaaa';
        const rName  = (RARITIES[item.rarity] || RARITIES.common).name;

        this._detName.setText(item.name).setColor(rColor);
        this._detTier.setText(rName.toUpperCase()).setColor(rColor);
        this._detType.setText(item.type === 'consumable' ? 'Consumível' : `Equipamento — ${item.slot}`);
        this._detDesc.setText(item.description || '');

        const price = this._tab === 'buy' ? ShopSystem.buyPrice(itemId) : ShopSystem.sellPrice(itemId);
        this._detPrice.setText(`${this._tab === 'buy' ? 'Custa' : 'Vende por'}: ${price} ouro`);

        this._actionBg.setVisible(true);
        this._actionTx.setVisible(true).setText(this._tab === 'buy' ? 'COMPRAR' : 'VENDER');
        this._actionMsg.setText('');
    }

    _doAction() {
        if (this._selected === null) return;
        const itemId = this._rows[this._selected].itemId;
        const result = this._tab === 'buy'
            ? ShopSystem.buy(this._player, itemId)
            : ShopSystem.sell(this._player, itemId);

        if (result.ok) {
            this._actionMsg.setColor('#88ff88').setText(`OK — ${this._tab === 'buy' ? '−' : '+'}${result.price} ouro`);
            EventBus.emit('player-stats-changed', { player: this._player });
            this.registry.set('player', this._player);
            this._refreshGold();
            this._render();
            this._clearDetail();
        } else {
            this._actionMsg.setColor('#ff4444').setText(result.reason || 'Erro');
        }
    }

    _clearDetail() {
        this._selected = null;
        this._detName.setText('');
        this._detTier.setText('');
        this._detType.setText('');
        this._detDesc.setText('');
        this._detPrice.setText('');
        this._actionBg.setVisible(false);
        this._actionTx.setVisible(false);
    }

    _close() {
        this.scene.stop('Shop');
        const world = this.scene.get('World');
        if (world?.resumeFromOverlay) world.resumeFromOverlay();
    }
}
