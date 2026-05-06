import EventBus from '../utils/EventBus.js';
import { AREA_INFO, ELEMENTS } from '../constants.js';
import { xpToNext, masteryPercent, xpToNextElement } from '../systems/XPSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { spendStatPoint } from '../systems/XPSystem.js';
import { richToHtml } from '../utils/RichText.js';

const MAX_MESSAGES = 80;

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
            elementalList: document.getElementById('elemental-mastery-list'),
            chatMsgs:   document.getElementById('chat-messages'),
            chatLog:    document.getElementById('chat-log'),
            minimap:    document.getElementById('minimap-canvas'),
            btnInv:     document.getElementById('btn-inventory'),
            btnChar:    document.getElementById('btn-character'),
            btnQuest:   document.getElementById('btn-quests'),
            btnBook:    document.getElementById('btn-books'),
            btnSkill:   document.getElementById('btn-skill'),
            btnSave:    document.getElementById('btn-save'),
        };
    }

    _bindEvents() {
        EventBus.on('player-hp-change',     ({ player }) => this._updateVitals(player));
        EventBus.on('player-xp-change',     ({ player }) => this._updateXP(player));
        EventBus.on('element-xp-change',    ({ player }) => this._updateElementalMastery(player));
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

        // Action button alerts
        EventBus.on('item-alert',  () => this._setAlert('btnInv', true));
        EventBus.on('skill-alert', () => this._setAlert('btnSkill', true));
        EventBus.on('quest-complete', () => this._setAlert('btnQuest', true));
    }

    _bindButtons() {
        this._els.btnInv?.addEventListener('click', () => {
            const ws = this.scene.get('World');
            if (ws) { ws.pauseForOverlay(); ws.scene.launch('Inventory'); }
            this._setAlert('btnInv', false);
            const player = this.registry.get('player');
            if (player) player.pendingItemAlert = false;
        });
        this._els.btnChar?.addEventListener('click', () => {
            const ws = this.scene.get('World');
            if (ws) { ws.pauseForOverlay(); ws.scene.launch('Character'); }
        });
        this._els.btnQuest?.addEventListener('click', () => {
            const ws = this.scene.get('World');
            if (ws) { ws.pauseForOverlay(); ws.scene.launch('Quest'); }
            this._setAlert('btnQuest', false);
        });
        this._els.btnBook?.addEventListener('click', () => {
            const ws = this.scene.get('World');
            if (ws) { ws.pauseForOverlay(); ws.scene.launch('Book'); }
        });
        this._els.btnSkill?.addEventListener('click', () => {
            const ws = this.scene.get('World');
            if (ws) { ws.pauseForOverlay(); ws.scene.launch('Skill'); }
            this._setAlert('btnSkill', false);
        });
        this._els.btnSave?.addEventListener('click', () => {
            const player = this.registry.get('player');
            if (player) {
                SaveSystem.autoSave(player);
                this.addMsg('Jogo salvo!', 'system');
            }
        });
    }

    _setAlert(btnKey, on) {
        const btn = this._els[btnKey];
        if (!btn) return;
        if (on) btn.classList.add('alert');
        else    btn.classList.remove('alert');
    }

    addMsg(text, type = '') {
        const el = this._els.chatMsgs || document.getElementById('chat-messages');
        if (!el) return;
        const div = document.createElement('div');
        div.className = `chat-msg ${type}`;

        // Timestamp in São Paulo (Brasília) timezone — HH:MM:SS
        const tsStr = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
        }).format(new Date());
        const tsSpan = `<span class="chat-time">[${tsStr}]</span> `;

        // Apply both layers: explicit {{tag:value}} tokens and keyword auto-highlight
        const inner = highlightKeywords(richToHtml(String(text)));
        div.innerHTML = tsSpan + inner;
        el.appendChild(div);

        while (el.children.length > MAX_MESSAGES) el.removeChild(el.firstChild);

        // Auto-scroll
        const log = this._els.chatLog || document.getElementById('chat-log');
        if (log) log.scrollTop = log.scrollHeight;
        el.scrollTop = el.scrollHeight;
    }

    _updateAll(player) {
        player = player || this.registry.get('player');
        if (!player) return;
        this._updateVitals(player);
        this._updateXP(player);
        this._updateStats(player);
        this._updateMastery(player);
        this._updateElementalMastery(player);
        const e = this._els;
        if (e.charName) e.charName.textContent = player.name || 'Aventureiro';
        if (e.level) e.level.textContent = player.level;
        // Restore alert states from player flags
        this._setAlert('btnInv', !!player.pendingItemAlert);
    }

    _updateVitals(player) {
        player = player || this.registry.get('player');
        if (!player) return;
        const e = this._els;
        setBar(e.hpBar, e.hpText, player.hp, player.maxHp);
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

    _updateElementalMastery(player) {
        player = player || this.registry.get('player');
        if (!player || !this._els.elementalList) return;
        const el = this._els.elementalList;
        el.innerHTML = '';

        for (const [id, data] of Object.entries(ELEMENTS)) {
            const m = player.elementalMastery[id];
            if (!m) continue;

            const next = xpToNextElement(m.level);
            const pct = Math.min(100, (m.xp / next) * 100);
            
            // Get texture as data URL for DOM
            const textureKey = `icon_element_${id}`;
            const texture = this.textures.get(textureKey);
            const canvas = texture.getSourceImage();
            const iconUrl = canvas ? canvas.toDataURL() : '';

            const div = document.createElement('div');
            div.className = 'element-mastery-item';
            div.innerHTML = `
                <div class="element-header">
                    <img src="${iconUrl}" class="element-icon" />
                    <span class="element-name" style="color: #${data.color.toString(16).padStart(6, '0')}">${data.name}</span>
                    <span class="element-level">Nv. ${m.level}</span>
                </div>
                <div class="element-bar-track">
                    <div class="element-bar-fill" style="width:${pct}%; background-color: #${data.color.toString(16).padStart(6, '0')}"></div>
                </div>
            `;
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

// Skip text that already contains <span> markers so we don't double-process
function highlightKeywords(text) {
    // Only escape the parts NOT already wrapped in spans
    if (text.includes('<span')) {
        // assume input was already markup; only auto-augment plain segments
        return text.replace(/>([^<]+)</g, (m, body) => {
            return '>' + augmentPlain(body) + '<';
        });
    }
    return augmentPlain(escapeHtml(text));
}

function augmentPlain(s) {
    // XP / HP / Foco / Ouro counters
    s = s.replace(/(\+\d+\s*XP)/gi,                '<span class="kw-xp">$1</span>');
    s = s.replace(/([+−-]\d+\s*HP)/gi,             '<span class="kw-damage">$1</span>');
    s = s.replace(/(\+\d+\s*Foco)/gi,              '<span class="kw-focus">$1</span>');
    s = s.replace(/(\d+\s*ouro)/gi,                '<span class="kw-gold">$1</span>');
    // Level
    s = s.replace(/\b(NÍVEL\s*\d+|nv\.?\s*\d+|NIVEL\s*ACIMA|nível\s*\d+)\b/gi, '<span class="kw-level">$1</span>');
    // Combat keywords
    s = s.replace(/\b(CRÍTICO!?|SUPER\s*EFICAZ!?)\b/gi, '<span class="kw-crit">$1</span>');
    s = s.replace(/\b(ESQUIVA|esquivou|desviou)\b/gi,  '<span class="kw-dodge">$1</span>');
    s = s.replace(/\b(LOOT:?|ITENS?\s*OBTIDOS?)\b/gi,   '<span class="kw-loot">$1</span>');
    s = s.replace(/\b(VITÓRIA!?|venceu)\b/gi,           '<span class="kw-good">$1</span>');
    s = s.replace(/\b(DERROTAD[OA]|FALHOU)\b/gi,        '<span class="kw-bad">$1</span>');
    // Rarity & importance
    s = s.replace(/\b(Lendári[oa]|LENDÁRIO)\b/gi,       '<span class="kw-legendary">$1</span>');
    s = s.replace(/\b(Épic[oa]|ÉPICO)\b/gi,             '<span class="kw-epic">$1</span>');
    s = s.replace(/\b(Rar[oa]|RARO|raro)\b/gi,          '<span class="kw-rare">$1</span>');
    s = s.replace(/\b(Incomum|INCOMUM)\b/gi,            '<span class="kw-uncommon">$1</span>');
    s = s.replace(/\b(Proibid[oa]|Essencial|Muito Importante|Importante)\b/gi, '<span class="kw-rarity">$1</span>');
    // Quest / dialog
    s = s.replace(/\b(missão|Missão|Missões)\b/g,       '<span class="kw-quest">$1</span>');
    // Elements
    s = s.replace(/\b(Fogo|FIRE)\b/g,                   '<span class="kw-fire">$1</span>');
    s = s.replace(/\b(Água|WATER)\b/g,                  '<span class="kw-water">$1</span>');
    s = s.replace(/\b(Terra|EARTH)\b/g,                 '<span class="kw-earth">$1</span>');
    s = s.replace(/\b(Gelo|ICE)\b/g,                    '<span class="kw-ice">$1</span>');
    s = s.replace(/\b(Trevas|SHADOW)\b/g,               '<span class="kw-shadow">$1</span>');
    // Damage / heal as words
    s = s.replace(/\b(DANO|dano)\b/g,                   '<span class="kw-damage">$1</span>');
    s = s.replace(/\b(cura|HEAL|curou|regenerou)\b/gi,  '<span class="kw-heal">$1</span>');
    return s;
}
