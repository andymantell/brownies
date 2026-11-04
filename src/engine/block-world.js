import * as THREE from 'three'
import { makeBlockLooks } from './block-looks.js'
import { makeBlockMeshes } from './block-meshes.js'
import { makeCrumbs } from './crumbs.js'

// A world made of blocks, like a giant box of building bricks.
//
// Every block sits on a grid. Its position is three whole numbers:
//   x: across, y: up, z: back-and-forth
// The block at (0, 0, 0) is a 1 × 1 × 1 cube. Its bottom is at height 0 and its top
// is at height 1, so someone standing on it has their feet at height 1.
//
//   const blocks = createBlockWorld(screen, blockTypes)
//   blocks.put(0, 0, 0, 'stone')
//   blocks.remove(0, 0, 0)

const HOW_HIGH_YOU_CAN_STEP = 1 // you can step up one block, but not two
const HEAD_ROOM = 2 // you need two empty blocks above the ground to fit in
const CLIMB_SPEED = 6 // how fast feet move up onto a step
const FALL_SPEED = 10 // how fast you drop down off a ledge
const BODY_RADIUS = 0.3 // how far your front edge sticks out from your middle
const CHUNK_SIZE = 16 // the world is drawn in squares ("chunks") this many blocks across

export function createBlockWorld(screen, blockTypes) {
  const looks = makeBlockLooks(blockTypes)
  const crumbs = makeCrumbs(screen)

  // Every block, by its position. "3,0,-2" → "grass"
  const allBlocks = new Map()

  // The world is cut into chunks, so when one block changes we only redraw its chunk.
  // "1,-2" → { blocks: Set of block names, meshes: [...] }
  const chunks = new Map()
  const chunksToRedraw = new Set()

  // The lowest and highest blocks so far, so we know how far up and down to look.
  let lowestBlock = 0
  let highestBlock = 0

  function nameOf(x, y, z) {
    return x + ',' + y + ',' + z
  }

  function whatIsAt(x, y, z) {
    // A block's bottom is at height y and its top at y + 1, so we round heights down.
    const name = nameOf(Math.round(x), Math.floor(y), Math.round(z))
    return allBlocks.get(name) ?? null
  }

  function isSolid(x, y, z) {
    return whatIsAt(x, y, z) !== null
  }

  // How high would your feet be if you stood in this column?
  // We look down from just above your feet (so you can step up one block)
  // until we find a block to stand on.
  function groundHeightAt(x, z, feetHeight) {
    const highestStep = Math.floor(feetHeight + 0.01) + HOW_HIGH_YOU_CAN_STEP - 1

    for (let y = highestStep; y >= lowestBlock; y--) {
      if (isSolid(x, y, z)) {
        return y + 1
      }
    }

    return -Infinity // nothing to stand on: it's the edge of the world!
  }

  // Could someone with their feet at this height walk into this column?
  function canWalkInto(x, z, feetHeight) {
    const ground = groundHeightAt(x, z, feetHeight)

    if (ground === -Infinity) {
      return false
    }

    for (let gap = 0; gap < HEAD_ROOM; gap++) {
      if (isSolid(x, ground + gap, z)) {
        return false // not enough room for your head
      }
    }

    return true
  }

  function chunkNameFor(x, z) {
    const chunkX = Math.floor(x / CHUNK_SIZE)
    const chunkZ = Math.floor(z / CHUNK_SIZE)
    return chunkX + ',' + chunkZ
  }

  function getChunk(chunkName) {
    if (!chunks.has(chunkName)) {
      chunks.set(chunkName, { blocks: new Set(), meshes: [] })
    }
    return chunks.get(chunkName)
  }

  // A block changed, so its chunk needs redrawing. So do the chunks next to it,
  // because a block on the edge of a chunk can hide (or uncover) a side next door.
  function markChangedNear(x, z) {
    chunksToRedraw.add(chunkNameFor(x, z))
    chunksToRedraw.add(chunkNameFor(x + 1, z))
    chunksToRedraw.add(chunkNameFor(x - 1, z))
    chunksToRedraw.add(chunkNameFor(x, z + 1))
    chunksToRedraw.add(chunkNameFor(x, z - 1))
  }

  function redrawChunk(chunkName) {
    const chunk = getChunk(chunkName)

    for (const mesh of chunk.meshes) {
      screen.scene.remove(mesh)
      mesh.geometry.dispose()
    }

    const blocksInChunk = []
    for (const name of chunk.blocks) {
      const [x, y, z] = name.split(',').map(Number)
      blocksInChunk.push({ x, y, z, type: allBlocks.get(name) })
    }

    chunk.meshes = makeBlockMeshes(blocksInChunk, isSolid, looks)
    for (const mesh of chunk.meshes) {
      screen.scene.add(mesh)
    }
  }

  return {
    whatIsAt,
    isSolid,
    groundHeightAt,
    canWalkInto,

    // Put a block in the world. `type` is one of the names in blocks.js.
    put(x, y, z, type) {
      if (!looks[type]) {
        throw new Error(`There's no kind of block called "${type}"`)
      }
      allBlocks.set(nameOf(x, y, z), type)
      getChunk(chunkNameFor(x, z)).blocks.add(nameOf(x, y, z))
      markChangedNear(x, z)
      lowestBlock = Math.min(lowestBlock, y)
      highestBlock = Math.max(highestBlock, y)
    },

    // Take a block out of the world (if there is one).
    remove(x, y, z) {
      takeOut(x, y, z)
    },

    // Break a block, with a little burst of crumbs.
    // Gives back true if it broke, or false if there was nothing there (or it's unbreakable).
    break(x, y, z) {
      const type = whatIsAt(x, y, z)

      if (type === null) {
        return false
      }
      if (blockTypes[type].unbreakable) {
        return false
      }

      takeOut(x, y, z)
      crumbs.burst(x, y, z, looks[type].mainColour)
      return true
    },

    // The height of the top of the highest block in a column.
    topOfColumn(x, z) {
      for (let y = highestBlock; y >= lowestBlock; y--) {
        if (isSolid(x, y, z)) {
          return y + 1
        }
      }
      return -Infinity
    },

    // Move someone along the ground by a little step, without walking through blocks.
    // They step up onto blocks one high, and drop down off ledges.
    moveAlong(position, stepAcross, stepBack, secondsPassed) {
      if (stepAcross !== 0) {
        const frontEdge = position.x + stepAcross + Math.sign(stepAcross) * BODY_RADIUS
        if (canWalkInto(frontEdge, position.z, position.y)) {
          position.x += stepAcross
        }
      }

      if (stepBack !== 0) {
        const frontEdge = position.z + stepBack + Math.sign(stepBack) * BODY_RADIUS
        if (canWalkInto(position.x, frontEdge, position.y)) {
          position.z += stepBack
        }
      }

      settleOntoGround(position, secondsPassed)
    },

    // Make sure someone's feet are on the ground: climb up a step, or fall down.
    settleOntoGround,

    // Call this every frame. It redraws any chunks that changed, and moves the crumbs.
    update(secondsPassed) {
      for (const chunkName of chunksToRedraw) {
        redrawChunk(chunkName)
      }
      chunksToRedraw.clear()
      crumbs.update(secondsPassed)
    },

    // Find the first block an imaginary laser from the camera bumps into
    // (to find which block someone tapped).
    findBlockAlongLaser(laser) {
      return findFirstBlockAlong(laser, isSolid)
    },
  }

  function takeOut(x, y, z) {
    const name = nameOf(x, y, z)
    allBlocks.delete(name)
    getChunk(chunkNameFor(x, z)).blocks.delete(name)
    markChangedNear(x, z)
  }

  function settleOntoGround(position, secondsPassed) {
    const ground = groundHeightAt(position.x, position.z, position.y)

    if (ground === -Infinity) {
      return
    }

    if (ground > position.y) {
      position.y = Math.min(ground, position.y + CLIMB_SPEED * secondsPassed)
    } else {
      position.y = Math.max(ground, position.y - FALL_SPEED * secondsPassed)
    }
  }
}

// Walk along the laser in tiny steps until we bump into a block.
// Gives back { block: { x, y, z }, spot: where the laser hit }, or null if it missed.
function findFirstBlockAlong(laser, isSolid) {
  const stepSize = 0.05
  const longestLook = 150
  const spot = new THREE.Vector3()

  for (let distance = 0; distance < longestLook; distance += stepSize) {
    laser.ray.at(distance, spot)

    const block = {
      x: Math.round(spot.x),
      y: Math.floor(spot.y),
      z: Math.round(spot.z),
    }

    if (isSolid(block.x, block.y, block.z)) {
      return { block, spot }
    }
  }

  return null
}
