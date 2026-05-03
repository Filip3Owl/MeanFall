/**
 * DialogScene — bottom dialog box like classic JRPGs.
 * Receives { speaker, lines, onClose, role }.
 * Press SPACE / ENTER / click box to advance. Closes when out of lines.
 */
export class DialogScene extends Phaser.Scene {
    constructor() { super('Dialog'); }

    init(data) {
        this._speaker = data.speaker || 'NPC';
        this._lines   = data.lines   || [];
        this._onClose = data.onClose || (() => {});
        this._role    = data.role    || 'quest';
        this._idx     = 0;
        this._typingTimer = null;
        this._fullText    = '';
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

        // Body text
        this._bodyTx = this.add.text(24, boxY + 18, '', {
            fontSize: '12px', color: '#eeeedd', fontFamily: 'Courier New',
            wordWrap: { width: W - 50 }, lineSpacing: 4,
        }).setOrigin(0, 0);

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
        this._bodyTx.setText('');
        this._pageTx.setText(`(${this._idx + 1}/${this._lines.length})`);

        // Typewriter effect
        if (this._typingTimer) this._typingTimer.remove();
        let ch = 0;
        this._typingTimer = this.time.addEvent({
            delay: 22,
            repeat: line.length - 1,
            callback: () => {
                ch++;
                this._bodyTx.setText(line.substring(0, ch));
            },
        });
    }

    _advance() {
        if (this._typingTimer && !this._typingTimer.hasDispatched && this._typingTimer.repeatCount > 0) {
            // Skip typewriter
            this._typingTimer.remove();
            this._bodyTx.setText(this._fullText);
            return;
        }
        this._idx++;
        if (this._idx >= this._lines.length) this._close();
        else this._renderLine();
    }

    _close() {
        if (this._typingTimer) this._typingTimer.remove();
        this.scene.stop('Dialog');
        try { this._onClose(); } catch (e) { /* swallow */ }
    }
}
