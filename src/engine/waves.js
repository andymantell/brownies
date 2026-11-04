import * as THREE from 'three'

// A patch of blocky water that goes up and down in waves.
// It's lots of square blocks, drawn all in one go so the game stays fast.
//
//   const waves = makeWaves(screen, { x: 40, z: 0, width: 20, depth: 60, level: 0, colour: 'blue' })
//   waves.update(secondsPassed) // in the game loop
//
// x and z are the middle of the patch. `level` is how high the calm water is.

const BLOCK_SIZE = 1
const WAVE_HEIGHT = 0.3 // how far the blocks go up and down
const WAVE_SPEED = 2 // how fast the waves roll along
const STEP = 0.1 // blocks move in little jumps, so the waves look blocky

export function makeWaves(screen, { x, z, width, depth, level, colour }) {
  const across = Math.round(width / BLOCK_SIZE)
  const back = Math.round(depth / BLOCK_SIZE)

  const shape = new THREE.BoxGeometry(BLOCK_SIZE, 1, BLOCK_SIZE)
  const paint = new THREE.MeshStandardMaterial({ color: colour })
  const blocks = new THREE.InstancedMesh(shape, paint, across * back)
  blocks.receiveShadow = true
  blocks.frustumCulled = false // always draw them, even when the camera moves
  screen.scene.add(blocks)

  // Where every block sits on the ground.
  const spots = []
  for (let i = 0; i < across; i++) {
    for (let j = 0; j < back; j++) {
      spots.push({
        x: x - width / 2 + (i + 0.5) * BLOCK_SIZE,
        z: z - depth / 2 + (j + 0.5) * BLOCK_SIZE,
      })
    }
  }

  const placer = new THREE.Object3D()
  let time = 0

  function update(secondsPassed) {
    time += secondsPassed
    spots.forEach((spot, number) => {
      const wave = Math.sin(time * WAVE_SPEED + spot.x * 0.6 + spot.z * 0.3)
      const height = Math.round((wave * WAVE_HEIGHT) / STEP) * STEP
      placer.position.set(spot.x, level + height - 0.5, spot.z) // top of the block is at the water level
      placer.updateMatrix()
      blocks.setMatrixAt(number, placer.matrix)
    })
    blocks.instanceMatrix.needsUpdate = true
  }

  update(0)

  return { update }
}
