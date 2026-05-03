import { TILE_SIZE, TILE_WALKABLE, AREA_INFO } from '../constants.js';
import { MAP_DATA } from '../data/maps.js';
import { TILE_TEXTURE_MAP } from '../utils/Draw.js';

export class MapManager {
    constructor(scene) {
        this.scene = scene;
        this.tiles = [];
        this.areaId = null;
        this.mapData = null;
    }

    load(areaId) {
        this.areaId  = areaId;
        this.mapData = MAP_DATA[areaId];
        this._buildTiles();
        const info = AREA_INFO[areaId];
        if (info) this.scene.cameras.main.setBackgroundColor(info.bgColor);
    }

    _buildTiles() {
        // Clear old tiles
        this.tiles.forEach(row => row.forEach(img => img.destroy()));
        this.tiles = [];

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
            }
        }
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

    drawMinimap(canvas) {
        const ctx = canvas.getContext('2d');
        const rows = this.mapData?.tiles;
        if (!rows) return;
        const COLS = rows[0].length;
        const ROWS = rows.length;
        const cw = canvas.width  / COLS;
        const ch = canvas.height / ROWS;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                ctx.fillStyle = miniColor(rows[r][c]);
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
    };
    return MAP[tileId] ?? '#111111';
}
