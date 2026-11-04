import * as THREE from 'three'

// A big square of ground split into little squares, like a chessboard.
// Each little square has a block on it, and you can make any block taller or shorter.
// Good for snow that piles up, or sand, or water.
//
//   const blanket = makeGridOfBlocks(screen, { size: 60, blockSize: 0.5, colour: 'white' })
//   blanket.setHeightAt(2, 3, 0.4)   // the block at x 2, z 3 is now 0.4 tall
//   blanket.heightAt(2, 3)           // gives back 0.4
//
// All the blocks are drawn in one go, so the game stays fast.
export function makeGridOfBlocks(screen, { size, blockSize, colour }) {
  const blocksAcross = Math.round(size / blockSize)
  const howMany = blocksAcross * blocksAcross
  const heights = new Array(howMany).fill(0)

  const shape = new THREE.BoxGeometry(blockSize, 1, blockSize)
  shape.translate(0, 0.5, 0) // so a block grows up from the ground, not both ways
  const paint = new THREE.MeshStandardMaterial({ color: colour })
  const blocks = new THREE.InstancedMesh(shape, paint, howMany)
  blocks.receiveShadow = true
  blocks.frustumCulled = false // always draw them, even when the camera moves
  screen.scene.add(blocks)

  const placer = new THREE.Object3D()

  // Which block is at this spot? Gives back its number, or -1 if it's off the grid.
  function blockNumberAt(x, z) {
    const across = Math.floor((x + size / 2) / blockSize)
    const back = Math.floor((z + size / 2) / blockSize)
    if (across < 0 || across >= blocksAcross || back < 0 || back >= blocksAcross) {
      return -1
    }
    return back * blocksAcross + across
  }

  function placeBlock(number) {
    const across = number % blocksAcross
    const back = Math.floor(number / blocksAcross)
    placer.position.set(
      (across + 0.5) * blockSize - size / 2,
      0,
      (back + 0.5) * blockSize - size / 2,
    )
    if (heights[number] > 0) {
      placer.scale.set(1, heights[number], 1)
    } else {
      placer.scale.set(0, 0, 0) // no snow here, so hide the block
    }
    placer.updateMatrix()
    blocks.setMatrixAt(number, placer.matrix)
    blocks.instanceMatrix.needsUpdate = true
  }

  for (let number = 0; number < howMany; number++) {
    placeBlock(number)
  }

  return {
    blockSize,

    heightAt(x, z) {
      const number = blockNumberAt(x, z)
      if (number === -1) {
        return 0
      }
      return heights[number]
    },

    setHeightAt(x, z, height) {
      const number = blockNumberAt(x, z)
      if (number === -1) {
        return
      }
      heights[number] = height
      placeBlock(number)
    },
  }
}
