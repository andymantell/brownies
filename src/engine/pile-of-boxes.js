import * as THREE from 'three'
import { pickAtRandom } from './maths.js'

// A pile of the same little box, drawn all in one go so the game stays fast.
// You can add boxes, move them, shrink them and take them away again.
// Good for lots of little things that land on the ground, like chicken nuggets.
//
//   const pile = makePileOfBoxes(screen, { howMany: 300, width: 0.3, height: 0.2, depth: 0.3, colours: ['gold'] })
//   const number = pile.addOne({ x: 2, y: 0, z: 3 })
//   pile.moveOne(number, { x: 2, y: 1, z: 3 })
//   pile.shrinkOne(number, 0.5)   // half as big
//   pile.removeOne(number)
//
// When it's full, addOne gives back -1 and doesn't add anything.
export function makePileOfBoxes(screen, { howMany, width, height, depth, colours }) {
  const shape = new THREE.BoxGeometry(width, height, depth)
  const paint = new THREE.MeshStandardMaterial({ color: '#ffffff' })
  const boxes = new THREE.InstancedMesh(shape, paint, howMany)
  boxes.castShadow = true
  boxes.receiveShadow = true
  boxes.frustumCulled = false // always draw them, even when the camera moves
  screen.scene.add(boxes)

  // Where each box is, how big it is and which way it's turned.
  const spots = []
  const sizes = []
  const turns = []

  // The numbers of the boxes we're not using yet.
  const freeNumbers = []

  const placer = new THREE.Object3D()
  const colour = new THREE.Color()

  function draw(number) {
    const spot = spots[number]
    placer.position.set(spot.x, spot.y, spot.z)
    placer.rotation.y = turns[number]
    placer.scale.setScalar(sizes[number])
    placer.updateMatrix()
    boxes.setMatrixAt(number, placer.matrix)
    boxes.instanceMatrix.needsUpdate = true
  }

  // At the start, every box is hidden away and free to use.
  for (let number = howMany - 1; number >= 0; number--) {
    spots[number] = { x: 0, y: 0, z: 0 }
    sizes[number] = 0
    turns[number] = 0
    draw(number)
    boxes.setColorAt(number, colour.set(pickAtRandom(colours)))
    freeNumbers.push(number)
  }

  function addOne(spot) {
    if (freeNumbers.length === 0) {
      return -1
    }
    const number = freeNumbers.pop()
    spots[number] = { x: spot.x, y: spot.y, z: spot.z }
    sizes[number] = 1
    turns[number] = Math.random() * Math.PI
    draw(number)
    return number
  }

  function moveOne(number, spot) {
    spots[number] = { x: spot.x, y: spot.y, z: spot.z }
    draw(number)
  }

  function shrinkOne(number, size) {
    sizes[number] = size
    draw(number)
  }

  function removeOne(number) {
    sizes[number] = 0
    draw(number)
    freeNumbers.push(number)
  }

  return { addOne, moveOne, shrinkOne, removeOne }
}
