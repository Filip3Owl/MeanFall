import { CombatSystem }                from '../systems/CombatSystem.js';
import { QuestionEngine }                from '../systems/QuestionEngine.js';
import { awardXP, awardElementalXP }           from '../systems/XPSystem.js';
import { BookSystem }                    from '../systems/BookSystem.js';
import { ITEMS, DROP_TABLES, RARITY_COLORS } from '../data/items.js';
import { BOOKS, BOOK_IMPORTANCE }        from '../data/books.js';
import { ELEMENTS, FLEE_XP_PENALTY, TOPIC_TO_ELEMENT }     from '../constants.js';
import EventBus                          from '../utils/EventBus.js';

export class CombatScene extends Phaser.Scene {
    constructor() { super('Combat'); }

    init(data) {
        this._monsterDef   = data.monster;
        this._instanceId   = data.instanceId;
        this._monsterHp    = data.monster.maxHp;
        this._streak       = 0;
        this._recentIds    = [];
        this._currentQ     = null;
        this._answerLock   = false;
        this._numericValue = '';
    }

    create() {
        this._player = JSON.parse(JSON.stringify(this.registry.get('player')));
        this._buildUI();
        this._nextQuestion();

        // ── Entrance Animation ──────────────────────────────────────────────
        this.cameras.main.fadeIn(300, 0, 0, 0);

        if (this._monsterSprite) {
            const finalScale = 2.5;
            this._monsterSprite.setScale(0).setAlpha(0);
            this.tweens.add({
                targets: this._monsterSprite,
                scale: finalScale,
                alpha: 1,
                duration: 600,
                delay: 100,
                ease: 'Back.easeOut'
            });
        }
    }

    // ─── UI CONSTRUCTION ──────────────────────────────────────────────────────

