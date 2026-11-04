import * as THREE from 'three'

// Lets a group do flips and somersaults, spinning around its middle
// instead of around its feet.
//
//   const flipper = makeFlippable(person, 1.1) // 1.1 is how high its middle is
//   flipper.rotation.x = -Math.PI // upside down!
//
// Everything that was in the group moves inside the flipper. The parts keep
// their positions, so you can still move them around just like before.
export function makeFlippable(group, middleHeight) {
  const flipper = new THREE.Group() // the spinning point, at the middle
  flipper.position.y = middleHeight

  const holder = new THREE.Group() // moves the parts back down, so they stay put
  holder.position.y = -middleHeight
  flipper.add(holder)

  while (group.children.length > 0) {
    holder.add(group.children[0])
  }
  group.add(flipper)

  return flipper
}
