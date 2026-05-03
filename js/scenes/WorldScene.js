import { TILE_SIZE, AREA_INFO, AREA_UNLOCK, PLAYER_DEFAULTS, RESPAWN_TIME, REGEN_INTERVAL_MS, REGEN_HP_PER_TICK, REGEN_FOCUS_PER_TICK } from '../constants.js';
import { MapManager } from '../systems/MapManager.js';
import { Player } from '../entities/Player.js';
import { Monster } from '../entities/Monster.js';
import { NPC } from '../entities/NPC.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { masteryPercent } from '../systems/XPSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { SkillSystem } from '../systems/SkillSystem.js';
import { TutorialSystem } from '../systems/TutorialSystem.js';
import { ITEMS } from '../data/items.js';
import { buildPlayerSprite } from '../utils/Draw.js';
import EventBus from '../utils/EventBus.js';

export class WorldScene extends Phaser.Scene {
    constructor() { super('World'); }

    create() {
        this._playerData = this.registry.get('player') || JSON.parse(JSON.stringify(PLAYER_DEFAULTS));
        // Rebuild player sprite from saved appearance
        if (this._playerData.appearance) buildPlayerSprite(this, this._playerData.appearance);

        this._mapManager = new MapManager(this);
        this._monsters   = [];
        this._npcs       = [];
        this._paused     = false;
        this._spaceLock  = false;
        this._respawns   = [];

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
        this._kKey      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this._f5Key     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F5);

        QuestSystem.init(this._playerData);
        SkillSystem.init(this._playerData);
        TutorialSystem.init(this._playerData);
        CombatSystem.refreshWeaponElement(this._playerData, ITEMS);

        EventBus.on('combat-end',     this._onCombatEnd.bind(this));
        EventBus.on('player-level-up', this._onLevelUp.bind(this));

        this._syncTimer  = this.time.addEvent({ delay: 5000, loop: true, callback: this._autoSync, callbackScope: this });
        this._regenTimer = this.time.addEvent({ delay: REGEN_INTERVAL_MS, loop: true, callback: this._regenTick, callbackScope: this });

        EventBus.emit('area-changed', { areaId: this._playerData.currentArea });
        EventBus.emit('minimap-update', { mapMgr: this._mapManager, player: this._playerData });

        this._chat(`Bem-vindo a ${AREA_INFO[this._playerData.currentArea]?.displayName || '?'}!`, 'portal');

        // First-time tutorial
        TutorialSystem.trigger(this._playerData, this, 'start');

