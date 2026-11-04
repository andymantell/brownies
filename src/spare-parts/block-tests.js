import {
  test,
  check,
  wait,
  tapKey,
  tapGround,
  whereIsCharacter,
  howHighIsCharacter,
  turnCharacterTowards,
  putBlock,
  isThereABlockAt,
  findRoute,
  stepsBetween,
} from '../engine/testing.js'

// 🧪 Tests for the block world, breaking blocks and pathfinding.
// This is a spare part: it isn't plugged into the game yet. See README.md in this folder.

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
