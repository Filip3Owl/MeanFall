import EventBus from '../utils/EventBus.js';
import { AREA_INFO } from '../constants.js';
import { xpToNext, masteryPercent } from '../systems/XPSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { spendStatPoint } from '../systems/XPSystem.js';

const MAX_MESSAGES = 50;

export class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UI', active: false }); }

    create() {
        this._bindDOM();
        this._bindEvents();
        this._bindButtons();
        this._updateAll();
    }

    _bindDOM() {
        this._els = {
            charName:   document.getElementById('char-name'),
            level:      document.getElementById('char-level'),
            hpBar:      document.getElementById('hp-bar'),
            hpText:     document.getElementById('hp-text'),
            focusBar:   document.getElementById('focus-bar'),
            focusText:  document.getElementById('focus-text'),
            xpBar:      document.getElementById('xp-bar'),
            xpText:     document.getElementById('xp-text'),
            statStr:    document.getElementById('stat-str'),
            statInt:    document.getElementById('stat-int'),
            statAgi:    document.getElementById('stat-agi'),
            statVit:    document.getElementById('stat-vit'),
            statGold:   document.getElementById('stat-gold'),
            areaName:   document.getElementById('area-name'),
            areaTopic:  document.getElementById('area-topic'),
            headerArea: document.getElementById('header-area'),
            masterList: document.getElementById('mastery-list'),
            chatMsgs:   document.getElementById('chat-messages'),
            minimap:    document.getElementById('minimap-canvas'),
        };
    }

    _bindEvents() {
        EventBus.on('player-hp-change',     ({ player }) => this._updateVitals(player));
        EventBus.on('player-xp-change',     ({ player }) => this._updateXP(player));
        EventBus.on('player-level-up',      ({ player }) => {
            this._updateAll(player);
            this.addMsg(`NIVEL ACIMA! Agora és nível ${player.level}!`, 'levelup');
        });
        EventBus.on('player-stats-changed', ({ player }) => this._updateStats(player));
        EventBus.on('area-changed',         ({ areaId }) => this._updateArea(areaId));
        EventBus.on('chat',                 ({ msg, type }) => this.addMsg(msg, type));
        EventBus.on('minimap-update',       ({ mapMgr, player }) => this._updateMinimap(mapMgr, player));
        EventBus.on('player-level-up',      ({ player }) => {
            if (player.availableStatPoints > 0) this._showStatPointPopup(player);
        });
    }

    _bindButtons() {
        document.getElementById('btn-inventory')?.addEventListener('click', () => {
            const ws = this.scene.get('World');
            if (ws) { ws.pauseForOverlay(); ws.scene.launch('Inventory'); }
        });
        document.getElementById('btn-character')?.addEventListener('click', () => {
            const ws = this.scene.get('World');
            if (ws) { ws.pauseForOverlay(); ws.scene.launch('Character'); }
        });
        document.getElementById('btn-quests')?.addEventListener('click', () => {
            const ws = this.scene.get('World');
            if (ws) { ws.pauseForOverlay(); ws.scene.launch('Quest'); }
        });
        document.getElementById('btn-books')?.addEventListener('click', () => {
            const ws = this.scene.get('World');
            if (ws) { ws.pauseForOverlay(); ws.scene.launch('Book'); }
        });
        document.getElementById('btn-save')?.addEventListener('click', () => {
            const player = this.registry.get('player');
            if (player) {
                SaveSystem.autoSave(player);
                this.addMsg('Jogo salvo!', 'system');
            }
        });
    }

    addMsg(text, type = '') {
        const el = document.getElementById('chat-messages');
        if (!el) return;
        const div = document.createElement('div');
        div.className = `chat-msg ${type}`;
        // Highlight numeric values and keywords in-line
        div.innerHTML = highlightKeywords(text);
        el.appendChild(div);
        while (el.children.length > MAX_MESSAGES) el.removeChild(el.firstChild);
        el.scrollTop = el.scrollHeight;
    }

    _updateAll(player) {
        player = player || this.registry.get('player');
        if (!player) return;
        this._updateVitals(player);
        this._updateXP(player);
        this._updateStats(player);
        this._updateMastery(player);
        const e = this._els;
        if (e.charName) e.charName.textContent = player.name || 'Aventureiro';
        if (e.level) e.level.textContent = player.level;
    }

    _updateVitals(player) {
        player = player || this.registry.get('player');
        if (!player) return;
        const e = this._els;
        setBar(e.hpBar,    e.hpText,    player.hp,    player.maxHp);
        setBar(e.focusBar, e.focusText, player.focus, player.maxFocus);
        if (e.level) e.level.textContent = player.level;
    }

    _updateXP(player) {
        player = player || this.registry.get('player');
        if (!player) return;
        const next = xpToNext(player.level);
        const pct  = Math.min(100, (player.xp / next) * 100);
        setBar(this._els.xpBar, this._els.xpText, player.xp, next);
        if (this._els.xpBar) this._els.xpBar.style.width = pct + '%';
    }

    _updateStats(player) {
        player = player || this.registry.get('player');
        if (!player) return;
        const e = this._els;
        if (e.statStr)  e.statStr.textContent  = player.strength;
        if (e.statInt)  e.statInt.textContent  = player.intelligence;
        if (e.statAgi)  e.statAgi.textContent  = player.agility;
        if (e.statVit)  e.statVit.textContent  = player.vitality;
        if (e.statGold) e.statGold.textContent = player.gold;
        this._updateMastery(player);
    }

    _updateMastery(player) {
        player = player || this.registry.get('player');
        if (!player || !this._els.masterList) return;
        const el = this._els.masterList;
        el.innerHTML = '';
        for (const [area, m] of Object.entries(player.mastery)) {
            const info = AREA_INFO[area];
            if (!info) continue;
            const pct = masteryPercent(m);
            const div = document.createElement('div');
            div.className = 'mastery-item';
            div.innerHTML = `
                <div class="mastery-name">${info.displayName}</div>
                <div class="mastery-bar-track"><div class="mastery-bar-fill" style="width:${pct}%"></div></div>
                <span class="mastery-pct">${pct}% (${m.correct}/${m.attempted})</span>`;
            el.appendChild(div);
        }
    }

    _updateArea(areaId) {
        const info = AREA_INFO[areaId];
        if (!info) return;
        const e = this._els;
        if (e.areaName)   e.areaName.textContent   = info.displayName;
        if (e.areaTopic)  e.areaTopic.textContent   = info.topic;
        if (e.headerArea) e.headerArea.textContent  = info.displayName;
    }

    _updateMinimap(mapMgr, player) {
        if (!mapMgr || !this._els.minimap) return;
        mapMgr.drawMinimap(this._els.minimap);
        mapMgr.drawMinimapPlayer(this._els.minimap, player.position.x, player.position.y);
    }

    _showStatPointPopup(player) {
        let popup = document.getElementById('stat-point-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'stat-point-popup';
            popup.className = 'visible';
            document.body.appendChild(popup);
        }

        popup.innerHTML = `<h3>NIVEL ACIMA! Distribua 1 ponto de atributo</h3>`;
        const stats = [
            ['strength', 'Forca (dano)'],
            ['intelligence', 'Inteligencia (XP bonus)'],
            ['agility', 'Agilidade (esquiva)'],
            ['vitality', 'Vitalidade (HP)'],
        ];
        stats.forEach(([key, label]) => {
            const btn = document.createElement('button');
            btn.className = 'stat-point-btn';
            btn.textContent = `${label} (atual: ${player[key]})`;
            btn.onclick = () => {
                spendStatPoint(player, key);
                this.registry.set('player', player);
                EventBus.emit('player-stats-changed', { player });
                popup.classList.remove('visible');
            };
            popup.appendChild(btn);
        });
        popup.classList.add('visible');
    }
}