    _buildUI() {
        const W = 544, H = 480;
        const isElite = this._monsterDef.name.startsWith('Elite');
        const elem     = ELEMENTS[this._monsterDef.element] || ELEMENTS.normal;
        const eColor   = isElite ? 0xffd700 : elem.color;
        const eDark    = isElite ? 0x2a1a00 : elem.dark;
        const eHex     = '#' + eColor.toString(16).padStart(6, '0');
        // eTextHex = accent (always brighter than eColor) → safe for text on dark bg
        const eAccent  = isElite ? 0xffd700 : elem.accent;
        const eTextHex = '#' + eAccent.toString(16).padStart(6, '0');

        // ── Deep void background ─────────────────────────────────────────
        this.add.rectangle(0, 0, W, H, 0x020106, 0.97).setOrigin(0, 0);

        // Subtle ambient elemental glow at corners
        const gfx = this.add.graphics();
        gfx.fillStyle(eColor, 0.06);
        gfx.fillRect(0, 0, W / 2, H / 2);
        gfx.fillStyle(0x000000, 0.0);

        // ── Ornamental top header ────────────────────────────────────────
        this.add.rectangle(0, 0, W, 32, eDark, 1).setOrigin(0, 0);
        this.add.rectangle(0, 31, W, 1, eColor, 0.9).setOrigin(0, 0);
        this.add.rectangle(0, 32, W, 1, 0x000000, 0.6).setOrigin(0, 0);

        // Corner runes
        this.add.text(8, 6, '⟨ ⟩', { fontSize: '11px', color: eTextHex, fontFamily: 'Courier New' }).setOrigin(0, 0).setAlpha(0.7);
        this.add.text(W - 8, 6, '⟨ ⟩', { fontSize: '11px', color: eTextHex, fontFamily: 'Courier New' }).setOrigin(1, 0).setAlpha(0.7);

        const titleStr = isElite
            ? `✦  ENCONTRO ELITE  ·  ${elem.topicLabel.toUpperCase()}  ✦`
            : `[ ${elem.symbol} ]  COMBATE  ·  ${elem.topicLabel.toUpperCase()}`;
        this.add.text(W / 2, 16, titleStr, {
            fontSize: '11px', color: eTextHex, fontFamily: 'Courier New', fontStyle: 'bold', letterSpacing: 1,
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5, 0.5);

        // ── Build panels ─────────────────────────────────────────────────
        this._buildMonsterPanel(elem, eColor, eDark, eHex, eTextHex, isElite);
        this._buildPlayerPanel(eColor, eHex, eTextHex, isElite);

        // ── VS divider ───────────────────────────────────────────────────
        const vsColor = isElite ? '#ffe55a' : '#f5c842';
        this.add.text(W / 2, 92, 'VS', {
            fontSize: '18px', color: vsColor, fontFamily: 'Courier New', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5, 0.5);

        // ── Horizontal divider ───────────────────────────────────────────
        const divGfx = this.add.graphics();
        divGfx.lineStyle(1, eColor, 0.35);
        divGfx.lineBetween(12, 162, W - 12, 162);
        divGfx.lineStyle(1, 0xffffff, 0.04);
        divGfx.lineBetween(12, 163, W - 12, 163);

        // ── Question zone ────────────────────────────────────────────────
        this._buildQuestionBox(eColor, eHex, eTextHex, isElite);
        this._buildBottomBar(eColor, eHex, isElite);

        this.input.keyboard.on('keydown', this._onKeyDown.bind(this));
    }

    _buildMonsterPanel(elem, eColor, eDark, eHex, eTextHex, isElite) {
        const PX = 8, PY = 32, PW = 258, PH = 128;

        // Background
        this.add.rectangle(PX, PY, PW, PH, eDark, 1).setOrigin(0, 0);
        this.add.rectangle(PX, PY, PW, PH, eColor, 0).setOrigin(0, 0).setStrokeStyle(1, eColor, 0.45);
        // Top accent line
        this.add.rectangle(PX, PY, PW, 2, eColor, 0.6).setOrigin(0, 0);

        // Flash overlay
        this._monsterFlashRect = this.add.rectangle(PX, PY, PW, PH, 0xff2222, 0).setOrigin(0, 0);

        // Sprite zone (left 100px)
        this._monsterPanelCenter = { x: PX + 50, y: PY + 64 };
        const texKey = `sprite_${this._monsterDef.id}`;
        if (this.textures.exists(texKey)) {
            const aura = this.add.circle(PX + 50, PY + 64, 36, eColor, 0.12).setDepth(0);
            this.tweens.add({ targets: aura, alpha: 0.28, scale: 1.15, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this._monsterSprite = this.add.image(PX + 50, PY + 64, texKey).setScale(2.4).setDepth(1);
        }

        // Info panel (right side)
        const ix = PX + 108;
        this.add.text(ix, PY + 10, this._monsterDef.name.toUpperCase(), {
            fontSize: '10px', color: '#f0e8d8', fontFamily: 'Courier New', fontStyle: 'bold',
            wordWrap: { width: 148 },
        }).setOrigin(0, 0);

        // Level + element badge
        const badgeBg = this.add.rectangle(ix, PY + 32, 60, 14, eColor, 0.2).setOrigin(0, 0).setStrokeStyle(1, eColor, 0.5);
        this.add.text(ix + 30, PY + 39, `${elem.symbol} · Nv.${this._monsterDef.level}`, {
            fontSize: '9px', color: eTextHex, fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        // HP label row
        this.add.text(ix, PY + 52, 'HP', { fontSize: '9px', color: '#aa9988', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0, 0);
        this._mHpTxt = this.add.text(PX + PW - 6, PY + 52, '', { fontSize: '9px', color: '#ffbbaa', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(1, 0);

        // HP bar graphics
        this._mHpGfx = this.add.graphics();
        this._updateMonsterBar();

        // Flavor text
        if (this._monsterDef.flavor) {
            this.add.text(ix, PY + 86, this._monsterDef.flavor, {
                fontSize: '8px', color: '#998877', fontFamily: 'Courier New', fontStyle: 'italic',
                wordWrap: { width: 148 }, lineSpacing: 1,
            }).setOrigin(0, 0);
        }
    }

    _buildPlayerPanel(eColor, eHex, eTextHex, isElite) {
        const PX = 278, PY = 32, PW = 258, PH = 128;
        const p = this._player;

        // Background
        this.add.rectangle(PX, PY, PW, PH, 0x001a08, 1).setOrigin(0, 0);
        this.add.rectangle(PX, PY, PW, PH, 0x33cc66, 0).setOrigin(0, 0).setStrokeStyle(1, 0x33cc66, 0.35);
        this.add.rectangle(PX, PY, PW, 2, 0x44dd77, 0.5).setOrigin(0, 0);

        // Flash
        this._playerFlashRect   = this.add.rectangle(PX, PY, PW, PH, 0xff2222, 0).setOrigin(0, 0);
        this._playerPanelCenter = { x: PX + PW - 50, y: PY + 64 };

        // Sprite
        if (this.textures.exists('sprite_player')) {
            const aura = this.add.circle(PX + PW - 50, PY + 64, 30, 0x44ff88, 0.08);
            this.tweens.add({ targets: aura, alpha: 0.2, scale: 1.1, duration: 1300, yoyo: true, repeat: -1 });
            this.add.image(PX + PW - 50, PY + 64, 'sprite_player').setScale(1.5).setDepth(1);
        }

        // Info (left side of panel)
        const ix = PX + 8;
        this.add.text(ix, PY + 10, (p.name || 'Aventureiro').toUpperCase(), {
            fontSize: '10px', color: '#88ffaa', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0, 0);

        // Level badge
        this.add.rectangle(ix, PY + 32, 56, 14, 0x44cc66, 0.18).setOrigin(0, 0).setStrokeStyle(1, 0x44cc66, 0.5);
        this.add.text(ix + 28, PY + 39, `Nv. ${p.level}`, {
            fontSize: '9px', color: '#88ffaa', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        // HP / FOCO labels
        this.add.text(ix, PY + 52, 'HP',   { fontSize: '9px', color: '#aa9988', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0, 0);
        this.add.text(ix, PY + 78, 'FOCO', { fontSize: '9px', color: '#aa9988', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0, 0);

        this._pHpTxt    = this.add.text(PX + PW - 108, PY + 52, '', { fontSize: '9px', color: '#ffbbaa', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0, 0);
        this._pFocusTxt = this.add.text(PX + PW - 108, PY + 78, '', { fontSize: '9px', color: '#bbccff', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0, 0);

        // Streak text (top-right of whole panel row)
        this._streakTxt = this.add.text(PX + PW - 6, PY + 8, '', {
            fontSize: '11px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(1, 0);

        this._pVitalsGfx = this.add.graphics();
        this._updatePlayerBars();
    }

    _buildQuestionBox(eColor, eHex, eTextHex, isElite) {
        const W = 544;
        const QY = 166, QH = 270;

        // Background
        this.add.rectangle(8, QY, W - 16, QH, 0x060409, 1).setOrigin(0, 0);

        // Ornamental frame
        const fg = this.add.graphics();
        fg.lineStyle(1, eColor, 0.3);
        fg.strokeRect(8, QY, W - 16, QH);
        fg.lineStyle(1, eColor, 0.12);
        fg.strokeRect(11, QY + 3, W - 22, QH - 6);

        // Corner ornaments
        const cornerSz = 8;
        fg.lineStyle(2, eColor, 0.55);
        [[8, QY], [W - 8, QY], [8, QY + QH], [W - 8, QY + QH]].forEach(([cx, cy]) => {
            const sx = cx === 8 ? 1 : -1, sy = cy === QY ? 1 : -1;
            fg.lineBetween(cx, cy, cx + sx * cornerSz, cy);
            fg.lineBetween(cx, cy, cx, cy + sy * cornerSz);
        });

        // Section title
        this.add.text(W / 2, QY + 8, '◆  P E R G U N T A  ◆', {
            fontSize: '9px', color: eTextHex, fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0).setAlpha(0.8);

        // Thin title separator
        fg.lineStyle(1, eColor, 0.15);
        fg.lineBetween(30, QY + 20, W - 30, QY + 20);

        // Context text
        this._ctxTxt = this.add.text(16, QY + 24, '', {
            fontSize: '10px', color: '#aabbcc', fontFamily: 'Courier New', fontStyle: 'italic',
            wordWrap: { width: W - 32 },
        }).setOrigin(0, 0).setVisible(false);

        // Question text
        this._qTxt = this.add.text(16, QY + 24, '', {
            fontSize: '12px', color: '#ede8de', fontFamily: 'Courier New',
            wordWrap: { width: W - 32 }, lineSpacing: 4,
        }).setOrigin(0, 0);

        // Choice buttons (built dynamically in _showChoiceBtns)
        this._aBtns = [];
        for (let i = 0; i < 4; i++) {
            const col = i % 2, row = Math.floor(i / 2);
            const bx = 10 + col * 262;
            const by = 306 + row * 36;
            const bg = this.add.rectangle(bx, by, 256, 30, 0x0d0b18, 1)
                .setOrigin(0, 0).setStrokeStyle(1, 0x2a2440, 1).setInteractive()
                .on('pointerover', () => { if (!this._answerLock) { bg.setFillStyle(0x16122a); bg.setStrokeStyle(1, eColor, 0.6); } })
                .on('pointerout',  () => { if (!this._answerLock) { bg.setFillStyle(0x0d0b18); bg.setStrokeStyle(1, 0x2a2440, 1); } });

            // Label badge (A/B/C/D)
            const LABELS = ['A','B','C','D'];
            const badge = this.add.rectangle(bx + 3, by + 3, 24, 24, eColor, 0.25).setOrigin(0, 0).setStrokeStyle(1, eColor, 0.6);
            const badgeTx = this.add.text(bx + 15, by + 15, LABELS[i], {
                fontSize: '10px', color: eTextHex, fontFamily: 'Courier New', fontStyle: 'bold',
                stroke: '#000000', strokeThickness: 2,
            }).setOrigin(0.5, 0.5);

            const tx = this.add.text(bx + 34, by + 15, '', {
                fontSize: '11px', color: '#ddd8cc', fontFamily: 'Courier New', wordWrap: { width: 214 },
            }).setOrigin(0, 0.5);

            this._aBtns.push({ bg, badge, badgeTx, tx });
        }

        // Numeric input
        this._numPrt = this.add.text(14, 306, '▶  DIGITE A RESPOSTA  ·  ENTER para confirmar', {
            fontSize: '10px', color: eTextHex, fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0, 0).setVisible(false);

        // Input box background
        this._numBoxBg = this.add.rectangle(14, 322, W - 28, 28, 0x0a0814, 1).setOrigin(0, 0)
            .setStrokeStyle(1, eColor, 0.4).setVisible(false);
        this._numDisp = this.add.text(22, 336, '', {
            fontSize: '16px', color: '#ffffff', fontFamily: 'Courier New',
        }).setOrigin(0, 0.5).setVisible(false);
        this._numCursor = this.add.text(22, 336, '|', {
            fontSize: '16px', color: eTextHex, fontFamily: 'Courier New',
        }).setOrigin(0, 0.5).setVisible(false);
        this._numOkBg = this.add.rectangle(14, 356, 140, 26, 0x0a2010, 1).setOrigin(0, 0)
            .setStrokeStyle(1, 0x33cc66, 0.6).setInteractive()
            .on('pointerover', () => this._numOkBg.setFillStyle(0x153020))
            .on('pointerout',  () => this._numOkBg.setFillStyle(0x0a2010))
            .on('pointerdown', () => this._submitNumeric())
            .setVisible(false);
        this._numOkTx = this.add.text(84, 369, '✓  CONFIRMAR', {
            fontSize: '11px', color: '#55ee88', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0.5).setVisible(false);

        // Feedback (correct/wrong)
        this._feedbackTxt = this.add.text(W / 2, 376, '', {
            fontSize: '12px', fontFamily: 'Courier New', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3,
            wordWrap: { width: W - 32 },
        }).setOrigin(0.5, 0).setVisible(false);

        // Explanation text
        this._explTxt = this.add.text(16, 396, '', {
            fontSize: '10px', color: '#99bbdd', fontFamily: 'Courier New',
            wordWrap: { width: W - 32 }, fontStyle: 'italic',
        }).setOrigin(0, 0);
    }

    _buildBottomBar(eColor, eHex, isElite) {
        const W = 544;
        const BY = 438;

        // Bar background
        this.add.rectangle(0, BY - 1, W, 1, eColor, 0.2).setOrigin(0, 0);
        this.add.rectangle(0, BY, W, 42, 0x040206, 1).setOrigin(0, 0);

        const btnStyle = (fillColor, borderColor, label, textColor, x, w) => {
            const bg = this.add.rectangle(x, BY + 6, w, 28, fillColor, 1).setOrigin(0, 0)
                .setStrokeStyle(1, borderColor, 0.5).setInteractive()
                .on('pointerover', () => bg.setFillStyle(fillColor + 0x0a0a0a))
                .on('pointerout',  () => bg.setFillStyle(fillColor));
            this.add.text(x + w / 2, BY + 20, label, {
                fontSize: '10px', color: textColor, fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0.5, 0.5);
            return bg;
        };

        // DICA
        const hintBg = btnStyle(0x080818, 0x5555bb, '◈  DICA  (−10 FOCO)', '#aaaaff', 8, 168);
        hintBg.on('pointerdown', () => this._useHint());

        // NOTAS/CALC
        const calcBg = btnStyle(0x060e06, 0x338833, '✦  NOTAS / CALC  [N]', '#55cc66', 184, 176);
        calcBg.on('pointerdown', () => this._openScratchpad());

        // FUGIR
        const fleeBg = btnStyle(0x180808, 0xaa3322, '⊗  FUGIR', '#ee6644', 368, 100);
        fleeBg.on('pointerdown', () => this._flee());

        // Extra separator before Fugir
        const sepGfx = this.add.graphics();
        sepGfx.lineStyle(1, 0x331100, 0.8);
        sepGfx.lineBetween(362, BY + 6, 362, BY + 34);

        this.input.keyboard.on('keydown-N', () => this._openScratchpad());
    }

    _openScratchpad() {
        if (this.scene.isActive('Scratchpad')) return;
        this.scene.launch('Scratchpad', { parent: this });
    }

    // ─── QUESTION FLOW ────────────────────────────────────────────────────────

    _nextQuestion() {
        const area    = this._player.currentArea;
        const mastery = this._player.mastery[area] || { attempted: 0, correct: 0, wrongIds: [] };
        const q = QuestionEngine.getQuestion(
            this._monsterDef.questionTopic,
            this._monsterDef.questionDifficulty,
            mastery,
            this._recentIds
        );

        if (!q) { this._endCombat('flee'); return; }

        this._currentQ = QuestionEngine.shuffleOptions(q);
        this._recentIds.push(q.id);
        if (this._recentIds.length > 6) this._recentIds.shift();

        this._answerLock   = false;
        this._numericValue = '';
        this._feedbackTxt.setVisible(false);
        this._explTxt.setText('');

        this._renderQuestion();
    }

    _renderQuestion() {
        const q = this._currentQ;
        let y = 186;

        if (q.context) {
            this._ctxTxt.setY(y).setText(`Contexto: ${q.context}`).setVisible(true);
            y += this._ctxTxt.height + 4;
        } else {
            this._ctxTxt.setVisible(false);
        }

        this._qTxt.setY(y).setText(q.questionText);
        // Clamp options start between 284-296 so they don't drift too far
        const optY = Math.min(Math.max(y + this._qTxt.height + 8, 284), 296);

        if (q.type === 'fill_numeric') {
            this._hideChoiceBtns();
            this._showNumericInput(optY);
        } else {
            this._hideNumericInput();
            this._showChoiceBtns(q.options || [], optY);
        }
    }

    _showChoiceBtns(options, startY) {
        for (let i = 0; i < this._aBtns.length; i++) {
            const { bg, badge, badgeTx, tx } = this._aBtns[i];
            if (i < options.length) {
                const col = i % 2, row = Math.floor(i / 2);
                const by  = startY + row * 36;
                bg.setY(by).setFillStyle(0x0d0b18).setVisible(true);
                badge.setY(by + 3).setVisible(true);
                badgeTx.setY(by + 15).setVisible(true);
                tx.setY(by + 15).setText(options[i]).setVisible(true);
                bg.removeAllListeners('pointerdown');
                const answer = options[i];
                bg.on('pointerdown', () => { if (!this._answerLock) this._onAnswer(answer, bg); });
            } else {
                bg.setVisible(false);
                badge.setVisible(false);
                badgeTx.setVisible(false);
                tx.setVisible(false);
            }
        }
    }

    _hideChoiceBtns() {
        for (const { bg, badge, badgeTx, tx } of this._aBtns) {
            bg.setVisible(false).removeAllListeners('pointerdown');
            badge.setVisible(false);
            badgeTx.setVisible(false);
            tx.setVisible(false);
        }
    }

    _showNumericInput(startY) {
        this._numPrt.setY(startY).setVisible(true);
        this._numBoxBg.setY(startY + 16).setVisible(true);
        this._numDisp.setY(startY + 30).setText('').setVisible(true);
        this._numCursor.setY(startY + 30).setX(22).setVisible(true).setAlpha(1);
        if (!this._cursorTween) {
            this._cursorTween = this.tweens.add({
                targets: this._numCursor, alpha: 0.1, duration: 500, yoyo: true, repeat: -1,
            });
        }
        this._numOkBg.setY(startY + 50).setVisible(true);
        this._numOkTx.setY(startY + 63).setVisible(true);
    }

    _hideNumericInput() {
        this._numPrt.setVisible(false);
        this._numBoxBg?.setVisible(false);
        this._numDisp.setVisible(false);
        this._numCursor.setVisible(false);
        this._numOkBg.setVisible(false);
        this._numOkTx.setVisible(false);
    }

    _onKeyDown(event) {
        if (!this._currentQ || this._currentQ.type !== 'fill_numeric' || this._answerLock) return;
        if (event.key === 'Enter')     { this._submitNumeric(); return; }
        if (event.key === 'Backspace') { this._numericValue = this._numericValue.slice(0, -1); }
        else if (/^[-0-9.,]$/.test(event.key)) { this._numericValue += event.key; }
        this._numDisp.setText(this._numericValue);
        this._numCursor.setX(14 + this._numDisp.width + 2);
    }

    _submitNumeric() {
        if (!this._answerLock && this._numericValue) this._onAnswer(this._numericValue, null);
    }

    // ─── ANSWER HANDLING ──────────────────────────────────────────────────────

    _onAnswer(userAnswer, btnBg) {
        if (this._answerLock) return;
        this._answerLock = true;

        const q       = this._currentQ;
        const correct = QuestionEngine.checkAnswer(q, userAnswer);
        const area    = this._player.currentArea;
        const mastery = this._player.mastery[area];
        mastery.attempted++;

        if (correct) {
            this._streak++;
            mastery.correct++;
            mastery.wrongIds = mastery.wrongIds.filter(id => id !== q.id);

            // Award Elemental XP based on topic
            const elementId = TOPIC_TO_ELEMENT[q.topic] || 'normal';
            awardElementalXP(this._player, elementId, 15);

            // Resolve weapon element from equipped item (live lookup)
            const weaponId = this._player.equipment?.rightHand || this._player.equipment?.leftHand;
            const weaponInfo = ITEMS[weaponId] || null;
            this._player._weaponElement = weaponInfo?.element || 'normal';

            const result = CombatSystem.calcPlayerDamage(this._player, this._monsterDef, this._streak, weaponInfo);
            this._monsterHp = Math.max(0, this._monsterHp - result.damage);
            this._updateMonsterBar();
            this._spawnDamageNumber(this._monsterPanelCenter, result.damage, result.isCrit ? '#ff88cc' : '#ff5555', result.isCrit);
            this._flashTarget('monster', result.advantage === 'super' ? 0xffaa00 : 0xff3333);

            let msg = `Correto! Dano: ${result.damage}`;
            if (result.isCrit)              msg += ' [CRÍTICO!]';
            if (result.advantage === 'super') msg += ' [SUPER EFICAZ!]';
            if (result.advantage === 'weak')  msg += ' [Pouco eficaz...]';
            
            // Add distribution flair
            if (result.distribution === 'uniform') msg += ' (Instável!)';
            else if (weaponInfo) msg += ' (Consistente)';

            this._showFeedback(msg, result.isCrit ? '#ff88cc' : '#55ff88');
            if (btnBg) btnBg.setFillStyle(0x003300);
            if (this._streak > 1) this._streakTxt.setText(`${this._streak}× STREAK!`);

            if (q.explanation) this._explTxt.setText(`Explicação: ${q.explanation}`);

            if (this._monsterHp <= 0) {
                this.time.delayedCall(1500, () => this._endCombat('win'));
                return;
            }
        } else {
            this._streak = 0;
            this._streakTxt.setText('');
            if (!mastery.wrongIds.includes(q.id)) mastery.wrongIds.push(q.id);

            const result = CombatSystem.calcMonsterDamage(this._monsterDef, this._player);
            this._player.hp = Math.max(0, this._player.hp - result.damage);
            this._updatePlayerBars();
            EventBus.emit('player-hp-change', { player: this._player });

            if (result.dodged) {
                this._showFeedback('Errado! Mas você ESQUIVOU o ataque!', '#88ccff');
                this._spawnDamageNumber(this._playerPanelCenter, 'ESQUIVA', '#88ccff', false);
            } else {
                this._showFeedback(`Errado! Dano recebido: ${result.damage}`, '#ff5555');
                this._spawnDamageNumber(this._playerPanelCenter, result.damage, '#ff5555', false);
                this._flashTarget('player', 0xff3333);
            }
            if (btnBg) btnBg.setFillStyle(0x330000);

            if (q.explanation) this._explTxt.setText(`Explicação: ${q.explanation}`);

            if (this._player.hp <= 0) {
                this.time.delayedCall(1500, () => this._endCombat('loss'));
                return;
            }
        }

        this.time.delayedCall(1900, () => this._nextQuestion());
    }

    _spawnDamageNumber(center, value, color, big) {
        if (!center) return;
        
        // Screen shake on hit
        this.cameras.main.shake(big ? 250 : 150, big ? 0.012 : 0.006);

        // Sprite jump/shake
        const targetSprite = center === this._monsterPanelCenter ? this._monsterSprite : null;
        if (targetSprite) {
            this.tweens.add({
                targets: targetSprite,
                x: center.x + (big ? 10 : 5),
                yoyo: true, duration: 50, repeat: 2,
                onComplete: () => targetSprite.setX(center.x)
            });
        }

        const txt = this.add.text(center.x, center.y - 10, String(value), {
            fontSize: big ? '24px' : '16px', color, fontFamily: 'Courier New', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5, 0.5).setDepth(50);
        this.tweens.add({
            targets: txt, y: center.y - 60, alpha: 0,
            duration: 1100, ease: 'Cubic.Out',
            onComplete: () => txt.destroy(),
        });
    }

    _flashTarget(who, color) {
        const target = who === 'monster' ? this._monsterFlashRect : this._playerFlashRect;
        if (!target) return;
        target.setFillStyle(color, 0.5);
        this.tweens.add({
            targets: target, alpha: 0,
            duration: 280, ease: 'Quad.Out',
            onComplete: () => target.setAlpha(1).setFillStyle(color, 0),
        });
    }

    _showFeedback(msg, color) {
        this._feedbackTxt.setText(msg).setColor(color).setVisible(true);
    }

    // ─── BAR RENDERING ────────────────────────────────────────────────────────

    _drawBar(g, x, y, w, h, pct, baseColor, dangerColor) {
        const color  = pct < 0.3 ? dangerColor : baseColor;
        const filled = Math.max(0, Math.floor(w * pct));
        g.fillStyle(0x0a0008);       g.fillRect(x, y, w, h);
        if (filled > 0) {
            g.fillStyle(color, 0.85); g.fillRect(x, y, filled, h);
            g.fillStyle(0xffffff, 0.18); g.fillRect(x, y, filled, Math.ceil(h * 0.4));
        }
        // Tick marks at 25%, 50%, 75%
        g.fillStyle(0x000000, 0.4);
        [0.25, 0.5, 0.75].forEach(t => { const tx = x + Math.floor(w * t); g.fillRect(tx, y, 1, h); });
        // Border
        g.lineStyle(1, color, 0.35); g.strokeRect(x, y, w, h);
    }

    _updateMonsterBar() {
        const pct = Math.max(0, this._monsterHp / this._monsterDef.maxHp);
        const g   = this._mHpGfx;
        g.clear();
        this._drawBar(g, 108, 98, 148, 11, pct, 0xee3333, 0xff0000);
        this._mHpTxt.setText(`${this._monsterHp} / ${this._monsterDef.maxHp}`);
        // Pulse danger when low
        if (pct < 0.3 && this._monsterSprite && !this._dangerPulse) {
            this._dangerPulse = this.tweens.add({ targets: this._monsterSprite, alpha: 0.6, duration: 300, yoyo: true, repeat: -1 });
        } else if (pct >= 0.3 && this._dangerPulse) {
            this._dangerPulse.stop(); this._dangerPulse = null;
            if (this._monsterSprite) this._monsterSprite.setAlpha(1);
        }
    }

    _updatePlayerBars() {
        const p    = this._player;
        const hPct = Math.max(0, p.hp / p.maxHp);
        const fPct = Math.max(0, p.focus / p.maxFocus);
        const g    = this._pVitalsGfx;
        g.clear();
        this._drawBar(g, 286, 62, 148, 11, hPct, 0xdd3333, 0xff0000);
        this._drawBar(g, 286, 88, 148, 11, fPct, 0x3355ee, 0x5566ff);

        this._pHpTxt.setText(`${p.hp} / ${p.maxHp}`);
        this._pFocusTxt.setText(`${p.focus} / ${p.maxFocus}`);
    }

    // ─── ACTIONS ──────────────────────────────────────────────────────────────

    _useHint() {
        if (!this._currentQ?.hint) {
            this._explTxt.setText('Nenhuma dica disponível para esta questão.');
            return;
        }
        if (this._player.focus < 10) {
            this._explTxt.setText('Foco insuficiente para dica! (Necessário: 10)');
            return;
        }
        this._player.focus -= 10;
        this._updatePlayerBars();
        EventBus.emit('player-hp-change', { player: this._player });
        this._explTxt.setText(`Dica: ${this._currentQ.hint}`);
    }

    _flee() {
        // Confirm flee with penalty warning
        const lost = Math.floor((this._player.xp || 0) * FLEE_XP_PENALTY);
        const ok = window.confirm(`Fugir custa ${Math.round(FLEE_XP_PENALTY * 100)}% do XP atual (−${lost} XP). Continuar?`);
        if (!ok) { this._answerLock = false; return; }
        this._player.xp = Math.max(0, (this._player.xp || 0) - lost);
        EventBus.emit('player-xp-change', { player: this._player });
        EventBus.emit('chat', { msg: `Você fugiu e perdeu ${lost} XP.`, type: 'error' });
        this._endCombat('flee');
    }

    // ─── COMBAT END ───────────────────────────────────────────────────────────

    _endCombat(outcome) {
        let xpGained = 0;
        let goldGained = 0;
        const lootNames = [];
        let lootIds = [];
        let bookIds = [];

        if (outcome === 'win') {
            const isElite = this._monsterDef.name.startsWith('Elite');
            xpGained = awardXP(this._player, this._monsterDef.xpReward);
            
            // Base gold
            goldGained = this._monsterDef.goldReward || 0;
            
            // STREAK BONUS: 20% extra gold per streak point above 2
            if (this._streak >= 3) {
                const multiplier = 1 + (this._streak - 2) * 0.2;
                const bonus = Math.floor(goldGained * (multiplier - 1));
                goldGained += bonus;
                EventBus.emit('chat', { msg: `{{gold:STREAK BONUS!}} +${bonus} moedas extras!`, type: 'loot' });
            }

            this._player.gold = (this._player.gold || 0) + goldGained;

            // Roll loot multiple times for Elites (2x rolls)
            const rolls = isElite ? 2 : 1;
            for (let i = 0; i < rolls; i++) {
                const batch = CombatSystem.rollDrops(this._monsterDef.id.replace('Elite ', ''), DROP_TABLES);
                lootIds.push(...batch);
            }

            const RARITY_TAG = { legendary: 'legend', epic: 'epic', rare: 'rare', uncommon: 'loot', common: 'mute' };
            for (const itemId of lootIds) {
                CombatSystem.addToInventory(this._player, itemId);
                const itemDef = ITEMS[itemId];
                if (itemDef) {
                    const tag = RARITY_TAG[itemDef.rarity] || 'loot';
                    lootNames.push(`{{${tag}:${itemDef.name}}}`);
                }
            }

            bookIds = BookSystem.rollBookDrops(this._monsterDef.id.replace('Elite ', ''));
            for (const bookId of bookIds) {
                BookSystem.addBook(this._player, bookId);
                const b = BOOKS[bookId];
                if (b) lootNames.push(`{{hint:Livro: ${b.title}}}`);
            }

            EventBus.emit('player-stats-changed', { player: this._player });
        }

        this.registry.set('player', this._player);

        if (outcome === 'win' && (lootIds.length > 0 || bookIds.length > 0)) {
            this._showVictoryPopup(xpGained, goldGained, lootIds, bookIds, () => {
                this._finishCombat(outcome, xpGained, lootNames);
            });
        } else {
            this._finishCombat(outcome, xpGained, lootNames);
        }
    }

    _finishCombat(outcome, xpGained, lootNames) {
        this.scene.stop('Combat');
        EventBus.emit('combat-end', {
            outcome,
            instanceId: this._instanceId,
            xpGained,
            loot: lootNames,
            playerData: this._player,
        });
    }

    _showVictoryPopup(xp, gold, lootIds, bookIds, onContinue) {
        const W = 544, H = 480;
        const totalRows = Math.min(lootIds.length + bookIds.length, 7);
        this.add.rectangle(0, 0, W, H, 0x000000, 0.85).setOrigin(0, 0).setDepth(100);

        const panelW = 380, panelH = 80 + totalRows * 22 + 60;
        const px2 = (W - panelW) / 2;
        const py2 = (H - panelH) / 2;

        this.add.rectangle(px2, py2, panelW, panelH, 0x0d0a03, 1).setOrigin(0, 0).setDepth(101);
        this.add.rectangle(px2, py2, panelW, panelH, 0xffd700, 0).setOrigin(0, 0).setStrokeStyle(2, 0xffd700).setDepth(101);

        this.add.text(W / 2, py2 + 12, 'VITÓRIA!', {
            fontSize: '18px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0).setDepth(102);

        this.add.text(W / 2, py2 + 38, `+${xp} XP    +${gold} Ouro`, {
            fontSize: '12px', color: '#ffaa44', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0).setDepth(102);

        this.add.text(W / 2, py2 + 60, 'ITENS OBTIDOS:', {
            fontSize: '10px', color: '#888888', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0).setDepth(102);

        let rowIdx = 0;
        lootIds.slice(0, 7 - bookIds.length).forEach((itemId) => {
            const item = ITEMS[itemId];
            if (!item) return;
            const color = RARITY_COLORS[item.rarity] || '#cccccc';
            const yLine = py2 + 78 + rowIdx * 22;
            this.add.rectangle(px2 + 20, yLine, panelW - 40, 18, 0x111111, 1).setOrigin(0, 0).setDepth(102);
            this.add.image(px2 + 32, yLine + 9, item.icon || 'item_potion_red').setScale(0.6).setDepth(102);
            this.add.text(px2 + 46, yLine + 9, item.name, {
                fontSize: '11px', color, fontFamily: 'Courier New',
            }).setOrigin(0, 0.5).setDepth(102);
            this.add.text(px2 + panelW - 28, yLine + 9, (item.rarity || 'common').toUpperCase(), {
                fontSize: '9px', color: '#666666', fontFamily: 'Courier New',
            }).setOrigin(1, 0.5).setDepth(102);
            rowIdx++;
        });

        // Book drops with importance badges
        bookIds.slice(0, 7 - rowIdx).forEach((bookId) => {
            const book = BOOKS[bookId];
            if (!book) return;
            const imp = BOOK_IMPORTANCE[book.importance] || BOOK_IMPORTANCE.normal;
            const yLine = py2 + 78 + rowIdx * 22;
            this.add.rectangle(px2 + 20, yLine, panelW - 40, 18, 0x1a1108, 1).setOrigin(0, 0).setDepth(102);
            this.add.text(px2 + 28, yLine + 9, `[Livro] ${book.title}`, {
                fontSize: '11px', color: imp.hex, fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0, 0.5).setDepth(102);
            this.add.text(px2 + panelW - 28, yLine + 9, imp.name.toUpperCase(), {
                fontSize: '9px', color: imp.hex, fontFamily: 'Courier New',
            }).setOrigin(1, 0.5).setDepth(102);
            rowIdx++;
        });

        const btnY = py2 + panelH - 36;
        const btnBg = this.add.rectangle(W / 2 - 60, btnY, 120, 28, 0x1a3a1a, 1).setOrigin(0, 0).setDepth(102)
            .setInteractive()
            .on('pointerover', () => btnBg.setFillStyle(0x2a5a2a))
            .on('pointerout',  () => btnBg.setFillStyle(0x1a3a1a))
            .on('pointerdown', () => onContinue());
        this.add.text(W / 2, btnY + 14, 'CONTINUAR', {
            fontSize: '12px', color: '#88ff88', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0.5).setDepth(102);

        // Auto-continue after 6s as fallback
        this.time.delayedCall(6000, () => onContinue());
    }

    shutdown() {
        this.input.keyboard.removeAllListeners();
    }
}
