import { config } from '../config.js'
import { blockTypes } from './blocks.js'
import { createBlockWorld, buildIsland, spotInFront, randomNumberBetween } from '../engine/index.js'

// 🧱 A world made of blocks: a floating island with hills and trees.
// This is a spare part: it isn't plugged into the game yet. See README.md in this folder.

const HILLINESS = 5 // how tall the hills get, in blocks (0 for flat)
const FLAT_IN_THE_MIDDLE = 10 // how far from the middle stays flat
const HOW_MANY_TREES = 25
const TREES_STAY_THIS_FAR_AWAY = 18 // from the middle, so they don't get in the way of the tests

export function createWorld(screen) {
  const blocks = createBlockWorld(screen, blockTypes)

  buildIsland(blocks, {
    size: config.world.size,
    hilliness: HILLINESS,
    flatInTheMiddle: FLAT_IN_THE_MIDDLE,
  })

  for (let tree = 0; tree < HOW_MANY_TREES; tree++) {
    plantTreeSomewhere(blocks)
  }

  return {
    blocks,

    // Call this every frame.
    update(secondsPassed) {
      blocks.update(secondsPassed)
    },

    // Break the first block in front of someone: at their feet, then at their head,
    // and if there's nothing there, dig into the ground in front of them.
    breakBlockInFrontOf(someone) {
      const inFront = spotInFront(someone.position, someone.facingAngle(), 1)
      const feet = Math.round(someone.position.y)

      const heightsToTry = [feet, feet + 1, feet - 1]
      for (const height of heightsToTry) {
        const didBreak = blocks.break(inFront.x, height, inFront.z)
        if (didBreak) {
          return true
        }
      }

      return false
    },
  }
}

// Plant a tree at a random spot, away from the middle so there's room to play.
function plantTreeSomewhere(blocks) {
  const half = config.world.size / 2 - 3
  const x = Math.round(randomNumberBetween(-half, half))
  const z = Math.round(randomNumberBetween(-half, half))

  const tooNearTheMiddle = Math.hypot(x, z) < TREES_STAY_THIS_FAR_AWAY
  if (tooNearTheMiddle) {
    return
  }

  plantTree(blocks, x, z)
}

// A tree: a trunk of wood, with a big blob of leaves on top.
function plantTree(blocks, x, z) {
  const ground = blocks.topOfColumn(x, z)
  const trunkHeight = 3 + Math.round(Math.random() * 2) // 3, 4 or 5 blocks tall

  for (let up = 0; up < trunkHeight; up++) {
    blocks.put(x, ground + up, z, 'wood')
  }

  // Two layers of leaves, 5 × 5, round the top of the trunk (with the corners cut off).
  const leavesStart = ground + trunkHeight - 1
  for (let up = 0; up < 2; up++) {
    for (let across = -2; across <= 2; across++) {
      for (let back = -2; back <= 2; back++) {
        const isCorner = Math.abs(across) === 2 && Math.abs(back) === 2
        const isTrunk = across === 0 && back === 0 && up === 0
        if (!isCorner && !isTrunk) {
          blocks.put(x + across, leavesStart + up, z + back, 'leaves')
        }
      }
    }
  }

  // A little plus shape of leaves on the very top.
  const top = leavesStart + 2
  blocks.put(x, top, z, 'leaves')
  blocks.put(x + 1, top, z, 'leaves')
  blocks.put(x - 1, top, z, 'leaves')
  blocks.put(x, top, z + 1, 'leaves')
  blocks.put(x, top, z - 1, 'leaves')
}
