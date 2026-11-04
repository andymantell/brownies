import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A little grey cat, made out of boxes.
// For now it just sits in the world. Later it could wander about!

export function createCat(screen) {
  const colours = config.cat

  // A group holds all the parts of the cat together, so they move as one.
  const cat = makeGroup()
  cat.position.set(config.cat.x, 0, config.cat.z)

  const body = makeBox({ width: 0.5, height: 0.45, depth: 1, colour: colours.furColour })
  body.position.y = 0.55
  cat.add(body)

  const head = makeBox({ width: 0.5, height: 0.45, depth: 0.45, colour: colours.furColour })
  head.position.set(0, 0.95, 0.55)
  cat.add(head)

  // Two pointy ears on top of the head.
  const leftEar = makeBox({ width: 0.12, height: 0.18, depth: 0.08, colour: colours.furColour })
  leftEar.position.set(-0.15, 0.3, 0)
  head.add(leftEar)

  const rightEar = makeBox({ width: 0.12, height: 0.18, depth: 0.08, colour: colours.furColour })
  rightEar.position.set(0.15, 0.3, 0)
  head.add(rightEar)

  // Two eyes and a little pink nose on the front of the head.
  const leftEye = makeBox({ width: 0.08, height: 0.1, depth: 0.04, colour: colours.eyeColour })
  leftEye.position.set(-0.12, 0.06, 0.23)
  head.add(leftEye)

  const rightEye = makeBox({ width: 0.08, height: 0.1, depth: 0.04, colour: colours.eyeColour })
  rightEye.position.set(0.12, 0.06, 0.23)
  head.add(rightEye)

  const nose = makeBox({ width: 0.07, height: 0.05, depth: 0.04, colour: colours.noseColour })
  nose.position.set(0, -0.06, 0.23)
  head.add(nose)

  // Four legs, one at each corner of the body.
  addLeg(cat, { x: -0.17, z: 0.35, colour: colours.furColour })
  addLeg(cat, { x: 0.17, z: 0.35, colour: colours.furColour })
  addLeg(cat, { x: -0.17, z: -0.35, colour: colours.furColour })
  addLeg(cat, { x: 0.17, z: -0.35, colour: colours.furColour })

  // A long tail sticking up at the back.
  const tail = makeBox({ width: 0.1, height: 0.7, depth: 0.1, colour: colours.furColour })
  tail.position.set(0, 0.95, -0.5)
  tail.rotation.x = -0.4 // lean the tail backwards a little
  cat.add(tail)

  screen.add(cat)

  return {
    position: cat.position,
    cat,
  }
}

// One leg, standing on the ground.
function addLeg(cat, { x, z, colour }) {
  const leg = makeBox({ width: 0.12, height: 0.35, depth: 0.12, colour })
  leg.position.set(x, 0.175, z)
  cat.add(leg)
}
