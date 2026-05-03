# MeanFall — Beta

An educational top-down RPG that teaches statistics through tile-based exploration, turn-based combat, an elemental system, quests, and a fully functional merchant economy. Players answer statistics questions to deal damage, gather elemental loot, complete merchant-driven quests, and progress through six themed regions — each tied to a different statistical topic.

Built with vanilla JavaScript and Phaser 3. Single-page application, no build step, no bundler, no dependencies beyond the Phaser CDN script.

> **Status: BETA v0.9.0** — gameplay loop, content, and core systems are feature-complete. Balancing and polish are in progress.

---

## Concept

MeanFall replaces traditional click-to-attack combat with a knowledge-based loop: every encounter is a statistics question. A correct answer deals damage scaled by player attributes, weapon element, rarity bonuses, and a streak multiplier; an incorrect answer lets the monster strike back. Mastery percentage per region gates progression to higher-tier areas, so players cannot skip the underlying concepts.

The world is divided into six regions, each focused on a different statistical topic:

| Region                    | Topic                                | Element  | Suggested Level |
|---------------------------|--------------------------------------|----------|-----------------|
| Village of Data           | Data types (categorical, ordinal, continuous) | Normal   | 1     |
| Meadows of Measures       | Mean, median, mode                   | Earth    | 3               |
| Forest of Spread          | Variance, standard deviation, IQR    | Ice      | 5               |
| Plains of Probability     | Basic and conditional probability    | Fire     | 8               |
| Mountains of Distribution | Normal distribution, z-scores       | Water    | 12              |
| Dungeon of Inference      | Hypothesis testing, p-values        | Shadow   | 15              |

---

## Beta Highlights

- **Six elements** — Fire, Earth, Water, Ice, Shadow, Normal — with a damage multiplier matrix that produces super-effective and resisted matchups in combat.
- **Five rarity tiers** — Common, Uncommon, Rare, Epic, Legendary — each with its own color, value multiplier, and stat scaling.
- **Quest system** — seven quests across the world map, accepted automatically when you talk to quest-giving NPCs and tracked in a dedicated journal accessible with `Q`.
- **Merchant NPCs and shops** — three merchants in different regions sell tier-appropriate gear and consumables, and buy any item back at 50% of its base value.
- **Loot system** — every monster guarantees at least one drop, plus rolls on a multi-tier loot table tied to its region and difficulty. Loot includes consumables, weapons, armor, and accessories with elemental affinities.
- **Monster respawn** — defeated monsters automatically respawn after 90 seconds in their original location, enabling sustained farming and quest progression.
- **Critical hits and dodges** — Agility scales dodge chance and critical strike chance; criticals deal +60% damage and trigger pink damage numbers.
- **Damage feedback** — floating damage numbers, screen flashes on hit, super-effective and resisted call-outs in the combat log.
- **Polished UI** — refreshed theme with Beta tag, color-coded keywords (damage, heal, loot, level, XP, rarity, dialog), card-style panels, gradient bars with shine, and a footer crediting the developer.

---

## Features

- **58 curated statistics questions** across six topics, balanced across easy, medium, and hard difficulty tiers.
- **Three question types**: multiple choice, true/false, and free-form numeric input with configurable tolerance.
- **Turn-based combat** with damage scaling driven by player attributes, weapon element vs monster element matchup, rarity bonuses, critical hits, and streak bonuses.
- **Adaptive question selection** that biases 60% of draws toward previously missed questions to reinforce weak concepts.
- **Mastery-gated progression**: portals to advanced regions check both player level and per-region mastery percentage before unlocking.
- **Inventory and equipment system** with consumables and equipment slots (head, chest, legs, feet, hands, ring, amulet) that apply stat bonuses and weapon elements.
- **Three-slot save system** persisting to LocalStorage, with auto-save on area transitions and combat completion, plus manual save via F5.
- **Procedural texture generation**: every tile, sprite, monster, item, and merchant is drawn at runtime via Phaser Graphics — no external image assets.
- **Hint system** that costs 10 Focus per use, encouraging strategic resource management during combat.
- **Quest journal** with progress bars, status badges (active, complete, claimed), and reward previews.

