import { spendStatPoint, xpToNext, masteryPercent } from '../systems/XPSystem.js';
import { ITEMS }      from '../data/items.js';
import { AREA_INFO }  from '../constants.js';
import EventBus       from '../utils/EventBus.js';
import { Sound }      from '../utils/SoundSystem.js';

export class CharacterScene extends Phaser.Scene {
    constructor() { super('Character'); }

    create() {
        this._player = JSON.parse(JSON.stringify(this.registry.get('player')));
        this._buildUI();

        const close = () => this._close();
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on('down', close);
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C).on('down', close);
    }

    // ─── UI CONSTRUCTION ──────────────────────────────────────────────────────

    _buildUI() {
        const W = 544, H = 480;
        const p = this._player;

        this.add.rectangle(0, 0, W, H, 0x000000, 0.92).setOrigin(0, 0);
        this.add.rectangle(10, 10, W - 20, H - 20, 0x0d0a03, 1).setOrigin(0, 0);
        this.add.rectangle(10, 10, W - 20, H - 20, 0xd4af37, 0).setOrigin(0, 0).setStrokeStyle(1, 0xd4af37);

        this.add.text(W / 2, 22, 'P E R S O N A G E M', {
            fontSize: '17px', color: '#ffd700', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0);

        // Close button
        this.add.rectangle(504, 14, 22, 22, 0x330000, 1).setOrigin(0, 0)
            .setInteractive()
            .on('pointerover',  () => Sound.hover())
            .on('pointerdown',  () => { Sound.click(); this._close(); });
        this.add.text(515, 25, 'X', { fontSize: '15px', color: '#ff4444', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5);

        // Name + level
        this.add.text(W / 2, 46, p.name || 'Aventureiro', {
            fontSize: '16px', color: '#ffd700', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0);
        this.add.text(W / 2, 66, `Nível ${p.level}`, {
            fontSize: '15px', color: '#888888', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0);

        this._buildVitalsPanel();
        this._buildAttributesPanel();
        this._buildEquipmentPanel();
        this._buildMasteryPanel();

        this.add.text(W / 2, 458, 'C ou ESC para fechar', {
            fontSize: '16px', color: '#444444', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0);
    }

    _buildVitalsPanel() {
        const p = this._player;
        this.add.rectangle(14, 86, 252, 122, 0x080604, 1).setOrigin(0, 0);
        this.add.text(140, 92, 'Vitais', { fontSize: '17px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

        const rows = [
            ['HP',    `${p.hp} / ${p.maxHp}`],
            ['Foco',  `${p.focus} / ${p.maxFocus}`],
            ['XP',    `${p.xp} / ${xpToNext(p.level)}`],
            ['Ouro',  `${p.gold || 0}`],
        ];
        rows.forEach(([label, val], i) => {
            const y = 110 + i * 22;
            this.add.text(22, y, label, { fontSize: '17px', color: '#777777', fontFamily: 'Courier New' }).setOrigin(0, 0);
            this.add.text(260, y, val,  { fontSize: '17px', color: '#ffffff',  fontFamily: 'Courier New' }).setOrigin(1, 0);
        });
    }

    _buildAttributesPanel() {
        const p = this._player;
        this.add.rectangle(274, 86, 256, 122, 0x080604, 1).setOrigin(0, 0);
        this.add.text(402, 92, 'Atributos', { fontSize: '17px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

        const STATS = [
            ['strength',     'Força'],
            ['intelligence', 'Inteligência'],
            ['agility',      'Agilidade'],
            ['vitality',     'Vitalidade'],
        ];

        this._statValTxts = {};
        this._plusBtns    = {};

        STATS.forEach(([key, label], i) => {
            const y = 110 + i * 24;
            this.add.text(282, y, label, { fontSize: '17px', color: '#777777', fontFamily: 'Courier New' }).setOrigin(0, 0);

            this._statValTxts[key] = this.add.text(404, y, String(p[key]), {
                fontSize: '17px', color: '#ffffff', fontFamily: 'Courier New',
            }).setOrigin(0.5, 0);

            const btn = this.add.rectangle(426, y, 56, 18, 0x1a1a33, 1).setOrigin(0, 0)
                .setInteractive()
                .on('pointerover', () => { btn.setFillStyle(0x2a2a55); Sound.hover(); })
                .on('pointerout',  () => btn.setFillStyle(0x1a1a33))
                .on('pointerdown', () => { Sound.select(); this._spendPoint(key); });
            this.add.text(454, y + 9, '+1', { fontSize: '16px', color: '#aaaaff', fontFamily: 'Courier New' }).setOrigin(0.5, 0.5);
            this._plusBtns[key] = btn;
        });

        this._statPointsTxt = this.add.text(402, 208, '', {
            fontSize: '16px', color: '#ffaa00', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0);
        this._refreshStatPoints();
    }

    _buildEquipmentPanel() {
        const p = this._player;
        this.add.rectangle(14, 218, 516, 148, 0x080604, 1).setOrigin(0, 0);
        this.add.text(272, 224, 'Equipamentos', { fontSize: '17px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

        const SLOTS = [
            ['head',      'Cabeça'],  ['chest',     'Peito'],
            ['legs',      'Pernas'],  ['feet',      'Pés'],
            ['leftHand',  'M. Esq.'], ['rightHand', 'M. Dir.'],
            ['ring',      'Anel'],    ['amulet',    'Amuleto'],
        ];

        SLOTS.forEach(([slot, label], i) => {
            const col    = i % 4;
            const row    = Math.floor(i / 4);
            const x      = 22 + col * 128;
            const y      = 242 + row * 50;
            const itemId = p.equipment[slot];
            const name   = itemId ? (ITEMS[itemId]?.name || itemId) : '—';
            const color  = itemId ? '#aaaaff' : '#333333';

            this.add.text(x, y, label, { fontSize: '15px', color: '#555555', fontFamily: 'Courier New' }).setOrigin(0, 0);
            this.add.text(x, y + 14, name, { fontSize: '16px', color, fontFamily: 'Courier New', wordWrap: { width: 118 } }).setOrigin(0, 0);
        });

        // ── Relic slot (full width) ───────────────────────────────────────────
        const relicId   = p.equipment?.relic;
        const relicItem = relicId ? ITEMS[relicId] : null;
        const relicName = relicItem ? relicItem.name : '—  Nenhuma relíquia equipada';
        const relicColor = relicItem ? (relicItem.rarity === 'legendary' ? '#ffaa22' : '#aaaaff') : '#333333';
        this.add.text(22,  338, 'Relíquia', { fontSize: '15px', color: '#aa8800', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this.add.text(110, 338, relicName,  { fontSize: '15px', color: relicColor, fontFamily: 'Courier New', wordWrap: { width: 400 } }).setOrigin(0, 0);
        if (relicItem?.passiveEffect) {
            this.add.text(110, 352, relicItem.description || '', { fontSize: '13px', color: '#888888', fontFamily: 'Courier New', wordWrap: { width: 400 } }).setOrigin(0, 0);
        }
    }

    _buildMasteryPanel() {
        const p = this._player;
        this.add.rectangle(14, 376, 516, 96, 0x080604, 1).setOrigin(0, 0);
        this.add.text(272, 382, 'Maestria por Área', { fontSize: '17px', color: '#d4af37', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

        const areas = Object.keys(p.mastery);
        areas.forEach((area, i) => {
            const pct   = masteryPercent(p.mastery[area]);
            const info  = AREA_INFO[area];
            const x     = 22 + i * 84;
            const color = pct >= 70 ? '#00cc44' : pct >= 40 ? '#ffaa00' : '#777777';
            const short = info?.displayName?.split(' ')[0] || area;

            this.add.text(x + 30, 400, short, { fontSize: '15px', color: '#555555', fontFamily: 'Courier New' }).setOrigin(0.5, 0);

            // Bar track
            this.add.rectangle(x, 414, 60, 7, 0x111111, 1).setOrigin(0, 0);
            if (pct > 0) this.add.rectangle(x, 414, Math.floor(60 * pct / 100), 7, color === '#00cc44' ? 0x00cc44 : color === '#ffaa00' ? 0xffaa00 : 0x777777, 1).setOrigin(0, 0);

            this.add.text(x + 30, 424, `${pct}%`, { fontSize: '15px', color, fontFamily: 'Courier New' }).setOrigin(0.5, 0);
            this.add.text(x + 30, 438, `${p.mastery[area].correct}/${p.mastery[area].attempted}`, {
                fontSize: '13px', color: '#555555', fontFamily: 'Courier New',
            }).setOrigin(0.5, 0);
        });
    }

    // ─── STAT POINT SPENDING ──────────────────────────────────────────────────

    _spendPoint(stat) {
        if ((this._player.availableStatPoints || 0) <= 0) return;
        const ok = spendStatPoint(this._player, stat);
        if (ok) {
            this._statValTxts[stat].setText(String(this._player[stat]));
            this.registry.set('player', this._player);
            EventBus.emit('player-stats-changed', { player: this._player });
            this._refreshStatPoints();
        }
    }

    _refreshStatPoints() {
        const pts   = this._player.availableStatPoints || 0;
        const alpha = pts > 0 ? 1 : 0.3;
        this._statPointsTxt.setText(pts > 0 ? `Pontos disponíveis: ${pts}` : '');
        for (const btn of Object.values(this._plusBtns)) btn.setAlpha(alpha);
    }

    // ─── CLOSE ────────────────────────────────────────────────────────────────

    _close() {
        this.registry.set('player', this._player);
        this.scene.stop('Character');
        const world = this.scene.get('World');
        if (world?.resumeFromOverlay) world.resumeFromOverlay();
    }
}
