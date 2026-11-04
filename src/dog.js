import { makeBox, makeGroup } from './engine/index.js'

// A friendly dog, made out of boxes.
// The same recipe makes any kind of dog: we just give it different colours.

export function createDog(screen, looks) {
  // A group holds all the parts of the dog together, so they move as one.
  const dog = makeGroup()
  dog.position.set(looks.x, 0, looks.z)

  const body = makeBox({ width: 0.6, height: 0.55, depth: 1.2, colour: looks.furColour })
  body.position.y = 0.7
  dog.add(body)

  const head = makeBox({ width: 0.55, height: 0.5, depth: 0.5, colour: looks.furColour })
  head.position.set(0, 1.15, 0.7)
  dog.add(head)

  // A snout sticking out of the front of the head, with a nose on the end.
  const snout = makeBox({ width: 0.3, height: 0.22, depth: 0.25, colour: looks.snoutColour })
  snout.position.set(0, -0.1, 0.35)
  head.add(snout)

  const nose = makeBox({ width: 0.12, height: 0.08, depth: 0.05, colour: looks.noseColour })
  nose.position.set(0, 0.07, 0.14)
  snout.add(nose)

  // Two eyes on the front of the head.
  const leftEye = makeBox({ width: 0.08, height: 0.1, depth: 0.04, colour: looks.eyeColour })
  leftEye.position.set(-0.13, 0.08, 0.26)
  head.add(leftEye)

  const rightEye = makeBox({ width: 0.08, height: 0.1, depth: 0.04, colour: looks.eyeColour })
  rightEye.position.set(0.13, 0.08, 0.26)
  head.add(rightEye)

  if (looks.pointyEars) {
    addPointyEars(head, looks.earColour)
  } else {
    addFloppyEars(head, looks.earColour)
  }

  // Four legs, one at each corner of the body.
  addLeg(dog, { x: -0.2, z: 0.42, colour: looks.furColour })
  addLeg(dog, { x: 0.2, z: 0.42, colour: looks.furColour })
  addLeg(dog, { x: -0.2, z: -0.42, colour: looks.furColour })
  addLeg(dog, { x: 0.2, z: -0.42, colour: looks.furColour })

  // A waggy tail sticking out at the back.
  const tail = makeBox({ width: 0.12, height: 0.12, depth: 0.5, colour: looks.furColour })
  tail.position.set(0, 0.95, -0.75)
  tail.rotation.x = 0.5 // point the tail up a little
  dog.add(tail)

  screen.add(dog)

  return {
    position: dog.position,
    dog,
  }
}

// Two floppy ears hanging down the sides of the head, like a labrador.
function addFloppyEars(head, colour) {
  const leftEar = makeBox({ width: 0.08, height: 0.3, depth: 0.2, colour })
  leftEar.position.set(-0.31, -0.02, 0)
  head.add(leftEar)

  const rightEar = makeBox({ width: 0.08, height: 0.3, depth: 0.2, colour })
  rightEar.position.set(0.31, -0.02, 0)
  head.add(rightEar)
}

// Two pointy ears standing up on top of the head, like a husky.
function addPointyEars(head, colour) {
  const leftEar = makeBox({ width: 0.14, height: 0.22, depth: 0.08, colour })
  leftEar.position.set(-0.17, 0.35, -0.05)
  head.add(leftEar)

  const rightEar = makeBox({ width: 0.14, height: 0.22, depth: 0.08, colour })
  rightEar.position.set(0.17, 0.35, -0.05)
  head.add(rightEar)
}

// One leg, standing on the ground.
function addLeg(dog, { x, z, colour }) {
  const leg = makeBox({ width: 0.15, height: 0.45, depth: 0.15, colour })
  leg.position.set(x, 0.225, z)
  dog.add(leg)
}
