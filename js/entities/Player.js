import { TILE_SIZE } from '../constants.js';

export class Player {
    constructor(scene, data) {
        this.scene = scene;
        Object.assign(this, data);

        const px = this.position.x * TILE_SIZE + TILE_SIZE / 2;
        const py = this.position.y * TILE_SIZE + TILE_SIZE / 2;
        this.sprite = scene.add.image(px, py, 'sprite_player').setDepth(5);

        this._moveCooldown = 0;
        this._moveDelay    = 180;
        this._facing = 'down';
    }

    update(delta, cursors, wasd, mapManager) {
        this._moveCooldown -= delta;
        if (this._moveCooldown > 0) return null;

        let dx = 0, dy = 0;
        if (cursors.left.isDown  || wasd.left.isDown)  dx = -1;
        if (cursors.right.isDown || wasd.right.isDown) dx =  1;
        if (cursors.up.isDown    || wasd.up.isDown)    dy = -1;
        if (cursors.down.isDown  || wasd.down.isDown)  dy =  1;

        if (dx !== 0 && dy !== 0) dy = 0;
        if (dx === 0 && dy === 0) return null;

        const nx = this.position.x + dx;
        const ny = this.position.y + dy;

        if (!mapManager.isWalkable(nx, ny)) return null;

        this.position.x = nx;
        this.position.y = ny;
        this.sprite.setPosition(
            nx * TILE_SIZE + TILE_SIZE / 2,
            ny * TILE_SIZE + TILE_SIZE / 2
        );
        this._moveCooldown = this._moveDelay;

        return { x: nx, y: ny };
    }

    syncSprite() {
        this.sprite.setPosition(
            this.position.x * TILE_SIZE + TILE_SIZE / 2,
            this.position.y * TILE_SIZE + TILE_SIZE / 2
        );
    }

    refreshTexture() {
        if (this.sprite) this.sprite.setTexture('sprite_player');
    }

    takeDamage(amount) { this.hp = Math.max(0, this.hp - amount); }
    heal(amount)       { this.hp = Math.min(this.maxHp, this.hp + amount); }

    toData() {
        const { scene, sprite, _moveCooldown, _moveDelay, _facing, ...data } = this;
        return data;
    }

    destroy() { this.sprite.destroy(); }
}
