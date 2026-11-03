import * as THREE from 'three'

// Building blocks. Everything in this game is made out of boxes!

// Make a coloured box.
//   makeBox({ width: 1, height: 5, depth: 1, colour: 'hotpink' })
export function makeBox({ width = 1, height = 1, depth = 1, colour = 'white' }) {
  const shape = new THREE.BoxGeometry(width, height, depth)
  const paint = new THREE.MeshStandardMaterial({ color: colour })
  const box = new THREE.Mesh(shape, paint)

  box.castShadow = true // the box makes a shadow
  box.receiveShadow = true // other shadows can fall on the box

  return box
}

// An empty holder. Put boxes in it with `.add(box)` and they all move together.
export function makeGroup() {
  return new THREE.Group()
}

// A box that swings from its top end, like an arm from a shoulder or a leg from a hip.
// Turn it with `.rotation.x`.
export function makeSwingingBox({ width, height, depth, colour }) {
  const joint = new THREE.Group()

  const box = makeBox({ width, height, depth, colour })
  box.position.y = -height / 2 // hang down below the joint
  joint.add(box)

  return joint
}
