# MeanFall

An educational top-down RPG that teaches statistics through tile-based exploration and turn-based combat. Players answer statistics questions to attack monsters, gain experience, and unlock new areas — each themed around a different statistical concept.

Built with vanilla JavaScript and Phaser 3. No build step, no bundler, no dependencies beyond a single CDN script.

---

## Concept

MeanFall replaces traditional click-to-attack combat with a knowledge-based loop: every encounter is a statistics question. A correct answer deals damage scaled by player stats and a streak multiplier; an incorrect answer lets the monster strike back. Mastery percentage per region gates progression to higher-tier areas, so players cannot skip the underlying concepts.

The world is divided into six regions, each focused on a different statistical topic and difficulty band:

| Region                 | Topic                                | Suggested Level |
|------------------------|--------------------------------------|-----------------|
| Village of Data        | Data types (categorical, ordinal, continuous) | 1     |
| Meadows of Measures    | Mean, median, mode                   | 3               |
| Forest of Spread       | Variance, standard deviation, IQR    | 5               |
| Plains of Probability  | Basic and conditional probability    | 8               |
| Mountains of Distribution | Normal distribution, z-scores     | 12              |
| Dungeon of Inference   | Hypothesis testing, p-values         | 15              |

---

## Features

- **58 curated statistics questions** across six topics, balanced across easy, medium, and hard difficulty tiers.
- **Three question types**: multiple choice, true/false, and free-form numeric input with configurable tolerance.
- **Turn-based combat** with damage scaling driven by player attributes (Strength, Intelligence, Agility, Vitality), monster defense, and a correct-answer streak bonus capped at +20.
- **Adaptive question selection** that biases 60% of draws toward previously missed questions to reinforce weak concepts.
- **Mastery-gated progression**: portals to advanced regions check both player level and per-region mastery percentage before unlocking.
- **Inventory and equipment system** with consumables (potions, scrolls) and equipment slots (head, chest, legs, feet, hands, ring, amulet) that apply stat bonuses.
- **Three-slot save system** persisting to LocalStorage, with auto-save on area transitions and manual save via F5.
- **Procedural texture generation**: every tile, sprite, monster, and item is drawn at runtime via Phaser Graphics — no external image assets.
- **Hint system** that costs 10 Focus per use, encouraging strategic resource management.

---

## Tech Stack

- **Phaser 3.60.0** (loaded via CDN)
- **Vanilla JavaScript ES Modules** (no bundler, no transpilation)
- **HTML5 Canvas** for the game viewport and minimap
- **LocalStorage** for persistence

---

## Project Structure

```
.
├── index.html               Game shell, DOM HUD, layout
├── css/
│   └── style.css            Dark medieval theme, status bars, chat log
└── js/
    ├── main.js              Phaser game configuration and entry point
    ├── constants.js         Tile codes, area metadata, XP table, defaults
    ├── data/
    │   ├── questions.js     58-question bank, organized by topic
    │   ├── maps.js          6 hand-crafted tile maps with monster and NPC placements
    │   ├── monsters.js      12 monster definitions with topic and difficulty bindings
    │   └── items.js         Consumables, equipment, and per-monster drop tables
    ├── systems/
    │   ├── CombatSystem.js  Damage formulas, inventory, equipment, drops
    │   ├── QuestionEngine.js  Question selection, answer checking, option shuffling
    │   ├── XPSystem.js      XP awards, level-up, stat point spending, mastery
    │   ├── SaveSystem.js    LocalStorage save slots
    │   └── MapManager.js    Tile rendering, collision, exits, minimap
    ├── scenes/
    │   ├── BootScene.js     Texture generation, transition to main menu
    │   ├── MainMenuScene.js New game, continue, help overlay
    │   ├── WorldScene.js    Player movement, NPC interaction, combat triggering
    │   ├── UIScene.js       DOM HUD updates, chat, minimap, stat-point popup
    │   ├── CombatScene.js   Question display, answer handling, damage resolution
    │   ├── InventoryScene.js  Item list, use and equip actions
    │   └── CharacterScene.js  Vitals, attributes, equipment, mastery overview
    ├── entities/
    │   ├── Player.js        Sprite, grid movement with cooldown
    │   ├── Monster.js       Sprite, patrol AI, mini health bar
    │   └── NPC.js           Sprite, cycling dialog
    └── utils/
        ├── EventBus.js      Module-level pub/sub for cross-scene events
        └── Draw.js          Procedural texture generation for tiles, sprites, items
```

---

## Architecture

The game uses a **scene composition** model: `WorldScene` runs continuously, while `UIScene` overlays the HTML HUD and listens to game events. `CombatScene`, `InventoryScene`, and `CharacterScene` are launched on demand and pause the world via `WorldScene.pauseForOverlay()` / `resumeFromOverlay()`.

Cross-scene communication flows through a single module-level `EventBus`. Player state lives in the Phaser `registry` and is mutated by scenes that own the current interaction (combat, inventory, character).

The combat loop is driven by `QuestionEngine.getQuestion()`, which filters by topic and difficulty, excludes the last six asked questions, and biases toward the player's prior wrong answers. Damage is computed by `CombatSystem.calcPlayerDamage()` using player level, intelligence, strength, and the current streak, minus monster defense.

---

## Running Locally

The project uses ES modules, so it must be served over HTTP — opening `index.html` directly via `file://` will fail with a CORS error.

### Option 1: Python

```bash
python3 -m http.server 3001
```

### Option 2: Node

```bash
npx serve -p 3001
```

Then open `http://localhost:3001` in any modern browser.

---

## Controls

| Key            | Action                          |
|----------------|---------------------------------|
| WASD or Arrows | Move player                     |
| Space          | Talk to adjacent NPC            |
| I              | Open inventory                  |
| C              | Open character sheet            |
| F5             | Save game                       |
| ESC            | Close inventory or character    |

In combat, multiple choice answers are clicked directly; numeric answers accept digits, minus, comma, and period, with Enter to submit.

---

## Damage Formulas

```
Player damage = floor(10 + level × 1.5 + INT × 0.5 + STR × 0.3 + min(streak × 2, 20)) − monster.defense
Monster damage = max(1, monster.attackDamage − floor(AGI × 0.3))
Dodge chance   = AGI × 0.01
XP gain        = floor(monster.xpReward × (1 + INT × 0.02))
```

Stat points are awarded every three levels, with permanent HP bonuses for vitality and Focus bonuses for intelligence.

---

## Educational Design Notes

Question difficulty is explicitly tagged per item, and monsters declare which difficulty bands they pull from. Early-region monsters draw only from `easy`, mid-region monsters draw from `easy` and `medium`, and end-game monsters favor `medium` and `hard`. Every question carries an explanation field shown after the answer and an optional hint surfaced in combat for a Focus cost.

The 60% wrong-answer bias in question selection is designed to surface concepts the learner has struggled with, rather than the random uniform sampling typical of quiz games.

---

## License

MIT.
