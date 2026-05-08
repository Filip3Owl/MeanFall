import { BOOKS, BOOK_IMPORTANCE } from '../data/books.js';
import { ELEMENTS } from '../constants.js';
import EventBus from '../utils/EventBus.js';

const W = 544, H = 480;
const SIDEBAR_W  = 168;
const CONTENT_X  = SIDEBAR_W + 14;
const CONTENT_W  = W - CONTENT_X - 8;

const TOPICS = [
    { id: 'data_types',       name: 'Tipos de Dados',    elem: 'normal' },
    { id: 'mean_median_mode', name: 'Tendência Central', elem: 'earth'  },
    { id: 'spread',           name: 'Dispersão',         elem: 'ice'    },
    { id: 'probability',      name: 'Probabilidade',     elem: 'fire'   },
    { id: 'distributions',    name: 'Distribuições',     elem: 'water'  },
    { id: 'inference',        name: 'Inferência',        elem: 'shadow' },
];

export class CompendiumScene extends Phaser.Scene {
    constructor() { super('Compendium'); }

    init() {
        this._selectedTopic  = null;
        this._sidebarBtns    = [];   // { topic, bg, txt, dot } — small array, safe to iterate
        this._contentObjs    = [];   // everything in the content area — destroyed manually
        this._detailObjs     = [];   // book-detail overlay objects
    }

