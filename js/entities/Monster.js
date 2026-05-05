import { TILE_SIZE, ELEMENTS } from '../constants.js';
import { MONSTERS } from '../data/monsters.js';

export class Monster {
    constructor(scene, instanceData) {
        this.scene      = scene;
        this.instanceId = instanceData.instanceId;
        this.monsterId  = instanceData.monsterId;
        this.tileX      = instanceData.x;
        this.tileY      = instanceData.y;

        const def   = MONSTERS[this.monsterId];
        this.def    = def;
        this.hp     = def.maxHp;
        this.maxHp  = def.maxHp;

        const key = `sprite_${this.monsterId}`;
        const px  = this.tileX * TILE_SIZE + TILE_SIZE / 2;
        const py  = this.tileY * TILE_SIZE + TILE_SIZE / 2;
        
        // Shadow
        this.shadow = scene.add.image(px, py + 8, 'entity_shadow').setScale(0.8).setDepth(2).setAlpha(0.6);
        
        this.sprite = scene.add.image(px, py, key).setDepth(4);

        // Patrol state
        this._patrolDir = 1;
        this._patrolTimer = 0;
        this._patrolInterval = 1200 + Math.random() * 600;
        this._originX = instanceData.x;
        this._originY = instanceData.y;

        // Name label above HP bar
        const elem = ELEMENTS[def.element] || ELEMENTS.normal;
        const elemHex = '#' + (elem?.color || 0xffffff).toString(16).padStart(6, '0');
        this._nameLabel = scene.add.text(0, 0, `${def.name} Lv.${def.level}`, {
            fontSize: '8px', color: elemHex, fontFamily: 'Courier New', fontStyle: 'bold',
            backgroundColor: '#000000bb', padding: { x: 2, y: 1 },
        }).setOrigin(0.5, 1).setDepth(6);

        // HP bar (mini)
        this._hpBar = scene.add.graphics().setDepth(5);
        this._refreshLabels();
    }

    _refreshLabels() {
        const cx = this.tileX * TILE_SIZE + TILE_SIZE / 2;
        const top = this.tileY * TILE_SIZE - 8;
        if (this._nameLabel) this._nameLabel.setPosition(cx, top);
        this._drawHpBar();
    }

    _drawHpBar() {
        const g = this._hpBar;
        g.clear();
        const x = this.tileX * TILE_SIZE + 4;
        const y = this.tileY * TILE_SIZE - 5;
        const w = TILE_SIZE - 8;
        const h = 3;
        g.fillStyle(0x330000); g.fillRect(x, y, w, h);
        const pct = this.hp / this.maxHp;
        const fill = pct > 0.5 ? 0x33cc33 : pct > 0.25 ? 0xffaa00 : 0xff2222;
        g.fillStyle(fill); g.fillRect(x, y, Math.floor(w * pct), h);
    }

    update(delta, mapManager) {
        if (this.def.movePattern === 'static') return;
        this._patrolTimer += delta;
        if (this._patrolTimer < this._patrolInterval) return;
        this._patrolTimer = 0;

        const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
        const dir  = dirs[Math.floor(Math.random() * dirs.length)];
        const nx   = this.tileX + dir.x;
        const ny   = this.tileY + dir.y;

        if (Math.abs(nx - this._originX) > 3 || Math.abs(ny - this._originY) > 3) return;
        if (!mapManager.isWalkable(nx, ny)) return;

        this.tileX = nx;
        this.tileY = ny;
        const npx = nx * TILE_SIZE + TILE_SIZE / 2;
        const npy = ny * TILE_SIZE + TILE_SIZE / 2;
        this.sprite.setPosition(npx, npy);
        this.shadow.setPosition(npx, npy + 8);
        this._refreshLabels();
    }

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        this._drawHpBar();
        return this.hp <= 0;
    }

    isAt(col, row) { return this.tileX === col && this.tileY === row; }

    destroy() {
        this.sprite.destroy();
        this.shadow.destroy();
        this._hpBar.destroy();
        this._nameLabel?.destroy();
    }
}
