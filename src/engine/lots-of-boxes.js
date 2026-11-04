import * as THREE from 'three'

// Lots and lots of the same box, drawn all in one go so the game stays fast.
// Good for thousands of little things, like snow on the ground.
//
//   const snowOnTheGround = makeLotsOfBoxes(screen, { howMany: 5000, width: 0.3, height: 0.05, depth: 0.3, colour: 'white' })
//   snowOnTheGround.addOne({ x: 2, y: 0, z: 3 })
//
// When it's full, new boxes take the place of the oldest ones.
export function makeLotsOfBoxes(screen, { howMany, width = 1, height = 1, depth = 1, colour = 'white' }) {
  const shape = new THREE.BoxGeometry(width, height, depth)
  const paint = new THREE.MeshStandardMaterial({ color: colour })
  const boxes = new THREE.InstancedMesh(shape, paint, howMany)
  boxes.receiveShadow = true
  boxes.count = 0
  boxes.frustumCulled = false // always draw them, even when the camera moves
  screen.scene.add(boxes)

  const placer = new THREE.Object3D()
  let nextSpace = 0

  function addOne(spot) {
    placer.position.set(spot.x, spot.y, spot.z)
    placer.rotation.y = Math.random() * Math.PI
    placer.updateMatrix()
    boxes.setMatrixAt(nextSpace, placer.matrix)
    boxes.instanceMatrix.needsUpdate = true

    nextSpace = (nextSpace + 1) % howMany
    boxes.count = Math.min(boxes.count + 1, howMany)
  }

  return { addOne }
}