---

## Tech Stack

- **Phaser 3.60.0** (loaded via CDN)
- **Vanilla JavaScript ES Modules** (no bundler, no transpilation)
- **HTML5 Canvas** for the game viewport and minimap
- **CSS3** with custom-property theming
- **LocalStorage** for persistence

---

## Project Structure

```
.
├── index.html                  Game shell, DOM HUD, layout, footer
├── css/
│   └── style.css               Beta theme, cards, color-coded chat
└── js/
    ├── main.js                 Phaser configuration and entry point
    ├── constants.js            Tile codes, areas, XP table, ELEMENTS,
    │                           ELEMENT_MATRIX, RARITIES, VERSION info
    ├── data/
    │   ├── questions.js        58-question bank, organized by topic
    │   ├── maps.js             6 hand-crafted tile maps with NPC roles
    │   ├── monsters.js         12 elemental creatures
    │   ├── items.js            27 items across 5 rarities, 6 elements
    │   ├── quests.js           7 quests with progression chain
    │   └── shops.js            3 merchant catalogs
    ├── systems/
    │   ├── CombatSystem.js     Damage formulas with elemental matchup,
    │   │                       crit, equip / unequip, inventory ops
    │   ├── QuestionEngine.js   Question selection, answer checking
    │   ├── XPSystem.js         XP awards, level-up, mastery
    │   ├── SaveSystem.js       LocalStorage save slots
    │   ├── MapManager.js       Tile rendering, collision, minimap
    │   ├── QuestSystem.js      Quest log, progress tracking, rewards
    │   └── ShopSystem.js       Buy / sell, price calculation
    ├── scenes/
    │   ├── BootScene.js        Texture generation
    │   ├── MainMenuScene.js    Menu with Beta badge and credits
    │   ├── WorldScene.js       Player movement, NPC interaction,
    │   │                       respawn timing, combat triggering
    │   ├── UIScene.js          DOM HUD, color-coded chat
    │   ├── CombatScene.js      Question UI, elemental damage feedback,
    │   │                       crit / dodge / super-effective animations
    │   ├── InventoryScene.js   Item list, equip / unequip, comparison
    │   ├── CharacterScene.js   Vitals, attributes, equipment, mastery
    │   ├── ShopScene.js        Merchant UI with Buy / Sell tabs
    │   └── QuestScene.js       Quest journal with progress bars
    ├── entities/
    │   ├── Player.js           Sprite, grid movement
    │   ├── Monster.js          Sprite, patrol AI, mini health bar
    │   └── NPC.js              Quest-givers (gold robe) and merchants
    │                           (green apron) with floating role badges
    └── utils/
        ├── EventBus.js         Module-level pub/sub
        └── Draw.js             Procedural sprites for tiles, players,
                                monsters, items, NPCs by element
```

---

## Architecture

The game uses a **scene composition** model: `WorldScene` runs continuously, while `UIScene` overlays the HTML HUD and listens to game events. `CombatScene`, `InventoryScene`, `CharacterScene`, `ShopScene`, and `QuestScene` are launched on demand and pause the world via `WorldScene.pauseForOverlay()` / `resumeFromOverlay()`.

Cross-scene communication flows through a single module-level `EventBus`. Player state lives in the Phaser `registry` and is mutated by scenes that own the current interaction (combat, shop, inventory, character, quest journal).

The combat loop is driven by `QuestionEngine.getQuestion()`, which filters by topic and difficulty, excludes the last six asked questions, and biases toward the player's prior wrong answers. Damage is computed by `CombatSystem.calcPlayerDamage()` using player level, intelligence, strength, weapon element vs monster element, rarity-scaled equipment bonuses, critical chance from agility, and streak bonus.

