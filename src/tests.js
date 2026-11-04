import { config } from './config.js'
import {
  test,
  check,
  wait,
  holdKey,
  tapGround,
  pressGround,
  slideFingerTo,
  liftFinger,
  tapKey,
  whereIsCharacter,
  howHighIsCharacter,
  putCharacterAt,
  turnCharacterTowards,
  putBlock,
  isThereABlockAt,
  findRoute,
  stepsBetween,
} from './engine/testing.js'

// 🧪 Our tests!
//
// Each test has:
//   - a name
//   - a description of what we're testing
//   - some steps: do something to the game, then check() what happened
//
// Every test starts with the character standing still in the middle of the field.
// Open the tests with the peeling corner in the top right of the game.

test(
  'Walks when you press a key',
  'Holding down the right arrow key for 1 second should make the character walk.',
  async () => {
    const start = whereIsCharacter()

    await holdKey('ArrowRight', 1)

    const end = whereIsCharacter()
    check('The character walked at least 3 steps', stepsBetween(start, end) >= 3)
  },
)

test(
  'Stands still when nobody touches anything',
  "If we don't press any keys, the character should stay where they are.",
  async () => {
    const start = whereIsCharacter()

    await wait(1)

    const end = whereIsCharacter()
    check('The character has not moved', stepsBetween(start, end) < 0.01)
  },
)

test(
  'Walks to where you tap',
  'Tapping the grass should make the character walk to that spot and stop there.',
  async () => {
    const spot = { x: 3, z: 3 }

    tapGround(spot.x, spot.z)
    await wait(2)

    const end = whereIsCharacter()
    check('The character is on the spot we tapped', stepsBetween(end, spot) < 0.5)
  },
)

test(
  'Follows your finger',
  'Holding your finger down and sliding it should make the character follow it.',
  async () => {
    // A held finger moves with the camera, so let the camera settle first.
    await wait(1)

    // Put a finger down a little way to the side.
    pressGround(2, 0)
    await wait(0.5)
    const afterPressing = whereIsCharacter()
    check('The character walked towards the finger', afterPressing.x > 1)

    // Slide the finger, still holding it down.
    slideFingerTo(2, 4)
    await wait(0.5)
    const afterSliding = whereIsCharacter()
    check('The character followed the finger', afterSliding.z > afterPressing.z + 1)

    // Let go, and the character should soon stop.
    liftFinger()
    await wait(2)
    const afterLettingGo = whereIsCharacter()
    await wait(0.5)
    const end = whereIsCharacter()
    check('The character stops after you let go', stepsBetween(afterLettingGo, end) < 0.01)
  },
)

test(
  "Can't fall off the edge",
  'Walking towards the edge of the field for a long time should not take the character off it.',
  async () => {
    putCharacterAt(25, 0) // near the edge
    await wait(1) // give the camera time to catch up so we can watch

    await holdKey('ArrowRight', 2)

    const end = whereIsCharacter()
    check('The character is still on the field', isOnTheField(end))
  },
)

test(
  "Can't walk through a wall",
  'A wall two blocks high should stop the character walking past it.',
  async () => {
    // Build a wall across the way, 2 blocks high.
    for (let back = -3; back <= 3; back++) {
      putBlock(2, 0, back, 'stone')
      putBlock(2, 1, back, 'stone')
    }

    tapGround(4, 0) // on the other side of the wall
    await wait(2)

    const end = whereIsCharacter()
    check('The character stopped in front of the wall', end.x < 2)
  },
)

test(
  'Climbs up a step',
  'Walking onto a block one high should make the character step up on top of it.',
  async () => {
    // A little platform, one block high.
    for (let across = 2; across <= 4; across++) {
      for (let back = -1; back <= 1; back++) {
        putBlock(across, 0, back, 'wood')
      }
    }

    tapGround(3, 0)
    await wait(2)

    const end = whereIsCharacter()
    check('The character got to the platform', stepsBetween(end, { x: 3, z: 0 }) < 0.5)
    check('The character is standing on top of it', Math.abs(howHighIsCharacter() - 1) < 0.05)
  },
)

test(
  'Breaks a block with the space bar',
  'Pressing space should break the block right in front of the character.',
  async () => {
    putBlock(0, 0, 1, 'stone')
    turnCharacterTowards(0, 1)

    await tapKey(' ')
    await wait(0.2)

    check('The block has gone', !isThereABlockAt(0, 0, 1))
  },
)

test(
  'Finds a way around a wall',
  'Pathfinding should find a route around a wall, not through it.',
  async () => {
    for (let back = -3; back <= 3; back++) {
      putBlock(3, 0, back, 'stone')
      putBlock(3, 1, back, 'stone')
    }

    const route = findRoute({ x: 0, z: 0 }, { x: 6, z: 0 })
    const end = route[route.length - 1]

    const goesThroughTheWall = route.some((square) => {
      return square.x === 3 && Math.abs(square.z) <= 3
    })

    check('The route gets to the other side', end.x === 6 && end.z === 0)
    check("The route doesn't go through the wall", !goesThroughTheWall)
  },
)

// Is a spot inside the field? (The field goes from -half to +half in both directions.)
function isOnTheField(spot) {
  const half = config.world.size / 2
  return Math.abs(spot.x) < half && Math.abs(spot.z) < half
}
