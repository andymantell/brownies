import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// Father Christmas, made out of boxes.
// A red suit, a big white beard and a floppy red hat with a white bobble.

export function createSanta(screen) {
  const colours = config.santa

  // A group holds all the parts of Santa together, so they move as one.
  const santa = makeGroup()
  santa.position.set(colours.x, 0, colours.z)

  // A big round(ish) red tummy, with a black belt and a gold buckle.
  const body = makeBox({ width: 1, height: 1, depth: 0.7, colour: colours.suitColour })
  body.position.y = 1.2
  santa.add(body)

  const belt = makeBox({ width: 1.04, height: 0.16, depth: 0.74, colour: colours.beltColour })
  belt.position.y = -0.15
  body.add(belt)

  const buckle = makeBox({ width: 0.22, height: 0.2, depth: 0.04, colour: colours.buckleColour })
  buckle.position.set(0, 0, 0.38)
  belt.add(buckle)

  const head = makeBox({ width: 0.7, height: 0.7, depth: 0.7, colour: colours.skinColour })
  head.position.y = 2.05
  santa.add(head)

  // Two eyes and a rosy nose on the front of the head.
  const leftEye = makeBox({ width: 0.1, height: 0.12, depth: 0.05, colour: colours.eyeColour })
  leftEye.position.set(-0.16, 0.12, 0.36)
  head.add(leftEye)

  const rightEye = makeBox({ width: 0.1, height: 0.12, depth: 0.05, colour: colours.eyeColour })
  rightEye.position.set(0.16, 0.12, 0.36)
  head.add(rightEye)

  const nose = makeBox({ width: 0.12, height: 0.1, depth: 0.06, colour: colours.noseColour })
  nose.position.set(0, 0, 0.38)
  head.add(nose)

  // A big bushy white beard covering the bottom of his face.
  const beard = makeBox({ width: 0.76, height: 0.5, depth: 0.12, colour: colours.beardColour })
  beard.position.set(0, -0.3, 0.36)
  head.add(beard)

  // A red hat with a white furry rim, and a bobble on the top.
  const hatRim = makeBox({ width: 0.8, height: 0.14, depth: 0.8, colour: colours.beardColour })
  hatRim.position.set(0, 0.4, 0)
  head.add(hatRim)

  const hat = makeBox({ width: 0.6, height: 0.4, depth: 0.6, colour: colours.suitColour })
  hat.position.set(0, 0.65, 0)
  head.add(hat)

  const bobble = makeBox({ width: 0.2, height: 0.2, depth: 0.2, colour: colours.beardColour })
  bobble.position.set(0, 0.95, 0)
  head.add(bobble)

  // Two red arms with white cuffs, and black boots at the bottom of his legs.
  addArm(santa, -0.62, colours)
  addArm(santa, 0.62, colours)
  addLeg(santa, -0.25, colours)
  addLeg(santa, 0.25, colours)

  screen.add(santa)

  return {
    position: santa.position,
    santa,
  }
}

// One red arm hanging down by his side.
function addArm(santa, x, colours) {
  const arm = makeBox({ width: 0.24, height: 0.8, depth: 0.24, colour: colours.suitColour })
  arm.position.set(x, 1.25, 0)
  santa.add(arm)

  const cuff = makeBox({ width: 0.28, height: 0.12, depth: 0.28, colour: colours.beardColour })
  cuff.position.set(0, -0.4, 0)
  arm.add(cuff)
}

// One leg with a black boot on the end.
function addLeg(santa, x, colours) {
  const leg = makeBox({ width: 0.32, height: 0.7, depth: 0.32, colour: colours.suitColour })
  leg.position.set(x, 0.35, 0)
  santa.add(leg)

  const boot = makeBox({ width: 0.36, height: 0.24, depth: 0.42, colour: colours.beltColour })
  boot.position.set(0, -0.23, 0.04)
  leg.add(boot)
}