`QuestSystem` tracks kills (per monster ID, per area, per element), item collection, and mastery percentages, automatically marking quests complete when all objectives are met. `ShopSystem` is a thin wrapper around inventory operations that handles gold transactions for both buying and selling.

Monster respawn is handled in `WorldScene._processRespawns()`, which checks pending respawn timers each frame. When a respawn is due and the player is in the matching area, the monster is reinserted into the scene with a chat notification.

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
| Space          | Talk to adjacent NPC / open shop|
| I              | Open inventory                  |
| C              | Open character sheet            |
| Q              | Open quest journal              |
| F5             | Save game                       |
| ESC            | Close any modal                 |

In combat, multiple choice answers are clicked directly; numeric answers accept digits, minus, comma, and period, with Enter to submit.

---

## Damage Formulas

```
Base                  = floor(10 + level × 1.5 + INT × 0.5 + STR × 0.3 + min(streak × 2, 20))
Element multiplier    = ELEMENT_MATRIX[weapon.element][monster.element]   (0.75 / 1.0 / 1.5)
Crit chance           = min(0.05 + AGI × 0.01, 0.30)
Crit multiplier       = 1.6
Player damage         = max(1, floor(Base × Element × CritMult) − monster.defense)

Monster damage        = max(1, monster.attackDamage − floor(AGI × 0.3))
Dodge chance          = AGI × 0.01
XP gain               = floor(monster.xpReward × (1 + INT × 0.02))
```

Stat points are awarded every three levels, with permanent HP bonuses for vitality and Focus bonuses for intelligence.

---

## Element Matrix (advantage / neutral / weakness)

| Attacker → Defender | Fire | Earth | Water | Ice  | Shadow | Normal |
|---------------------|------|-------|-------|------|--------|--------|
| Fire                | 1.0  | 1.5   | 0.75  | 1.5  | 1.0    | 1.0    |
| Earth               | 0.75 | 1.0   | 1.5   | 1.0  | 1.5    | 1.0    |
| Water               | 1.5  | 0.75  | 1.0   | 0.75 | 1.0    | 1.0    |
| Ice                 | 0.75 | 1.0   | 1.5   | 1.0  | 0.75   | 1.0    |
| Shadow              | 1.0  | 0.75  | 1.0   | 1.5  | 1.0    | 1.5    |
| Normal              | 1.0  | 1.0   | 1.0   | 1.0  | 0.75   | 1.0    |

---

## Rarity Tiers

| Rarity     | Color   | Value Multiplier | Power Scaling |
|------------|---------|------------------|---------------|
| Common     | Gray    | ×1.0             | ×1.0          |
| Uncommon   | Green   | ×2.0             | ×1.4          |
| Rare       | Blue    | ×4.0             | ×1.8          |
| Epic       | Purple  | ×8.0             | ×2.5          |
| Legendary  | Orange  | ×16.0            | ×3.5          |

---

## Educational Design Notes

Question difficulty is explicitly tagged per item, and monsters declare which difficulty bands they pull from. Early-region monsters draw only from `easy`, mid-region monsters draw from `easy` and `medium`, and end-game monsters favor `medium` and `hard`. Every question carries an explanation field shown after the answer and an optional hint surfaced in combat for a Focus cost.

The 60% wrong-answer bias in question selection is designed to surface concepts the learner has struggled with, rather than the random uniform sampling typical of quiz games.

Quests reinforce the same content from a different angle: rather than simply answering questions, the player must demonstrate mastery (kill counts, mastery percentage, item collection) to progress. The reward chain (basic gear → elemental gear → legendary gear) parallels the difficulty arc of the statistical content.

---

## Credits

**Developed by Filipe Rangel.**

Built with [Phaser 3](https://phaser.io). Statistics curriculum and game design original.

---

## License

MIT.
