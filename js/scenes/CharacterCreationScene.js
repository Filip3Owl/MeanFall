import { GENDERS, HAIR_COLORS, ROBE_COLORS, SKIN_TONES, APPEARANCE_DEFAULTS } from '../data/appearance.js';
import { buildPlayerSprite } from '../utils/Draw.js';
import { PLAYER_DEFAULTS, DIFFICULTIES } from '../constants.js';

const W = 544, H = 480;

const PREV_CX = 86;
const DIV_X   = 172;
const OPT_L   = DIV_X + 10;
const OPT_R   = W - 6;
const OPT_W   = OPT_R - OPT_L;   // 356
const OPT_CX  = OPT_L + OPT_W / 2; // 360

const CLASSES = [
    {
        id: 'mage', name: 'Mago', icon: '✦',
        color: 0x6644ff, dark: 0x100a28,
        stats: 'INT +3 · Foco +15',
        lore: 'Domina teoria e fórmulas',
        apply: d => { d.intelligence += 3; d.maxFocus += 15; d.focus = d.maxFocus; },
    },
    {
        id: 'warrior', name: 'Guerreiro', icon: '⚔',
        color: 0xff5533, dark: 0x28100a,
        stats: 'FOR +3 · HP +20',
        lore: 'Resiste em combates longos',
        apply: d => { d.strength += 3; d.maxHp += 20; d.hp = d.maxHp; },
    },
    {
        id: 'explorer', name: 'Explorador', icon: '◈',
        color: 0x33cc66, dark: 0x0a2814,
        stats: 'AGI +3 · Bônus Fuga',
        lore: 'Aprende rápido no campo',
        apply: d => { d.agility += 3; },
    },
];

const TRAJECTORIES = [
    { id: 'autodidact', name: 'Autodidata', color: 0x88aaff, dark: 0x0c1228,
      stats: 'VIT +2',  apply: d => { d.vitality += 2; } },
    { id: 'academic',   name: 'Acadêmico',  color: 0xffcc44, dark: 0x1e1608,
      stats: 'INT+1 FOR+1', apply: d => { d.intelligence += 1; d.strength += 1; } },
    { id: 'practical',  name: 'Prático',    color: 0x44ee88, dark: 0x0a1e14,
      stats: 'AGI+1 VIT+1', apply: d => { d.agility += 1; d.vitality += 1; } },
];

export class CharacterCreationScene extends Phaser.Scene {
    constructor() { super('CharacterCreation'); }

    create() {
        this._appearance  = { ...APPEARANCE_DEFAULTS };
        this._difficulty  = 'medium';
        this._class       = 'mage';
        this._trajectory  = 'autodidact';
        this._name        = '';
        this._nameCursor  = true;
        this._nameActive  = true;

        this._buildAtmosphere();
        this._buildHeader();
        this._buildLeftPanel();
        this._buildRightPanel();
        this._refreshAll();

        this.time.addEvent({ delay: 530, loop: true, callback: () => {
            this._nameCursor = !this._nameCursor;
            this._renderName();
        }});

        this.input.keyboard.on('keydown', this._onKey.bind(this));
        this.cameras.main.fadeIn(450, 0, 0, 0);
    }

    // ── Atmosphere ─────────────────────────────────────────────────────────────

    _buildAtmosphere() {
        this.add.rectangle(0, 0, W, H, 0x020108).setOrigin(0);
        for (const [nx, ny, nr, nc, na, dur] of [
            [W * 0.15, H * 0.35, 140, 0x2200aa, 0.06, 3800],
            [W * 0.82, H * 0.65, 120, 0x002288, 0.05, 4200],
            [W * 0.50, H * 0.85, 170, 0x220055, 0.04, 3500],
        ]) {
            const g = this.add.graphics();
            g.fillStyle(nc, na);
            g.fillCircle(nx, ny, nr);
            this.tweens.add({ targets: g, alpha: { from: 0.5, to: 1.3 }, duration: dur, yoyo: true, repeat: -1, delay: Math.random() * 1800 });
        }
        for (let i = 0; i < 90; i++) {
            const s = this.add.rectangle(Math.random() * W, Math.random() * H, 1, 1, 0xffffff, Math.random() * 0.5 + 0.08);
            this.tweens.add({ targets: s, alpha: 0.04, duration: 1200 + Math.random() * 2400, yoyo: true, repeat: -1, delay: Math.random() * 2200 });
        }
    }

