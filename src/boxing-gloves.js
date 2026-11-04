import { makeBox } from './engine/index.js'

// Big blocky boxing gloves, made out of boxes.
// They go on the ends of someone's arms, so they swing when they walk.

// How far down the arm the hands are.
const endOfTheArm = -0.8

export function putOnBoxingGloves(person, colour) {
  const leftGlove = makeBox({ width: 0.34, height: 0.32, depth: 0.38, colour: colour })
  leftGlove.position.y = endOfTheArm
  person.leftArm.add(leftGlove)

  const rightGlove = makeBox({ width: 0.34, height: 0.32, depth: 0.38, colour: colour })
  rightGlove.position.y = endOfTheArm
  person.rightArm.add(rightGlove)
}
