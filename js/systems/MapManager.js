import { TILE_SIZE, TILE_WALKABLE, AREA_INFO } from '../constants.js';
import { MAP_DATA } from '../data/maps.js';
import { TILE_TEXTURE_MAP } from '../utils/Draw.js';

export class MapManager {
    constructor(scene) {
        this.scene = scene;
        this.tiles = [];
        this.areaId = null;
        this.mapData = null;
        this._scrollSprites = [];
        this._decos = [];
    }

    load(areaId) {
        this.areaId  = areaId;
        this.mapData = MAP_DATA[areaId];
        this._buildTiles();
        const info = AREA_INFO[areaId];
        if (info) this.scene.cameras.main.setBackgroundColor(info.bgColor);
    }

    _buildTiles() {
        // Clear old tiles and decorations
        this.tiles.forEach(row => row.forEach(img => img.destroy()));
        if (this._decos) this._decos.forEach(d => d.destroy());
        if (this._scrollSprites) this._scrollSprites.forEach(s => { s.sprite.destroy(); s.glow.destroy(); });
        
        this.tiles = [];
        this._decos = [];
        this._scrollSprites = [];

        const rows = this.mapData.tiles;
        for (let row = 0; row < rows.length; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < rows[row].length; col++) {
                const tileId  = rows[row][col];
                const texKey  = TILE_TEXTURE_MAP[tileId] ?? 'tile_grass';
                const x = col * TILE_SIZE + TILE_SIZE / 2;
                const y = row * TILE_SIZE + TILE_SIZE / 2;
                
                const img = this.scene.add.image(x, y, texKey).setDepth(0);
                this.tiles[row][col] = img;

                // Wall shadows
                if (row > 0 && this.mapData.tiles[row - 1][col] === 3 && tileId !== 3) {
                    const shadow = this.scene.add.image(x, y - TILE_SIZE / 2, 'tile_wall_shadow').setOrigin(0.5, 0).setDepth(0.5);
                    this._decos.push(shadow);
                }

                // Deterministic pseudo-random decoration
                const seed = row * 13 + col * 37 + (this.areaId?.length || 0);
                const noise = Math.sin(seed); 
                const chance = (noise + 1) / 2;

                const isIndoor = this.areaId?.includes('_house_') || this.areaId?.includes('_inn') || this.areaId?.includes('_shop');
                if (!isIndoor && chance > 0.75) {
                    let decoTex = null;
                    if (tileId === 0 || tileId === 9) { // Grass
                        if (chance > 0.96) decoTex = 'deco_flower_red';
                        else if (chance > 0.92) decoTex = 'deco_flower_blue';
                        else if (chance > 0.88) decoTex = 'deco_flower_white';
                        else decoTex = 'deco_grass_tuft';
                    } else if (tileId === 1) { // Stone
                        if (chance > 0.90) decoTex = 'deco_cracks';
                        else decoTex = 'deco_rock_small';
                    } else if (tileId === 8) { // Sand
                        if (chance > 0.92) decoTex = 'deco_cactus';
                        else decoTex = 'deco_rock_small';
                    } else if (tileId === 11) { // Snow
                        if (chance > 0.93) decoTex = 'deco_ice_crystal';
                        else decoTex = 'deco_snow_mound';
                    } else if (tileId === 10) { // Mountain
                        decoTex = (chance > 0.90) ? 'deco_rock_large' : 'deco_rock_small';
                    } else if (tileId === 12 || tileId === 3) { // Cave
                        if (chance > 0.97) decoTex = 'deco_bones';
                        else if (chance > 0.88) decoTex = 'deco_rock_small';
                    }

                    if (decoTex) {
                        const deco = this.scene.add.image(x, y, decoTex).setDepth(1).setAlpha(0.85);
                        if (noise > 0) deco.setFlipX(true);
                        this._decos.push(deco);
                    }
                }
            }
        }

        // Render fixed scrolls
        if (this.mapData.scrolls) {
            for (const s of this.mapData.scrolls) {
                const sx = s.x * TILE_SIZE + TILE_SIZE / 2;
                const sy = s.y * TILE_SIZE + TILE_SIZE / 2;
                const sprite = this.scene.add.image(sx, sy, 'item_scroll').setDepth(2).setScale(0.8);
                sprite.scrollId = s.scrollId;
                sprite.tileX = s.x;
                sprite.tileY = s.y;
                
                const glow = this.scene.add.circle(sx, sy, 8, 0x88ccff, 0.3).setDepth(1.5);
                this.scene.tweens.add({ targets: glow, alpha: 0.6, scale: 1.5, duration: 1200, yoyo: true, repeat: -1 });
                
                this._scrollSprites.push({ sprite, glow });
            }
        }
    }

    getScrollAt(x, y) {
        return this._scrollSprites?.find(s => s.sprite.tileX === x && s.sprite.tileY === y);
    }

    isWalkable(col, row) {
        const rows = this.mapData?.tiles;
        if (!rows || row < 0 || col < 0 || row >= rows.length || col >= rows[row].length) return false;
        return TILE_WALKABLE[rows[row][col]] ?? false;
    }

    getTileId(col, row) {
        return this.mapData?.tiles?.[row]?.[col] ?? -1;
    }

    getExit(col, row) {
        return (this.mapData?.exits || []).find(e => e.x === col && e.y === row) || null;
    }

    drawMinimap(canvas, playerData) {
        const ctx = canvas.getContext('2d');
        const rows = this.mapData?.tiles;
        if (!rows) return;
        const areaId = playerData.currentArea;
        const discovered = (playerData.discoveredTiles || {})[areaId] || {};
        
        const COLS = rows[0].length;
        const ROWS = rows.length;
        const cw = canvas.width  / COLS;
        const ch = canvas.height / ROWS;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (discovered[`${c},${r}`]) {
                    ctx.fillStyle = miniColor(rows[r][c]);
                } else {
                    ctx.fillStyle = '#050308'; // Hidden
                }
                ctx.fillRect(c * cw, r * ch, cw, ch);
            }
        }
    }

    drawMinimapPlayer(canvas, col, row) {
        const rows = this.mapData?.tiles;
        if (!rows) return;
        const COLS = rows[0].length;
        const ROWS = rows.length;
        const cw = canvas.width  / COLS;
        const ch = canvas.height / ROWS;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(col * cw + cw * 0.1, row * ch + ch * 0.1, cw * 0.8, ch * 0.8);
    }
}

function miniColor(tileId) {
    const MAP = {
        0: '#3a7d44', 1: '#888888', 2: '#1a5fa8', 3: '#555555',
        4: '#2d6a2d', 5: '#4a3222', 6: '#9944ff', 7: '#8b6914',
        8: '#d4a647', 9: '#2a5d34', 10: '#666677', 11: '#ddddee', 12: '#2a2233',
        13: '#882211', 14: '#ffee88', 15: '#5c3a1e', 16: '#4a2d18',
        17: '#cc2222', 18: '#7a4c2a', 19: '#882222',
    };
    return MAP[tileId] ?? '#111111';
}
