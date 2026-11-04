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
  whereIsCharacter,
  putCharacterAt,
  stepsBetween,
  isTheDoorOpen,
  isTheRoofSeeThrough,
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
    const spot = { x: 6, z: -5 } // a clear bit of grass, away from the animals and the houses

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
    slideFingerTo(1, 4) // (not too near the cat, or we would bump into it)
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
  'The door opens when you walk up to it',
  'The house door should be shut when you are far away, and open when you stand next to it.',
  async () => {
    check('The door is shut to start with', !isTheDoorOpen())

    // Stand just outside the door. (The door is in the middle of the front wall.)
    const door = { x: config.house.x, z: config.house.z + config.house.depth / 2 }
    putCharacterAt(door.x, door.z + 1)
    await wait(1)
    check('The door is open', isTheDoorOpen())

    // Walk away again.
    putCharacterAt(0, 0)
    await wait(1)
    check('The door has shut again', !isTheDoorOpen())
  },
)

test(
  "Can't walk through the walls",
  'Trying to walk straight through the side of the house should stop you at the wall.',
  async () => {
    // Stand next to the house's side wall, and tap a spot inside the house.
    const sideWall = config.house.x + config.house.width / 2
    putCharacterAt(sideWall + 2, config.house.z)
    tapGround(config.house.x, config.house.z)
    await wait(2)

    const end = whereIsCharacter()
    check('The character stopped outside the wall', end.x > sideWall)
  },
)

test(
  'Can walk inside through the door',
  'Tapping a spot inside the house should make the character walk in through the door.',
  async () => {
    const door = { x: config.house.x, z: config.house.z + config.house.depth / 2 }
    putCharacterAt(door.x, door.z + 2)

    const insideTheHouse = { x: config.house.x, z: config.house.z }
    tapGround(insideTheHouse.x, insideTheHouse.z)
    await wait(2)

    const end = whereIsCharacter()
    check('The character is inside the house', stepsBetween(end, insideTheHouse) < 0.5)
  },
)

test(
  'Bumps into the cat',
  "Walking at the cat should stop the character, instead of walking through it.",
  async () => {
    // Stand a little way from the cat, then try to walk to where the cat is.
    const cat = { x: config.cat.x, z: config.cat.z }
    putCharacterAt(cat.x, cat.z - 3)
    tapGround(cat.x, cat.z)
    await wait(2)

    const end = whereIsCharacter()
    check('The character stopped before reaching the cat', stepsBetween(end, cat) > 0.5)
  },
)

test(
  'Bumps into the cat house',
  'Walking at the cat house should stop the character, instead of walking through it.',
  async () => {
    // Stand a little way from the cat house, then try to walk to the middle of it.
    const catHouse = { x: config.catHouse.x, z: config.catHouse.z }
    putCharacterAt(catHouse.x, catHouse.z - 3)
    tapGround(catHouse.x, catHouse.z)
    await wait(2)

    const end = whereIsCharacter()
    check('The character stopped before reaching the middle', stepsBetween(end, catHouse) > 0.5)
  },
)

// Is a spot inside the field? (The field goes from -half to +half in both directions.)
function isOnTheField(spot) {
  const half = config.world.size / 2
  return Math.abs(spot.x) < half && Math.abs(spot.z) < half
}

test(
  'The roof goes see-through when you are inside',
  'The roof should be solid when you are outside, and see-through when you are inside the house.',
  async () => {
    check('The roof is solid to start with', !isTheRoofSeeThrough())

    // Stand in the middle of the house.
    putCharacterAt(config.house.x, config.house.z)
    await wait(1)
    check('The roof is see-through', isTheRoofSeeThrough())

    // Go back outside.
    putCharacterAt(0, 0)
    await wait(1)
    check('The roof is solid again', !isTheRoofSeeThrough())
  },
)
