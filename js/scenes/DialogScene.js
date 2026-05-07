import { RICH_COLORS } from '../utils/RichText.js';

// Highlight key terms in dialog text using Phaser BBCode-like tagging.
// We can't use real BBCode without an extra plugin, so we render line in
// segments: any token wrapped in {{tag:value}} is shown in its own colored
// Text object positioned next to the previous one.

const DIALOG_KEYWORDS = {
    Estatística: '#ffd700', estatística: '#ffd700',
    Distorção:   '#ff5566',
    HIPÓTESE:    '#bb88ff', Hipótese: '#bb88ff',
    Curva:       '#88ccff',  curva: '#88ccff',
    Média:       '#aaee66',  média: '#aaee66',
    Mediana:     '#88dd88',  mediana: '#88dd88',
    Moda:        '#ddaa88',  moda: '#ddaa88',
    Variância:   '#88ddff',  variância: '#88ddff',
    Probabilidade: '#ff9966',
    Inferência:  '#bb88ff',  inferência: '#bb88ff',
    XP:          '#ffaa22',
    nível:       '#ffaa44',  Nível: '#ffaa44',
    missão:      '#88ccff',  Missão: '#88ccff', missões: '#88ccff',
    LOOT:        '#ffd700',
    Lendário:    '#ffaa22',
    Importante:  '#44cc88',
    Essencial:   '#bb44ff',
    Foco:        '#88aaff',
    'α':          '#ff88cc',
    'p-valor':    '#ff88cc',
    'H₀':         '#bb88ff',
};

/**
 * DialogScene — bottom dialog box like classic JRPGs.
 * Receives { speaker, lines, onClose, role }.
 * Press SPACE / ENTER / click box to advance. Closes when out of lines.
 */
export class DialogScene extends Phaser.Scene {
    constructor() { super('Dialog'); }

    init(data) {
        this._speaker     = data.speaker || 'NPC';
        this._lines       = data.lines   || [];
        this._onClose     = data.onClose || (() => {});
        this._action      = data.action  || null;     // { label, kind } or null
        this._onAction    = data.onAction || null;
        this._role        = data.role     || 'quest';
        this._idx            = 0;
        this._typingTimer    = null;
        this._fullText       = '';
        this._actionTaken    = false;  // MUST reset: scene object is reused across launches
        this._autoCloseTimer = null;
    }

    create() {
        const W = 544, H = 480;

        // Translucent shade over world
        this._shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.45).setOrigin(0, 0).setInteractive()
            .on('pointerdown', () => this._advance());

        // Dialog box
        const boxY = H - 130;
        const boxH = 120;
        this._box = this.add.rectangle(8, boxY, W - 16, boxH, 0x0a0814, 1).setOrigin(0, 0);
        this.add.rectangle(8, boxY, W - 16, boxH, 0xd4af37, 0).setOrigin(0, 0).setStrokeStyle(2, 0xd4af37);
        this.add.rectangle(10, boxY + 2, W - 20, 2, 0xd4af37, 0.4).setOrigin(0, 0);
        this.add.rectangle(10, boxY + boxH - 4, W - 20, 2, 0xd4af37, 0.4).setOrigin(0, 0);

