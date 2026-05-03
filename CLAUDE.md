# StatQuest RPG — CLAUDE.md

RPG educacional estilo Tibia para ensinar estatística, feito com Phaser 3 + JavaScript vanilla. O jogador explora mapas tile-based, combate monstros respondendo questões de estatística e evolui desbloqueando novas áreas.

---

## Stack Tecnológica

- **Phaser 3.60.0** (via CDN) — engine de jogo
- **JavaScript ES6 modules** — sem bundler, sem framework
- **HTML5 / CSS3** — layout 3 colunas + HUD DOM
- **LocalStorage** — sistema de save (3 slots)

---

## Estrutura de Arquivos

```
/
├── index.html
├── CLAUDE.md
├── css/
│   └── style.css
└── js/
    ├── main.js                  ❌ FALTANDO — entry point do Phaser
    ├── constants.js             ✅ Config global, XP table, tile types
    ├── utils/
    │   ├── EventBus.js          ✅ Pub/sub de eventos
    │   └── Draw.js              ✅ Geração procedural de texturas
    ├── systems/
    │   ├── CombatSystem.js      ✅ Cálculo de dano, itens, equipamentos
    │   ├── QuestionEngine.js    ✅ Filtro/seleção de questões, checar resposta
    │   ├── XPSystem.js          ✅ XP, level up, pontos de atributo
    │   ├── SaveSystem.js        ✅ Save/load LocalStorage
    │   └── MapManager.js        ✅ Renderização de mapa, colisão, minimapa
    ├── scenes/
    │   ├── BootScene.js         ✅ Gera texturas, transita para MainMenu
    │   ├── MainMenuScene.js     ✅ Menu, carregamento de save, help overlay
    │   ├── WorldScene.js        ✅ Mundo, movimento do jogador, combate/portais
    │   ├── UIScene.js           ✅ HUD DOM: barras HP/Focus/XP, chat log
    │   ├── CombatScene.js       ❌ FALTANDO — UI de combate + questões
    │   ├── InventoryScene.js    ❌ FALTANDO — UI do inventário
    │   └── CharacterScene.js    ❌ FALTANDO — UI de atributos/equipamentos
    ├── entities/
    │   ├── Player.js            ✅ Sprite, movimento, vitals
    │   ├── Monster.js           ✅ Sprite, patrulha, barra de HP
    │   └── NPC.js               ✅ Sprite, ciclo de diálogos
    └── data/
        ├── questions.js         ✅ 52+ questões (6 tópicos)
        ├── maps.js              ✅ 6 mapas completos
        ├── monsters.js          ✅ 12 monstros definidos
        └── items.js             ✅ 8 itens + tabelas de drop
```

---

## O Que Está Faltando (Crítico)

### 1. `js/main.js` — Entry Point
Deve inicializar o Phaser com todas as cenas registradas:
```javascript
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { UIScene } from './scenes/UIScene.js';
import { CombatScene } from './scenes/CombatScene.js';
import { InventoryScene } from './scenes/InventoryScene.js';
import { CharacterScene } from './scenes/CharacterScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,   // 544
  height: GAME_HEIGHT, // 480
  parent: 'game-container',
  scene: [BootScene, MainMenuScene, WorldScene, UIScene, CombatScene, InventoryScene, CharacterScene],
  backgroundColor: '#000000'
};
new Phaser.Game(config);
```

### 2. `js/scenes/CombatScene.js` — Mais Crítico
Recebe dados via `scene.settings.data` do WorldScene. Fluxo esperado:
- Exibir sprite do monstro, nome e barra de HP
- Exibir questão (texto, contexto opcional, opções para múltipla escolha)
- Input do jogador → chamar `QuestionEngine.checkAnswer()`
- Resposta correta → `CombatSystem.calcPlayerDamage()` → reduzir HP do monstro
- Resposta errada → `CombatSystem.calcMonsterDamage()` → reduzir HP do jogador
- Hint (custa 10 Focus) → exibir `question.hint`
- Monstro derrotado → `XPSystem.awardXP()`, `CombatSystem.rollDrops()`, emitir `combat-end`
- Jogador derrotado → emitir `combat-end` com `outcome: 'loss'`
- Emite evento: `EventBus.emit('combat-end', { outcome, instanceId, xpGained, loot, playerData })`

### 3. `js/scenes/InventoryScene.js`
- Abre sobre o WorldScene (sem pausar)
- Lista itens do `playerData.inventory`
- Usar consumíveis → `CombatSystem.useItem()`
- Equipar/desequipar → `CombatSystem.equipItem()`
- Tecla `I` ou botão fecha a cena

### 4. `js/scenes/CharacterScene.js`
- Exibe nome, nível, XP, HP, Focus
- Mostra atributos (força, inteligência, agilidade, vitalidade)
- Se `playerData.statPoints > 0`, botões para gastar pontos → `XPSystem.spendStatPoint()`
- Tecla `C` ou botão fecha a cena

---

## Áreas do Mundo e Tópicos de Estatística

| Área       | Tópico                    | Nível Mínimo | Requisito de Desbloqueio   |
|------------|---------------------------|--------------|----------------------------|
| Village    | Tipos de Dados            | 1            | —                          |
| Meadows    | Média/Mediana/Moda        | 3            | 60% mastery no Village     |
| Forest     | Variância/Desvio Padrão   | 1            | — (acesso lateral)         |
| Plains     | Probabilidade             | 1            | —                          |
| Mountains  | Distribuições             | 1            | —                          |
| Dungeon    | Testes de Hipótese        | 15           | 70% mastery em 3 áreas     |

---

## Sistema de Eventos (EventBus)

Todos os sistemas se comunicam via `EventBus`. Eventos principais:

| Evento                  | Emitido por       | Escutado por  |
|-------------------------|-------------------|---------------|
| `chat`                  | qualquer sistema  | UIScene       |
| `player-hp-change`      | CombatSystem      | UIScene       |
| `player-xp-change`      | XPSystem          | UIScene       |
| `player-level-up`       | XPSystem          | UIScene       |
| `player-stats-changed`  | XPSystem          | UIScene       |
| `area-changed`          | WorldScene        | UIScene       |
| `minimap-update`        | MapManager        | UIScene       |
| `combat-end`            | CombatScene       | WorldScene    |

---

## Convenções do Código

- **Sem bundler**: todos os imports são ES6 modules relativos
- **playerData** é o objeto central passado entre cenas via `scene.registry` ou `scene.settings.data`
- Texturas são geradas proceduralmente em `Draw.js` — não há imagens externas
- Mensagens no chat usam classes CSS: `.system`, `.combat-hit`, `.combat-miss`, `.xp`, `.levelup`, `.portal`, `.dialog`
- Idioma do jogo: **Português**
- Perguntas de estatística ficam exclusivamente em `data/questions.js`
- Monstros derrotados são rastreados por `instanceId` em `playerData.defeatedMonsters`

---

## Dimensões do Jogo

- Canvas: **544 × 480 px**
- Tile: **32 × 32 px**
- Grid: **17 colunas × 15 linhas**
- Minimap: **180 × 180 px** (canvas separado no DOM)

---

## Status Atual do Projeto

**~70% completo.** O loop principal falta: sem `main.js` o jogo não inicializa. Sem `CombatScene` o combate não tem UI. As cenas de inventário e personagem são secundárias mas necessárias para a experiência completa.

**Ordem de implementação recomendada:**
1. `main.js` (desbloqueador — sem ele nada roda)
2. `CombatScene.js` (loop central do jogo)
3. `InventoryScene.js`
4. `CharacterScene.js`
