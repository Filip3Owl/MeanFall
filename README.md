# MeanFall

![MeanFall Banner](icon/banner.svg)

> **RPG educacional de estatística — jogue em [meanfall.pro](https://www.meanfall.pro)**

Um RPG top-down que ensina estatística através de exploração tile-based, combate por turnos e um sistema elemental completo. O jogador responde questões de estatística para causar dano, coleta loot elemental, completa missões e progride por seis regiões temáticas — cada uma ligada a um tópico diferente de estatística.

Feito com JavaScript vanilla e Phaser 3. Single-page application, sem build step, sem bundler, sem dependências além do CDN do Phaser.

---

## 🎮 Jogar Agora

**[www.meanfall.pro](https://www.meanfall.pro)**

---

## Regiões do Mundo

| Região | Tópico | Elemento | Nível Sugerido |
|---|---|---|---|
| Vila dos Dados | Tipos de dados (categórico, ordinal, contínuo) | Normal | 1 |
| Pradarias das Medidas | Média, mediana, moda | Terra | 3 |
| Floresta da Dispersão | Variância, desvio padrão, IQR | Gelo | 5 |
| Planícies da Probabilidade | Probabilidade básica e condicional | Fogo | 8 |
| Montanhas das Distribuições | Distribuição normal, z-scores | Água | 12 |
| Masmorra da Inferência | Testes de hipótese, p-valores | Trevas | 15 |

---

## Funcionalidades

- **207 questões de estatística** ambientadas no mundo do RPG (poções, monstros, loot, alquimia), balanceadas em fácil, médio e difícil.
- **30 monstros únicos** com variantes **Elite** (15% de chance de spawn, 2× HP e 3× ouro, aura visual única).
- **Três tipos de questão** — múltipla escolha, verdadeiro/falso e resposta numérica com tolerância decimal.
- **Combate por turnos tático** onde o dano escala com seus atributos (INT, STR), streak bonus de acertos e matchups elementais.
- **Fever Mode**: acertar 5 questões seguidas entra em Fever Mode — +40% de dano e música intensificada.
- **Efeitos de Status Elementais**: cada elemento aplica um debuff único ao errar (queimadura, congelamento, maldição, etc.).
- **Aprendizado Adaptativo** — o motor de perguntas prioriza tópicos onde o jogador tem menor taxa de acerto (60% de viés para erros).
- **Sistema de RPG Completo**:
    - **Inventário e Equipamentos**: 7 slots (cabeça, peito, pernas, pés, mãos, anel, amuleto) com 48 itens.
    - **Árvore de Habilidades**: 13 habilidades passivas que melhoram eficiência em combate e bônus de ouro/XP.
    - **Missões (Quests)**: 7 missões principais com rastreamento no diário (`Q`).
    - **Bounties Diárias**: objetivos rotativos por área que renovam a cada dia.
    - **Codex e Biblioteca**: 18 tomos in-world que concedem bônus permanentes e expandem o lore.
    - **Economia**: 3 mercadores com catálogos por área.
- **Mimics e Inferência**: na Dungeon, baús podem ser Mimics — ative o teste de hipótese (p-valor) antes de abrir.
- **Utilitários In-Game**: Calculadora e Bloco de Notas arrastáveis (`N`) que persistem entre sessões.
- **Exploração e Mundo**: mapa completamente visível, minimapa em tempo real, interiores de casas com música própria.
- **Tecnologia**: salvamento automático em LocalStorage (3 slots) e **Texturas Procedurais** — todos os sprites, tiles e efeitos são gerados via código em runtime, resultando em carregamento instantâneo sem assets externos.

---

## Combate e Aprendizado

Em **MeanFall**, o conhecimento é sua arma mais poderosa. O dano que você causa não depende apenas da sua espada, mas da sua precisão estatística:

- **Bônus de Streak**: Acertar sequências de perguntas aumenta exponencialmente o dano base.
- **Matchup Elemental**: Use o elemento certo contra o monstro (ex: Fogo contra Terra) para um multiplicador de 1.5×.
- **Dicas de Foco**: Gastar pontos de **Foco** permite visualizar uma dica teórica para a questão.
- **Feedback Detalhado**: Errar uma pergunta mostra uma explicação contextualizada no lore do jogo (ex: por que o peso de um dragão é um dado contínuo e não discreto).

---

## Interface de Combate

- Painel do monstro com sprite procedural, aura elemental, barra de HP dinâmica e badges de elite.
- Painel do jogador com monitoramento de HP, Foco e progresso de XP.
- Caixa de diálogo estilo JRPG com **typewriter effect**, retrato do NPC, paginação automática de textos longos e suporte a **branching choices** (ramificações de diálogo).
- Ferramentas de apoio integradas (Calculadora/Notas) para resolução de problemas complexos.

---

## Stack Tecnológica

- **Phaser 3.60.0** (Engine de jogo via CDN)
- **JavaScript ES Modules** (Arquitetura moderna sem necessidade de build/npm)
- **HTML5 Canvas** (Viewport e Minimapa)
- **CSS3** (Interface UI com variáveis dinâmicas)
- **LocalStorage** (Persistência de saves e notas)

---

## Estrutura do Projeto

```
.
├── index.html
├── css/
│   └── style.css
├── icon/
│   ├── meanfallfav.png     Favicon
│   └── banner.svg          Arte do banner (SVG)
└── js/
    ├── main.js             Ponto de entrada do Phaser
    ├── constants.js        Configurações globais, XP table, matrix elemental
    ├── data/
    │   ├── questions.js    207 questões em 6 tópicos e 3 dificuldades
    │   ├── monsters.js     30 monstros com stats, elemento e comportamento
    │   ├── items.js        48 itens (equipamentos e consumíveis)
    │   ├── maps.js         6 mapas tile-based
    │   ├── quests.js       7 missões principais
    │   ├── skills.js       13 habilidades passivas
    │   ├── books.js        18 tomos da biblioteca in-world
    │   ├── shops.js        3 mercadores com estoques por área
    │   ├── bounties.js     Pools de bounties diárias por área
    │   ├── lore.js         Lore expandido do mundo
    │   └── appearance.js   Aparências para criação de personagem
    ├── systems/
    │   ├── CombatSystem.js       Dano, itens, drops
    │   ├── QuestionEngine.js     Seleção adaptativa de questões
    │   ├── QuestionGenerator.js  Geração procedural de questões numéricas
    │   ├── XPSystem.js           Level up, atributos, mastery
    │   ├── SaveSystem.js         Save/load (3 slots + autosave)
    │   ├── MapManager.js         Renderização de mapa e minimapa
    │   ├── QuestSystem.js        Rastreamento de missões
    │   ├── BountySystem.js       Bounties diárias rotativas
    │   ├── ShopSystem.js         Economia e mercadores
    │   ├── SkillSystem.js        Árvore de habilidades
    │   ├── BookSystem.js         Biblioteca e bônus permanentes
    │   ├── InferenceSystem.js    Testes de hipótese para Mimics
    │   ├── StatusEffectSystem.js Efeitos elementais em combate
    │   └── TutorialSystem.js     Tutorial guiado
    ├── scenes/
    │   ├── BootScene.js          Gera texturas procedurais
    │   ├── IntroScene.js         Intro com lore
    │   ├── MainMenuScene.js      Menu e slots de save
    │   ├── CharacterCreationScene.js  Criação de personagem
    │   ├── WorldScene.js         Exploração, NPCs, portais
    │   ├── UIScene.js            HUD DOM (HP, Focus, XP, chat)
    │   ├── CombatScene.js        Combate por turnos + questões
    │   ├── GameOverScene.js      Tela de morte com estatísticas
    │   ├── InventoryScene.js     Inventário e equipamentos
    │   ├── CharacterScene.js     Atributos e gasto de pontos
    │   ├── QuestScene.js         Diário de missões
    │   ├── SkillScene.js         Árvore de habilidades
    │   ├── ShopScene.js          Loja de mercadores
    │   ├── BookScene.js          Leitura de tomos
    │   ├── CompendiumScene.js    Codex elemental
    │   ├── InferenceScene.js     Mini-jogo de teste de hipótese
    │   ├── DialogScene.js        Diálogos com NPCs — typewriter effect, retrato, paginação, branching choices
    │   └── ScratchpadScene.js    Calculadora e notas (arrastáveis)
    ├── entities/
    │   ├── Player.js       Sprite, movimento, vitals
    │   ├── Monster.js      Sprite, IA de patrulha/chase, Elite
    │   └── NPC.js          Sprite, diálogos, interação
    └── utils/
        ├── Draw.js         Geração procedural de todas as texturas
        ├── EventBus.js     Pub/sub de eventos entre sistemas
        ├── MusicSystem.js  Música procedural via Web Audio API
        ├── SoundSystem.js  Efeitos sonoros procedurais
        └── RichText.js     Texto colorido inline em combate
```

---

## Rodar Localmente

O projeto usa ES modules e precisa ser servido via HTTP.

```bash
# Com Python
python3 -m http.server 8080

# Com Node (servidor estático qualquer)
npx serve .
```

---

## Controles

| Tecla | Ação |
|---|---|
| **WASD / Setas** | Mover jogador |
| **Espaço** | Interagir / Conversar |
| **I** | Abrir Inventário |
| **C** | Atributos do Personagem |
| **Q** | Diário de Missões |
| **B** | Biblioteca de Livros |
| **K** | Árvore de Habilidades |
| **L** | Compêndio Elemental |
| **N** | Calculadora + Notas (Combate) |
| **F5** | Salvar Jogo |
| **ESC** | Fechar Modais / Menu |

---

## Fórmulas de Dano

```
Base              = floor(10 + level × 1.5 + INT × 0.5 + STR × 0.3 + min(streak × 2, 20))
Elemento          = ELEMENT_MATRIX[arma][monstro]   (0.75 / 1.0 / 1.5)
Crítico           = min(0.05 + AGI × 0.01, 0.30) → ×1.6 de dano
Dano do jogador   = max(1, floor(Base × Elemento × Crítico) − defesa do monstro)
```

---

## Créditos

Desenvolvido por **Filipe Rangel**.
Currículo de estatística e game design originais.

---

## Licença

MIT.
