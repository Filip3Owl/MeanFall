import { CombatSystem }          from '../systems/CombatSystem.js';
import { QuestionEngine }         from '../systems/QuestionEngine.js';
import { awardXP }                from '../systems/XPSystem.js';
import { ITEMS, DROP_TABLES }     from '../data/items.js';
import { ELEMENTS }               from '../constants.js';
import EventBus                   from '../utils/EventBus.js';

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
    }

    // ─── UI CONSTRUCTION ──────────────────────────────────────────────────────

    _buildUI() {
        const W = 544;

        // Dark overlay over WorldScene
        this.add.rectangle(0, 0, W, 480, 0x050201, 0.94).setOrigin(0, 0);

        // Header tinted with element color
        const elem = ELEMENTS[this._monsterDef.element] || ELEMENTS.air;
        this.add.rectangle(0, 0, W, 28, elem.dark, 1).setOrigin(0, 0);
        this.add.rectangle(0, 26, W, 2, elem.color, 1).setOrigin(0, 0);
        const elemHex = '#' + elem.color.toString(16).padStart(6, '0');
        this.add.text(W / 2, 14, `[${elem.symbol}] COMBATE — ${elem.topicLabel.toUpperCase()}`, {
            fontSize: '12px', color: elemHex, fontFamily: 'Courier New',
        }).setOrigin(0.5, 0.5);

        this._buildMonsterPanel();
        this._buildPlayerPanel();

        // VS
        this.add.text(W / 2, 90, 'VS', {
            fontSize: '22px', color: '#d4af37', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        // Separator
        this.add.rectangle(0, 158, W, 2, 0x554422, 1).setOrigin(0, 0);

        this._buildQuestionBox();
        this._buildBottomBar();

        this.input.keyboard.on('keydown', this._onKeyDown.bind(this));
    }

    _buildMonsterPanel() {
        const elem = ELEMENTS[this._monsterDef.element] || ELEMENTS.air;

        // Panel background tinted with element color
        const bgDark = elem.dark || 0x1a0000;
        this.add.rectangle(8, 28, 196, 130, bgDark, 1).setOrigin(0, 0);
        this.add.rectangle(8, 28, 196, 130, elem.color, 0).setOrigin(0, 0)
            .setStrokeStyle(1, elem.color, 0.5);

        // Sprite with elemental glow
        const texKey = `sprite_${this._monsterDef.id}`;
        if (this.textures.exists(texKey)) {
            const aura = this.add.circle(60, 88, 32, elem.color, 0.18);
            this.tweens.add({ targets: aura, alpha: 0.35, scale: 1.1, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.add.image(60, 88, texKey).setScale(2.5);
        }

        this.add.text(112, 36, this._monsterDef.name, {
            fontSize: '11px', color: '#ffffff', fontFamily: 'Courier New', wordWrap: { width: 86 },
        }).setOrigin(0, 0);
        this.add.text(112, 54, `Nv. ${this._monsterDef.level}`, {
            fontSize: '10px', color: '#888888', fontFamily: 'Courier New',
        }).setOrigin(0, 0);

        // Element badge
        const badgeColorHex = '#' + elem.color.toString(16).padStart(6, '0');
        this.add.text(112, 68, `[${elem.symbol}] ${elem.name}`, {
            fontSize: '9px', color: badgeColorHex, fontFamily: 'Courier New',
        }).setOrigin(0, 0);

        this._mHpGfx = this.add.graphics();
        this._mHpTxt = this.add.text(112, 102, '', { fontSize: '9px', color: '#ff6666', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this._updateMonsterBar();
    }

    _buildPlayerPanel() {
        this.add.rectangle(340, 28, 196, 130, 0x001a00, 1).setOrigin(0, 0);

        const p = this._player;
        this.add.text(346, 36, p.name || 'Aventureiro', {
            fontSize: '11px', color: '#88ff88', fontFamily: 'Courier New',
        }).setOrigin(0, 0);
        this.add.text(346, 52, `Nv. ${p.level}`, {
            fontSize: '10px', color: '#666666', fontFamily: 'Courier New',
        }).setOrigin(0, 0);

        this._pVitalsGfx = this.add.graphics();
        this._pHpTxt     = this.add.text(346, 86, '', { fontSize: '9px', color: '#ff6666', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this._pFocusTxt  = this.add.text(346, 110, '', { fontSize: '9px', color: '#6688ff', fontFamily: 'Courier New' }).setOrigin(0, 0);
        this._streakTxt  = this.add.text(528, 36, '', { fontSize: '10px', color: '#ffaa00', fontFamily: 'Courier New' }).setOrigin(1, 0);
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
        this._numPrt = this.add.text(14, 296, 'Resposta numérica:', {
            fontSize: '11px', color: '#aaaaaa', fontFamily: 'Courier New',
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
        this._numCursor.setY(startY + 18).setX(14).setVisible(true);
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

            const dmg = CombatSystem.calcPlayerDamage(this._player, this._monsterDef, this._streak);
            this._monsterHp = Math.max(0, this._monsterHp - dmg);
            this._updateMonsterBar();

            const msg = dmg > 0 ? `Correto! Dano causado: ${dmg}` : 'Correto! Bloqueado pela defesa do monstro.';
            this._showFeedback(msg, '#00cc44');
            if (btnBg) btnBg.setFillStyle(0x003300);
            if (this._streak > 1) this._streakTxt.setText(`${this._streak}× STREAK!`);

            if (q.explanation) this._explTxt.setText(`Explicação: ${q.explanation}`);

            if (this._monsterHp <= 0) {
                this.time.delayedCall(1600, () => this._endCombat('win'));
                return;
            }
        } else {
            this._streak = 0;
            this._streakTxt.setText('');
            if (!mastery.wrongIds.includes(q.id)) mastery.wrongIds.push(q.id);

            const dmg = CombatSystem.calcMonsterDamage(this._monsterDef, this._player);
            this._player.hp = Math.max(0, this._player.hp - dmg);
            this._updatePlayerBars();
            EventBus.emit('player-hp-change', { player: this._player });

            const msg = dmg === 0 ? 'Errado! Você desviou o ataque!' : `Errado! Você recebeu ${dmg} de dano.`;
            this._showFeedback(msg, '#ff2222');
            if (btnBg) btnBg.setFillStyle(0x330000);

            if (q.explanation) this._explTxt.setText(`Explicação: ${q.explanation}`);

            if (this._player.hp <= 0) {
                this.time.delayedCall(1600, () => this._endCombat('loss'));
                return;
            }
        }

        this.time.delayedCall(1900, () => this._nextQuestion());
    }

    _showFeedback(msg, color) {
        this._feedbackTxt.setText(msg).setColor(color).setVisible(true);
    }

    // ─── BAR RENDERING ────────────────────────────────────────────────────────

    _updateMonsterBar() {
        const pct = Math.max(0, this._monsterHp / this._monsterDef.maxHp);
        const g   = this._mHpGfx;
        g.clear();
        g.fillStyle(0x330000); g.fillRect(112, 86, 68, 8);
        g.fillStyle(0xff3333); g.fillRect(112, 86, Math.max(0, Math.floor(68 * pct)), 8);
        this._mHpTxt.setText(`${this._monsterHp}/${this._monsterDef.maxHp}`);
    }

    _updatePlayerBars() {
        const p    = this._player;
        const hPct = p.hp / p.maxHp;
        const fPct = p.focus / p.maxFocus;
        const g    = this._pVitalsGfx;
        g.clear();
        // HP bar
        g.fillStyle(0x330000); g.fillRect(346, 70, 100, 8);
        g.fillStyle(0xff3333); g.fillRect(346, 70, Math.floor(100 * hPct), 8);
        // Focus bar
        g.fillStyle(0x000a33); g.fillRect(346, 94, 100, 8);
        g.fillStyle(0x3355ff); g.fillRect(346, 94, Math.floor(100 * fPct), 8);
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
        this._endCombat('flee');
    }

    // ─── COMBAT END ───────────────────────────────────────────────────────────

    _endCombat(outcome) {
        let xpGained = 0;
        const lootNames = [];

        if (outcome === 'win') {
            xpGained = awardXP(this._player, this._monsterDef.xpReward);
            this._player.gold = (this._player.gold || 0) + (this._monsterDef.goldReward || 0);

            const lootIds = CombatSystem.rollDrops(this._monsterDef.id, DROP_TABLES);
            for (const itemId of lootIds) {
                CombatSystem.addToInventory(this._player, itemId);
                const name = ITEMS[itemId]?.name;
                if (name) lootNames.push(name);
            }
            EventBus.emit('player-stats-changed', { player: this._player });
        }

        this.registry.set('player', this._player);
        this.scene.stop('Combat');

        EventBus.emit('combat-end', {
            outcome,
            instanceId: this._instanceId,
            xpGained,
            loot: lootNames,
            playerData: this._player,
        });
    }

    shutdown() {
        this.input.keyboard.removeAllListeners();
    }
}
