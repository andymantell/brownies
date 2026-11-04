import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A blocky passenger jet, parked on the grass.
// It has a long body with windows, two big wings with engines underneath,
// a tail fin at the back, and little wheels to stand on.
// The nose points forwards (along z), so it can turn to face where it flies.

const LENGTH = 14 // from the nose to the tail
const BODY_SIZE = 2.4 // how wide and tall the body is
const BODY_HEIGHT = 2.6 // how high the middle of the body is off the ground
const WING_SPAN = 15 // from one wing tip to the other
const WING_HEIGHT = 1.65 // low enough to jump up onto!

export function createJet(screen) {
  const colours = config.jet

  // A group holds all the parts, so we can move the whole jet as one.
  const jet = makeGroup()
  jet.position.set(colours.x, 0, colours.z)

  // The long body.
  const body = makeBox({ width: BODY_SIZE, height: BODY_SIZE, depth: LENGTH, colour: colours.bodyColour })
  body.position.y = BODY_HEIGHT
  jet.add(body)

  // The nose: two smaller boxes that get narrower, at the front.
  addNosePart(jet, LENGTH / 2 + 0.4, 2, colours.bodyColour)
  addNosePart(jet, LENGTH / 2 + 1.1, 1.3, colours.bodyColour)

  // The windscreen, where the pilot looks out.
  const windscreen = makeBox({ width: 1.8, height: 0.5, depth: 0.6, colour: colours.windowColour })
  windscreen.position.set(0, BODY_HEIGHT + 0.6, LENGTH / 2 + 0.3)
  jet.add(windscreen)

  // A row of little windows along each side, for the passengers.
  addWindows(jet, -BODY_SIZE / 2 - 0.03, colours.windowColour)
  addWindows(jet, BODY_SIZE / 2 + 0.03, colours.windowColour)

  // A blue stripe along each side, under the windows.
  addStripe(jet, -BODY_SIZE / 2 - 0.03, colours.stripeColour)
  addStripe(jet, BODY_SIZE / 2 + 0.03, colours.stripeColour)

  // The big wings, sticking out from the middle.
  const wings = makeBox({ width: WING_SPAN, height: 0.3, depth: 3, colour: colours.bodyColour })
  wings.position.set(0, WING_HEIGHT, 0.5)
  jet.add(wings)

  // Two engines, hanging under the wings.
  addEngine(jet, -4, colours.engineColour)
  addEngine(jet, 4, colours.engineColour)

  // The tail fin, standing up at the back, painted red.
  const tailFin = makeBox({ width: 0.3, height: 3, depth: 2.2, colour: colours.tailColour })
  tailFin.position.set(0, BODY_HEIGHT + BODY_SIZE / 2 + 1.5, -LENGTH / 2 + 1.2)
  jet.add(tailFin)

  // The little wings at the back.
  const tailWings = makeBox({ width: 6, height: 0.25, depth: 1.5, colour: colours.bodyColour })
  tailWings.position.set(0, BODY_HEIGHT + 0.6, -LENGTH / 2 + 1)
  jet.add(tailWings)

  // Wheels to stand on: one at the front, two under the wings.
  addWheel(jet, 0, LENGTH / 2 - 1.5, colours.wheelColour)
  addWheel(jet, -1.5, -0.5, colours.wheelColour)
  addWheel(jet, 1.5, -0.5, colours.wheelColour)

  screen.add(jet)

  // The parts you bump into. The wings are low, so you can jump up and stand on them.
  const solidParts = [body, wings, tailWings]

  return { jet, position: jet.position, solidParts }
}

// Part of the pointy nose at the front.
function addNosePart(jet, z, size, colour) {
  const part = makeBox({ width: size, height: size, depth: 0.8, colour })
  part.position.set(0, BODY_HEIGHT, z)
  jet.add(part)
}

// A row of little windows along one side of the body.
function addWindows(jet, x, colour) {
  for (let z = -LENGTH / 2 + 2.5; z < LENGTH / 2 - 1; z += 1) {
    const passengerWindow = makeBox({ width: 0.05, height: 0.4, depth: 0.4, colour })
    passengerWindow.position.set(x, BODY_HEIGHT + 0.4, z)
    jet.add(passengerWindow)
  }
}

// A stripe painted along one side of the body.
function addStripe(jet, x, colour) {
  const stripe = makeBox({ width: 0.05, height: 0.2, depth: LENGTH, colour })
  stripe.position.set(x, BODY_HEIGHT - 0.2, 0)
  jet.add(stripe)
}

// An engine: a fat box hanging under a wing.
function addEngine(jet, x, colour) {
  const engine = makeBox({ width: 1.2, height: 1.2, depth: 2.4, colour })
  engine.position.set(x, WING_HEIGHT - 0.75, 1)
  jet.add(engine)
}

// A wheel, holding the jet up off the grass.
function addWheel(jet, x, z, colour) {
  const wheel = makeBox({ width: 0.5, height: 1.4, depth: 0.6, colour })
  wheel.position.set(x, 0.7, z)
  jet.add(wheel)
}