    // ── Header ─────────────────────────────────────────────────────────────────

    _buildHeader() {
        this.add.text(W / 2, 18, 'CRIAR PERSONAGEM', {
            fontSize: '17px', color: '#d4af37', fontFamily: 'Courier New',
            fontStyle: 'bold', letterSpacing: 4,
        }).setOrigin(0.5, 0.5).setDepth(4);
        const hg = this.add.graphics().setDepth(3);
        hg.lineStyle(1, 0xd4af37, 0.3);
        hg.lineBetween(10, 34, W - 10, 34);
    }

    // ── Left preview panel ─────────────────────────────────────────────────────

    _buildLeftPanel() {
        const dg = this.add.graphics().setDepth(2);
        dg.lineStyle(1, 0xd4af37, 0.18);
        dg.lineBetween(DIV_X, 38, DIV_X, H - 10);

        const FW = 108, FH = 138, FY = 126;
        this.add.rectangle(PREV_CX, FY, FW, FH, 0x060412, 1).setDepth(2).setStrokeStyle(1, 0xd4af37, 0.5);

        for (const [ox, oy, sx, sy] of [
            [PREV_CX - FW/2, FY - FH/2,  1,  1],
            [PREV_CX + FW/2, FY - FH/2, -1,  1],
            [PREV_CX - FW/2, FY + FH/2,  1, -1],
            [PREV_CX + FW/2, FY + FH/2, -1, -1],
        ]) {
            const og = this.add.graphics().setDepth(3);
            og.lineStyle(1, 0xd4af37, 0.7);
            og.lineBetween(ox, oy, ox + sx * 8, oy);
            og.lineBetween(ox, oy, ox, oy + sy * 8);
        }

        this._previewAura = this.add.circle(PREV_CX, FY, 34, 0x6644ff, 0.13).setDepth(2);
        this.tweens.add({ targets: this._previewAura, alpha: { from: 0.08, to: 0.28 }, scale: { from: 1, to: 1.14 }, duration: 1300, yoyo: true, repeat: -1 });

        this._previewSprite = this.add.image(PREV_CX, FY, 'sprite_player').setScale(3.8).setDepth(3);

        this._namePreview = this.add.text(PREV_CX, FY + FH/2 + 10, 'Aventureiro', {
            fontSize: '13px', color: '#f0e8d0', fontFamily: 'Courier New', fontStyle: 'bold', align: 'center',
        }).setOrigin(0.5, 0).setDepth(3);

        this._classBadge = this.add.text(PREV_CX, FY + FH/2 + 28, '', {
            fontSize: '11px', fontFamily: 'Courier New', fontStyle: 'bold', letterSpacing: 1,
        }).setOrigin(0.5, 0).setDepth(3);

        this._trajBadge = this.add.text(PREV_CX, FY + FH/2 + 44, '', {
            fontSize: '10px', color: '#666688', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0).setDepth(3);

        const sg = this.add.graphics().setDepth(2);
        sg.lineStyle(1, 0xd4af37, 0.12);
        sg.lineBetween(16, FY + FH/2 + 60, DIV_X - 10, FY + FH/2 + 60);

        const STATS_DEF = [
            { key: 'str', label: 'FOR', color: 0xff5533 },
            { key: 'int', label: 'INT', color: 0x6644ff },
            { key: 'agi', label: 'AGI', color: 0x33cc66 },
            { key: 'vit', label: 'VIT', color: 0xffbb33 },
        ];
        const sbY0 = FY + FH/2 + 68;
        const sbX  = 12;
        const barW = 90;
        this._statBars = {};
        STATS_DEF.forEach(({ key, label, color }, i) => {
            const sy = sbY0 + i * 22;
            this.add.text(sbX, sy, label, {
                fontSize: '10px', color: '#555577', fontFamily: 'Courier New',
            }).setOrigin(0, 0.5).setDepth(3);
            this.add.rectangle(sbX + 26, sy, barW, 6, 0x08061a, 1)
                .setOrigin(0, 0.5).setDepth(2).setStrokeStyle(1, 0x181630, 1);
            const fill = this.add.rectangle(sbX + 26, sy, barW * 5 / 8, 6, color, 0.75)
                .setOrigin(0, 0.5).setDepth(3);
            this._statBars[key] = { fill, barW, color };
        });

        this._diffBadge = this.add.text(PREV_CX, H - 22, '', {
            fontSize: '10px', fontFamily: 'Courier New', fontStyle: 'bold', letterSpacing: 1,
        }).setOrigin(0.5, 0.5).setDepth(3);
    }

    // ── Right options panel ────────────────────────────────────────────────────

    _buildRightPanel() {
        let y = 42;

        y = this._section(y, 'IDENTIDADE');
        y = this._buildNameRow(y) + 4;
        y = this._buildGenderRow(y) + 6;

        y = this._section(y, 'APARÊNCIA');
        y = this._buildSwatchRow(y, 'PELE',   SKIN_TONES,  'skin') + 3;
        y = this._buildSwatchRow(y, 'CABELO', HAIR_COLORS, 'hair') + 3;
        y = this._buildSwatchRow(y, 'TÚNICA', ROBE_COLORS, 'robe') + 6;

        y = this._section(y, 'CLASSE');
        y = this._buildClassCards(y) + 6;

        y = this._section(y, 'TRAJETÓRIA');
        y = this._buildTrajectoryRow(y) + 6;

        y = this._section(y, 'DIFICULDADE');
        this._buildDifficultyRow(y);
        y += 32;
        this._diffDesc = this.add.text(OPT_CX, y, '', {
            fontSize: '10px', color: '#8888aa', fontFamily: 'Courier New',
            align: 'center', wordWrap: { width: OPT_W - 4 },
        }).setOrigin(0.5, 0).setDepth(3);

        this._buildConfirmBtn();
    }

    _section(y, label) {
        const HALF = 52;
        const g = this.add.graphics().setDepth(3);
        g.lineStyle(1, 0xd4af37, 0.18);
        g.lineBetween(OPT_L, y, OPT_CX - HALF, y);
        g.lineBetween(OPT_CX + HALF, y, OPT_R, y);
        this.add.text(OPT_CX, y, label, {
            fontSize: '10px', color: '#8a6c28', fontFamily: 'Courier New',
            fontStyle: 'bold', letterSpacing: 3,
        }).setOrigin(0.5, 0.5).setDepth(4);
        return y + 15;
    }

    _buildNameRow(y) {
        this.add.text(OPT_L, y, 'NOME', {
            fontSize: '11px', color: '#666688', fontFamily: 'Courier New', letterSpacing: 2,
        }).setOrigin(0, 0.5).setDepth(3);

        const inX = OPT_L + 42, inW = OPT_W - 44;
        this._inputBg = this.add.rectangle(inX, y, inW, 22, 0x07041a, 1)
            .setOrigin(0, 0.5).setDepth(3).setStrokeStyle(1, 0xd4af37, 0.6);
        this._nameText = this.add.text(inX + 6, y, '', {
            fontSize: '13px', color: '#f0e8d0', fontFamily: 'Courier New',
        }).setOrigin(0, 0.5).setDepth(4);

        this._inputBg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => { this._nameActive = true; });
        return y + 26;
    }

