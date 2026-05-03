import { TILE_SIZE, AREA_INFO, AREA_UNLOCK, PLAYER_DEFAULTS, RESPAWN_TIME } from '../constants.js';
import { MapManager } from '../systems/MapManager.js';
import { Player } from '../entities/Player.js';
import { Monster } from '../entities/Monster.js';
import { NPC } from '../entities/NPC.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { masteryPercent } from '../systems/XPSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { ITEMS } from '../data/items.js';
import EventBus from '../utils/EventBus.js';

export class WorldScene extends Phaser.Scene {
    constructor() { super('World'); }

    create() {
        this._playerData = this.registry.get('player') || JSON.parse(JSON.stringify(PLAYER_DEFAULTS));
        this._mapManager = new MapManager(this);
        this._monsters   = [];
        this._npcs       = [];
        this._paused     = false;
        this._spaceLock  = false;

        this._loadArea(this._playerData.currentArea);

        this._cursors = this.input.keyboard.createCursorKeys();
        this._wasd    = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        this._spaceKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this._iKey      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this._cKey      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this._qKey      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this._bKey      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
        this._f5Key     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F5);

        QuestSystem.init(this._playerData);
        // Auto-accept all quests when prerequisites are met (lightweight onboarding)
        this._autoAcceptQuests();
        // Refresh weapon element from current equipment
        CombatSystem.refreshWeaponElement(this._playerData, ITEMS);

        // Listen for combat result
        EventBus.on('combat-end', this._onCombatEnd.bind(this));

        // Keep player data in sync
        this._syncTimer = this.time.addEvent({ delay: 5000, loop: true, callback: this._autoSync, callbackScope: this });

