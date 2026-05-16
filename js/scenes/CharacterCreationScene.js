import { GENDERS, HAIR_COLORS, ROBE_COLORS, SKIN_TONES, APPEARANCE_DEFAULTS } from '../data/appearance.js';
import { buildPlayerSprite } from '../utils/Draw.js';
import { PLAYER_DEFAULTS, DIFFICULTIES } from '../constants.js';

const W = 544, H = 480;

const PREV_CX   = 86;
const DIV_X     = 172;
const OPT_L     = DIV_X + 10;
const OPT_R     = W - 6;
const OPT_W     = OPT_R - OPT_L;
const OPT_CX    = OPT_L + OPT_W / 2;

const SCROLL_TOP = 42;
const SCROLL_BOT = H - 52;
const SCROLL_H   = SCROLL_BOT - SCROLL_TOP; // 386

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
      stats: 'VIT +2',       apply: d => { d.vitality += 2; } },
    { id: 'academic',   name: 'Acadêmico',  color: 0xffcc44, dark: 0x1e1608,
      stats: 'INT+1 FOR+1',  apply: d => { d.intelligence += 1; d.strength += 1; } },
    { id: 'practical',  name: 'Prático',    color: 0x44ee88, dark: 0x0a1e14,
      stats: 'AGI+1 VIT+1',  apply: d => { d.agility += 1; d.vitality += 1; } },
];

export class CharacterCreationScene extends Phaser.Scene {
    constructor() { super('CharacterCreation'); }

