import { config } from './config.js'
import { makeBox, makeGroup, makeSwingingBox } from './engine/index.js'

// A little red panda, made out of boxes.
// It has rusty red fur, a white face and dark legs.

export function createRedPanda(screen) {
  const looks = config.redPanda

  // A group holds all the parts of the red panda together, so they move as one.
  const redPanda = makeGroup()
  redPanda.position.set(looks.x, 0, looks.z)

  // A long, fluffy body.
  const body = makeBox({ width: 0.55, height: 0.45, depth: 1, colour: looks.furColour })
  body.position.y = 0.6
  redPanda.add(body)

  // A dark tummy underneath.
  const tummy = makeBox({ width: 0.5, height: 0.1, depth: 0.8, colour: looks.legColour })
  tummy.position.y = -0.22
  body.add(tummy)

  // A round head at the front.
  const head = makeBox({ width: 0.55, height: 0.45, depth: 0.45, colour: looks.furColour })
  head.position.set(0, 0.95, 0.6)
  redPanda.add(head)

  // A white snout poking out of the face, with a black nose on the end.
  const snout = makeBox({ width: 0.25, height: 0.18, depth: 0.15, colour: looks.faceColour })
  snout.position.set(0, -0.1, 0.28)
  head.add(snout)

  const nose = makeBox({ width: 0.1, height: 0.07, depth: 0.04, colour: looks.noseColour })
  nose.position.set(0, 0.04, 0.08)
  snout.add(nose)

  // White patches over the eyes, with a dark eye in each one.
  addEye(head, { x: -0.14, looks })
  addEye(head, { x: 0.14, looks })

  // Two pointy ears with white edges.
  addEar(head, { x: -0.19, looks })
  addEar(head, { x: 0.19, looks })

  // Four dark legs, one at each corner of the body.
  addLeg(redPanda, { x: -0.18, z: 0.35, looks })
  addLeg(redPanda, { x: 0.18, z: 0.35, looks })
  addLeg(redPanda, { x: -0.18, z: -0.35, looks })
  addLeg(redPanda, { x: 0.18, z: -0.35, looks })

  screen.add(redPanda)

  return {
    position: redPanda.position,
    redPanda,
  }
}

const LEG_LENGTH = 0.4

// A white patch on the face, with a dark eye in the middle.
function addEye(head, { x, looks }) {
  const patch = makeBox({ width: 0.16, height: 0.14, depth: 0.04, colour: looks.faceColour })
  patch.position.set(x, 0.06, 0.23)
  head.add(patch)

  const eye = makeBox({ width: 0.07, height: 0.08, depth: 0.03, colour: looks.eyeColour })
  eye.position.z = 0.02
  patch.add(eye)
}

// A pointy ear, with a white edge round the front.
function addEar(head, { x, looks }) {
  const ear = makeBox({ width: 0.16, height: 0.16, depth: 0.08, colour: looks.furColour })
  ear.position.set(x, 0.29, -0.05)
  head.add(ear)

  const edge = makeBox({ width: 0.1, height: 0.1, depth: 0.02, colour: looks.faceColour })
  edge.position.set(0, -0.01, 0.05)
  ear.add(edge)
}

// One dark leg, swinging from the hip, with its foot on the ground.
function addLeg(redPanda, { x, z, looks }) {
  const leg = makeSwingingBox({ width: 0.14, height: LEG_LENGTH, depth: 0.14, colour: looks.legColour })
  leg.position.set(x, LEG_LENGTH, z) // the hip, at the top of the leg
  redPanda.add(leg)
  return leg
}