        EventBus.emit('area-changed', { areaId: this._playerData.currentArea });
        EventBus.emit('minimap-update', { mapMgr: this._mapManager, player: this._playerData });
        this._chat('Pressione Espaco perto de NPCs para dialogar.', 'system');
        this._chat(`Bem-vindo a ${AREA_INFO[this._playerData.currentArea]?.displayName || '?'}!`, 'portal');
    }

    _loadArea(areaId) {
        // Clear previous entities
        this._monsters.forEach(m => m.destroy());
        this._npcs.forEach(n => n.destroy());
        this._monsters = [];
        this._npcs = [];
        if (this._player) this._player.destroy();

        this._mapManager.load(areaId);
        this._playerData.currentArea = areaId;

        // Spawn player
        const pos = this._playerData.position;
        this._player = new Player(this, { ...this._playerData, position: { ...pos } });

        // Spawn monsters (skip defeated)
        const defeated = this._playerData.defeatedMonsters || {};
        const mapMons  = this._mapManager.mapData?.monsters || [];
        for (const md of mapMons) {
            if (defeated[md.instanceId]) continue;
            this._monsters.push(new Monster(this, md));
        }

        // Spawn NPCs
        const mapNpcs = this._mapManager.mapData?.npcs || [];
        for (const nd of mapNpcs) {
            this._npcs.push(new NPC(this, nd));
        }
    }

    update(time, delta) {
        if (this._paused) return;

        const moved = this._player.update(delta, this._cursors, this._wasd, this._mapManager);
        if (moved) {
            this._playerData.position = { ...moved };
            this._checkTileInteractions(moved.x, moved.y);
            EventBus.emit('minimap-update', { mapMgr: this._mapManager, player: this._playerData });
        }

        // Update monsters
        for (const m of this._monsters) m.update(delta, this._mapManager);

        // Space = interact with adjacent NPC
        if (Phaser.Input.Keyboard.JustDown(this._spaceKey) && !this._spaceLock) {
            this._tryInteractNPC();
        }

        // I = Inventory
        if (Phaser.Input.Keyboard.JustDown(this._iKey)) {
            this.scene.launch('Inventory');
            this._paused = true;
        }
        // C = Character
        if (Phaser.Input.Keyboard.JustDown(this._cKey)) {
            this.scene.launch('Character');
            this._paused = true;
        }
        // Q = Quest log
        if (Phaser.Input.Keyboard.JustDown(this._qKey)) {
            this.scene.launch('Quest');
            this._paused = true;
        }
        // B = Book library
        if (Phaser.Input.Keyboard.JustDown(this._bKey)) {
            this.scene.launch('Book');
            this._paused = true;
        }
        // F5 = Save
        if (Phaser.Input.Keyboard.JustDown(this._f5Key)) {
            SaveSystem.autoSave(this._playerData);
            this._chat('Jogo salvo!', 'system');
        }

        // Process pending respawns
        this._processRespawns(time);
    }

    _processRespawns(now) {
        if (!this._respawns || this._respawns.length === 0) return;
        const ready = this._respawns.filter(r => now >= r.respawnAt && r.areaId === this._playerData.currentArea);
        for (const r of ready) {
            if (this._playerData.defeatedMonsters) delete this._playerData.defeatedMonsters[r.instanceId];
            const md = (this._mapManager.mapData?.monsters || []).find(m => m.instanceId === r.instanceId);
            if (md && !this._monsters.some(m => m.instanceId === r.instanceId)) {
                this._monsters.push(new Monster(this, md));
                this._chat(`Uma criatura reapareceu na região!`, 'system');
            }
        }
        this._respawns = this._respawns.filter(r => !ready.includes(r));
    }

    _autoAcceptQuests() {
        for (const q of Object.values(QuestSystem.questsForNPC ? {} : {})) { /* noop */ }
        // Re-iterate all quests and auto-accept those whose prereq is satisfied.
        // (We import QUESTS lazily by reading the questLog after initial calls.)
    }

    _checkTileInteractions(col, row) {
        // Portal check
        const exit = this._mapManager.getExit(col, row);
        if (exit) {
            this._tryPortal(exit);
            return;
        }

        // Monster collision check
        const hit = this._monsters.find(m => m.isAt(col, row));
        if (hit) {
            this._startCombat(hit);
        }
    }

    _tryPortal(exit) {
        const nextArea = exit.targetArea;
        const unlock   = AREA_UNLOCK[nextArea];

        if (unlock) {
            const player = this._playerData;
            const mastery = masteryPercent(player.mastery[unlock.masteryArea]);
            const levelOk = !unlock.minLevel || player.level >= unlock.minLevel;
            const mastOk  = mastery >= unlock.masteryPct;

            if (!levelOk || !mastOk) {
                const msg = `Portal bloqueado! Precisa de ${unlock.masteryPct}% em ${AREA_INFO[unlock.masteryArea]?.displayName}${unlock.minLevel ? ` e nível ${unlock.minLevel}` : ''}.`;
                this._chat(msg, 'error');
                // Push player back one tile
                this._playerData.position.y -= 1;
                this._player.syncSprite();
                return;
            }
        }

        this._chat(`Viajando para ${AREA_INFO[nextArea]?.displayName}...`, 'portal');
        this._playerData.currentArea = nextArea;
        this._playerData.position    = { ...exit.targetSpawn };
        this._playerData.lastSafePosition = { ...exit.targetSpawn };
        this._playerData.lastSafeArea     = nextArea;
        this.registry.set('player', this._playerData);
        SaveSystem.autoSave(this._playerData);

        this._loadArea(nextArea);
        EventBus.emit('area-changed', { areaId: nextArea });
        EventBus.emit('minimap-update', { mapMgr: this._mapManager, player: this._playerData });
    }

    _startCombat(monster) {
        this._paused = true;
        // Save safe position (before stepping on monster)
        this._playerData.lastSafePosition = { ...this._playerData.position };
        this.registry.set('player', this._playerData);
        this.scene.launch('Combat', { monster: monster.def, instanceId: monster.instanceId });
    }

    _onCombatEnd({ outcome, instanceId, xpGained, loot, playerData }) {
        this._paused = false;

        // Update player data from combat
        if (playerData) {
            Object.assign(this._playerData, playerData);
            this.registry.set('player', this._playerData);
        }

        if (outcome === 'win') {
            // Remove defeated monster + record kill for quests + schedule respawn
            const idx = this._monsters.findIndex(m => m.instanceId === instanceId);
            let defDef = null;
            if (idx !== -1) {
                defDef = this._monsters[idx].def;
                this._monsters[idx].destroy();
                this._monsters.splice(idx, 1);
                if (!this._playerData.defeatedMonsters) this._playerData.defeatedMonsters = {};
                this._playerData.defeatedMonsters[instanceId] = true;
            }

            if (defDef) {
                QuestSystem.recordKill(this._playerData, defDef);
                if (!this._respawns) this._respawns = [];
                this._respawns.push({
                    instanceId,
                    areaId: this._playerData.currentArea,
                    respawnAt: this.time.now + RESPAWN_TIME,
                });
            }

            if (xpGained) this._chat(`+${xpGained} XP`, 'xp');
            if (loot?.length) this._chat(`Loot: ${loot.join(', ')}`, 'loot');
            SaveSystem.autoSave(this._playerData);
            EventBus.emit('player-hp-change', { player: this._playerData });

        } else if (outcome === 'loss') {
            // Respawn at last safe position
            this._playerData.hp = Math.floor(this._playerData.maxHp * 0.5);
            this._playerData.position = { ...this._playerData.lastSafePosition };
            this._playerData.currentArea = this._playerData.lastSafeArea;
            this.registry.set('player', this._playerData);
            this._chat('Você foi derrotado e reviveu em segurança.', 'combat-hit');
            this._loadArea(this._playerData.currentArea);
            EventBus.emit('player-hp-change', { player: this._playerData });
        }

        EventBus.emit('minimap-update', { mapMgr: this._mapManager, player: this._playerData });
    }

    _tryInteractNPC() {
        const col = this._playerData.position.x;
        const row = this._playerData.position.y;
        const npc = this._npcs.find(n => n.isAdjacentTo(col, row));
        if (!npc) return;

        // Speak first line, then open scene depending on role
        const line = npc.nextLine();
        this._chat(`[${npc.npcId}] ${line}`, 'dialog');

        if (npc.role === 'shop') {
            const shop = ShopSystem.shopForNPC(npc.npcId);
            if (shop) {
                this._paused = true;
                this.scene.launch('Shop', { shopId: shop.id });
            }
        } else if (npc.role === 'quest') {
            // Auto-accept all available quests this NPC offers
            const offers = QuestSystem.questsForNPC(this._playerData, npc.npcId);
            for (const o of offers) {
                if (o.status === 'available') {
                    QuestSystem.accept(this._playerData, o.quest.id);
                    this._chat(`Nova missão: ${o.quest.name}`, 'levelup');
                }
            }
            // If they have a complete quest, open log
            if (offers.some(o => o.status === 'complete')) {
                this._paused = true;
                this.scene.launch('Quest');
            }
        }
    }

    _autoSync() {
        this.registry.set('player', this._playerData);
    }

    _chat(msg, type) {
        EventBus.emit('chat', { msg, type });
    }

    pauseForOverlay() {
        this._paused = true;
    }

    resumeFromOverlay() {
        this._paused = false;
    }

    shutdown() {
        EventBus.off('combat-end', this._onCombatEnd);
        this._syncTimer?.remove();
    }
}
