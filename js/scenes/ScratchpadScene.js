import EventBus from '../utils/EventBus.js';

export class ScratchpadScene extends Phaser.Scene {
    constructor() { super('Scratchpad'); }

    init(data) {
        this._parentScene = data.parent;
        this._history = [];
        this._currentInput = '';
    }

    create() {
        const W = 200, H = 340;
        const x = 330, y = 135; // Moved to the right to avoid overlapping question box

        // Container for positioning
        this._container = this.add.container(x, y);

        // Background (Old school dark RPG style)
        const bg = this.add.rectangle(0, 0, W, H, 0x0a0a0a, 0.98).setOrigin(0).setStrokeStyle(2, 0x554422);
        
        // Header
        const header = this.add.rectangle(0, 0, W, 24, 0x221108, 1).setOrigin(0);
        const title = this.add.text(W / 2, 12, 'CALCULADORA', {
            fontSize: '10px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Display Area (Calculation Result)
        this.add.rectangle(10, 30, W - 20, 34, 0x1a1a1a, 1).setOrigin(0).setStrokeStyle(1, 0x333333);
        this._displayTxt = this.add.text(W - 15, 47, '0', {
            fontSize: '16px', color: '#88ff88', fontFamily: 'Courier New', fontStyle: 'bold'
        }).setOrigin(1, 0.5);

        // History Area
        this.add.text(10, 70, 'HISTÓRICO:', { fontSize: '9px', color: '#554422', fontFamily: 'Courier New' });
        this._historyTxt = this.add.text(10, 80, '', {
            fontSize: '9px', color: '#888', fontFamily: 'Courier New', wordWrap: { width: W - 20 }
        });

        this._container.add([bg, header, title, this._displayTxt, this._historyTxt]);

        this._buildKeypad(W);

        // Input Listeners
        this.input.keyboard.on('keydown', this._onKeyDown.bind(this));
    }

    _buildKeypad(W) {
        const startY = 150;
        const btnW = 40, btnH = 30;
        const gap = 6;
        const keys = [
            ['7', '8', '9', '/'],
            ['4', '5', '6', '*'],
            ['1', '2', '3', '-'],
            ['0', '.', 'C', '+'],
            ['(', ')', '=']
        ];

        keys.forEach((row, rowIndex) => {
            row.forEach((key, colIndex) => {
                const bx = 12 + colIndex * (btnW + gap);
                const by = startY + rowIndex * (btnH + gap);
                
                // Wider button for "="
                const finalW = (key === '=') ? (btnW * 2 + gap) : btnW;
                
                const btnBg = this.add.rectangle(bx, by, finalW, btnH, 0x1a1505, 1)
                    .setOrigin(0).setStrokeStyle(1, 0x554422)
                    .setInteractive({ useHandCursor: true });
                
                const btnTxt = this.add.text(bx + finalW/2, by + btnH/2, key, {
                    fontSize: '12px', color: '#ffd700', fontFamily: 'Courier New', fontStyle: 'bold'
                }).setOrigin(0.5);

                btnBg.on('pointerover', () => btnBg.setFillStyle(0x332a0a));
                btnBg.on('pointerout',  () => btnBg.setFillStyle(0x1a1505));
                btnBg.on('pointerdown', () => {
                    btnBg.setFillStyle(0x554422);
                    this.time.delayedCall(100, () => btnBg.setFillStyle(0x332a0a));
                    this._handleKeyPress(key);
                });

                this._container.add([btnBg, btnTxt]);
            });
        });
    }

    _handleKeyPress(key) {
        if (key === '=') {
            this._calculate();
        } else if (key === 'C') {
            this._currentInput = '';
            this._updateDisplay();
        } else {
            this._currentInput += key;
            this._updateDisplay();
        }
    }

    _onKeyDown(event) {
        const key = event.key;

        if (key === 'Escape') {
            this._close();
            return;
        }

        if (key === 'Enter') {
            this._calculate();
            return;
        }

        if (key === 'Backspace') {
            this._currentInput = this._currentInput.slice(0, -1);
            this._updateDisplay();
            return;
        }

        if (key === 'c' || key === 'C') {
            this._currentInput = '';
            this._updateDisplay();
            return;
        }

        // Allow numbers and basic operators
        if (/^[0-9.+\-*/%()]$/.test(key)) {
            this._currentInput += key;
            this._updateDisplay();
        }
    }

    _updateDisplay() {
        this._displayTxt.setText(this._currentInput || '0');
    }

    _calculate() {
        if (!this._currentInput) return;
        
        try {
            // Basic sanitization: only allow math chars
            const expression = this._currentInput.replace(/[^0-9.+\-*/%()]/g, '');
            // Using Function instead of eval for a bit more safety in this context
            const result = new Function(`return ${expression}`)();
            
            const entry = `${expression} = ${result}`;
            this._history.unshift(entry);
            if (this._history.length > 8) this._history.pop();
            
            this._historyTxt.setText(this._history.join('\n'));
            this._currentInput = String(result);
            this._updateDisplay();
        } catch (e) {
            this._displayTxt.setText('ERRO');
            this.time.delayedCall(1000, () => this._updateDisplay());
        }
    }

    _close() {
        this.scene.stop();
        EventBus.emit('scratchpad-closed');
    }
}
