import { TILE_SIZE, AREA_INFO, AREA_UNLOCK, PLAYER_DEFAULTS, RESPAWN_TIME, REGEN_INTERVAL_MS, REGEN_HP_PER_TICK, REGEN_FOCUS_PER_TICK, ELEMENTS } from '../constants.js';
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
import { FogManager } from '../systems/FogManager.js';
import { ITEMS } from '../data/items.js';
import { ANCIENT_SCROLLS } from '../data/lore.js';
import { buildPlayerSprite } from '../utils/Draw.js';
import EventBus from '../utils/EventBus.js';
import { Sound } from '../utils/SoundSystem.js';
import { Music } from '../utils/MusicSystem.js';

export class WorldScene extends Phaser.Scene {
    constructor() { super('World'); }

    create() {
        this._playerData = this.registry.get('player') || JSON.parse(JSON.stringify(PLAYER_DEFAULTS));
        
        // Ensure new systems have data even on old saves
        if (!this._playerData.discoveredTiles) this._playerData.discoveredTiles = {};
        if (!this._playerData.elementalMastery) {
            this._playerData.elementalMastery = JSON.parse(JSON.stringify(PLAYER_DEFAULTS.elementalMastery));
        }
        if (!this._playerData.openedChests) this._playerData.openedChests = {};
        if (!this._playerData.inventory) this._playerData.inventory = [];
        if (!this._playerData.equipment) this._playerData.equipment = {};
        
        // Ensure stats exist
        const stats = ['strength', 'intelligence', 'agility', 'vitality'];
        stats.forEach(s => { if (this._playerData[s] === undefined) this._playerData[s] = 5; });
        
        // Rebuild player sprite from saved appearance
        if (this._playerData.appearance) buildPlayerSprite(this, this._playerData.appearance);

        this._mapManager = new MapManager(this);
        this._fogManager = new FogManager(this);
        this._monsters   = [];
        this._npcs       = [];
        this._npcIcons   = this.add.group();
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
        this._lKey      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
        this._nKey      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
        this._f5Key     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F5);

        QuestSystem.init(this._playerData);
        SkillSystem.init(this._playerData);
        TutorialSystem.init(this._playerData);
        CombatSystem.refreshWeaponElement(this._playerData, ITEMS);

        EventBus.on('combat-end',     this._onCombatEnd.bind(this));
        EventBus.on('player-level-up', this._onLevelUp.bind(this));
        EventBus.on('element-xp-change', () => this._updateElementalAura());

        this._syncTimer  = this.time.addEvent({ delay: 5000, loop: true, callback: this._autoSync, callbackScope: this });
        this._regenTimer = this.time.addEvent({ delay: REGEN_INTERVAL_MS, loop: true, callback: this._regenTick, callbackScope: this });

