# Spare parts

These are ready-made pieces that are **not plugged into the game** right now. The game doesn't load anything in this folder. They use helpers that are still in `src/engine/`: `createBlockWorld`, `buildIsland`, `findPath`, `createPathWalker`, `createPhysics`, plus the block-breaking crumbs.

| File | What it is |
| --- | --- |
| `world.js` | A world made of blocks: a floating island with hills and trees, and `breakBlockInFrontOf()` |
| `blocks.js` | The kinds of block (grass, dirt, stone, sand, wood, leaves, bedrock) and their colours |
| `duck.js` | A demo duck that uses pathfinding to follow you around, with white dots showing its route |
| `block-tests.js` | Tests for walls, climbing a step, breaking a block and pathfinding |
| `particle-tests.js` | Tests for particle effects (the helper itself is `src/engine/particles.js`) |
| `physics-tests.js` | Tests for falling, bouncing, jumping, walls and falling off the edge |
| `tower-of-boxes.js` | A tower of coloured boxes for realistic physics to knock over |
| `realistic-physics-tests.js` | Tests for realistic physics: landing, stacking, toppling, pushing and rolling off |

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

## Plugging in particles

`makeParticles()` (in `src/engine/particles.js`) makes bursts of little pieces. It has six ready-made styles: `sparkles`, `smoke`, `splash`, `confetti`, `fire` and `crumbs`. To make a new style, copy one in `PARTICLE_STYLES` at the top of that file and change the numbers.

**`src/main.js`**

```js
import { createScreen, startGameLoop, makeParticles } from './engine/index.js'
import './spare-parts/particle-tests.js' // just after import './tests.js'

const particles = makeParticles(screen)

// in the game loop, after screen.follow(...):
particles.update(secondsPassed)

connectTests({ character, controls, screen, particles })
window.game = { screen, world, character, config, particles }
```

Then one line makes an effect, wherever you want it:

```js
particles.burst('sparkles', character.position)
particles.burst('confetti', { x: 3, y: 0, z: -2 })
particles.burst('crumbs', spot, 'brown') // a colour of your own instead of the style's
```

To keep an effect going, like a campfire or a smoking chimney:

```js
const campfire = particles.keepGoing('fire', { x: 3, y: 0, z: 3 })
campfire.stop() // when you want it to go out
```

Once `window.game` has `particles`, you can try them from the browser console too: `game.particles.burst('confetti', game.character.position)`.

## Physics: falling, bouncing, jumping, throwing

The physics helper is `src/engine/physics.js`. It gives anything gravity and a speed, so it can fall, bounce, slide to a stop, bump into walls and land on the ground. It works on the flat grassy field and on the block world.

To run its tests, add this to `src/main.js`, just after `import './tests.js'`:

```js
import './spare-parts/physics-tests.js'
```

### Make something fall and bounce

**`src/main.js`**

```js
import { createScreen, startGameLoop, createPhysics, makeBox } from './engine/index.js'

const physics = createPhysics(world) // or createPhysics(world.blocks) in the block world

const ball = makeBox({ width: 0.5, height: 0.5, depth: 0.5, colour: '#ffcc00' })
ball.position.set(3, 6, 0) // up in the sky
screen.add(ball)
const ballPhysics = physics.add(ball, { bounciness: 0.7 })

// in the game loop:
physics.update(secondsPassed)

// to throw it (3 across, 6 up, 0 back):
ballPhysics.throw(3, 6, 0)
```

The settings for `physics.add()` are all optional:

- `bounciness`: 0 lands with a thud, 1 bounces back as high as it fell
- `grip`: how quickly it stops sliding on the ground (0 is like ice)
- `radius`: how far its sides stick out, for bumping into walls
- `height`: how tall it is, for bumping its head

### Make the character jump

**`src/main.js`**

```js
const characterPhysics = physics.add(character.person, { height: 2.2 })

// in the game loop, before physics.update(secondsPassed):
if (controls.wantsToJump()) {
  characterPhysics.jump(2) // 2 blocks high
}
```

**`src/controls.js`**, in the returned object:

```js
wantsToJump() {
  return keyboard.wasJustPressed(' ')
},
```

The character still walks the way it always has. Physics only does the up and down. In the block world, take out the `settleOntoGround()` lines in `character.js`, because physics does that job now. (Space is also the break-a-block key in the block world, so pick a different key for one of them.)

### If they want really realistic physics

Our simple helper doesn't make things spin, roll or knock each other over, and things pass through each other. For toppling towers, rolling balls and chain reactions, use `src/engine/realistic-physics.js`. It uses a physics library called Rapier (rapier.rs). A copy of Rapier is in `vendor/rapier/`, so it works without the internet.

It isn't in `engine/index.js`, because Rapier is a big download (about 4 MB). The game only loads it if you import it.

**`src/main.js`**

```js
import { createRealisticPhysics } from './engine/realistic-physics.js'
import { buildTowerOfBoxes } from './spare-parts/tower-of-boxes.js'

const physics = await createRealisticPhysics()
physics.addFloor(config.world.size)
physics.addPusher(character.person) // so the character knocks things over by walking into them
buildTowerOfBoxes(screen, physics, { x: 3, z: -3, howHigh: 7 })

// in the game loop:
physics.update(secondsPassed)
```

To add your own things:

```js
physics.addBox(crate, { width: 1, height: 1, depth: 1 })
const ballPhysics = physics.addBall(ball, { radius: 0.4, heaviness: 8 })
ballPhysics.throw(0, 3, -16) // across, up, back
```

The settings are `bounciness`, `slipperiness` (0 is grippy, 1 is ice), `heaviness` (1 is like wood, 8 is like iron) and `fixed: true` for things that never move, like walls.

To run its tests, add `import './spare-parts/realistic-physics-tests.js'` just after `import './tests.js'`.

Use one kind of physics at a time for the same thing. In the block world, Rapier doesn't know about the blocks on its own, so add each block it should bump into with `physics.addBox(..., { fixed: true })`.
