import { BOOKS, BOOK_IMPORTANCE } from '../data/books.js';
import { ELEMENTS } from '../constants.js';
import EventBus from '../utils/EventBus.js';

export class CompendiumScene extends Phaser.Scene {
    constructor() { super('Compendium'); }

    init() {
        this._selectedTopic = null;
        this._selectedBookId = null;
    }

    create() {
        this._player = this.registry.get('player');
        const W = 544, H = 480;

        // Dark overlay
        this.add.rectangle(0, 0, W, H, 0x050201, 0.95).setOrigin(0);

        // Header
        this.add.rectangle(0, 0, W, 32, 0x1a1a1a, 1).setOrigin(0);
        this.add.text(W / 2, 16, 'COMPÊNDIO DE ESTATÍSTICA', {
            fontSize: '14px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Close button hint
        this.add.text(W - 10, 16, '[ESC] VOLTAR', {
            fontSize: '10px', color: '#888', fontFamily: 'Courier New'
        }).setOrigin(1, 0.5);

        // Sidebar (Topics)
        this._buildSidebar();

        // Main Content Area
        this._contentGroup = this.add.group();
        this._renderEmptyState();

        // Input
        this.input.keyboard.on('keydown-ESC', () => this._close());
    }

    _buildSidebar() {
        const x = 10, yStart = 45;
        const topics = [
            { id: 'data_types',       name: 'Tipos de Dados',    elem: 'normal' },
            { id: 'mean_median_mode', name: 'Tendência Central', elem: 'earth' },
            { id: 'spread',           name: 'Dispersão',        elem: 'ice' },
            { id: 'probability',      name: 'Probabilidade',    elem: 'fire' },
            { id: 'distributions',    name: 'Distribuições',    elem: 'water' },
            { id: 'inference',        name: 'Inferência',       elem: 'shadow' }
        ];

        this.add.text(x, yStart - 15, 'TÓPICOS:', { fontSize: '10px', color: '#554422', fontFamily: 'Courier New' });

        topics.forEach((t, i) => {
            const ty = yStart + i * 28;
            const elem = ELEMENTS[t.elem];
            const bg = this.add.rectangle(x, ty, 160, 24, 0x1a1a1a, 1).setOrigin(0).setInteractive({ useHandCursor: true });
            const txt = this.add.text(x + 8, ty + 12, t.name, {
                fontSize: '11px', color: '#aaaaaa', fontFamily: 'Courier New'
            }).setOrigin(0, 0.5);

            bg.on('pointerover', () => { if (this._selectedTopic !== t.id) bg.setFillStyle(0x2a2a2a); });
            bg.on('pointerout',  () => { if (this._selectedTopic !== t.id) bg.setFillStyle(0x1a1a1a); });
            bg.on('pointerdown', () => this._selectTopic(t, bg, txt));

            // Icon/Bullet
            this.add.circle(x + 152, ty + 12, 3, elem.color, 0.6);
        });
    }

    _selectTopic(topic, bg, txt) {
        this._selectedTopic = topic.id;
        // Reset all sidebar buttons (visual)
        this.children.list.filter(c => c.type === 'Rectangle' && c.x === 10).forEach(r => r.setFillStyle(0x1a1a1a));
        this.children.list.filter(c => c.type === 'Text' && c.x === 18).forEach(t => t.setColor('#aaaaaa'));
        
        bg.setFillStyle(0x332211);
        txt.setColor('#ffd700');

        this._renderTopicContent(topic);
    }

    _renderEmptyState() {
        this._contentGroup.clear(true, true);
        const txt = this.add.text(360, 240, 'Selecione um tópico para\nrevisar o conhecimento\nadquirido em sua jornada.', {
            fontSize: '12px', color: '#444', fontFamily: 'Courier New', align: 'center'
        }).setOrigin(0.5);
        this._contentGroup.add(txt);
    }

    _renderTopicContent(topic) {
        this._contentGroup.clear(true, true);
        const x = 180, y = 45;

        this.add.text(x, y, `CONHECIMENTO: ${topic.name.toUpperCase()}`, {
            fontSize: '14px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold'
        }, this._contentGroup);

        // Find books for this topic that the player has READ
        const readBooks = this._player.readBooks || [];
        const topicBooks = Object.values(BOOKS).filter(b => b.topic === topic.id);
        const unlocked = topicBooks.filter(b => readBooks.includes(b.id));

        if (unlocked.length === 0) {
            this.add.text(x, y + 40, 'Nenhum conhecimento registrado.\n\nDerrote criaturas deste elemento\npara encontrar livros e pergaminhos.', {
                fontSize: '11px', color: '#666', fontFamily: 'Courier New', fontStyle: 'italic'
            }, this._contentGroup);
            return;
        }

        let curY = y + 40;
        unlocked.forEach(book => {
            const imp = BOOK_IMPORTANCE[book.importance];
            const title = this.add.text(x, curY, `• ${book.title}`, {
                fontSize: '12px', color: imp.hex, fontFamily: 'Courier New', fontStyle: 'bold'
            }, this._contentGroup).setInteractive({ useHandCursor: true });

            title.on('pointerover', () => title.setColor('#ffffff'));
            title.on('pointerout',  () => title.setColor(imp.hex));
            title.on('pointerdown', () => this._showBookDetail(book));

            curY += 20;
        });

        // Statistics/Mastery brief
        const mastery = this._player.mastery[this._player.currentArea] || { attempted: 0, correct: 0 };
        const pct = mastery.attempted > 0 ? Math.floor((mastery.correct / mastery.attempted) * 100) : 0;
        
        const masteryText = `Precisão de Batalha nesta região: ${pct}% (${mastery.correct}/${mastery.attempted})`;
        this.add.text(x, 450, masteryText, {
            fontSize: '10px', color: '#888', fontFamily: 'Courier New'
        }, this._contentGroup);
    }

    _showBookDetail(book) {
        // Simple detail overlay
        const W = 544, H = 480;
        const overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.8).setOrigin(0).setDepth(100).setInteractive();
        const panel = this.add.rectangle(W/2, H/2, 400, 300, 0x1a1510, 1).setStrokeStyle(2, 0xd4af37).setDepth(101);
        
        const title = this.add.text(W/2, H/2 - 130, book.title, {
            fontSize: '15px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold', wordWrap: { width: 360 }, align: 'center'
        }).setOrigin(0.5).setDepth(102);

        // Combine all pages for the compendium view
        const content = book.pages.join('\n\n');
        const text = this.add.text(W/2 - 180, H/2 - 90, content, {
            fontSize: '11px', color: '#e8dfd1', fontFamily: 'Courier New', wordWrap: { width: 360 }, lineSpacing: 4
        }).setOrigin(0).setDepth(102);

        const closeHint = this.add.text(W/2, H/2 + 130, '[ CLIQUE PARA VOLTAR ]', {
            fontSize: '10px', color: '#888', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(102);

        overlay.on('pointerdown', () => {
            overlay.destroy(); panel.destroy(); title.destroy(); text.destroy(); closeHint.destroy();
        });
    }

    _close() {
        this.scene.stop();
        EventBus.emit('overlay-closed');
    }
}
