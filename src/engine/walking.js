import * as THREE from 'three'
import { doEveryFrame } from './loop.js'

// Makes an animal's four legs walk, all by itself.
// It watches how far the animal moves each frame, and steps the legs just enough
// to keep up, so the feet don't slide over the ground. When the animal stops,
// the legs stop too.
//
//   makeLegsWalk(cat, { frontLeft, frontRight, backLeft, backRight, legLength: 0.35 })
//
// The legs move in diagonal pairs, like a real cat or dog:
// front-left with back-right, then front-right with back-left.

// How far a leg swings forwards and backwards (in radians, about 30 degrees).
const SWING = 0.5

// How quickly the legs go back to standing straight when the animal stops.
const SETTLE_SPEED = 8

// Moving further than this in one frame isn't walking, it's being teleported!
const TOO_FAR_FOR_ONE_STEP = 1

export function makeLegsWalk(animal, { frontLeft, frontRight, backLeft, backRight, legLength }) {
  // In one swing, from front to back, a foot covers this much ground.
  const groundPerSwing = 2 * legLength * Math.sin(SWING)

  let stepTimer = 0 // goes up as the legs step, a bit like a clock
  let howMuchSwing = 0 // 1 while walking, 0 while standing still
  const whereItWas = animal.getWorldPosition(new THREE.Vector3())
  const whereItIsNow = new THREE.Vector3()

  doEveryFrame((secondsPassed) => {
    // How far has the animal moved since last frame?
    animal.getWorldPosition(whereItIsNow)
    const distance = Math.hypot(whereItIsNow.x - whereItWas.x, whereItIsNow.z - whereItWas.z)
    whereItWas.copy(whereItIsNow)

    const isWalking = distance > 0.0001 && distance < TOO_FAR_FOR_ONE_STEP

    if (isWalking) {
      // Step the legs on by exactly the right amount for the ground we covered.
      stepTimer += (distance / groundPerSwing) * Math.PI
      howMuchSwing = 1
    } else {
      // Slowly straighten the legs.
      howMuchSwing = Math.max(0, howMuchSwing - SETTLE_SPEED * secondsPassed)
    }

    const swing = Math.sin(stepTimer) * SWING * howMuchSwing
    frontLeft.rotation.x = swing
    backRight.rotation.x = swing
    frontRight.rotation.x = -swing
    backLeft.rotation.x = -swing
  })
}
