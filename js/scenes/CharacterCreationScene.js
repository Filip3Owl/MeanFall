import { GENDERS, HAIR_COLORS, ROBE_COLORS, SKIN_TONES, APPEARANCE_DEFAULTS } from '../data/appearance.js';
import { buildPlayerSprite } from '../utils/Draw.js';
import { PLAYER_DEFAULTS, DIFFICULTIES } from '../constants.js';

/**
 * Character creator. Lets the player pick gender, skin, hair color, robe color
 * and a name before starting the journey.
 * Receives nothing; on confirm, sets registry.player and starts World+UI.
 */
export class CharacterCreationScene extends Phaser.Scene {
    constructor() { super('CharacterCreation'); }

    create() {
        this._appearance = { ...APPEARANCE_DEFAULTS };
        this._difficulty = 'medium';
        this._name = 'Aventureiro';

        this._buildUI();
        this._refreshSprite();
    }

    _buildUI() {
        const W = this.scale.width, H = this.scale.height;
        // ... (background logic)
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

        // Sprite preview (left-center)
        this._previewBg = this.add.rectangle(W / 4, 200, 100, 140, 0x0a0814).setStrokeStyle(1, 0xd4af37);
        this._previewSprite = this.add.image(W / 4, 200, 'sprite_player').setScale(3.5);

        // Customization panel (right side)
        let x = W * 0.65;
        let y = 80;

        const labelStyle = { fontSize: '11px', color: '#88ccff', fontFamily: 'Courier New', fontStyle: 'bold' };
        const valStyle   = { fontSize: '13px', color: '#ffffff', fontFamily: 'Courier New', fontStyle: 'bold' };

        // Gender
        this.add.text(x, y, 'GÊNERO', labelStyle).setOrigin(0.5, 0);
        this._genderTx = this.add.text(x, y + 16, '', valStyle).setOrigin(0.5, 0);
        this._makePicker(x, y + 18, 
            () => this._cycle('gender', GENDERS, -1),
            () => this._cycle('gender', GENDERS, +1));

        y += 55;
        // Skin
        this.add.text(x, y, 'PELE', labelStyle).setOrigin(0.5, 0);
        this._skinTx = this.add.text(x, y + 16, '', valStyle).setOrigin(0.5, 0);
        this._makePicker(x, y + 18, 
            () => this._cycle('skin', SKIN_TONES, -1),
            () => this._cycle('skin', SKIN_TONES, +1));

        y += 55;
        // Hair
        this.add.text(x, y, 'CABELO', labelStyle).setOrigin(0.5, 0);
        this._hairTx = this.add.text(x, y + 16, '', valStyle).setOrigin(0.5, 0);
        this._makePicker(x, y + 18, 
            () => this._cycle('hair', HAIR_COLORS, -1),
            () => this._cycle('hair', HAIR_COLORS, +1));

        y += 55;
        // Robe
        this.add.text(x, y, 'TÚNICA', labelStyle).setOrigin(0.5, 0);
        this._robeTx = this.add.text(x, y + 16, '', valStyle).setOrigin(0.5, 0);
        this._makePicker(x, y + 18, 
            () => this._cycle('robe', ROBE_COLORS, -1),
            () => this._cycle('robe', ROBE_COLORS, +1));

        y += 65;
        // Difficulty
        this.add.rectangle(x, y + 25, 200, 60, 0x111111, 0.5).setStrokeStyle(1, 0x333333);
        this.add.text(x, y, 'DIFICULDADE', labelStyle).setOrigin(0.5, 0);
        this._diffTx = this.add.text(x, y + 16, '', valStyle).setOrigin(0.5, 0);
        this._diffDesc = this.add.text(x, y + 34, '', { fontSize: '9px', color: '#aaaaaa', fontFamily: 'Courier New', align: 'center', wordWrap: { width: 180 } }).setOrigin(0.5, 0);
        this._makePicker(x, y + 18, 
            () => this._cycleDiff(-1),
            () => this._cycleDiff(+1));

        // Confirm
        const btn = this.add.rectangle(W / 2, H - 40, 220, 40, 0x1a3a1a, 1)
            .setStrokeStyle(1, 0x44cc44).setInteractive()
            .on('pointerover', () => btn.setFillStyle(0x2a5a2a))
            .on('pointerout',  () => btn.setFillStyle(0x1a3a1a))
            .on('pointerdown', () => this._confirm());
        this.add.text(W / 2, H - 40, 'COMEÇAR JORNADA', {
            fontSize: '14px', color: '#88ff88', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        this._refreshTexts();
    }

    _makePicker(cx, cy, onPrev, onNext) {
        const lBtn = this.add.rectangle(cx - 70, cy, 22, 22, 0x1a1a3a, 1).setStrokeStyle(1, 0x4488ff).setInteractive()
            .on('pointerover', () => lBtn.setFillStyle(0x2a2a55))
            .on('pointerout',  () => lBtn.setFillStyle(0x1a1a3a))
            .on('pointerdown', onPrev);
        this.add.text(cx - 70, cy, '<', { fontSize: '14px', color: '#88ccff', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0.5, 0.5);

        const rBtn = this.add.rectangle(cx + 70, cy, 22, 22, 0x1a1a3a, 1).setStrokeStyle(1, 0x4488ff).setInteractive()
            .on('pointerover', () => rBtn.setFillStyle(0x2a2a55))
            .on('pointerout',  () => rBtn.setFillStyle(0x1a1a3a))
            .on('pointerdown', onNext);
        this.add.text(cx + 70, cy, '>', { fontSize: '14px', color: '#88ccff', fontFamily: 'Courier New', fontStyle: 'bold' }).setOrigin(0.5, 0.5);
    }

    _cycle(field, list, dir) {
        const ids = list.map(o => o.id);
        const idx = ids.indexOf(this._appearance[field]);
        const next = ((idx + dir) % ids.length + ids.length) % ids.length;
        this._appearance[field] = ids[next];
        this._refreshSprite();
        this._refreshTexts();
    }

    _cycleDiff(dir) {
        const ids = Object.keys(DIFFICULTIES);
        const idx = ids.indexOf(this._difficulty);
        const next = ((idx + dir) % ids.length + ids.length) % ids.length;
        this._difficulty = ids[next];
        this._refreshTexts();
    }

    _refreshSprite() {
        buildPlayerSprite(this, this._appearance);
        this._previewSprite.setTexture('sprite_player');
    }

    _refreshTexts() {
        const get = (list, id) => list.find(o => o.id === id)?.name || '?';
        this._genderTx.setText(get(GENDERS, this._appearance.gender));
        this._skinTx.setText(  get(SKIN_TONES, this._appearance.skin));
        this._hairTx.setText(  get(HAIR_COLORS, this._appearance.hair));
        this._robeTx.setText(  get(ROBE_COLORS, this._appearance.robe));

        const diff = DIFFICULTIES[this._difficulty];
        this._diffTx.setText(diff.name).setColor(diff.color);
        this._diffDesc.setText(diff.desc);
    }

    _confirm() {
        const name = window.prompt('Nome do seu personagem:', 'Aventureiro') || 'Aventureiro';
        const data = JSON.parse(JSON.stringify(PLAYER_DEFAULTS));
        data.name = name;
        data.difficulty = this._difficulty;
        data.appearance = { ...this._appearance };
        this.registry.set('player', data);
        this.scene.start('World');
        this.scene.launch('UI');
    }
}
