import { TILE_SIZE } from '../constants.js';

export class NPC {
    constructor(scene, data) {
        this.scene   = scene;
        this.npcId   = data.npcId;
        this.tileX   = data.x;
        this.tileY   = data.y;
        this.dialog  = data.dialog || [];
        this._dlgIdx = 0;

        const px = data.x * TILE_SIZE + TILE_SIZE / 2;
        const py = data.y * TILE_SIZE + TILE_SIZE / 2;
        this.sprite = scene.add.image(px, py, 'sprite_npc').setDepth(4);
        // name label
        this._label = scene.add.text(px, py - 22, data.npcId, {
            fontSize: '8px', color: '#ffd700', backgroundColor: '#00000088',
        }).setOrigin(0.5).setDepth(6);
    }

    isAdjacentTo(col, row) {
        return Math.abs(this.tileX - col) + Math.abs(this.tileY - row) === 1;
    }

    nextLine() {
        const line = this.dialog[this._dlgIdx % this.dialog.length];
        this._dlgIdx++;
        return line;
    }

    destroy() {
        this.sprite.destroy();
        this._label.destroy();
    }
}
