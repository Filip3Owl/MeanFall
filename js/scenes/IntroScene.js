import { STORY } from '../data/lore.js';
import { layoutRichText } from '../utils/RichText.js';

/**
 * IntroScene — animated prologue text. Plays once before character creation
 * on a brand-new game.
 */
export class IntroScene extends Phaser.Scene {
    constructor() { super('Intro'); }

    create() {
        const W = this.scale.width, H = this.scale.height;

        // Dark void background with stars
        this.add.rectangle(0, 0, W, H, 0x040208).setOrigin(0, 0);
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;
            const s = Math.random() * 1.4 + 0.4;
            const star = this.add.rectangle(x, y, s, s, 0xffffff, Math.random() * 0.7 + 0.2);
            this.tweens.add({ targets: star, alpha: 0.1, duration: 1200 + Math.random() * 1800, yoyo: true, repeat: -1 });
        }

        // Title
        this.add.text(W / 2, 50, STORY.title.toUpperCase(), {
            fontSize: '24px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0);
        this.add.text(W / 2, 80, STORY.subtitle, {
            fontSize: '11px', color: '#aaaaaa', fontFamily: 'Courier New', fontStyle: 'italic',
        }).setOrigin(0.5, 0);

        // Prologue lines fade-in sequentially with rich coloring
        const lines = STORY.prologueLines;
        let cursorY = 120;

        lines.forEach((line, i) => {
            const result = layoutRichText(this, 30, cursorY, line, {
                fontSize: '11px', wrapWidth: W - 60, lineHeight: 16, baseColor: '#ddccaa',
            });
            // Center each block of text
            const usedHeight = result.height;
            this.tweens.add({
                targets: result.objects, alpha: { from: 0, to: 1 },
                duration: 1200, delay: i * 1100,
            });
            cursorY += usedHeight + 6;
        });

        // Skip / Continue button
        const totalDelay = lines.length * 1100 + 500;
        this._continueBtn = this.add.rectangle(W / 2, H - 40, 220, 32, 0x1a3a1a, 1)
            .setStrokeStyle(1, 0x44cc44).setInteractive()
            .on('pointerover', () => this._continueBtn.setFillStyle(0x2a5a2a))
            .on('pointerout',  () => this._continueBtn.setFillStyle(0x1a3a1a))
            .on('pointerdown', () => this._next())
            .setAlpha(0);
        this._continueTx = this.add.text(W / 2, H - 40, 'CONTINUAR', {
            fontSize: '13px', color: '#88ff88', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0.5).setAlpha(0);

        this.tweens.add({ targets: [this._continueBtn, this._continueTx], alpha: 1, duration: 600, delay: totalDelay });

        // Skip text
        const skipTx = this.add.text(W - 10, 10, 'ESPAÇO/ESC para pular', {
            fontSize: '10px', color: '#666666', fontFamily: 'Courier New',
        }).setOrigin(1, 0).setDepth(10);

        this.input.keyboard.on('keydown-SPACE', () => this._next());
        this.input.keyboard.on('keydown-ESC',   () => this._next());
    }

    _next() {
        this.scene.start('CharacterCreation');
    }
}
