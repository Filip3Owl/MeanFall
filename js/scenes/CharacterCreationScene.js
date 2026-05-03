import { GENDERS, HAIR_COLORS, ROBE_COLORS, SKIN_TONES, APPEARANCE_DEFAULTS } from '../data/appearance.js';
import { buildPlayerSprite } from '../utils/Draw.js';
import { PLAYER_DEFAULTS } from '../constants.js';

/**
 * Character creator. Lets the player pick gender, skin, hair color, robe color
 * and a name before starting the journey.
 * Receives nothing; on confirm, sets registry.player and starts World+UI.
 */
export class CharacterCreationScene extends Phaser.Scene {
    constructor() { super('CharacterCreation'); }

    create() {
        this._appearance = { ...APPEARANCE_DEFAULTS };
        this._name = 'Aventureiro';

        this._buildUI();
        this._refreshSprite();
    }

    _buildUI() {
        const W = this.scale.width, H = this.scale.height;
        // Background
        this.add.rectangle(0, 0, W, H, 0x050308, 1).setOrigin(0, 0);
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;
            this.add.rectangle(x, y, 1, 1, 0xffffff, Math.random() * 0.6 + 0.2);
        }

        // Title
        this.add.text(W / 2, 28, 'CRIE SEU AVENTUREIRO', {
            fontSize: '20px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0);
        this.add.text(W / 2, 56, 'A última esperança contra a Distorção', {
            fontSize: '11px', color: '#aaaaaa', fontFamily: 'Courier New', fontStyle: 'italic',
        }).setOrigin(0.5, 0);

        // Sprite preview (large)
        this._previewBg = this.add.rectangle(W / 2, 130, 80, 100, 0x0a0814).setStrokeStyle(1, 0xd4af37);
        this._previewSprite = this.add.image(W / 2, 130, 'sprite_player').setScale(2.4);

        let y = 200;
        // Gender selector
        this._genderTx = this.add.text(W / 2, y, '', { fontSize: '12px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0.5, 0);
        this._makePicker(W / 2, y + 18, 'Gênero',
            () => this._cycle('gender', GENDERS, -1),
            () => this._cycle('gender', GENDERS, +1));

        y += 60;
        this._skinTx = this.add.text(W / 2, y, '', { fontSize: '12px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0.5, 0);
        this._makePicker(W / 2, y + 18, 'Pele',
            () => this._cycle('skin', SKIN_TONES, -1),
            () => this._cycle('skin', SKIN_TONES, +1));

        y += 60;
        this._hairTx = this.add.text(W / 2, y, '', { fontSize: '12px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0.5, 0);
        this._makePicker(W / 2, y + 18, 'Cabelo',
            () => this._cycle('hair', HAIR_COLORS, -1),
            () => this._cycle('hair', HAIR_COLORS, +1));

        y += 60;
        this._robeTx = this.add.text(W / 2, y, '', { fontSize: '12px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0.5, 0);
        this._makePicker(W / 2, y + 18, 'Túnica',
            () => this._cycle('robe', ROBE_COLORS, -1),
            () => this._cycle('robe', ROBE_COLORS, +1));

        // Confirm
        const btn = this.add.rectangle(W / 2, H - 40, 200, 36, 0x1a3a1a, 1)
            .setStrokeStyle(1, 0x44cc44).setInteractive()
            .on('pointerover', () => btn.setFillStyle(0x2a5a2a))
            .on('pointerout',  () => btn.setFillStyle(0x1a3a1a))
            .on('pointerdown', () => this._confirm());
        this.add.text(W / 2, H - 40, 'COMEÇAR JORNADA', {
            fontSize: '13px', color: '#88ff88', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        this._refreshTexts();
    }

    _makePicker(cx, cy, label, onPrev, onNext) {
        const lBtn = this.add.rectangle(cx - 80, cy, 24, 24, 0x1a1a3a, 1).setStrokeStyle(1, 0x4488ff).setInteractive()
            .on('pointerover', () => lBtn.setFillStyle(0x2a2a55))
            .on('pointerout',  () => lBtn.setFillStyle(0x1a1a3a))
            .on('pointerdown', onPrev);
        this.add.text(cx - 80, cy, '<', { fontSize: '14px', color: '#88ccff', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0.5, 0.5);

        const rBtn = this.add.rectangle(cx + 80, cy, 24, 24, 0x1a1a3a, 1).setStrokeStyle(1, 0x4488ff).setInteractive()
            .on('pointerover', () => rBtn.setFillStyle(0x2a2a55))
            .on('pointerout',  () => rBtn.setFillStyle(0x1a1a3a))
            .on('pointerdown', onNext);
        this.add.text(cx + 80, cy, '>', { fontSize: '14px', color: '#88ccff', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0.5, 0.5);
    }

    _cycle(field, list, dir) {
        const ids = list.map(o => o.id);
        const idx = ids.indexOf(this._appearance[field]);
        const next = ((idx + dir) % ids.length + ids.length) % ids.length;
        this._appearance[field] = ids[next];
        this._refreshSprite();
        this._refreshTexts();
    }

    _refreshSprite() {
        buildPlayerSprite(this, this._appearance);
        this._previewSprite.setTexture('sprite_player');
    }

    _refreshTexts() {
        const get = (list, id) => list.find(o => o.id === id)?.name || '?';
        this._genderTx.setText(`Gênero: ${get(GENDERS, this._appearance.gender)}`);
        this._skinTx.setText(  `Pele:   ${get(SKIN_TONES, this._appearance.skin)}`);
        this._hairTx.setText(  `Cabelo: ${get(HAIR_COLORS, this._appearance.hair)}`);
        this._robeTx.setText(  `Túnica: ${get(ROBE_COLORS, this._appearance.robe)}`);
    }

    _confirm() {
        const name = window.prompt('Nome do seu personagem:', 'Aventureiro') || 'Aventureiro';
        const data = JSON.parse(JSON.stringify(PLAYER_DEFAULTS));
        data.name = name;
        data.appearance = { ...this._appearance };
        this.registry.set('player', data);
        this.scene.start('World');
        this.scene.launch('UI');
    }
}
