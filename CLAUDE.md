# MeanFall — CLAUDE.md

RPG educacional estilo Tibia para ensinar estatística, feito com Phaser 3 + JavaScript vanilla. O jogador explora mapas tile-based, combate monstros respondendo questões de estatística e evolui desbloqueando novas áreas.

Jogo publicado em **[meanfall.pro](https://www.meanfall.pro)**.

---

## Stack Tecnológica

- **Phaser 3.60.0** (via CDN) — engine de jogo
- **JavaScript ES6 modules** — sem bundler, sem framework
- **HTML5 / CSS3** — layout 3 colunas + HUD DOM
- **Web Audio API** — música e efeitos sonoros procedurais (zero arquivos externos)
- **LocalStorage** — sistema de save (3 slots)

---

## Estrutura de Arquivos

```
/
├── index.html
├── CLAUDE.md
├── css/
│   └── style.css
├── icon/
│   ├── meanfallfav.png
│   └── banner.svg
└── js/
    ├── main.js              Entry point — inicializa Phaser com todas as cenas
    ├── constants.js         Config global, XP table, tile types, element matrix
    ├── utils/
    │   ├── EventBus.js      Pub/sub de eventos entre sistemas
    │   ├── Draw.js          Geração procedural de texturas (sprites, tiles, UI)
    │   ├── MusicSystem.js   Música procedural via Web Audio API (por área/estado)
    │   ├── SoundSystem.js   Efeitos sonoros procedurais (hit, levelup, etc.)
    │   └── RichText.js      Renderização de texto colorido inline com markup {{tag:texto}}
    ├── systems/
    │   ├── CombatSystem.js        Cálculo de dano, itens, equipamentos, drops
    │   ├── QuestionEngine.js      Seleção adaptativa de questões, checagem de resposta
    │   ├── QuestionGenerator.js   Geração procedural de questões numéricas (média, var, etc.)
    │   ├── XPSystem.js            XP, level up, pontos de atributo, mastery por área
    │   ├── SaveSystem.js          Save/load LocalStorage (3 slots + autosave)
    │   ├── MapManager.js          Renderização de mapa, colisão, minimapa
    │   ├── QuestSystem.js         Rastreamento de objetivos e recompensas de quests
    │   ├── BountySystem.js        Bounties diárias rotativas por área desbloqueada
    │   ├── ShopSystem.js          Compra/venda de itens com mercadores por área
    │   ├── SkillSystem.js         Árvore de habilidades passivas (13 habilidades)
    │   ├── BookSystem.js          Biblioteca in-world com tomos que concedem bônus permanentes
    │   ├── InferenceSystem.js     Geração de testes de hipótese para Mimics (Dungeon)
    │   ├── StatusEffectSystem.js  Efeitos de status elementais aplicados em combate
    │   └── TutorialSystem.js      Tutorial guiado para novos jogadores
    ├── scenes/
    │   ├── BootScene.js           Gera texturas, transita para MainMenu
    │   ├── IntroScene.js          Animação de intro com lore do mundo
    │   ├── MainMenuScene.js       Menu principal, 3 slots de save, help overlay
    │   ├── CharacterCreationScene.js  Criação de personagem (nome, aparência)
    │   ├── WorldScene.js          Mundo, movimento, NPCs, portais, interiores de casas
    │   ├── UIScene.js             HUD DOM: barras HP/Focus/XP, chat log, minimapa
    │   ├── CombatScene.js         UI de combate por turnos + questões + efeitos elementais
    │   ├── GameOverScene.js       Tela de morte com estatísticas e opções de respawn/menu
    │   ├── InventoryScene.js      Inventário, equipamentos (7 slots), uso de consumíveis
    │   ├── CharacterScene.js      Atributos, level, XP, gasto de pontos de stat
    │   ├── QuestScene.js          Diário de missões com objetivos e recompensas
    │   ├── SkillScene.js          Árvore de habilidades passivas
    │   ├── ShopScene.js           Interface de compra/venda com mercadores
    │   ├── BookScene.js           Leitura de tomos da biblioteca
    │   ├── CompendiumScene.js     Codex elemental com informações de monstros
    │   ├── InferenceScene.js      Mini-jogo de teste de hipótese para Mimics
    │   ├── DialogScene.js         Diálogos com NPCs com ciclos de texto
    │   └── ScratchpadScene.js     Calculadora + bloco de notas arrastáveis (persistem entre sessões)
    ├── entities/
    │   ├── Player.js      Sprite, movimento, vitals
    │   ├── Monster.js     Sprite, patrulha/chase, barra de HP, aura elemental, variantes Elite
    │   └── NPC.js         Sprite, ciclo de diálogos, interação
    └── data/
        ├── questions.js   207 questões (6 tópicos, 3 dificuldades, 3 tipos)
        ├── monsters.js    30 monstros (24 elementais + 6 chefes/especiais), 4 por área
        ├── items.js       48 itens (consumíveis, equipamentos por slot, scrolls)
        ├── maps.js        6 mapas tile-based completos
        ├── quests.js      7 missões principais com objetivos e recompensas
        ├── skills.js      13 habilidades passivas na árvore de habilidades
        ├── books.js       18 tomos com lore e bônus permanentes
        ├── shops.js       3 mercadores com estoques por área
        ├── bounties.js    Pools de bounties diárias por área
        ├── lore.js        Lore expandido do mundo
        └── appearance.js  Opções de aparência para criação de personagem
```

---

## Áreas do Mundo

| Área       | Tópico                    | Elemento | Nível Sugerido | Requisito de Desbloqueio |
|------------|---------------------------|----------|----------------|--------------------------|
| Village    | Tipos de Dados            | Normal   | 1              | —                        |
| Meadows    | Média/Mediana/Moda        | Terra    | 3              | 60% mastery no Village   |
| Forest     | Variância/Desvio Padrão   | Gelo     | 5              | —                        |
| Plains     | Probabilidade             | Fogo     | 8              | —                        |
| Mountains  | Distribuições             | Água     | 12             | —                        |
| Dungeon    | Testes de Hipótese        | Trevas   | 15             | 70% mastery em 3 áreas   |

---

## Sistema de Combate

- **Dano do jogador**: `floor(10 + level×1.5 + INT×0.5 + STR×0.3 + min(streak×2, 20)) × elemental × crítico − defesa`
- **Matchup elemental**: matrix 6×6 com multiplicadores 0.75× / 1.0× / 1.5×
- **Streak / Fever Mode**: acertos consecutivos aumentam dano; a partir de 5 acertos entra em Fever Mode (+40% dano, música intensificada)
- **Efeitos de status elementais** aplicados ao jogador em respostas erradas:
  - `queimadura` (fogo) — próximo erro causa +70% dano
  - `congelado` (gelo) — bloqueia uso de dica no turno
  - `enraizado` (terra) — tolerância numérica = 0
  - `encharcado` (água) — próximo erro +40% dano e tolerância = 0
  - `maldito` (trevas) — próximo erro causa dano dobrado
- **Variantes Elite**: 15% de chance de spawn; 2× HP, 3× ouro, aura visual única
- **Mimics** (Dungeon): ativam `InferenceScene` — jogador faz um teste de hipótese (p-valor) antes do combate

---

## Sistema de Questões

- **207 questões** em 6 tópicos: `data_types`, `mean_median_mode`, `spread`, `probability`, `distributions`, `inference`
- **3 tipos**: múltipla escolha, verdadeiro/falso, resposta numérica (com tolerância decimal configurável)
- **3 dificuldades**: easy, medium, hard — cada monstro filtra por dificuldade conforme seu nível
- **Aprendizado adaptativo**: `QuestionEngine` prioriza tópicos com menor taxa de acerto do jogador (60% de viés para questões erradas anteriormente)
- **Geração procedural**: `QuestionGenerator` cria questões numéricas únicas de média, variância, moda e probabilidade com datasets aleatórios

---

## Sistema de Eventos (EventBus)

Todos os sistemas se comunicam via `EventBus`. Eventos principais:

| Evento                  | Emitido por          | Escutado por       |
|-------------------------|----------------------|--------------------|
| `chat`                  | qualquer sistema     | UIScene            |
| `player-hp-change`      | CombatSystem         | UIScene            |
| `player-focus-change`   | CombatSystem         | UIScene            |
| `player-xp-change`      | XPSystem             | UIScene            |
| `player-level-up`       | XPSystem             | UIScene            |
| `player-stats-changed`  | XPSystem             | UIScene            |
| `area-changed`          | WorldScene           | UIScene            |
| `minimap-update`        | MapManager           | UIScene            |
| `combat-end`            | CombatScene          | WorldScene         |
| `quest-update`          | QuestSystem          | UIScene, QuestScene|
| `bounty-complete`       | BountySystem         | UIScene            |
| `fever-start`           | CombatScene          | UIScene, MusicSystem|
| `fever-end`             | CombatScene          | UIScene, MusicSystem|

---

## Convenções do Código

- **Sem bundler**: todos os imports são ES6 modules relativos
- **playerData** é o objeto central passado entre cenas via `scene.registry` ou `scene.settings.data`
- Texturas são geradas proceduralmente em `Draw.js` — não há imagens externas além do favicon e banner SVG
- `RichText` usa markup `{{tag:texto}}` para texto colorido em combate (ex: `{{damage:-15}}`, `{{xp:+50 XP}}`)
- Mensagens no chat usam classes CSS: `.system`, `.combat-hit`, `.combat-miss`, `.xp`, `.levelup`, `.portal`, `.dialog`
- Idioma do jogo: **Português**
- Questões ficam exclusivamente em `data/questions.js`; geração procedural em `systems/QuestionGenerator.js`
- Monstros derrotados são rastreados por `instanceId` em `playerData.defeatedMonsters`
- Música muda por área via `MusicSystem` — cada area tem uma track definida em `TRACKS`

---

## Dimensões do Jogo

- Canvas: **544 × 480 px**
- Tile: **32 × 32 px**
- Grid: **17 colunas × 15 linhas**
- Minimap: **180 × 180 px** (canvas separado no DOM)

---

## Status Atual do Projeto

**~95% completo.** Todas as cenas, sistemas e dados estão implementados. O jogo está em produção em `meanfall.pro`.

**Áreas de trabalho contínuo:**
- Adição de novas questões (especialmente dificuldade hard em todas as áreas)
- Balanceamento de dificuldade e progressão de nível
- Polimento de UX (feedback visual, animações)
- Conteúdo adicional de quests e lore