        // Show skill selector if pending picks
        this.time.delayedCall(800, () => this._maybeOpenSkill());
    }

    // ── Area & spawning ───────────────────────────────────────────────────────

    _loadArea(areaId) {
        this._monsters.forEach(m => m.destroy());
        this._npcs.forEach(n => n.destroy());
        this._monsters = [];
        this._npcs = [];
        if (this._player) this._player.destroy();

        this._mapManager.load(areaId);
        this._playerData.currentArea = areaId;

        const pos = this._playerData.position;
        this._player = new Player(this, { ...this._playerData, position: { ...pos } });

        const defeated = this._playerData.defeatedMonsters || {};
        const mapMons  = this._mapManager.mapData?.monsters || [];
        for (const md of mapMons) {
            if (defeated[md.instanceId]) continue;
            this._monsters.push(new Monster(this, md));
        }

        const mapNpcs = this._mapManager.mapData?.npcs || [];
        for (const nd of mapNpcs) this._npcs.push(new NPC(this, nd));
    }

    // ── Update loop ───────────────────────────────────────────────────────────

    update(time, delta) {
        if (this._paused) return;

        const moved = this._player.update(delta, this._cursors, this._wasd, this._mapManager);
        if (moved) {
            this._playerData.position = { ...moved };
            this._checkTileInteractions(moved.x, moved.y);
            EventBus.emit('minimap-update', { mapMgr: this._mapManager, player: this._playerData });
            this._maybeNearPortalTutorial(moved.x, moved.y);
            this._maybeNearMerchantTutorial(moved.x, moved.y);
        }

        for (const m of this._monsters) m.update(delta, this._mapManager);

        if (Phaser.Input.Keyboard.JustDown(this._spaceKey) && !this._spaceLock) this._tryInteractNPC();
        if (Phaser.Input.Keyboard.JustDown(this._iKey)) this._openOverlay('Inventory');
        if (Phaser.Input.Keyboard.JustDown(this._cKey)) this._openOverlay('Character');
        if (Phaser.Input.Keyboard.JustDown(this._qKey)) this._openOverlay('Quest');
        if (Phaser.Input.Keyboard.JustDown(this._bKey)) this._openOverlay('Book');
        if (Phaser.Input.Keyboard.JustDown(this._kKey)) this._openOverlay('Skill');
        if (Phaser.Input.Keyboard.JustDown(this._f5Key)) {
            SaveSystem.autoSave(this._playerData);
            this._chat('Jogo salvo!', 'system');
        }

        this._processRespawns(time);
    }

    _openOverlay(sceneKey) {
        this.scene.launch(sceneKey);
        this._paused = true;
    }

    // ── Regen tick ────────────────────────────────────────────────────────────

    _regenTick() {
        if (this._paused) return;
        const p = this._playerData;
        const hpRegen    = REGEN_HP_PER_TICK    + SkillSystem.effectsOf(p, 'hpRegenBonus');
        const focusRegen = REGEN_FOCUS_PER_TICK + SkillSystem.effectsOf(p, 'focusRegenBonus');
        let changed = false;
        if (p.hp < p.maxHp) { p.hp = Math.min(p.maxHp, p.hp + hpRegen); changed = true; }
        if (p.focus < p.maxFocus) { p.focus = Math.min(p.maxFocus, p.focus + focusRegen); changed = true; }
        if (changed) EventBus.emit('player-hp-change', { player: p });
    }

    _processRespawns(now) {
        if (!this._respawns?.length) return;
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

    // ── Tile interactions ─────────────────────────────────────────────────────

    _checkTileInteractions(col, row) {
        const exit = this._mapManager.getExit(col, row);
        if (exit) { this._tryPortal(exit); return; }

        const hit = this._monsters.find(m => m.isAt(col, row));
        if (hit) this._startCombat(hit);
    }

    _maybeNearPortalTutorial(col, row) {
        const exits = this._mapManager.mapData?.exits || [];
        const close = exits.some(e => Math.abs(e.x - col) + Math.abs(e.y - row) <= 1);
        if (close) TutorialSystem.trigger(this._playerData, this, 'near_portal');
    }

    _maybeNearMerchantTutorial(col, row) {
        const merchant = this._npcs.find(n => n.role === 'shop' && Math.abs(n.tileX - col) + Math.abs(n.tileY - row) <= 1);
        if (merchant) TutorialSystem.trigger(this._playerData, this, 'near_merchant');
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
                const reasons = [];
                if (!levelOk) reasons.push(`nível ${unlock.minLevel}`);
                if (!mastOk)  reasons.push(`${unlock.masteryPct}% de maestria em ${AREA_INFO[unlock.masteryArea]?.displayName}`);
                this._chat(`Portal bloqueado! Necessita: ${reasons.join(' e ')}.`, 'error');
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
        this._playerData.lastSafePosition = { ...this._playerData.position };
        this.registry.set('player', this._playerData);
        TutorialSystem.trigger(this._playerData, this, 'first_monster');
        this.scene.launch('Combat', { monster: monster.def, instanceId: monster.instanceId });
    }

    // ── Combat result ─────────────────────────────────────────────────────────

    _onCombatEnd({ outcome, instanceId, xpGained, loot, playerData }) {
        this._paused = false;

        if (playerData) {
            Object.assign(this._playerData, playerData);
            this.registry.set('player', this._playerData);
        }

        if (outcome === 'win') {
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
                this._respawns.push({
                    instanceId, areaId: this._playerData.currentArea,
                    respawnAt: this.time.now + RESPAWN_TIME,
                });
            }
            if (xpGained) this._chat(`+${xpGained} XP`, 'xp');
            if (loot?.length) {
                this._chat(`Loot: ${loot.join(', ')}`, 'loot');
                this._playerData.pendingItemAlert = true;
                EventBus.emit('item-alert', { player: this._playerData });
                if (loot.some(s => s.startsWith('Livro:'))) {
                    TutorialSystem.trigger(this._playerData, this, 'first_book');
                }
            }
            SaveSystem.autoSave(this._playerData);
            EventBus.emit('player-hp-change', { player: this._playerData });

        } else if (outcome === 'loss') {
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

    _onLevelUp() {
        TutorialSystem.trigger(this._playerData, this, 'first_levelup');
        // open skill picker if there are unlocked skills
        this.time.delayedCall(600, () => this._maybeOpenSkill());
    }

    _maybeOpenSkill() {
        const pending = SkillSystem.pendingChoices(this._playerData);
        if (pending.length > 0) {
            this._chat(`Você pode escolher uma nova habilidade! Pressione K.`, 'levelup');
            EventBus.emit('skill-alert', { player: this._playerData });
        }
    }

    // ── NPC interaction → dialog ──────────────────────────────────────────────

    _tryInteractNPC() {
        const col = this._playerData.position.x;
        const row = this._playerData.position.y;
        const npc = this._npcs.find(n => n.isAdjacentTo(col, row));
        if (!npc) return;

        // Build dialog lines (cycle through their script + role-specific tail)
        const lines = [...(npc.dialog || [])];
        if (npc.role === 'shop') {
            lines.push('Quer ver minhas mercadorias?');
        } else if (npc.role === 'quest') {
            const offers = QuestSystem.questsForNPC(this._playerData, npc.npcId);
            const newOnes = offers.filter(o => o.status === 'available');
            const completes = offers.filter(o => o.status === 'complete');
            for (const o of newOnes) lines.push(`>> Missão: ${o.quest.name}`);
            for (const o of completes) lines.push(`>> Recompensa pronta: ${o.quest.name}!`);
        }

        this._paused = true;
        this.scene.launch('Dialog', {
            speaker: this._displayName(npc.npcId),
            lines,
            role: npc.role || 'quest',
            onClose: () => this._afterDialog(npc),
        });
    }

    _afterDialog(npc) {
        if (npc.role === 'shop') {
            const shop = ShopSystem.shopForNPC(npc.npcId);
            if (shop) { this.scene.launch('Shop', { shopId: shop.id }); this._paused = true; return; }
        }
        if (npc.role === 'quest') {
            const offers = QuestSystem.questsForNPC(this._playerData, npc.npcId);
            for (const o of offers) {
                if (o.status === 'available') {
                    QuestSystem.accept(this._playerData, o.quest.id);
                    this._chat(`Nova missão: ${o.quest.name}`, 'levelup');
                    TutorialSystem.trigger(this._playerData, this, 'quest_received');
                }
            }
            if (offers.some(o => o.status === 'complete')) {
                this.scene.launch('Quest');
                this._paused = true;
                return;
            }
        }
        this._paused = false;
    }

    _displayName(npcId) {
        const map = {
            elder: 'Anciã da Vila', scholar: 'Estudioso',
            merchant: 'Mercador', smith: 'Ferreiro', trader: 'Comerciante',
            sage: 'Sábio', hermit: 'Eremita', gambler: 'Apostador',
            astronomer: 'Astrônomo', oracle: 'Oráculo',
        };
        return map[npcId] || npcId;
    }

    _autoSync() { this.registry.set('player', this._playerData); }

    _chat(msg, type) { EventBus.emit('chat', { msg, type }); }

    pauseForOverlay() { this._paused = true; }
    resumeFromOverlay() { this._paused = false; }

    shutdown() {
        EventBus.off('combat-end', this._onCombatEnd);
        EventBus.off('player-level-up', this._onLevelUp);
        this._syncTimer?.remove();
        this._regenTimer?.remove();
    }
}