    _buildGenderRow(y) {
        this.add.text(OPT_L, y, 'GÊNERO', {
            fontSize: '11px', color: '#666688', fontFamily: 'Courier New', letterSpacing: 2,
        }).setOrigin(0, 0.5).setDepth(3);

        this._genderTx = this.add.text(OPT_CX, y, '', {
            fontSize: '13px', color: '#f0e8d0', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0.5).setDepth(4);

        const arrowStyle = { fontSize: '16px', color: '#6655cc', fontFamily: 'Courier New', fontStyle: 'bold' };
        const makeArrow = (ax, label, cb) => {
            const btn = this.add.rectangle(ax, y, 22, 20, 0x0d0a1e, 1)
                .setOrigin(0.5, 0.5).setDepth(3).setStrokeStyle(1, 0x4433aa, 0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => btn.setFillStyle(0x1a1630))
                .on('pointerout',  () => btn.setFillStyle(0x0d0a1e))
                .on('pointerdown', cb);
            this.add.text(ax, y, label, arrowStyle).setOrigin(0.5, 0.5).setDepth(4);
        };
        makeArrow(OPT_L + 54, '‹', () => this._cycle('gender', GENDERS, -1));
        makeArrow(OPT_R - 5,  '›', () => this._cycle('gender', GENDERS, +1));
        return y + 22;
    }

    _buildSwatchRow(y, label, list, field) {
        this.add.text(OPT_L, y, label, {
            fontSize: '11px', color: '#666688', fontFamily: 'Courier New', letterSpacing: 2,
        }).setOrigin(0, 0.5).setDepth(3);

        const labelW = label === 'PELE' ? 36 : 52;
        const SW = 15, GAP = 4;
        const swStart = OPT_L + labelW + 4;
        const swatches = list.map((item, i) => {
            const sx = swStart + i * (SW + GAP);
            const sq = this.add.rectangle(sx, y, SW, SW, item.hex, 1)
                .setOrigin(0, 0.5).setDepth(3).setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this._appearance[field] = item.id;
                    this._refreshSprite();
                    this._refreshSwatches();
                });
            const ring = this.add.rectangle(sx + SW / 2, y, SW + 4, SW + 4, 0, 0)
                .setOrigin(0.5, 0.5).setDepth(2.5).setStrokeStyle(1.5, 0xd4af37, 0);
            return { item, sq, ring, field };
        });
        if (!this._allSwatches) this._allSwatches = [];
        this._allSwatches.push(...swatches);
        return y + 19;
    }

    _buildClassCards(y) {
        const cardW = Math.floor((OPT_W - 8) / 3);
        const cardH = 70;
        this._classCards = [];
        CLASSES.forEach((cls, i) => {
            const cx = OPT_L + i * (cardW + 4);
            const hexStr = '#' + cls.color.toString(16).padStart(6, '0');

            const bg = this.add.rectangle(cx, y, cardW, cardH, cls.dark, 1)
                .setOrigin(0, 0).setDepth(3).setStrokeStyle(1, cls.color, 0.4)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => { if (this._class !== cls.id) bg.setFillStyle(cls.dark + 0x060408); })
                .on('pointerout',  () => { if (this._class !== cls.id) bg.setFillStyle(cls.dark); })
                .on('pointerdown', () => this._selectClass(cls.id));

            this.add.text(cx + cardW / 2, y + 14, cls.icon, {
                fontSize: '17px', color: hexStr, fontFamily: 'Courier New',
            }).setOrigin(0.5, 0.5).setDepth(4);
            this.add.text(cx + cardW / 2, y + 30, cls.name.toUpperCase(), {
                fontSize: '10px', color: '#e8e0d0', fontFamily: 'Courier New', fontStyle: 'bold', letterSpacing: 1,
            }).setOrigin(0.5, 0.5).setDepth(4);
            this.add.text(cx + cardW / 2, y + 44, cls.stats, {
                fontSize: '10px', color: hexStr, fontFamily: 'Courier New',
            }).setOrigin(0.5, 0.5).setDepth(4);
            this.add.text(cx + cardW / 2, y + 59, cls.lore, {
                fontSize: '9px', color: '#555577', fontFamily: 'Courier New',
                align: 'center', wordWrap: { width: cardW - 4 },
            }).setOrigin(0.5, 0.5).setDepth(4);

            this._classCards.push({ id: cls.id, bg, color: cls.color, dark: cls.dark });
        });
        return y + cardH;
    }

    _buildTrajectoryRow(y) {
        const pillW = Math.floor((OPT_W - 8) / 3);
        const pillH = 28;
        this._trajPills = {};
        TRAJECTORIES.forEach((traj, i) => {
            const px = OPT_L + i * (pillW + 4);
            const hexStr = '#' + traj.color.toString(16).padStart(6, '0');
            const pill = this.add.rectangle(px, y, pillW, pillH, traj.dark, 1)
                .setOrigin(0, 0).setDepth(3).setStrokeStyle(1, traj.color, 0.35)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this._selectTrajectory(traj.id));
            const nameTx = this.add.text(px + pillW / 2, y + 10, traj.name, {
                fontSize: '11px', color: hexStr, fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0.5, 0.5).setDepth(4);
            const statTx = this.add.text(px + pillW / 2, y + 21, traj.stats, {
                fontSize: '9px', color: '#555577', fontFamily: 'Courier New',
            }).setOrigin(0.5, 0.5).setDepth(4);
            this._trajPills[traj.id] = { pill, nameTx, statTx, color: traj.color, dark: traj.dark };
        });
        return y + pillH;
    }

    _buildDifficultyRow(y) {
        const diffIds = Object.keys(DIFFICULTIES);
        const pillW   = Math.floor((OPT_W - 4 * 4) / 5);
        const pillH   = 26;
        this._diffPills = {};
        diffIds.forEach((id, i) => {
            const diff   = DIFFICULTIES[id];
            const px     = OPT_L + i * (pillW + 4);
            const col    = parseInt(diff.color.replace('#', ''), 16);
            const pill   = this.add.rectangle(px, y, pillW, pillH, 0x08061a, 1)
                .setOrigin(0, 0).setDepth(3).setStrokeStyle(1, col, 0.35)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this._selectDiff(id));
            const tx = this.add.text(px + pillW / 2, y + pillH / 2, diff.name, {
                fontSize: '10px', color: diff.color, fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0.5, 0.5).setDepth(4);
            this._diffPills[id] = { pill, tx, col };
        });
    }

    _buildConfirmBtn() {
        const bh = 36, bw = OPT_W;
        const bx = OPT_L, by = H - 44;

        const btn = this.add.rectangle(bx, by, bw, bh, 0x081508, 1)
            .setOrigin(0, 0).setDepth(5).setStrokeStyle(1, 0x44cc55, 0.65)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => btn.setFillStyle(0x122012))
            .on('pointerout',  () => btn.setFillStyle(0x081508))
            .on('pointerdown', () => this._confirm());

        const shimmer = this.add.rectangle(bx, by, 0, bh, 0xffffff, 0.04).setOrigin(0, 0).setDepth(5);
        this.tweens.add({ targets: shimmer, width: bw, duration: 2000, delay: 500, ease: 'Quad.Out' });

        this.add.text(bx + bw / 2, by + bh / 2, '⚔   COMEÇAR JORNADA   ⚔', {
            fontSize: '14px', color: '#55ee77', fontFamily: 'Courier New',
            fontStyle: 'bold', letterSpacing: 1,
        }).setOrigin(0.5, 0.5).setDepth(6);
    }

    // ── Selection handlers ─────────────────────────────────────────────────────

    _selectClass(id) {
        this._class = id;
        this._refreshClassCards();
        this._refreshStatBars();
        this._refreshPreview();
    }

    _selectTrajectory(id) {
        this._trajectory = id;
        this._refreshTrajPills();
        this._refreshStatBars();
        this._refreshPreview();
    }

    _selectDiff(id) {
        this._difficulty = id;
        this._refreshDiffPills();
    }

    _cycle(field, list, dir) {
        const ids = list.map(o => o.id);
        const idx = ids.indexOf(this._appearance[field]);
        this._appearance[field] = ids[((idx + dir) % ids.length + ids.length) % ids.length];
        this._refreshSprite();
        this._refreshTexts();
    }

    // ── Refresh methods ────────────────────────────────────────────────────────

    _refreshAll() {
        this._refreshSprite();
        this._refreshTexts();
        this._refreshSwatches();
        this._refreshClassCards();
        this._refreshTrajPills();
        this._refreshDiffPills();
        this._refreshStatBars();
        this._refreshPreview();
        this._renderName();
    }

    _refreshSprite() {
        buildPlayerSprite(this, this._appearance);
        this._previewSprite.setTexture('sprite_player');
        const cls = CLASSES.find(c => c.id === this._class);
        if (cls) this._previewAura.setFillStyle(cls.color, 0.13);
    }

    _refreshTexts() {
        const get = (list, id) => list.find(o => o.id === id)?.name || '?';
        this._genderTx.setText(get(GENDERS, this._appearance.gender));
    }

    _renderName() {
        const display = this._name + (this._nameActive && this._nameCursor ? '|' : '');
        this._nameText.setText(display);
        this._namePreview.setText(this._name.trim() || 'Aventureiro');
    }

    _refreshSwatches() {
        if (!this._allSwatches) return;
        for (const { item, sq, ring, field } of this._allSwatches) {
            const active = this._appearance[field] === item.id;
            ring.setStrokeStyle(1.5, 0xd4af37, active ? 1 : 0);
            sq.setAlpha(active ? 1 : 0.45);
        }
    }

    _refreshClassCards() {
        if (!this._classCards) return;
        this._classCards.forEach(({ id, bg, color, dark }) => {
            const active = id === this._class;
            bg.setFillStyle(active ? dark + 0x0a060e : dark);
            bg.setStrokeStyle(1, color, active ? 0.95 : 0.3);
        });
    }

    _refreshTrajPills() {
        if (!this._trajPills) return;
        Object.entries(this._trajPills).forEach(([id, { pill, nameTx, color, dark }]) => {
            const active = id === this._trajectory;
            pill.setFillStyle(active ? dark + 0x080608 : dark);
            pill.setStrokeStyle(1, color, active ? 0.9 : 0.3);
            nameTx.setAlpha(active ? 1 : 0.55);
        });
        const traj = TRAJECTORIES.find(t => t.id === this._trajectory);
        if (this._trajBadge) this._trajBadge.setText(traj?.name || '');
    }

    _refreshDiffPills() {
        if (!this._diffPills) return;
        Object.entries(this._diffPills).forEach(([id, { pill, tx, col }]) => {
            const active = id === this._difficulty;
            pill.setFillStyle(active ? 0x14103a : 0x08061a);
            pill.setStrokeStyle(1, col, active ? 0.95 : 0.3);
            tx.setAlpha(active ? 1 : 0.45);
        });
        const diff = DIFFICULTIES[this._difficulty];
        if (this._diffDesc) this._diffDesc.setText(diff.desc);
        if (this._diffBadge) this._diffBadge.setText(diff.name.toUpperCase()).setColor(diff.color);
    }

    _refreshStatBars() {
        if (!this._statBars) return;
        const sim = { strength: 5, intelligence: 5, agility: 5, vitality: 5 };
        const cls  = CLASSES.find(c => c.id === this._class);
        const traj = TRAJECTORIES.find(t => t.id === this._trajectory);
        if (cls?.id === 'mage')        sim.intelligence += 3;
        if (cls?.id === 'warrior')     sim.strength     += 3;
        if (cls?.id === 'explorer')    sim.agility      += 3;
        if (traj?.id === 'autodidact') sim.vitality     += 2;
        if (traj?.id === 'academic')   { sim.intelligence += 1; sim.strength += 1; }
        if (traj?.id === 'practical')  { sim.agility += 1; sim.vitality += 1; }

        const map = { str: sim.strength, int: sim.intelligence, agi: sim.agility, vit: sim.vitality };
        const maxVal = 10;
        Object.entries(map).forEach(([key, val]) => {
            const bar = this._statBars[key];
            if (!bar) return;
            this.tweens.add({ targets: bar.fill, width: Math.floor(bar.barW * Math.min(val / maxVal, 1)), duration: 200, ease: 'Quad.Out' });
        });
    }

    _refreshPreview() {
        const cls = CLASSES.find(c => c.id === this._class);
        const hexStr = cls ? '#' + cls.color.toString(16).padStart(6, '0') : '#aaaaaa';
        if (this._classBadge) this._classBadge.setText(cls?.name?.toUpperCase() || '').setColor(hexStr);
    }

    // ── Keyboard input ─────────────────────────────────────────────────────────

    _onKey(event) {
        if (!this._nameActive) return;
        const k = event.key;
        if (k === 'Backspace') {
            this._name = this._name.slice(0, -1);
        } else if (k === 'Enter') {
            this._confirm();
            return;
        } else if (k === 'Tab') {
            this._cycle('gender', GENDERS, +1);
            return;
        } else if (k.length === 1 && this._name.length < 16) {
            this._name += k;
        }
        this._renderName();
    }

    // ── Confirm ────────────────────────────────────────────────────────────────

    _confirm() {
        const name = this._name.trim() || 'Aventureiro';
        const data = JSON.parse(JSON.stringify(PLAYER_DEFAULTS));
        data.name        = name;
        data.difficulty  = this._difficulty;
        data.appearance  = { ...this._appearance };
        data.playerClass = this._class;
        data.trajectory  = this._trajectory;

        const cls = CLASSES.find(c => c.id === this._class);
        if (cls) cls.apply(data);
        const traj = TRAJECTORIES.find(t => t.id === this._trajectory);
        if (traj) traj.apply(data);

        this.registry.set('player', data);
        this.cameras.main.fadeOut(450, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('World');
            this.scene.launch('UI');
        });
    }
}