    create() {
        this._player = this.registry.get('player');

        // Background
        this.add.rectangle(0, 0, W, H, 0x050201, 0.97).setOrigin(0);

        // Header bar
        this.add.rectangle(0, 0, W, 34, 0x111111, 1).setOrigin(0);
        this.add.rectangle(0, 33, W, 1, 0xd4af37, 0.4).setOrigin(0);
        this.add.text(W / 2, 17, 'COMPÊNDIO DE ESTATÍSTICA', {
            fontSize: '16px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0.5);
        this.add.text(W - 10, 17, '[ESC]', {
            fontSize: '14px', color: '#666', fontFamily: 'Courier New',
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this._close());

        // Sidebar divider
        this.add.rectangle(SIDEBAR_W + 6, 34, 1, H - 34, 0xd4af37, 0.2).setOrigin(0);

        this._buildSidebar();
        this._renderEmptyState();

        this.input.keyboard.on('keydown-ESC', () => this._close());
    }

    // ── Sidebar ───────────────────────────────────────────────────────────────

    _buildSidebar() {
        const x = 8, yStart = 48;
        this.add.text(x, yStart - 12, 'TÓPICOS', {
            fontSize: '12px', color: '#443322', fontFamily: 'Courier New',
        });

        TOPICS.forEach((topic, i) => {
            const ty      = yStart + i * 30;
            const elem    = ELEMENTS[topic.elem] || {};
            const readCnt = this._readCountForTopic(topic.id);
            const total   = this._totalBooksForTopic(topic.id);

            const bg = this.add.rectangle(x, ty, SIDEBAR_W - 4, 26, 0x111111, 1)
                .setOrigin(0).setInteractive({ useHandCursor: true });

            const dot = this.add.circle(x + 8, ty + 13, 4, elem.color ?? 0x888888, readCnt > 0 ? 1 : 0.25);

            const txt = this.add.text(x + 18, ty + 13, topic.name, {
                fontSize: '13px', color: readCnt > 0 ? '#aaaaaa' : '#444444', fontFamily: 'Courier New',
            }).setOrigin(0, 0.5);

            const cntTx = this.add.text(x + SIDEBAR_W - 10, ty + 13, `${readCnt}/${total}`, {
                fontSize: '11px', color: readCnt > 0 ? '#666633' : '#333333', fontFamily: 'Courier New',
            }).setOrigin(1, 0.5);

            bg.on('pointerover', () => {
                if (this._selectedTopic !== topic.id) bg.setFillStyle(0x1e1a10);
            });
            bg.on('pointerout', () => {
                if (this._selectedTopic !== topic.id) bg.setFillStyle(0x111111);
            });
            bg.on('pointerdown', () => this._selectTopic(topic));

            this._sidebarBtns.push({ topic, bg, txt, dot, cntTx });
        });

        // Total progress bar at sidebar bottom
        const readAll  = (this._player.readBooks || []).length;
        const totalAll = Object.keys(BOOKS).length;
        const pct = totalAll > 0 ? readAll / totalAll : 0;

        this.add.text(x, H - 46, 'PROGRESSO TOTAL:', {
            fontSize: '11px', color: '#443322', fontFamily: 'Courier New',
        });
        this.add.rectangle(x, H - 34, SIDEBAR_W - 4, 10, 0x1a1a1a, 1).setOrigin(0);
        this.add.rectangle(x, H - 34, Math.max(2, (SIDEBAR_W - 4) * pct), 10, 0xd4af37, 0.6).setOrigin(0);
        this.add.text(x + SIDEBAR_W / 2 - 2, H - 22, `${readAll} / ${totalAll} livros`, {
            fontSize: '11px', color: '#666633', fontFamily: 'Courier New',
        }).setOrigin(0.5, 0);
    }

    _readCountForTopic(topicId) {
        const readBooks = this._player.readBooks || [];
        return Object.values(BOOKS).filter(b => b.topic === topicId && readBooks.includes(b.id)).length;
    }

    _totalBooksForTopic(topicId) {
        return Object.values(BOOKS).filter(b => b.topic === topicId).length;
    }

    // ── Topic selection ───────────────────────────────────────────────────────

    _selectTopic(topic) {
        this._selectedTopic = topic.id;

        // Reset all sidebar buttons — iterate our small stored array, NOT children.list
        this._sidebarBtns.forEach(({ topic: t, bg, txt }) => {
            const isActive = t.id === topic.id;
            bg.setFillStyle(isActive ? 0x2a1e08 : 0x111111);
            bg.setStrokeStyle(isActive ? 1 : 0, 0xd4af37);
            txt.setColor(isActive ? '#ffd700' : (this._readCountForTopic(t.id) > 0 ? '#aaaaaa' : '#444444'));
        });

        this._renderTopicContent(topic);
    }

    // ── Content area ──────────────────────────────────────────────────────────

    _clearContent() {
        this._contentObjs.forEach(o => o?.destroy());
        this._contentObjs = [];
    }

    _addContent(obj) {
        this._contentObjs.push(obj);
        return obj;
    }

    _renderEmptyState() {
        this._clearContent();
        this._addContent(this.add.text(CONTENT_X + CONTENT_W / 2, 260,
            'Selecione um tópico para revisar\no conhecimento adquirido\nem sua jornada.', {
                fontSize: '14px', color: '#333', fontFamily: 'Courier New', align: 'center',
            }).setOrigin(0.5));
    }

    _renderTopicContent(topic) {
        this._clearContent();

        const x = CONTENT_X, y = 44;

        // Topic header
        const elem = ELEMENTS[topic.elem] || {};
        this._addContent(this.add.rectangle(x, y, CONTENT_W, 28, 0x111111, 1).setOrigin(0));
        this._addContent(this.add.circle(x + 10, y + 14, 5, elem.color ?? 0x888888, 0.9));
        this._addContent(this.add.text(x + 22, y + 14, topic.name.toUpperCase(), {
            fontSize: '14px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold',
        }).setOrigin(0, 0.5));

        // Mastery stats for this topic's area
        const areaMap = {
            data_types: 'village', mean_median_mode: 'meadows',
            spread: 'forest', probability: 'plains',
            distributions: 'mountains', inference: 'dungeon',
        };
        const areaKey = areaMap[topic.id];
        const mastery = this._player.mastery?.[areaKey] || { attempted: 0, correct: 0 };
        const pct = mastery.attempted > 0 ? Math.floor((mastery.correct / mastery.attempted) * 100) : 0;
        const masteryColor = pct >= 70 ? '#44cc44' : pct >= 40 ? '#ddaa22' : '#888888';
        this._addContent(this.add.text(x + CONTENT_W, y + 14, `Precisão: ${pct}%`, {
            fontSize: '12px', color: masteryColor, fontFamily: 'Courier New',
        }).setOrigin(1, 0.5));

        // Books list
        const readBooks  = this._player.readBooks || [];
        const topicBooks = Object.values(BOOKS).filter(b => b.topic === topic.id);
        const unlocked   = topicBooks.filter(b => readBooks.includes(b.id));
        const locked     = topicBooks.filter(b => !readBooks.includes(b.id));

        let curY = y + 38;

        if (unlocked.length === 0) {
            this._addContent(this.add.text(x + CONTENT_W / 2, 240,
                'Nenhum livro encontrado ainda.\n\nDerrote criaturas deste elemento\npara desbloquear entradas.', {
                    fontSize: '13px', color: '#444', fontFamily: 'Courier New',
                    align: 'center', fontStyle: 'italic',
                }).setOrigin(0.5));
        } else {
            // Section label
            this._addContent(this.add.text(x + 4, curY, `${unlocked.length} entrada(s) desbloqueada(s):`, {
                fontSize: '11px', color: '#665533', fontFamily: 'Courier New',
            }));
            curY += 16;

            unlocked.forEach(book => {
                const imp       = BOOK_IMPORTANCE[book.importance] || BOOK_IMPORTANCE.normal;
                const rowBg     = this._addContent(
                    this.add.rectangle(x, curY, CONTENT_W, 28, 0x111111, 1).setOrigin(0)
                        .setInteractive({ useHandCursor: true }));

                const impBadge  = this._addContent(
                    this.add.rectangle(x, curY, 4, 28, imp.color, 1).setOrigin(0));

                const titleTx   = this._addContent(
                    this.add.text(x + 10, curY + 14, book.title, {
                        fontSize: '13px', color: imp.hex, fontFamily: 'Courier New',
                    }).setOrigin(0, 0.5));

                const authorTx  = this._addContent(
                    this.add.text(x + CONTENT_W - 2, curY + 14, book.author || '', {
                        fontSize: '11px', color: '#444', fontFamily: 'Courier New', fontStyle: 'italic',
                    }).setOrigin(1, 0.5));

                rowBg.on('pointerover',  () => { rowBg.setFillStyle(0x1e1a10); titleTx.setColor('#ffffff'); });
                rowBg.on('pointerout',   () => { rowBg.setFillStyle(0x111111); titleTx.setColor(imp.hex); });
                rowBg.on('pointerdown',  () => this._showBookDetail(book));

                curY += 30;
            });
        }

        // Locked entries (greyed out)
        if (locked.length > 0) {
            curY += 6;
            this._addContent(this.add.text(x + 4, curY, `${locked.length} entrada(s) ainda bloqueada(s):`, {
                fontSize: '11px', color: '#333', fontFamily: 'Courier New',
            }));
            curY += 14;
            locked.forEach(book => {
                this._addContent(this.add.text(x + 10, curY, `• ${book.title}`, {
                    fontSize: '12px', color: '#2a2a2a', fontFamily: 'Courier New',
                }));
                curY += 18;
            });
        }
    }

    // ── Book detail overlay ───────────────────────────────────────────────────

    _showBookDetail(book) {
        this._clearDetail();

        const imp      = BOOK_IMPORTANCE[book.importance] || BOOK_IMPORTANCE.normal;
        const allPages = book.pages || [];

        const add = obj => { this._detailObjs.push(obj); return obj; };

        // Backdrop
        add(this.add.rectangle(0, 0, W, H, 0x000000, 0.82).setOrigin(0).setDepth(50).setInteractive());

        // Panel
        const panelH = Math.min(380, 80 + allPages.length * 60);
        const panelY = H / 2 - panelH / 2;
        add(this.add.rectangle(W / 2, panelY, 420, panelH, 0x0e0c06, 1)
            .setStrokeStyle(2, imp.color).setDepth(51));

        // Importance bar
        add(this.add.rectangle(W / 2 - 210, panelY, 420, 4, imp.color, 0.7).setOrigin(0, 0).setDepth(52));

        // Title
        add(this.add.text(W / 2, panelY + 20, book.title, {
            fontSize: '14px', color: imp.hex, fontFamily: 'Courier New', fontStyle: 'bold',
            wordWrap: { width: 390 }, align: 'center',
        }).setOrigin(0.5, 0).setDepth(52));

        if (book.author) {
            add(this.add.text(W / 2, panelY + 38, `— ${book.author}`, {
                fontSize: '11px', color: '#555', fontFamily: 'Courier New', fontStyle: 'italic',
            }).setOrigin(0.5, 0).setDepth(52));
        }

        // Divider
        add(this.add.rectangle(W / 2, panelY + 52, 380, 1, 0xd4af37, 0.2).setDepth(52));

        // All pages concatenated (book summary view)
        const content = allPages.join('\n\n');
        add(this.add.text(W / 2 - 190, panelY + 60, content, {
            fontSize: '12px', color: '#d4c8b0', fontFamily: 'Courier New',
            wordWrap: { width: 388 }, lineSpacing: 3,
        }).setOrigin(0).setDepth(52));

        // Badge
        add(this.add.text(W / 2, panelY + panelH - 22, `[ ${imp.name.toUpperCase()} ]  — Clique para fechar`, {
            fontSize: '12px', color: '#666', fontFamily: 'Courier New',
        }).setOrigin(0.5).setDepth(52));

        // Close on any click
        this._detailObjs[0].on('pointerdown', () => this._clearDetail());
    }

    _clearDetail() {
        this._detailObjs.forEach(o => o?.destroy());
        this._detailObjs = [];
    }

    // ── Close ─────────────────────────────────────────────────────────────────

    _close() {
        this._clearContent();
        this._clearDetail();
        this.scene.stop();
        EventBus.emit('overlay-closed');
    }
}