    create() {
        this._appearance = { ...APPEARANCE_DEFAULTS };
        this._difficulty = 'medium';
        this._class      = 'mage';
        this._trajectory = 'autodidact';
        this._name       = '';
        this._nameCursor = true;
        this._nameActive = true;
        this._scrollY    = 0;
        this._maxScroll  = 0;
        this._contentH   = 0;

        this._buildAtmosphere();
        this._buildHeader();
        this._buildLeftPanel();
        this._buildScrollPanel();
        this._buildConfirmBtn();
        this._refreshAll();

        this.time.addEvent({ delay: 530, loop: true, callback: () => {
            this._nameCursor = !this._nameCursor;
            this._renderName();
        }});

        this.input.keyboard.on('keydown', this._onKey.bind(this));
        this.input.on('wheel', this._onWheel.bind(this));
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
        }).setOrigin(0.5).setDepth(4);
        const hg = this.add.graphics().setDepth(3);
        hg.lineStyle(1, 0xd4af37, 0.3);
        hg.lineBetween(10, 34, W - 10, 34);

        const backBtn = this.add.text(14, 18, '← MENU', {
            fontSize: '12px', color: '#666655', fontFamily: 'Courier New',
        }).setOrigin(0, 0.5).setDepth(6).setInteractive({ useHandCursor: true });
        backBtn.on('pointerover', () => backBtn.setColor('#d4af37'));
        backBtn.on('pointerout',  () => backBtn.setColor('#666655'));
        backBtn.on('pointerdown', () => this._backToMenu());
    }

    // ── Left preview panel ─────────────────────────────────────────────────────

    _buildLeftPanel() {
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

        const vitalsG = this.add.graphics().setDepth(2);
        vitalsG.lineStyle(1, 0xd4af37, 0.1);
        vitalsG.lineBetween(16, sbY0 + 80, DIV_X - 10, sbY0 + 80);

        this._hpTx = this.add.text(sbX, sbY0 + 92, '', {
            fontSize: '10px', color: '#cc4444', fontFamily: 'Courier New',
        }).setOrigin(0, 0.5).setDepth(3);
        this._focusTx = this.add.text(sbX, sbY0 + 108, '', {
            fontSize: '10px', color: '#4488cc', fontFamily: 'Courier New',
        }).setOrigin(0, 0.5).setDepth(3);

        this._diffBadge = this.add.text(PREV_CX, H - 22, '', {
            fontSize: '10px', fontFamily: 'Courier New', fontStyle: 'bold', letterSpacing: 1,
        }).setOrigin(0.5).setDepth(3);
    }

    // ── Scrollable right panel ─────────────────────────────────────────────────

    _buildScrollPanel() {
        // Vertical divider (world space, not in container)
        const dg = this.add.graphics().setDepth(2);
        dg.lineStyle(1, 0xd4af37, 0.18);
        dg.lineBetween(DIV_X, 38, DIV_X, H - 10);

        // Geometry mask — clips container to the scroll area in world space
        const maskGfx = this.make.graphics({ add: false });
        maskGfx.fillStyle(0xffffff, 1);
        maskGfx.fillRect(OPT_L, SCROLL_TOP, OPT_W - 6, SCROLL_H);
        const mask = maskGfx.createGeometryMask();

        // Container: x=0 (world x = local x), y=SCROLL_TOP (local y=0 = top of scroll area)
        this._sc = this.add.container(0, SCROLL_TOP).setDepth(3);
        this._sc.setMask(mask);

        let y = 8;

        y = this._section(y, 'IDENTIDADE');
        y = this._buildNameRow(y) + 10;
        y = this._buildGenderRow(y) + 14;

        y = this._section(y, 'APARÊNCIA');
        y = this._buildSwatchRow(y, 'PELE',   SKIN_TONES,  'skin') + 6;
        y = this._buildSwatchRow(y, 'CABELO', HAIR_COLORS, 'hair') + 6;
        y = this._buildSwatchRow(y, 'TÚNICA', ROBE_COLORS, 'robe') + 14;

        y = this._section(y, 'CLASSE');
        y = this._buildClassCards(y) + 14;

        y = this._section(y, 'TRAJETÓRIA');
        y = this._buildTrajectoryRow(y) + 14;

        y = this._section(y, 'DIFICULDADE');
        y = this._buildDifficultyPills(y) + 8;

        this._diffDesc = this.add.text(OPT_CX, y, '', {
            fontSize: '12px', color: '#8888aa', fontFamily: 'Courier New',
            align: 'center', wordWrap: { width: OPT_W - 16 },
        }).setOrigin(0.5, 0);
        this._sc.add(this._diffDesc);
        y += 52;

        this._contentH  = y + 10;
        this._maxScroll = Math.max(0, this._contentH - SCROLL_H);

        // Scrollbar track
        const sbX = OPT_R - 3;
        this.add.rectangle(sbX, SCROLL_TOP, 3, SCROLL_H, 0x141228, 1)
            .setOrigin(0.5, 0).setDepth(4);
        this._sbThumb = this.add.rectangle(sbX, SCROLL_TOP, 3, 40, 0x4a4070, 0.85)
            .setOrigin(0.5, 0).setDepth(5);
        this._updateScrollbar();
    }

    // All _section / _build* methods add children to this._sc
    _sc_add(...objs) { this._sc.add(objs.flat()); }

    _section(y, label) {
        const HALF = 52;
        const g = this.add.graphics();
        g.lineStyle(1, 0xd4af37, 0.18);
        g.lineBetween(OPT_L, y, OPT_CX - HALF, y);
        g.lineBetween(OPT_CX + HALF, y, OPT_R - 8, y);
        const tx = this.add.text(OPT_CX, y, label, {
            fontSize: '11px', color: '#8a6c28', fontFamily: 'Courier New',
            fontStyle: 'bold', letterSpacing: 3,
        }).setOrigin(0.5);
        this._sc_add(g, tx);
        return y + 18;
    }

    _buildNameRow(y) {
        const lbl = this.add.text(OPT_L + 4, y, 'NOME', {
            fontSize: '13px', color: '#666688', fontFamily: 'Courier New', letterSpacing: 2,
        }).setOrigin(0, 0.5);

        const inX = OPT_L + 54, inW = OPT_W - 62;
        this._inputBg = this.add.rectangle(inX, y, inW, 28, 0x07041a, 1)
            .setOrigin(0, 0.5).setStrokeStyle(1, 0xd4af37, 0.6);
        this._nameText = this.add.text(inX + 7, y, '', {
            fontSize: '14px', color: '#f0e8d0', fontFamily: 'Courier New',
        }).setOrigin(0, 0.5);

        this._inputBg.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => { this._nameActive = true; });

        this._sc_add(lbl, this._inputBg, this._nameText);
        return y + 32;
    }

    _buildGenderRow(y) {
        const lbl = this.add.text(OPT_L + 4, y, 'GÊNERO', {
            fontSize: '13px', color: '#666688', fontFamily: 'Courier New', letterSpacing: 2,
        }).setOrigin(0, 0.5);

        this._genderTx = this.add.text(OPT_CX, y, '', {
            fontSize: '14px', color: '#f0e8d0', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5);

        const arrowStyle = { fontSize: '18px', color: '#6655cc', fontFamily: 'Courier New', fontStyle: 'bold' };
        const objs = [lbl, this._genderTx];
        const makeArrow = (ax, arrow, cb) => {
            const btn = this.add.rectangle(ax, y, 26, 26, 0x0d0a1e, 1)
                .setOrigin(0.5).setStrokeStyle(1, 0x4433aa, 0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => btn.setFillStyle(0x1a1630))
                .on('pointerout',  () => btn.setFillStyle(0x0d0a1e))
                .on('pointerdown', cb);
            objs.push(btn, this.add.text(ax, y, arrow, arrowStyle).setOrigin(0.5));
        };
        makeArrow(OPT_L + 62, '‹', () => this._cycle('gender', GENDERS, -1));
        makeArrow(OPT_R - 10, '›', () => this._cycle('gender', GENDERS, +1));
        this._sc_add(objs);
        return y + 28;
    }

    _buildSwatchRow(y, label, list, field) {
        const lbl = this.add.text(OPT_L + 4, y, label, {
            fontSize: '13px', color: '#666688', fontFamily: 'Courier New', letterSpacing: 2,
        }).setOrigin(0, 0.5);

        const labelW = label === 'PELE' ? 42 : 62;
        const SW = 18, GAP = 5;
        const swStart = OPT_L + labelW + 6;
        const objs = [lbl];

        const swatches = list.map((item, i) => {
            const cx = swStart + i * (SW + GAP) + SW / 2;
            const sq = this.add.rectangle(cx, y, SW, SW, item.hex, 1)
                .setOrigin(0.5).setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this._appearance[field] = item.id;
                    this._refreshSprite();
                    this._refreshSwatches();
                });
            const ring = this.add.rectangle(cx, y, SW + 4, SW + 4, 0, 0)
                .setOrigin(0.5).setStrokeStyle(2, 0xd4af37, 0);
            objs.push(sq, ring);
            return { item, sq, ring, field };
        });

        if (!this._allSwatches) this._allSwatches = [];
        this._allSwatches.push(...swatches);
        this._sc_add(objs);
        return y + SW + 8;
    }

    _buildClassCards(y) {
        const cardW = Math.floor((OPT_W - 12) / 3);
        const cardH = 95; // Slightly taller for more breathing room
        this._classCards = [];
        const objs = [];

        CLASSES.forEach((cls, i) => {
            const cx = OPT_L + i * (cardW + 6);
            const hex = '#' + cls.color.toString(16).padStart(6, '0');

            const bg = this.add.rectangle(cx, y, cardW, cardH, cls.dark, 1)
                .setOrigin(0, 0).setStrokeStyle(1, cls.color, 0.4)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => { if (this._class !== cls.id) bg.setFillStyle(cls.dark + 0x060408); })
                .on('pointerout',  () => { if (this._class !== cls.id) bg.setFillStyle(cls.dark); })
                .on('pointerdown', () => this._selectClass(cls.id));

            const mx = cx + cardW / 2;
            objs.push(
                bg,
                this.add.text(mx, y + 15, cls.icon,            { fontSize: '18px', color: hex, fontFamily: 'Courier New' }).setOrigin(0.5),
                this.add.text(mx, y + 34, cls.name.toUpperCase(), { fontSize: '10px', color: '#e8e0d0', fontFamily: 'Courier New', fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5),
                this.add.text(mx, y + 50, cls.stats,            { fontSize: '9px', color: hex, fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0.5),
                this.add.text(mx, y + 72, cls.lore,             { fontSize: '10px', color: '#777799', fontFamily: 'Courier New', align: 'center', wordWrap: { width: cardW - 6 }, lineSpacing: -2 }).setOrigin(0.5),
            );
            this._classCards.push({ id: cls.id, bg, color: cls.color, dark: cls.dark });
        });

        this._sc_add(objs);
        return y + cardH;
    }

    _buildTrajectoryRow(y) {
        const pillW = Math.floor((OPT_W - 12) / 3);
        const pillH = 44; // Slightly taller
        this._trajPills = {};
        const objs = [];

        TRAJECTORIES.forEach((traj, i) => {
            const px  = OPT_L + i * (pillW + 6);
            const hex = '#' + traj.color.toString(16).padStart(6, '0');
            const pill = this.add.rectangle(px, y, pillW, pillH, traj.dark, 1)
                .setOrigin(0, 0).setStrokeStyle(1, traj.color, 0.35)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this._selectTrajectory(traj.id));
            const nameTx = this.add.text(px + pillW/2, y + 15, traj.name, {
                fontSize: '11px', color: hex, fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0.5);
            const statTx = this.add.text(px + pillW/2, y + 30, traj.stats, {
                fontSize: '9px', color: '#666688', fontFamily: 'Courier New', fontStyle: 'bold'
            }).setOrigin(0.5);
            objs.push(pill, nameTx, statTx);
            this._trajPills[traj.id] = { pill, nameTx, statTx, color: traj.color, dark: traj.dark };
        });

        this._sc_add(objs);
        return y + pillH;
    }

    _buildDifficultyPills(y) {
        const diffIds = Object.keys(DIFFICULTIES);
        const cols = 2;
        const gap  = 6;
        const pillW = Math.floor((OPT_W - 12 - gap) / cols);
        const pillH = 28;
        this._diffPills = {};
        const objs = [];

        diffIds.forEach((id, i) => {
            const diff = DIFFICULTIES[id];
            const row  = Math.floor(i / cols);
            const colIdx = i % cols;
            const px   = OPT_L + 4 + colIdx * (pillW + gap);
            const py   = y + row * (pillH + gap);
            const col  = parseInt(diff.color.replace('#', ''), 16);
            
            const pill = this.add.rectangle(px, py, pillW, pillH, 0x08061a, 1)
                .setOrigin(0, 0).setStrokeStyle(1, col, 0.35)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this._selectDiff(id));
            const tx = this.add.text(px + pillW/2, py + pillH/2, diff.name, {
                fontSize: '11px', color: diff.color, fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0.5);
            objs.push(pill, tx);
            this._diffPills[id] = { pill, tx, col };
        });

        this._sc_add(objs);
        return y + Math.ceil(diffIds.length / cols) * (pillH + gap);
    }

    // ── Confirm button (fixed, outside scroll) ─────────────────────────────────

    _buildConfirmBtn() {
        const bh = 36, bw = OPT_W - 6;
        const bx = OPT_L;
        const by = SCROLL_BOT + Math.floor((H - SCROLL_BOT - bh) / 2);

        const sep = this.add.graphics().setDepth(4);
        sep.lineStyle(1, 0xd4af37, 0.22);
        sep.lineBetween(OPT_L, SCROLL_BOT, OPT_R, SCROLL_BOT);

        this._confirmBtn = this.add.rectangle(bx, by, bw, bh, 0x081508, 1)
            .setOrigin(0, 0).setDepth(5).setStrokeStyle(1, 0x44cc55, 0.65)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => { if (this._name.trim()) this._confirmBtn.setFillStyle(0x122012); })
            .on('pointerout',  () => { if (this._name.trim()) this._confirmBtn.setFillStyle(0x081508); })
            .on('pointerdown', () => this._confirm());

        const shimmer = this.add.rectangle(bx, by, 0, bh, 0xffffff, 0.04).setOrigin(0, 0).setDepth(5);
        this.tweens.add({ targets: shimmer, width: bw, duration: 2000, delay: 500, ease: 'Quad.Out' });

        this._confirmTx = this.add.text(bx + bw / 2, by + bh / 2, '⚔   COMEÇAR JORNADA   ⚔', {
            fontSize: '14px', color: '#55ee77', fontFamily: 'Courier New', fontStyle: 'bold', letterSpacing: 1,
        }).setOrigin(0.5).setDepth(6);

        this._nameWarning = this.add.text(bx + bw / 2, by - 12, 'Digite um nome para continuar', {
            fontSize: '10px', color: '#ff5555', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(6).setVisible(false);
    }

    // ── Scroll ─────────────────────────────────────────────────────────────────

    _onWheel(pointer, _go, _dx, deltaY) {
        if (pointer.x < OPT_L || pointer.x > OPT_R) return;
        if (pointer.y < SCROLL_TOP || pointer.y > SCROLL_BOT) return;
        this._scrollY = Phaser.Math.Clamp(this._scrollY - deltaY * 0.6, -this._maxScroll, 0);
        this._sc.setY(SCROLL_TOP + this._scrollY);
        this._updateScrollbar();
    }

    _updateScrollbar() {
        if (!this._sbThumb) return;
        if (this._maxScroll <= 0) { this._sbThumb.setAlpha(0); return; }
        this._sbThumb.setAlpha(0.85);
        const thumbH = Math.max(24, Math.round((SCROLL_H / this._contentH) * SCROLL_H));
        const frac   = (-this._scrollY) / this._maxScroll;
        this._sbThumb.setY(SCROLL_TOP + Math.round(frac * (SCROLL_H - thumbH)));
        this._sbThumb.setDisplaySize(3, thumbH);
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

    // ── Refresh ────────────────────────────────────────────────────────────────

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
        this._refreshConfirmBtn();
    }

    _refreshConfirmBtn() {
        if (!this._confirmBtn) return;
        const hasName = this._name.trim().length > 0;
        
        this._confirmBtn.setAlpha(hasName ? 1 : 0.3);
        this._confirmTx.setAlpha(hasName ? 1 : 0.3);
        this._confirmBtn.input.enabled = hasName;
        this._nameWarning.setVisible(!hasName);
    }

    _refreshSwatches() {
        if (!this._allSwatches) return;
        for (const { item, sq, ring, field } of this._allSwatches) {
            const active = this._appearance[field] === item.id;
            ring.setStrokeStyle(2, 0xd4af37, active ? 1 : 0);
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
        Object.entries(map).forEach(([key, val]) => {
            const bar = this._statBars[key];
            if (!bar) return;
            this.tweens.add({ targets: bar.fill, width: Math.floor(bar.barW * Math.min(val / 10, 1)), duration: 200, ease: 'Quad.Out' });
        });

        const hp    = PLAYER_DEFAULTS.maxHp    + (cls?.id === 'warrior' ? 20 : 0);
        const focus = PLAYER_DEFAULTS.maxFocus  + (cls?.id === 'mage'    ? 15 : 0);
        if (this._hpTx)    this._hpTx.setText(`HP    ${String(hp).padStart(3, ' ')}`);
        if (this._focusTx) this._focusTx.setText(`FOCO  ${String(focus).padStart(3, ' ')}`);
    }

    _refreshPreview() {
        const cls = CLASSES.find(c => c.id === this._class);
        const hex = cls ? '#' + cls.color.toString(16).padStart(6, '0') : '#aaaaaa';
        if (this._classBadge) this._classBadge.setText(cls?.name?.toUpperCase() || '').setColor(hex);
    }

    // ── Keyboard ───────────────────────────────────────────────────────────────

    _onKey(event) {
        const k = event.key;
        if (k === 'Escape') { this._backToMenu(); return; }
        if (!this._nameActive) return;
        if (k === 'Backspace') {
            this._name = this._name.slice(0, -1);
        } else if (k === 'Enter') {
            this._confirm(); return;
        } else if (k === 'Tab') {
            this._cycle('gender', GENDERS, +1); return;
        } else if (k.length === 1 && this._name.length < 16) {
            this._name += k;
        }
        this._renderName();
    }

    _backToMenu() {
        this.cameras.main.fadeOut(350, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MainMenu'));
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