        // Speaker tag
        const tagColor = this._role === 'shop' ? 0x33aa55 : 0xaa6633;
        this._tagBg = this.add.rectangle(20, boxY - 14, 130, 22, tagColor, 1).setOrigin(0, 0).setStrokeStyle(1, 0xd4af37);
        this._tagTx = this.add.text(85, boxY - 3, this._speaker.toUpperCase(), {
            fontSize: '11px', color: '#ffffff', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        // Body text container (tokens drawn dynamically by _renderTokens)
        this._lineTokens = [];

        // Continue prompt (blinking)
        this._promptTx = this.add.text(W - 24, boxY + boxH - 18, '> Espaço / Clique', {
            fontSize: '9px', color: '#aaaaaa', fontFamily: 'Courier New', fontStyle: 'italic',
        }).setOrigin(1, 0.5);
        this.tweens.add({ targets: this._promptTx, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

        // Page indicator
        this._pageTx = this.add.text(20, boxY + boxH - 18, '', {
            fontSize: '9px', color: '#aaaaaa', fontFamily: 'Courier New',
        }).setOrigin(0, 0.5);

        this.input.keyboard.on('keydown-SPACE', () => this._advance());
        this.input.keyboard.on('keydown-ENTER', () => this._advance());
        this.input.keyboard.on('keydown-ESC',   () => this._close());

        this._renderLine();
    }

    _renderLine() {
        const line = this._lines[this._idx];
        if (!line) { this._close(); return; }
        this._fullText = line;
        this._pageTx.setText(`(${this._idx + 1} / ${this._lines.length})`);

        if (this._lineTokens) this._lineTokens.forEach(t => t.destroy());
        this._lineTokens = [];

        const tokens = this._tokenize(line);
        this._renderTokens(tokens);

        for (const t of this._lineTokens) t.setAlpha(0);
        this.tweens.add({ targets: this._lineTokens, alpha: 1, duration: 220 });

        // On last line, show the action button (if any) or auto-close
        const isLast = this._idx === this._lines.length - 1;
        this._setActionButtonVisible(isLast && !!this._action);

        if (isLast && !this._action) {
            this._promptTx.setText('Fechando...');
            this._autoCloseTimer = this.time.delayedCall(2000, () => this._close());
        }
    }

    _setActionButtonVisible(visible) {
        if (!this._action) return;
        if (visible && !this._actionBtn) {
            const W = this.scale.width;
            const boxY = W ? this.scale.height - 130 : 350;
            const btnY = boxY + 80;
            const color = this._action.kind === 'shop' ? 0x33aa55 : 0x4488ff;
            this._actionBtn = this.add.rectangle(W - 130, btnY, 110, 24, color, 1)
                .setStrokeStyle(2, 0xffffff, 0.4)
                .setOrigin(0, 0).setInteractive()
                .on('pointerover', () => this._actionBtn.setFillStyle(color + 0x222222))
                .on('pointerout',  () => this._actionBtn.setFillStyle(color))
                .on('pointerdown', (p, lx, ly, ev) => { ev.stopPropagation(); this._triggerAction(); });
            this._actionTx = this.add.text(W - 75, btnY + 12, this._action.label, {
                fontSize: '10px', color: '#ffffff', fontFamily: 'Courier New', fontStyle: 'bold',
            }).setOrigin(0.5, 0.5);
        } else if (!visible && this._actionBtn) {
            this._actionBtn.destroy(); this._actionBtn = null;
            this._actionTx?.destroy(); this._actionTx = null;
        }
    }

    _triggerAction() {
        const fn = this._onAction;
        this._onAction = null;
        this._actionTaken = true;
        this._destroyAll();
        this.scene.stop('Dialog');
        try { fn && fn(); } catch (e) {}
    }

    _destroyAll() {
        this.children.getAll().forEach(c => c.destroy());
        this._lineTokens = [];
        this._shade = this._box = this._tagBg = this._tagTx = null;
        this._promptTx = this._pageTx = this._actionBtn = this._actionTx = null;
    }

    _tokenize(line) {
        // Handles both {{tag:value}} rich tokens and plain words with keyword highlighting.
        const tokens = [];
        const re = /\{\{(\w+):([^}]+)\}\}|([^\s{]+|\s+)/g;
        let m;
        while ((m = re.exec(line)) !== null) {
            if (m[1] && m[2]) {
                // {{tag:body}} — color from RICH_COLORS, split for wrapping
                const color = RICH_COLORS[m[1]] || '#ffd700';
                for (const part of m[2].split(/(\s+)/)) {
                    if (part) tokens.push({ text: part, color, bold: true });
                }
            } else {
                const word = m[3] || '';
                const cleaned = word.replace(/[.,!?;:()…]/g, '');
                const kw = DIALOG_KEYWORDS[cleaned];
                tokens.push({ text: word, color: kw || null, bold: !!kw });
            }
        }
        return tokens;
    }

    _renderTokens(tokens) {
        const startX = 24;
        const startY = this.scale.height - 130 + 18;
        const wrapWidth = this.scale.width - 50;
        let cx = 0, cy = 0;
        const lineHeight = 16;

        for (const { text, color, bold } of tokens) {
            if (!text) continue;
            const txt = this.add.text(0, 0, text, {
                fontSize: '12px', color: color || '#eeeedd', fontFamily: 'Courier New',
                fontStyle: bold ? 'bold' : 'normal',
            }).setOrigin(0, 0).setDepth(11);

            const w = txt.width;
            if (cx + w > wrapWidth && text.trim() !== '') {
                cx = 0; cy += lineHeight;
            }
            txt.setPosition(startX + cx, startY + cy);
            cx += w;
            this._lineTokens.push(txt);
        }
    }

    _advance() {
        if (this._actionTaken) return;
        this._idx++;
        if (this._idx >= this._lines.length) this._close();
        else this._renderLine();
    }

    _close() {
        if (this._actionTaken) return;
        this._actionTaken = true;
        if (this._autoCloseTimer) { this._autoCloseTimer.remove(false); this._autoCloseTimer = null; }
        this._destroyAll();
        this.scene.stop('Dialog');
        try { this._onClose(); } catch (e) { /* swallow */ }
    }
}
