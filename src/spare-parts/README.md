# Spare parts

These are ready-made pieces that are **not plugged into the game** right now. The game doesn't load anything in this folder. They use helpers that are still in `src/engine/`: `createBlockWorld`, `buildIsland`, `findPath`, `createPathWalker`, plus the block-breaking crumbs.

| File | What it is |
| --- | --- |
| `world.js` | A world made of blocks: a floating island with hills and trees, and `breakBlockInFrontOf()` |
| `blocks.js` | The kinds of block (grass, dirt, stone, sand, wood, leaves, bedrock) and their colours |
| `duck.js` | A demo duck that uses pathfinding to follow you around, with white dots showing its route |
| `block-tests.js` | Tests for walls, climbing a step, breaking a block and pathfinding |

## Plugging the block world back in

**`src/main.js`**

```js
import { createWorld } from './spare-parts/world.js' // instead of './world.js'
import { createDuck } from './spare-parts/duck.js' // if you want the duck
import './spare-parts/block-tests.js' // just after import './tests.js'

const character = createCharacter(screen, world)
const controls = createControls(screen, world)
const duck = createDuck(screen, world, character)

// in the game loop, after character.update(...):
if (controls.wantsToBreakBlock()) {
  world.breakBlockInFrontOf(character)
}
duck.update(secondsPassed)
world.update(secondsPassed) // this draws the blocks, so you need it!

connectTests({ character, controls, screen, world })
```

Take out `world.keepOnField(character.position)` too, because the edge of the island already stops you.

**`src/character.js`**: take `world` as a second input, and walk with the block rules (stepping up one block, dropping off ledges, not walking through walls):

```js
export function createCharacter(screen, world) {

  // in the returned object:
  facingAngle() {
    return person.rotation.y
  },

  // instead of changing person.position.x and .z directly:
  const stepAcross = direction.x * distance
  const stepBack = direction.z * distance
  world.blocks.moveAlong(person.position, stepAcross, stepBack, secondsPassed)

  // when standing still (so you fall if the block under you breaks):
  world.blocks.settleOntoGround(person.position, secondsPassed)
}
```

**`src/controls.js`**: take `world` as a second input, so taps land on top of blocks, and add the space bar:

```js
export function createControls(screen, world) {
  const finger = createFinger(screen, (spot) => { ... }, world.blocks)

  // in the returned object:
  wantsToBreakBlock() {
    return keyboard.wasJustPressed(' ')
  },
}
```

For a flat, empty block world, set `HILLINESS` and `HOW_MANY_TREES` to 0 at the top of `world.js`.
