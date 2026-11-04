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

  // A big round-ish red shell.
  const shell = makeBox({ width: 1.1, height: 0.5, depth: 1.3, colour: colours.shellColour })
  shell.position.y = 0.3
  ladybird.add(shell)

  // A black line down the middle of the shell, where the wings meet.
  const line = makeBox({ width: 0.06, height: 0.52, depth: 1.32, colour: colours.spotColour })
  line.position.y = 0.3
  ladybird.add(line)

  // Black spots on the shell.
  addSpot(ladybird, { x: -0.3, z: 0.35 })
  addSpot(ladybird, { x: 0.3, z: 0.35 })
  addSpot(ladybird, { x: -0.3, z: -0.3 })
  addSpot(ladybird, { x: 0.3, z: -0.3 })

  // A black head at the front.
  const head = makeBox({ width: 0.6, height: 0.4, depth: 0.35, colour: colours.headColour })
  head.position.set(0, 0.3, 0.8)
  ladybird.add(head)

  // Two white eyes.
  const leftEye = makeBox({ width: 0.12, height: 0.12, depth: 0.04, colour: colours.eyeColour })
  leftEye.position.set(-0.16, 0.05, 0.18)
  head.add(leftEye)

  const rightEye = makeBox({ width: 0.12, height: 0.12, depth: 0.04, colour: colours.eyeColour })
  rightEye.position.set(0.16, 0.05, 0.18)
  head.add(rightEye)

  // Two feelers sticking up from the head.
  const leftFeeler = makeBox({ width: 0.05, height: 0.4, depth: 0.05, colour: colours.headColour })
  leftFeeler.position.set(-0.15, 0.35, 0.1)
  leftFeeler.rotation.z = 0.4 // lean out to the side
  head.add(leftFeeler)

  const rightFeeler = makeBox({ width: 0.05, height: 0.4, depth: 0.05, colour: colours.headColour })
  rightFeeler.position.set(0.15, 0.35, 0.1)
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

// One black spot on top of the shell.
function addSpot(ladybird, { x, z }) {
  const spot = makeBox({ width: 0.25, height: 0.04, depth: 0.25, colour: colours.spotColour })
  spot.position.set(x, 0.56, z)
  ladybird.add(spot)
}
