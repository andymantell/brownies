import { makeBox, makeGroup } from './engine/index.js'

// A GIANT ladybird, made out of boxes.
// It rides on the horse's back and goes wherever the horse goes.

const colours = {
  shellColour: '#e02020',
  spotColour: '#111111',
  headColour: '#111111',
  eyeColour: '#ffffff',
}

// How high up the horse's back is, so the ladybird sits right on top.
const topOfTheHorse = 1.8

export function createLadybird() {
  // A group holds all the parts of the ladybird together, so they move as one.
  const ladybird = makeGroup()

  // A big red shell, standing up tall, so the ladybird sits upright like a rider.
  const shell = makeBox({ width: 1.1, height: 1.3, depth: 0.5, colour: colours.shellColour })
  shell.position.y = 0.65
  ladybird.add(shell)

  // A black line down the middle of the shell, where the wings meet.
  const line = makeBox({ width: 0.06, height: 1.32, depth: 0.52, colour: colours.spotColour })
  line.position.y = 0.65
  ladybird.add(line)

  // Black spots on the shell, on the ladybird's back.
  addSpot(ladybird, { x: -0.3, y: 0.95 })
  addSpot(ladybird, { x: 0.3, y: 0.95 })
  addSpot(ladybird, { x: -0.3, y: 0.4 })
  addSpot(ladybird, { x: 0.3, y: 0.4 })

  // A black tummy on the front.
  const tummy = makeBox({ width: 0.9, height: 1.1, depth: 0.04, colour: colours.headColour })
  tummy.position.set(0, 0.65, 0.26)
  ladybird.add(tummy)

  // Two little legs dangling down each side of the horse.
  addLeg(ladybird, { x: -0.6 })
  addLeg(ladybird, { x: 0.6 })

  // A black head on top, looking forwards.
  const head = makeBox({ width: 0.6, height: 0.45, depth: 0.45, colour: colours.headColour })
  head.position.set(0, 1.5, 0)
  ladybird.add(head)

  // Two white eyes on the front of the head.
  const leftEye = makeBox({ width: 0.12, height: 0.12, depth: 0.04, colour: colours.eyeColour })
  leftEye.position.set(-0.15, 0.05, 0.23)
  head.add(leftEye)

  const rightEye = makeBox({ width: 0.12, height: 0.12, depth: 0.04, colour: colours.eyeColour })
  rightEye.position.set(0.15, 0.05, 0.23)
  head.add(rightEye)

  // Two feelers sticking up from the head.
  const leftFeeler = makeBox({ width: 0.05, height: 0.4, depth: 0.05, colour: colours.headColour })
  leftFeeler.position.set(-0.15, 0.4, 0.1)
  leftFeeler.rotation.z = 0.4 // lean out to the side
  head.add(leftFeeler)

  const rightFeeler = makeBox({ width: 0.05, height: 0.4, depth: 0.05, colour: colours.headColour })
  rightFeeler.position.set(0.15, 0.4, 0.1)
  rightFeeler.rotation.z = -0.4
  head.add(rightFeeler)

  return {
    ladybird,

    // Climb onto the horse's back. From now on the ladybird moves with the horse.
    rideOn(horse) {
      ladybird.position.set(0, topOfTheHorse, -0.1)
      horse.add(ladybird)
    },
  }
}

// One black spot on the ladybird's back.
function addSpot(ladybird, { x, y }) {
  const spot = makeBox({ width: 0.25, height: 0.25, depth: 0.04, colour: colours.spotColour })
  spot.position.set(x, y, -0.26)
  ladybird.add(spot)
}

// One little black leg, hanging down the side of the horse.
function addLeg(ladybird, { x }) {
  const leg = makeBox({ width: 0.1, height: 0.6, depth: 0.1, colour: colours.headColour })
  leg.position.set(x, 0, 0.1)
  ladybird.add(leg)
}
