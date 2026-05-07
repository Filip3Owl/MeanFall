# MeanFall

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

- **52+ questões de estatística** em seis tópicos, balanceadas em fácil, médio e difícil, todas ambientadas no mundo do RPG
- **24 monstros** (2 por área + variantes Elite com 15% de chance de spawn, 2× HP e 3× ouro)
- **Três tipos de questão** — múltipla escolha, verdadeiro/falso e resposta numérica
- **Combate por turnos** com dano escalado por atributos, matchup elemental, críticos e streak bonus
- **Seleção adaptativa** — 60% das perguntas são biasadas para questões previamente erradas
- **Progressão por maestria** — portais para regiões avançadas exigem nível e % de maestria
- **Sistema de inventário e equipamentos** com slots (cabeça, peito, pernas, pés, mãos, anel, amuleto)
- **Sistema de missões** — 7 missões com rastreamento automático e diário acessível com `Q`
- **Sistema de livros/codex** — 14 tomos in-world dropáveis com 5 níveis de importância e bônus permanentes
- **Mercadores e lojas** — 3 NPCs em regiões diferentes com catálogos tier-appropriate
- **Calculadora + Bloco de Notas** arrastáveis durante o combate (tecla `N`), com salvamento em LocalStorage
- **Fog of War** com exploração progressiva por região
- **Respawn de monstros** a cada 20 segundos
- **Sistema de save** em 3 slots via LocalStorage com auto-save
- **Texturas procedurais** — todos os sprites são gerados em runtime, sem imagens externas
- **Sistema elemental passivo** com maestria elemental, ícones procedurais e aura do jogador

---

## Interface de Combate

- Painel do monstro com sprite, aura elemental, barra de HP com marcações a 25/50/75%, flavor text e badge de nível/elemento
- Painel do jogador com barras de HP e Foco com tick marks e pulso de perigo
- Caixa de pergunta com frame ornamental, badges A/B/C/D, feedback de resposta com animação
- Barra inferior com botões **DICA** (−10 Foco), **NOTAS/CALC** e **FUGIR**
- Números de dano flutuantes, flash de tela e shake ao receber dano
- Cores de texto garantidas legíveis em todos os elementos (usa `accent` do elemento, sempre mais claro que a cor base)

---

## Stack Tecnológica

- **Phaser 3.60.0** (via CDN)
- **JavaScript ES Modules** (sem bundler, sem transpilação)
- **HTML5 Canvas** para viewport do jogo e minimapa
- **CSS3** com custom properties
- **LocalStorage** para persistência

---

## Estrutura do Projeto

```
.
├── index.html
├── css/
│   └── style.css
├── icon/
│   └── meanfallfav.png
└── js/
    ├── main.js
    ├── constants.js
    ├── data/
    │   ├── questions.js        52+ questões por tópico
    │   ├── maps.js             6 mapas tile-based completos
    │   ├── monsters.js         24 monstros com atributos e drops
    │   ├── items.js            Itens em 5 raridades e 6 elementos
    │   ├── quests.js           7 missões com cadeia de progressão
    │   ├── shops.js            3 catálogos de mercador
    │   └── books.js            14 tomos com 5 níveis de importância
    ├── systems/
    │   ├── CombatSystem.js
    │   ├── QuestionEngine.js
    │   ├── XPSystem.js
    │   ├── SaveSystem.js
    │   ├── MapManager.js
    │   ├── QuestSystem.js
    │   ├── ShopSystem.js
    │   ├── BookSystem.js
    │   ├── SkillSystem.js
    │   ├── TutorialSystem.js
    │   └── FogManager.js
    ├── scenes/
    │   ├── BootScene.js
    │   ├── MainMenuScene.js
    │   ├── WorldScene.js
    │   ├── UIScene.js
    │   ├── CombatScene.js
    │   ├── InventoryScene.js
    │   ├── CharacterScene.js
    │   ├── ShopScene.js
    │   ├── QuestScene.js
    │   ├── BookScene.js
    │   ├── DialogScene.js
    │   └── ScratchpadScene.js  Calculadora + Notas arrastáveis
    ├── entities/
    │   ├── Player.js
    │   ├── Monster.js          Sistema Elite (15% chance de spawn)
    │   └── NPC.js
    └── utils/
        ├── EventBus.js
        ├── Draw.js             Sprites procedurais por elemento
        └── RichText.js         Sistema de markup {{tag:valor}}
```

---

## Rodar Localmente

O projeto usa ES modules e precisa ser servido via HTTP — abrir `index.html` direto pelo `file://` falha com erro CORS.

```bash
python3 -m http.server 8080
```

Abrir `http://localhost:8080` em qualquer browser moderno.

---

## Controles

| Tecla | Ação |
|---|---|
| WASD / Setas | Mover jogador |
| Espaço | Falar com NPC / abrir loja |
| I | Inventário |
| C | Ficha do personagem |
| Q | Diário de missões |
| B | Biblioteca de livros |
| K | Habilidades |
| L | Compêndio elemental |
| N | Calculadora + Bloco de notas (durante combate) |
| F5 | Salvar jogo |
| ESC | Fechar qualquer modal |

---

## Fórmulas de Dano

```
Base              = floor(10 + level × 1.5 + INT × 0.5 + STR × 0.3 + min(streak × 2, 20))
Elemento          = ELEMENT_MATRIX[arma][monstro]   (0.75 / 1.0 / 1.5)
Crítico           = min(0.05 + AGI × 0.01, 0.30) → ×1.6 de dano
Dano do jogador   = max(1, floor(Base × Elemento × Crítico) − defesa do monstro)
Dano do monstro   = max(1, ataque − floor(AGI × 0.3))
Esquiva           = AGI × 1%
XP ganho          = floor(xpReward × (1 + INT × 0.02))
```

---

## Matriz Elemental

| Atacante → Defensor | Fogo | Terra | Água | Gelo | Trevas | Normal |
|---|---|---|---|---|---|---|
| Fogo | 1.0 | **1.5** | 0.75 | **1.5** | 1.0 | 1.0 |
| Terra | 0.75 | 1.0 | **1.5** | 1.0 | **1.5** | 1.0 |
| Água | **1.5** | 0.75 | 1.0 | 0.75 | 1.0 | 1.0 |
| Gelo | 0.75 | 1.0 | **1.5** | 1.0 | 0.75 | 1.0 |
| Trevas | 1.0 | 0.75 | 1.0 | **1.5** | 1.0 | **1.5** |
| Normal | 1.0 | 1.0 | 1.0 | 1.0 | 0.75 | 1.0 |

---

## Raridades

| Raridade | Cor | Multiplicador de Valor | Poder |
|---|---|---|---|
| Comum | Cinza | ×1.0 | ×1.0 |
| Incomum | Verde | ×2.0 | ×1.4 |
| Raro | Azul | ×4.0 | ×1.8 |
| Épico | Roxo | ×8.0 | ×2.5 |
| Lendário | Laranja | ×16.0 | ×3.5 |

---

## Créditos

Desenvolvido por **Filipe Rangel**.

Feito com [Phaser 3](https://phaser.io). Currículo de estatística e design do jogo originais.

---

## Licença

MIT.
