import * as THREE from 'three'
import { doEveryFrame } from './loop.js'

// Makes an animal's four legs walk, all by itself.
// It watches how far the animal moves each frame, and steps the legs just enough
// to keep up. A foot on the ground stays planted in one spot while the body walks
// over it, so the feet never slide. When the animal stops, the legs stop too.
//
//   makeLegsWalk(cat, { frontLeft, frontRight, backLeft, backRight, legLength: 0.35 })
//
// The legs move in diagonal pairs, like a real cat or dog:
// front-left with back-right, then front-right with back-left.
// While one pair pushes along the ground, the other pair lifts up and swings forwards.

// How far a leg swings forwards and backwards (in radians, about 30 degrees).
const SWING = 0.5

// How much shorter a leg gets as it lifts its foot off the ground (like bending a knee).
const LIFT = 0.25

// How quickly the legs go back to standing straight when the animal stops.
const SETTLE_SPEED = 8

// Moving further than this in one frame isn't walking, it's being teleported!
const TOO_FAR_FOR_ONE_STEP = 1

export function makeLegsWalk(animal, { frontLeft, frontRight, backLeft, backRight, legLength }) {
  // How far in front of (or behind) the hip a foot gets, at the end of a swing.
  const furthestReach = legLength * Math.sin(SWING)
  // In one step, a foot on the ground goes from in front of the hip to behind it.
  const groundPerStep = 2 * furthestReach

  let stepsTaken = 0 // goes up by 1 for every step
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
      // Step on by exactly the right amount for the ground we covered.
      stepsTaken += distance / groundPerStep
      howMuchSwing = 1
    } else {
      // Slowly straighten the legs.
      howMuchSwing = Math.max(0, howMuchSwing - SETTLE_SPEED * secondsPassed)
    }

    // Each pair takes turns: one step on the ground, then one step in the air.
    const isFirstPairOnTheGround = Math.floor(stepsTaken) % 2 === 0
    const howFarThroughStep = stepsTaken % 1 // from 0 (start) to 1 (end)

    const onTheGround = footOnTheGround(howFarThroughStep, furthestReach * howMuchSwing, legLength)
    const inTheAir = footInTheAir(howFarThroughStep, furthestReach * howMuchSwing, legLength, howMuchSwing)

    if (isFirstPairOnTheGround) {
      moveLegs(frontLeft, backRight, onTheGround)
      moveLegs(frontRight, backLeft, inTheAir)
    } else {
      moveLegs(frontLeft, backRight, inTheAir)
      moveLegs(frontRight, backLeft, onTheGround)
    }

    // A slanted leg doesn't reach down as far as a straight one, so the body
    // dips down a little to keep the feet on the ground.
    animal.position.y = -onTheGround.gapUnderFoot
  })
}

// A foot on the ground starts in front of the hip, and the body walks over it
// until it's behind. It moves back at exactly the walking speed, so it stays put.
function footOnTheGround(howFarThroughStep, furthestReach, legLength) {
  const footInFront = furthestReach * (1 - 2 * howFarThroughStep)
  const angle = legAngleFor(footInFront, legLength)

  return {
    angle,
    stretch: 1,
    gapUnderFoot: legLength * (1 - Math.cos(angle)),
  }
}

// A foot in the air starts behind the hip and swings forwards, lifting up on the way.
function footInTheAir(howFarThroughStep, furthestReach, legLength, howMuchSwing) {
  const footInFront = furthestReach * (2 * howFarThroughStep - 1)
  const liftAmount = Math.sin(howFarThroughStep * Math.PI) * howMuchSwing

  return {
    angle: legAngleFor(footInFront, legLength),
    stretch: 1 - LIFT * liftAmount,
  }
}

// How much to turn a leg so its foot is this far in front of the hip.
function legAngleFor(footInFront, legLength) {
  return -Math.asin(footInFront / legLength)
}

function moveLegs(legA, legB, foot) {
  for (const leg of [legA, legB]) {
    leg.rotation.x = foot.angle
    leg.scale.y = foot.stretch
  }
}