        this._updateElementalAura();
        this._fogManager.update(this._playerData);
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
            if (!this._mapManager.isWalkable(md.x, md.y)) continue;
            this._monsters.push(new Monster(this, md));
        }

        const mapNpcs = this._mapManager.mapData?.npcs || [];
        this._npcIcons.clear(true, true);
        for (const nd of mapNpcs) {
            const npc = new NPC(this, nd);
            this._npcs.push(npc);

            // Quest indicator icon
            const icon = this.add.text(npc.sprite.x, npc.sprite.y - 14, '!', {
                fontSize: '12px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5, 0.5).setDepth(100).setVisible(false);
            icon.npcId = nd.id;
            this._npcIcons.add(icon);
        }

        // The map is always 544×480 (same as the canvas), so the correct
        // camera position is always scroll (0,0). Reset here to fix any
        // drift left by combat pan/zoom animations.
        const cam = this.cameras.main;
        cam.stopFollow();
        cam.setZoom(1);
        cam.setScroll(0, 0);

        Music.play(areaId);
    }

    // ── Update loop ───────────────────────────────────────────────────────────

    update(time, delta) {
        if (this._paused) return;

        const moved = this._player.update(delta, this._cursors, this._wasd, this._mapManager);
        if (moved) {
            this._playerData.position = { ...moved };
            this._fogManager.update(this._playerData);
            this._checkTileInteractions(moved.x, moved.y);
            EventBus.emit('minimap-update', { mapMgr: this._mapManager, player: this._playerData });
            this._maybeNearPortalTutorial(moved.x, moved.y);
            this._maybeNearMerchantTutorial(moved.x, moved.y);
        }

        // Update quest icons
        this._npcIcons.getChildren().forEach(icon => {
            const quests = QuestSystem.questsForNPC(this._playerData, icon.npcId);
            const hasComplete = quests.some(q => q.status === 'complete');
            const hasAvailable = quests.some(q => q.status === 'available');

            if (hasComplete) {
                icon.setText('?').setColor('#44ff88').setVisible(true);
            } else if (hasAvailable) {
                icon.setText('!').setColor('#ffd700').setVisible(true);
            } else {
                icon.setVisible(false);
            }
        });

        for (const m of this._monsters) m.update(delta, this._mapManager);

        this._syncAuraPosition();

        if (Phaser.Input.Keyboard.JustDown(this._spaceKey) && !this._spaceLock) this._tryInteract();
        if (Phaser.Input.Keyboard.JustDown(this._iKey)) this._openOverlay('Inventory');
        if (Phaser.Input.Keyboard.JustDown(this._cKey)) this._openOverlay('Character');
        if (Phaser.Input.Keyboard.JustDown(this._qKey)) this._openOverlay('Quest');
        if (Phaser.Input.Keyboard.JustDown(this._bKey)) this._openOverlay('Book');
        if (Phaser.Input.Keyboard.JustDown(this._kKey)) this._openOverlay('Skill');
        if (Phaser.Input.Keyboard.JustDown(this._lKey)) this._openOverlay('Compendium');
        if (Phaser.Input.Keyboard.JustDown(this._nKey)) this._openOverlay('Scratchpad');
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

    _spawnRespawnEffect(monster) {
        // Visual fanfare when a creature reappears: pulsing rings + sprite fade-in
        const cx = monster.tileX * TILE_SIZE + TILE_SIZE / 2;
        const cy = monster.tileY * TILE_SIZE + TILE_SIZE / 2;
        const elemColor = monster.def.color || 0xffffff;

        // Sprite fade in from invisible + scale punch
        if (monster.sprite) {
            monster.sprite.setAlpha(0).setScale(0.2);
            this.tweens.add({
                targets: monster.sprite, alpha: 1, scale: 1,
                duration: 600, ease: 'Back.easeOut',
            });
        }
        if (monster._nameLabel) {
            monster._nameLabel.setAlpha(0);
            this.tweens.add({ targets: monster._nameLabel, alpha: 1, duration: 800, delay: 200 });
        }

        // Two expanding rings of color
        const makeRing = (delay) => {
            const ring = this.add.circle(cx, cy, 4, elemColor, 0).setStrokeStyle(2, elemColor, 0.9).setDepth(7);
            this.tweens.add({
                targets: ring,
                radius: 24, alpha: 0,
                duration: 700, delay,
                ease: 'Sine.easeOut',
                onComplete: () => ring.destroy(),
            });
        };
        makeRing(0);
        makeRing(180);

        // Sparkle particles around the spawn point
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const dx = Math.cos(a) * 16;
            const dy = Math.sin(a) * 16;
            const spark = this.add.rectangle(cx, cy, 2, 2, 0xffffff, 1).setDepth(8);
            this.tweens.add({
                targets: spark,
                x: cx + dx, y: cy + dy, alpha: 0,
                duration: 600,
                ease: 'Quad.easeOut',
                onComplete: () => spark.destroy(),
            });
        }
    }

    _processRespawns(now) {
        if (!this._respawns?.length) return;
        const ready = this._respawns.filter(r => now >= r.respawnAt && r.areaId === this._playerData.currentArea);
        for (const r of ready) {
            if (this._playerData.defeatedMonsters) delete this._playerData.defeatedMonsters[r.instanceId];
            const md = (this._mapManager.mapData?.monsters || []).find(m => m.instanceId === r.instanceId);
            if (md && this._mapManager.isWalkable(md.x, md.y) && !this._monsters.some(m => m.instanceId === r.instanceId)) {
                const newMon = new Monster(this, md);
                this._monsters.push(newMon);
                this._spawnRespawnEffect(newMon);
                this._chat(`{{accent:${newMon.def.name}}} reapareceu na região.`, 'system');
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
                if (!levelOk) reasons.push(`{{level:nível ${unlock.minLevel}}}`);
                if (!mastOk)  reasons.push(`{{accent:${unlock.masteryPct}% de maestria}} em {{accent:${AREA_INFO[unlock.masteryArea]?.displayName}}}`);
                this._chat(`{{bad:Portal bloqueado!}} Você precisa de: ${reasons.join(' e ')}.`, 'error');
                this._playerData.position.y -= 1;
                this._player.syncSprite();
                return;
            }
        }

        if (nextArea === 'village' && this._playerData.currentArea !== 'village') {
            const heal = this._playerData.maxHp - this._playerData.hp;
            if (heal > 0) {
                this._playerData.hp = this._playerData.maxHp;
                this._playerData.focus = this._playerData.maxFocus;
                this._chat('Você descansa na vila e {{heal:recupera todas as suas energias}}!', 'heal');
                EventBus.emit('player-hp-change', { player: this._playerData });
                this._player.syncSprite();
                return;
            }
        }

        this._chat(`Viajando para {{accent:${AREA_INFO[nextArea]?.displayName}}}...`, 'portal');
        Sound.portal();
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

        // ── Combat Entry Animation ───────────────────────────────────────────
        
        // Stop following the player to allow custom pan/zoom
        this.cameras.main.stopFollow();
        
        // Shake and Flash
        this.cameras.main.shake(400, 0.015);
        this.cameras.main.flash(400, 255, 255, 255);

        // Zoom and Pan towards the monster
        if (monster.sprite) {
            this.cameras.main.pan(monster.sprite.x, monster.sprite.y, 400, 'Quad.easeIn');
            this.cameras.main.zoomTo(2.5, 400, 'Quad.easeIn');
        }

        // Wait for animation to finish before launching CombatScene
        this.time.delayedCall(450, () => {
            Music.play('combat');
            this.scene.launch('Combat', { monster: monster.def, instanceId: monster.instanceId });
            
            // Reset camera immediately behind the overlay — map is always
            // 544×480 = canvas size, so scroll (0,0) is always correct.
            this.cameras.main.zoomTo(1, 0);
            this.cameras.main.setScroll(0, 0);
        });
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
            if (xpGained) this._chat(`Você obteve {{xp:+${xpGained} XP}} na batalha!`, 'xp');
            if (loot?.length) {
                Sound.coins();
                this._chat(`{{accent:RECOMPENSAS:}} ${loot.join(', ')}`, 'loot');
                this._playerData.pendingItemAlert = true;
                EventBus.emit('item-alert', { player: this._playerData });
                if (loot.some(s => s.includes('Livro:'))) {
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
            this._chat('{{bad:Você foi derrotado!}} Recuperando as energias em um local seguro...', 'combat-hit');
            this._loadArea(this._playerData.currentArea);
            EventBus.emit('player-hp-change', { player: this._playerData });
        }

        EventBus.emit('minimap-update', { mapMgr: this._mapManager, player: this._playerData });
        Music.play(this._playerData.currentArea);
    }

    _onLevelUp() {
        TutorialSystem.trigger(this._playerData, this, 'first_levelup');
        this._chat('{{level:SUBIU DE NÍVEL!}} Seus atributos aumentaram.', 'levelup');
        // open skill picker if there are unlocked skills
        this.time.delayedCall(600, () => this._maybeOpenSkill());
    }

    _maybeOpenSkill() {
        const pending = SkillSystem.pendingChoices(this._playerData);
        if (pending.length > 0) {
            this._chat(`{{accent:Pressione K}} para escolher uma nova habilidade!`, 'levelup');
            EventBus.emit('skill-alert', { player: this._playerData });
        }
    }

    // ── Interaction ──────────────────────────────────────────────────────────

    _tryInteract() {
        const col = this._playerData.position.x;
        const row = this._playerData.position.y;

        // Check for adjacent NPCs
        const npc = this._npcs.find(n => n.isAdjacentTo(col, row));
        if (npc) {
            this._interactNPC(npc);
            return;
        }

        // Check for adjacent Chests (Tile 7)
        const adj = [
            { x: col, y: row - 1 }, { x: col, y: row + 1 },
            { x: col - 1, y: row }, { x: col + 1, y: row }
        ];
        for (const pos of adj) {
            // Check for tile-based chests
            if (this._mapManager.getTileId(pos.x, pos.y) === 7) {
                this._interactChest(pos.x, pos.y);
                return;
            }
            
            // Check for scroll sprites
            const scroll = this._mapManager.getScrollAt(pos.x, pos.y);
            if (scroll) {
                this._interactScroll(scroll);
                return;
            }
        }
    }

    _interactScroll(scroll) {
        const data = ANCIENT_SCROLLS[scroll.sprite.scrollId];
        if (!data) return;

        Sound.interact();
        this._paused = true;
        this.scene.launch('Dialog', {
            speaker: data.title,
            lines: [data.text],
            role: 'lore',
            onClose: () => { this._paused = false; }
        });
    }

    _interactNPC(npc) {
        // Build dialog lines (cycle through their full lore script)
        const lines = [...(npc.dialog || [])];

        // Action follow-up info (shop/quest) included as final lore-flavored line
        let action = null;
        if (npc.role === 'shop') {
            lines.push('Examine minhas mercadorias quando estiver pronto, viajante.');
            action = { label: 'ABRIR LOJA', kind: 'shop' };
        } else if (npc.role === 'quest') {
            const offers = QuestSystem.questsForNPC(this._playerData, npc.npcId);
            const completes = offers.filter(o => o.status === 'complete');
            const newOnes   = offers.filter(o => o.status === 'available');
            for (const o of newOnes)   lines.push(`Tarefa proposta: {{accent:${o.quest.name}}}.`);
            for (const o of completes) lines.push(`Você completou: {{good:${o.quest.name}}}! Reivindique sua recompensa.`);
            if (completes.length > 0) action = { label: 'VER MISSÕES', kind: 'quest' };
        }

        Sound.interact();
        this._paused = true;
        this.scene.launch('Dialog', {
            speaker: this._displayName(npc.npcId),
            lines,
            role: npc.role || 'quest',
            action,
            onClose: () => this._afterDialog(npc),
            onAction: action ? () => this._performNpcAction(action.kind, npc) : null,
        });
    }

    _interactChest(x, y) {
        const instanceId = `chest_${this._playerData.currentArea}_${x}_${y}`;
        if (this._playerData.openedChests[instanceId]) {
            this._chat('Este baú já está vazio.', 'system');
            return;
        }

        // 30% chance of being a mimic in dungeon, 10% elsewhere
        const mimicChance = this._playerData.currentArea === 'dungeon' ? 0.3 : 0.1;
        const isActuallyMimic = Math.random() < mimicChance;

        this._paused = true;
        this.scene.launch('Inference', {
            targetId: instanceId,
            isActuallyMimic,
            onResult: (result) => {
                this._paused = false;
                if (result === 'open') {
                    this._openChest(x, y, instanceId);
                } else if (result === 'mimic_trigger') {
                    this._triggerMimic(x, y, instanceId);
                }
            }
        });
    }

    _openChest(x, y, instanceId) {
        this._playerData.openedChests[instanceId] = true;
        Sound.chest();
        const gold = 20 + Math.floor(Math.random() * 30);
        this._playerData.gold += gold;
        this._chat(`Você abriu o baú e encontrou {{gold:${gold} moedas de ouro}}!`, 'loot');
        EventBus.emit('player-stats-changed', { player: this._playerData });
        SaveSystem.autoSave(this._playerData);
    }

    _triggerMimic(x, y, instanceId) {
        this._chat('{{bad:O BAÚ ERA UM MÍMICO!}}', 'combat-hit');
        // Start combat with a special mimic monster
        const mimicDef = {
            id: 'mimic', name: 'Mímico de Madeira', level: this._playerData.level + 1,
            maxHp: 80, hp: 80, attackDamage: 12, defense: 2, xpReward: 50, goldReward: 40,
            element: 'shadow', questionTopic: 'inference', questionDifficulty: 'medium'
        };
        this._startCombat({ def: mimicDef, instanceId });
    }

    _performNpcAction(kind, npc) {
        this._paused = true;
        let launched = false;
        if (kind === 'shop') {
            const shop = ShopSystem.shopForNPC(npc.npcId);
            if (shop) { this.scene.launch('Shop', { shopId: shop.id }); launched = true; }
        } else if (kind === 'quest') {
            this.scene.launch('Quest'); launched = true;
        }
        // Safety: if nothing opened, unpause immediately to prevent permanent freeze
        if (!launched) this._paused = false;
    }

    _afterDialog(npc) {
        this._paused = false; // FIRST — guaranteed even if something below throws
        try {
            if (npc.role === 'quest') {
                const offers = QuestSystem.questsForNPC(this._playerData, npc.npcId);
                for (const o of offers) {
                    if (o.status === 'available') {
                        QuestSystem.accept(this._playerData, o.quest.id);
                        this._chat(`Nova {{quest:missão}} aceita: {{accent:${o.quest.name}}}`, 'levelup');
                        TutorialSystem.trigger(this._playerData, this, 'quest_received');
                    }
                }
            }
        } catch (e) { console.error('[WorldScene] _afterDialog error:', e); }
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

    // ── Elemental Aura Visual Effect ──────────────────────────────────────────

    _updateElementalAura() {
        const p = this._playerData;
        if (!p.elementalMastery || !this._player?.sprite) return;

        // Find highest level element (must be at least level 2 to show aura)
        let bestId = null;
        let maxLevel = 1;

        for (const [id, m] of Object.entries(p.elementalMastery)) {
            if (m.level > maxLevel) {
                maxLevel = m.level;
                bestId = id;
            }
        }

        // Cleanup old aura
        if (this._playerAura) {
            this._playerAura.destroy();
            this._playerAura = null;
        }

        if (!bestId) return;

        const data = ELEMENTS[bestId];
        const color = data.color;

        // Create a new container for the aura that will follow the player
        const aura = this.add.container(0, 0).setDepth(this._player.sprite.depth - 1);
        this._playerAura = aura;

        // 1. Static glow
        const glow = this.add.circle(0, 0, 16, color, 0.2);
        aura.add(glow);
        this.tweens.add({ targets: glow, alpha: 0.4, scale: 1.2, duration: 1000, yoyo: true, repeat: -1 });

        // 2. Rotating particles
        for (let i = 0; i < 3; i++) {
            const p = this.add.rectangle(0, 0, 4, 4, color, 0.8);
            aura.add(p);
            const angle = (i / 3) * Math.PI * 2;
            const radius = 18;
            p.x = Math.cos(angle) * radius;
            p.y = Math.sin(angle) * radius;

            this.tweens.add({
                targets: p,
                angle: 360,
                duration: 2000,
                repeat: -1,
                onUpdate: (tween) => {
                    const currentAngle = angle + (tween.progress * Math.PI * 2);
                    p.x = Math.cos(currentAngle) * radius;
                    p.y = Math.sin(currentAngle) * radius;
                }
            });
        }
    }

    _syncAuraPosition() {
        if (this._playerAura && this._player?.sprite) {
            this._playerAura.setPosition(this._player.sprite.x, this._player.sprite.y + 4);
        }
    }

    shutdown() {
        EventBus.off('combat-end', this._onCombatEnd);
        EventBus.off('player-level-up', this._onLevelUp);
        this._syncTimer?.remove();
        this._regenTimer?.remove();
    }
}
