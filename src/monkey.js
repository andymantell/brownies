import { makeBox, makeGroup } from './engine/index.js'

// A tiny cheeky monkey, made out of boxes.
// It sits on someone's head and goes wherever they go.

const colours = {
  furColour: '#8b5a2b',
  faceColour: '#e0b48a',
  eyeColour: '#222222',
}

// How high up a person's head is, so the monkey sits right on top.
const topOfTheHead = 2.4

export function createMonkey() {
  // A group holds all the parts of the monkey together, so they move as one.
  const monkey = makeGroup()

  const body = makeBox({ width: 0.3, height: 0.3, depth: 0.25, colour: colours.furColour })
  body.position.y = 0.15
  monkey.add(body)

  const head = makeBox({ width: 0.28, height: 0.26, depth: 0.26, colour: colours.furColour })
  head.position.y = 0.43
  monkey.add(head)

  // A light patch on the front of the face.
  const face = makeBox({ width: 0.2, height: 0.16, depth: 0.04, colour: colours.faceColour })
  face.position.set(0, -0.03, 0.13)
  head.add(face)

  // Two eyes.
  const leftEye = makeBox({ width: 0.04, height: 0.05, depth: 0.03, colour: colours.eyeColour })
  leftEye.position.set(-0.05, 0.02, 0.16)
  head.add(leftEye)

  const rightEye = makeBox({ width: 0.04, height: 0.05, depth: 0.03, colour: colours.eyeColour })
  rightEye.position.set(0.05, 0.02, 0.16)
  head.add(rightEye)

  // Big round ears sticking out of the sides.
  const leftEar = makeBox({ width: 0.06, height: 0.12, depth: 0.08, colour: colours.faceColour })
  leftEar.position.set(-0.17, 0.02, 0)
  head.add(leftEar)

  const rightEar = makeBox({ width: 0.06, height: 0.12, depth: 0.08, colour: colours.faceColour })
  rightEar.position.set(0.17, 0.02, 0)
  head.add(rightEar)

  // Arms hanging down the sides, holding on tight!
  const leftArm = makeBox({ width: 0.08, height: 0.3, depth: 0.08, colour: colours.furColour })
  leftArm.position.set(-0.2, 0.05, 0.05)
  monkey.add(leftArm)

  const rightArm = makeBox({ width: 0.08, height: 0.3, depth: 0.08, colour: colours.furColour })
  rightArm.position.set(0.2, 0.05, 0.05)
  monkey.add(rightArm)

  // A long curly-ish tail sticking up at the back.
  const tail = makeBox({ width: 0.06, height: 0.4, depth: 0.06, colour: colours.furColour })
  tail.position.set(0, 0.25, -0.18)
  tail.rotation.x = -0.6 // lean the tail backwards
  monkey.add(tail)

  return {
    monkey,

    // Pop the monkey on top of someone's head. It moves with them from now on.
    sitOnHeadOf(person) {
      monkey.position.set(0, topOfTheHead, 0)
      person.add(monkey)
    },
  }
}
