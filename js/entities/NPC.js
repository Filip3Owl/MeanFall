import { TILE_SIZE } from '../constants.js';

export class NPC {
    constructor(scene, data) {
        this.scene   = scene;
        this.npcId   = data.npcId;
        this.role    = data.role || 'quest'; // 'quest' | 'shop' | 'lore'
        this.tileX   = data.x;
        this.tileY   = data.y;
        this.dialog  = data.dialog || [];
        this._dlgIdx = 0;

        const px = data.x * TILE_SIZE + TILE_SIZE / 2;
        const py = data.y * TILE_SIZE + TILE_SIZE / 2;

        const texKey = this.role === 'shop' ? 'sprite_npc_shop' : 'sprite_npc';
        this.sprite  = scene.add.image(px, py, texKey).setDepth(4);

        // Role badge above name
        const badge  = this.role === 'shop' ? '$' : this.role === 'quest' ? '!' : '·';
        const badgeColor = this.role === 'shop' ? '#ffcc44' : '#ffaa44';
        this._badge  = scene.add.text(px, py - 28, badge, {
            fontSize: '10px', color: badgeColor, fontFamily: 'Courier New', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(7);

        this._label = scene.add.text(px, py - 18, data.npcId, {
            fontSize: '8px', color: '#ffd700', backgroundColor: '#00000088',
        }).setOrigin(0.5).setDepth(6);

        // Subtle floating animation
        scene.tweens.add({
            targets: [this._badge], y: py - 32, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
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
        this._badge?.destroy();
    }
}
