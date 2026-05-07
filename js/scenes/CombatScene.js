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
        const W = 544;
        const isElite = this._monsterDef.name.startsWith('Elite');

        // Dark overlay over WorldScene
        this.add.rectangle(0, 0, W, 480, 0x050201, 0.94).setOrigin(0, 0);

        // Header tinted with element color
        const elem = ELEMENTS[this._monsterDef.element] || ELEMENTS.air;
        const headerColor = isElite ? 0x443300 : elem.dark;
        const borderColor = isElite ? 0xffd700 : elem.color;

        this.add.rectangle(0, 0, W, 28, headerColor, 1).setOrigin(0, 0);
        this.add.rectangle(0, 26, W, 2, borderColor, 1).setOrigin(0, 0);
        
        const elemHex = isElite ? '#ffd700' : ('#' + elem.color.toString(16).padStart(6, '0'));
        const labelText = isElite ? `⭐ COMBATE ELITE — ${elem.topicLabel.toUpperCase()} ⭐` : `[${elem.symbol}] COMBATE — ${elem.topicLabel.toUpperCase()}`;
        
        this.add.text(W / 2, 14, labelText, {
            fontSize: '12px', color: elemHex, fontFamily: 'Courier New', fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        this._buildMonsterPanel();
        this._buildPlayerPanel();

        // VS
        this.add.text(W / 2, 90, 'VS', {
            fontSize: '22px', color: isElite ? '#ffd700' : '#d4af37', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        // Separator
        this.add.rectangle(0, 158, W, 2, 0x554422, 1).setOrigin(0, 0);

        this._buildQuestionBox();
        this._buildBottomBar();

        this.input.keyboard.on('keydown', this._onKeyDown.bind(this));
    }

    _buildMonsterPanel() {
        const elem = ELEMENTS[this._monsterDef.element] || ELEMENTS.normal || ELEMENTS.air;

        // Panel background tinted with element color
        const bgDark = elem.dark || 0x1a0000;
        this.add.rectangle(8, 28, 196, 130, bgDark, 1).setOrigin(0, 0);
        this.add.rectangle(8, 28, 196, 130, elem.color, 0).setOrigin(0, 0)
            .setStrokeStyle(1, elem.color, 0.5);
        // Flash overlay (used for damage flashes)
        this._monsterFlashRect = this.add.rectangle(8, 28, 196, 130, 0xff0000, 0).setOrigin(0, 0);

        // Sprite with elemental glow
        this._monsterPanelCenter = { x: 60, y: 88 };
        const texKey = `sprite_${this._monsterDef.id}`;
        if (this.textures.exists(texKey)) {
            const aura = this.add.circle(60, 88, 32, elem.color, 0.18);
            this.tweens.add({ targets: aura, alpha: 0.35, scale: 1.1, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this._monsterSprite = this.add.image(60, 88, texKey).setScale(2.5);
        }

        this.add.text(112, 36, this._monsterDef.name, {
            fontSize: '11px', color: '#ffffff', fontFamily: 'Courier New', wordWrap: { width: 86 },
        }).setOrigin(0, 0);
        this.add.text(112, 54, `Nv. ${this._monsterDef.level}`, {
            fontSize: '10px', color: '#ffaa44', fontFamily: 'Courier New',
        }).setOrigin(0, 0);

        // Element badge
        const badgeColorHex = '#' + elem.color.toString(16).padStart(6, '0');
        this.add.text(112, 68, `[${elem.symbol}] ${elem.name}`, {
            fontSize: '10px', color: badgeColorHex, fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0, 0);

        // HP label
        this.add.text(112, 86, 'HP', { fontSize: '9px', color: '#888888', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this._mHpGfx = this.add.graphics();
        this._mHpTxt = this.add.text(135, 86, '', { fontSize: '10px', color: '#ff8888', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0, 0);
        this._updateMonsterBar();
    }

    _buildPlayerPanel() {
        this.add.rectangle(340, 28, 196, 130, 0x001a0a, 1).setOrigin(0, 0);
        this.add.rectangle(340, 28, 196, 130, 0x44cc44, 0).setOrigin(0, 0).setStrokeStyle(1, 0x44cc44, 0.4);
        this._playerFlashRect   = this.add.rectangle(340, 28, 196, 130, 0xff0000, 0).setOrigin(0, 0);
        this._playerPanelCenter = { x: 510, y: 90 };

        const p = this._player;
        if (this.textures.exists('sprite_player')) {
            this.add.image(490, 90, 'sprite_player').setScale(1.4);
        }

        this.add.text(346, 36, p.name || 'Aventureiro', {
            fontSize: '11px', color: '#88ff88', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0, 0);
        this.add.text(346, 52, `Nv. ${p.level}`, {
            fontSize: '10px', color: '#ffaa44', fontFamily: 'Courier New',
        }).setOrigin(0, 0);

        this.add.text(346, 70, 'HP',   { fontSize: '9px', color: '#888888', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this.add.text(346, 96, 'FOCO', { fontSize: '9px', color: '#888888', fontFamily: 'Courier New' }).setOrigin(0, 0);

        this._pVitalsGfx = this.add.graphics();
        this._pHpTxt     = this.add.text(380, 70,  '', { fontSize: '10px', color: '#ff8888', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0, 0);
        this._pFocusTxt  = this.add.text(380, 96,  '', { fontSize: '10px', color: '#88aaff', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0, 0);
        this._streakTxt  = this.add.text(530, 38,  '', { fontSize: '11px', color: '#ffaa44', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(1, 0);
        this._updatePlayerBars();
    }

    _buildQuestionBox() {
        const W = 544;
        this.add.rectangle(8, 160, W - 16, 200, 0x0a0804, 1).setOrigin(0, 0);
        this.add.rectangle(8, 160, W - 16, 200, 0x554422, 0).setOrigin(0, 0).setStrokeStyle(1, 0x554422);
        this.add.text(W / 2, 168, 'Q U E S T Ã O', {
            fontSize: '10px', color: '#554422', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0);

        this._ctxTxt = this.add.text(16, 186, '', {
            fontSize: '10px', color: '#999999', fontFamily: 'Courier New', fontStyle: 'italic',
            wordWrap: { width: 512 },
        }).setOrigin(0, 0).setVisible(false);

        this._qTxt = this.add.text(16, 186, '', {
            fontSize: '12px', color: '#ffffff', fontFamily: 'Courier New',
            wordWrap: { width: 512 }, lineSpacing: 3,
        }).setOrigin(0, 0);

        // Choice buttons (4 max, 2 columns × 2 rows)
        this._aBtns = [];
        for (let i = 0; i < 4; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = 10 + col * 262;
            const by = 296 + row * 34;
            const bg = this.add.rectangle(bx, by, 256, 28, 0x111122, 1)
                .setOrigin(0, 0).setInteractive()
                .on('pointerover', () => { if (!this._answerLock) bg.setFillStyle(0x22224a); })
                .on('pointerout',  () => { if (!this._answerLock) bg.setFillStyle(0x111122); });
            const tx = this.add.text(bx + 8, by + 14, '', {
                fontSize: '11px', color: '#cccccc', fontFamily: 'Courier New', wordWrap: { width: 238 },
            }).setOrigin(0, 0.5);
            this._aBtns.push({ bg, tx });
        }

        // Numeric input
        this._numPrt = this.add.text(14, 296, '>> DIGITE A RESPOSTA NO TECLADO E PRESSIONE ENTER:', {
            fontSize: '11px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0, 0).setVisible(false);
        this._numDisp = this.add.text(14, 314, '', {
            fontSize: '18px', color: '#ffffff', fontFamily: 'Courier New',
        }).setOrigin(0, 0).setVisible(false);
        this._numCursor = this.add.text(14, 314, '_', {
            fontSize: '18px', color: '#ffd700', fontFamily: 'Courier New',
        }).setOrigin(0, 0).setVisible(false);
        this._numOkBg = this.add.rectangle(14, 346, 130, 26, 0x1a3a1a, 1).setOrigin(0, 0)
            .setInteractive()
            .on('pointerover', () => this._numOkBg.setFillStyle(0x2a5a2a))
            .on('pointerout',  () => this._numOkBg.setFillStyle(0x1a3a1a))
            .on('pointerdown', () => this._submitNumeric())
            .setVisible(false);
        this._numOkTx = this.add.text(79, 359, 'CONFIRMAR', {
            fontSize: '11px', color: '#88ff88', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0.5).setVisible(false);

        // Feedback + explanation
        this._feedbackTxt = this.add.text(W / 2, 366, '', {
            fontSize: '11px', fontFamily: 'Courier New', wordWrap: { width: 512 },
        }).setOrigin(0.5, 0).setVisible(false);

        this._explTxt = this.add.text(14, 386, '', {
            fontSize: '10px', color: '#888888', fontFamily: 'Courier New', wordWrap: { width: 516 },
        }).setOrigin(0, 0);
    }

    _buildBottomBar() {
        const W = 544;
        this.add.rectangle(0, 436, W, 44, 0x080604, 1).setOrigin(0, 0);

        // Hint button
        const hintBg = this.add.rectangle(8, 442, 162, 28, 0x111133, 1).setOrigin(0, 0)
            .setInteractive()
            .on('pointerover', () => hintBg.setFillStyle(0x222255))
            .on('pointerout',  () => hintBg.setFillStyle(0x111133))
            .on('pointerdown', () => this._useHint());
        this.add.text(89, 456, 'DICA  (−10 Foco)', {
            fontSize: '10px', color: '#aaaaff', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0.5);

        // Flee button
        const fleeBg = this.add.rectangle(376, 442, 120, 28, 0x2a1000, 1).setOrigin(0, 0)
            .setInteractive()
            .on('pointerover', () => fleeBg.setFillStyle(0x441800))
            .on('pointerout',  () => fleeBg.setFillStyle(0x2a1000))
            .on('pointerdown', () => this._flee());
        this.add.text(436, 456, 'FUGIR', {
            fontSize: '10px', color: '#ff8844', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0.5);

        // Scratchpad (Calculator) button
        const calcBg = this.add.rectangle(178, 442, 190, 28, 0x051a05, 1).setOrigin(0, 0)
            .setInteractive()
            .on('pointerover', () => calcBg.setFillStyle(0x0a2a0a))
            .on('pointerout',  () => calcBg.setFillStyle(0x051a05))
            .on('pointerdown', () => this._openScratchpad());
        this.add.text(273, 456, 'NOTAS / CALC (N)', {
            fontSize: '10px', color: '#88ff88', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0.5);

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
        const LABELS = ['A', 'B', 'C', 'D'];
        for (let i = 0; i < this._aBtns.length; i++) {
            const { bg, tx } = this._aBtns[i];
            if (i < options.length) {
                const col = i % 2, row = Math.floor(i / 2);
                const by  = startY + row * 34;
                bg.setY(by).setFillStyle(0x111122).setVisible(true);
                tx.setY(by + 14).setText(`${LABELS[i]}) ${options[i]}`).setVisible(true);
                bg.removeAllListeners('pointerdown');
                const answer = options[i];
                bg.on('pointerdown', () => { if (!this._answerLock) this._onAnswer(answer, bg); });
            } else {
                bg.setVisible(false);
                tx.setVisible(false);
            }
        }
    }

    _hideChoiceBtns() {
        for (const { bg, tx } of this._aBtns) {
            bg.setVisible(false).removeAllListeners('pointerdown');
            tx.setVisible(false);
        }
    }

    _showNumericInput(startY) {
        this._numPrt.setY(startY).setVisible(true);
        this._numDisp.setY(startY + 18).setText('').setVisible(true);
        // Animated cursor for clear "type here" hint
        this._numCursor.setY(startY + 18).setX(14).setVisible(true).setAlpha(1);
        if (!this._cursorTween) {
            this._cursorTween = this.tweens.add({
                targets: this._numCursor, alpha: 0.2, duration: 500, yoyo: true, repeat: -1,
            });
        }
        this._numOkBg.setY(startY + 48).setVisible(true);
        this._numOkTx.setY(startY + 61).setVisible(true);
    }

    _hideNumericInput() {
        this._numPrt.setVisible(false);
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

    _updateMonsterBar() {
        const pct = Math.max(0, this._monsterHp / this._monsterDef.maxHp);
        const g   = this._mHpGfx;
        g.clear();
        g.fillStyle(0x220000); g.fillRect(112, 96, 86, 10);
        g.fillStyle(0xff3333); g.fillRect(112, 96, Math.max(0, Math.floor(86 * pct)), 10);
        g.fillStyle(0xff8888, 0.4); g.fillRect(112, 96, Math.max(0, Math.floor(86 * pct)), 3);
        this._mHpTxt.setText(`${this._monsterHp}/${this._monsterDef.maxHp}`);
    }

    _updatePlayerBars() {
        const p    = this._player;
        const hPct = Math.max(0, p.hp / p.maxHp);
        const fPct = Math.max(0, p.focus / p.maxFocus);
        const g    = this._pVitalsGfx;
        g.clear();
        // HP bar (with gradient effect using two layers)
        g.fillStyle(0x220000); g.fillRect(346, 84, 130, 10);
        g.fillStyle(0xff3333); g.fillRect(346, 84, Math.floor(130 * hPct), 10);
        g.fillStyle(0xff8888, 0.4); g.fillRect(346, 84, Math.floor(130 * hPct), 3);
        // Focus bar
        g.fillStyle(0x000a22); g.fillRect(346, 110, 130, 10);
        g.fillStyle(0x3355ff); g.fillRect(346, 110, Math.floor(130 * fPct), 10);
        g.fillStyle(0x88aaff, 0.4); g.fillRect(346, 110, Math.floor(130 * fPct), 3);

        this._pHpTxt.setText(`${p.hp}/${p.maxHp}`);
        this._pFocusTxt.setText(`${p.focus}/${p.maxFocus}`);
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

            for (const itemId of lootIds) {
                CombatSystem.addToInventory(this._player, itemId);
                const name = ITEMS[itemId]?.name;
                if (name) lootNames.push(name);
            }

            bookIds = BookSystem.rollBookDrops(this._monsterDef.id.replace('Elite ', ''));
            for (const bookId of bookIds) {
                BookSystem.addBook(this._player, bookId);
                const b = BOOKS[bookId];
                if (b) lootNames.push(`Livro: ${b.title}`);
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