function setBar(barEl, textEl, cur, max) {
    if (!barEl || !textEl) return;
    const pct = max > 0 ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0;
    barEl.style.width = pct + '%';
    textEl.textContent = `${Math.floor(cur)}/${Math.floor(max)}`;
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

// Wrap key gameplay terms with semantic spans for color theming.
function highlightKeywords(text) {
    let s = escapeHtml(text);
    s = s.replace(/(\+\d+\s*XP)/gi,                   '<span style="color:#ffaa22;font-weight:bold">$1</span>');
    s = s.replace(/([+−-]\d+\s*HP)/gi,                '<span style="color:#ff5555;font-weight:bold">$1</span>');
    s = s.replace(/(\d+\s*ouro)/gi,                   '<span style="color:#ffd700;font-weight:bold">$1</span>');
    s = s.replace(/\b(NÍVEL\s*\d+|nv\.?\s*\d+)\b/gi,  '<span style="color:#ffaa44;font-weight:bold">$1</span>');
    s = s.replace(/\b(CRÍTICO|SUPER\s*EFICAZ)\b/gi,   '<span style="color:#ff88cc;font-weight:bold">$1</span>');
    s = s.replace(/\b(LOOT|ITENS?\s*OBTIDOS?)\b/gi,   '<span style="color:#ffd700;font-weight:bold">$1</span>');
    s = s.replace(/\b(DANO|dano)\b/g,                 '<span style="color:#ff5555">$1</span>');
    s = s.replace(/\b(cura|HEAL)\b/gi,                '<span style="color:#55ff88">$1</span>');
    s = s.replace(/\b(Lendário|Épico|Raro|Incomum)\b/gi, '<span style="color:#bb88ff;font-weight:bold">$1</span>');
    return s;
}
