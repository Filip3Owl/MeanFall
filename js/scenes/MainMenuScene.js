import { SaveSystem } from '../systems/SaveSystem.js';
import { PLAYER_DEFAULTS } from '../constants.js';

export class MainMenuScene extends Phaser.Scene {
    constructor() { super('MainMenu'); }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Background
        this.add.rectangle(W / 2, H / 2, W, H, 0x050302).setDepth(0);

        // Stars
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;
            const s = Math.random() * 1.5 + 0.5;
            this.add.rectangle(x, y, s, s, 0xffffff, Math.random() * 0.8 + 0.2).setDepth(1);
        }

        // Title
        this.add.text(W / 2, 80, 'StatQuest RPG', {
            fontSize: '36px', color: '#ffd700', fontFamily: 'Courier New',
            stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(2);

        this.add.text(W / 2, 125, 'Aprenda Estatística Jogando', {
            fontSize: '14px', color: '#d4af37', fontFamily: 'Courier New',
        }).setOrigin(0.5).setDepth(2);

        // Divider
        this.add.rectangle(W / 2, 150, 300, 2, 0xd4af37, 0.5).setDepth(2);

        // Buttons
        this._makeButton(W / 2, 200, 'Novo Jogo', () => this._newGame());

        const saves = SaveSystem.loadAll();
        if (saves.some(s => s !== null)) {
            this._makeButton(W / 2, 250, 'Continuar', () => this._loadGame(saves));
        }

        this._makeButton(W / 2, 300, 'Como Jogar', () => this._showHelp());

        // Player preview animation
        const px = this.add.image(W / 2, 380, 'sprite_player').setDepth(2).setScale(2);
        this.tweens.add({ targets: px, y: 370, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // Version
        this.add.text(W - 8, H - 8, 'v1.0', {
            fontSize: '10px', color: '#444', fontFamily: 'Courier New',
        }).setOrigin(1, 1).setDepth(2);

        this._helpVisible = false;
    }

    _makeButton(x, y, label, callback) {
        const btn = this.add.text(x, y, `[ ${label} ]`, {
            fontSize: '18px', color: '#d4af37', fontFamily: 'Courier New',
            backgroundColor: '#0d0a03',
            padding: { x: 16, y: 8 },
        }).setOrigin(0.5).setDepth(3).setInteractive({ useHandCursor: true });

        btn.on('pointerover',  () => btn.setStyle({ color: '#ffffff', backgroundColor: '#2a2005' }));
        btn.on('pointerout',   () => btn.setStyle({ color: '#d4af37', backgroundColor: '#0d0a03' }));
        btn.on('pointerdown',  () => callback());
        return btn;
    }

    _newGame() {
        const name = window.prompt('Nome do seu personagem:', 'Aventureiro') || 'Aventureiro';
        const data = { ...JSON.parse(JSON.stringify(PLAYER_DEFAULTS)), name };
        this.registry.set('player', data);
        this.scene.start('World');
        this.scene.launch('UI');
    }

    _loadGame(saves) {
        // Find most recent save
        const valid = saves.filter(s => s !== null);
        const latest = valid.sort((a, b) => new Date(b.saveTimestamp) - new Date(a.saveTimestamp))[0];
        this.registry.set('player', latest);
        this.scene.start('World');
        this.scene.launch('UI');
    }

    _showHelp() {
        if (this._helpVisible) return;
        this._helpVisible = true;
        const W = this.scale.width;
        const H = this.scale.height;

        const overlay = this.add.rectangle(W / 2, H / 2, W - 60, H - 80, 0x0d0a03, 0.97)
            .setStrokeStyle(2, 0xd4af37).setDepth(10).setInteractive();

        const lines = [
            'COMO JOGAR',
            '',
            'WASD ou Setas  →  Mover personagem',
            'Espaco         →  Falar com NPCs',
            'I              →  Abrir inventario',
            'C              →  Ver personagem',
            'F5             →  Salvar jogo',
            '',
            'COMBATE:',
            'Ao se aproximar de um monstro, um combate se inicia.',
            'Responda a pergunta de estatistica para atacar.',
            'Resposta correta = voce causa dano ao monstro.',
            'Resposta errada  = o monstro te ataca.',
            'Foco: use para obter uma dica (custa 10 de Foco).',
            '',
            'PROGRESSAO:',
            'Ganhe XP, suba de nivel e desbloqueie novas areas.',
            'Cada area ensina um topico de estatistica!',
            '',
            '[Clique para fechar]',
        ];

        this.add.text(W / 2, H / 2, lines.join('\n'), {
            fontSize: '12px', color: '#d4af37', fontFamily: 'Courier New',
            align: 'left', lineSpacing: 6,
        }).setOrigin(0.5).setDepth(11);

        overlay.on('pointerdown', () => {
            overlay.destroy();
            this._helpVisible = false;
            this.children.list
                .filter(c => c.depth === 11)
                .forEach(c => c.destroy());
        });
    }
}
