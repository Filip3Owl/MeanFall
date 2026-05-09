import { TILE_SIZE, ELEMENTS, DIFFICULTIES } from '../constants.js';
import { MONSTERS } from '../data/monsters.js';

export class Monster {
    constructor(scene, instanceData) {
        this.scene      = scene;
        this.instanceId = instanceData.instanceId;
        this.monsterId  = instanceData.monsterId;
        this.tileX      = instanceData.x;
        this.tileY      = instanceData.y;

        const pData = scene.registry.get('player');
        const diffDef = DIFFICULTIES[pData?.difficulty] || DIFFICULTIES.medium;

        const def   = MONSTERS[this.monsterId];
        this.def    = { ...def };
        
        // Elite Chance (15% chance to be an Elite monster)
        this.isElite = Math.random() < 0.15;
        if (this.isElite) {
            this.def.name = `Elite ${this.def.name}`;
            this.def.xpReward = Math.floor(this.def.xpReward * 2.5);
            this.def.goldReward = Math.floor(this.def.goldReward * 3);
        }

        const scaledHp = Math.floor(this.def.maxHp * diffDef.monsterHp * (this.isElite ? 2.0 : 1.0));
        this.hp     = scaledHp;
        this.maxHp  = scaledHp;

        const key = `sprite_${this.monsterId}`;
        const px  = this.tileX * TILE_SIZE + TILE_SIZE / 2;
        const py  = this.tileY * TILE_SIZE + TILE_SIZE / 2;
        
        // Shadow
        this.shadow = scene.add.image(px, py + 8, 'entity_shadow').setScale(this.isElite ? 1.2 : 0.8).setDepth(2).setAlpha(0.6);
        
        this.sprite = scene.add.image(px, py, key).setDepth(4);
        if (this.isElite) {
            this.sprite.setScale(1.3);
            this.sprite.setTint(0xffaa22); // More vibrant orange-gold tint
            
            // Pulsating Aura
            const auraColor = ELEMENTS[this.def.element]?.color || 0xffd700;
            this.aura = scene.add.circle(px, py, 16, auraColor, 0.25).setDepth(3);
            scene.tweens.add({
                targets: this.aura,
                alpha: 0.1,
                scale: 1.5,
                duration: 1200,
                yoyo: true,
                repeat: -1
            });

            // Sprite pulse
            scene.tweens.add({
                targets: this.sprite,
                scale: 1.4,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Patrol state
        this._patrolDir = 1;
        this._patrolTimer = 0;
        this._patrolInterval = 1200 + Math.random() * 600;
        this._originX = instanceData.x;
        this._originY = instanceData.y;

        // Name label above HP bar
        const elem = ELEMENTS[this.def.element] || ELEMENTS.normal;
        const elemHex = this.isElite ? '#ffd700' : ('#' + (elem?.color || 0xffffff).toString(16).padStart(6, '0'));
        this._nameLabel = scene.add.text(0, 0, `${this.def.name} Lv.${this.def.level}`, {
            fontSize: this.isElite ? '9px' : '8px', color: elemHex, fontFamily: 'Courier New', fontStyle: 'bold',
            backgroundColor: '#000000bb', padding: { x: 2, y: 1 },
        }).setOrigin(0.5, 1).setDepth(6);

        // HP bar (mini)
        this._hpBar = scene.add.graphics().setDepth(5);
        this._refreshLabels();
    }

    _refreshLabels() {
        const cx = this.tileX * TILE_SIZE + TILE_SIZE / 2;
        const cy = this.tileY * TILE_SIZE + TILE_SIZE / 2;
        const top = this.tileY * TILE_SIZE - 8;
        if (this._nameLabel) this._nameLabel.setPosition(cx, top);
        if (this.aura) this.aura.setPosition(cx, cy);
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
        this.aura?.destroy();
        this._hpBar.destroy();
        this._nameLabel?.destroy();
    }
}
