import { TILE_SIZE } from '../constants.js';

export class FogManager {
    constructor(scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics().setDepth(50); // Above tiles/monsters, below UI
        this.visionRadius = 4;
    }

    update(playerData) {
        const areaId = playerData.currentArea;
        if (!playerData.discoveredTiles[areaId]) {
            playerData.discoveredTiles[areaId] = {};
        }

        const px = playerData.position.x;
        const py = playerData.position.y;
        
        // Intelligence increases vision radius
        // Base 3, +1 for every 5 points of INT
        this.visionRadius = 3 + Math.floor(playerData.intelligence / 5);

        // Mark tiles within radius as discovered
        for (let dy = -this.visionRadius; dy <= this.visionRadius; dy++) {
            for (let dx = -this.visionRadius; dx <= this.visionRadius; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= this.visionRadius) {
                    const tx = px + dx;
                    const ty = py + dy;
                    playerData.discoveredTiles[areaId][`${tx},${ty}`] = true;
                }
            }
        }

        this.draw(playerData);
    }

    draw(playerData) {
        const g = this.graphics;
        g.clear();

        const areaId = playerData.currentArea;
        const discovered = playerData.discoveredTiles[areaId] || {};
        const px = playerData.position.x;
        const py = playerData.position.y;

        // Iterate through all visible tiles on screen (17x15)
        // Since the camera is usually static or centered, but here it's 544x480 (17x15 tiles)
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 17; col++) {
                const isDiscovered = discovered[`${col},${row}`];
                const dx = col - px;
                const dy = row - py;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const isInSight = dist <= this.visionRadius;

                const x = col * TILE_SIZE;
                const y = row * TILE_SIZE;

                if (!isDiscovered) {
                    // Fully hidden (Black)
                    g.fillStyle(0x000000, 1);
                    g.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                } else if (!isInSight) {
                    // Discovered but out of sight (Dimmed/Memory)
                    g.fillStyle(0x000000, 0.6);
                    g.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                }
                // If discovered AND in sight, we draw nothing (fully transparent)
            }
        }
    }

    clear() {
        this.graphics.clear();
    }
}
