import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A hutch for the rabbit, inside the house.
// It's a cage: a straw floor, a wooden roof, and thin bars all the way round,
// so we can see the rabbit inside.

const WIDTH = 2.4 // from side to side
const DEPTH = 1.6 // from front to back
const HEIGHT = 1.2
const BAR_THICKNESS = 0.06
const GAP_BETWEEN_BARS = 0.25

export function createRabbitHutch(screen) {
  const settings = config.rabbitHutch

  // A group holds all the parts of the hutch together, so we can move it as one.
  const hutch = makeGroup()
  hutch.position.set(settings.x, 0, settings.z)

  // The straw floor.
  const floor = makeBox({ width: WIDTH, height: 0.1, depth: DEPTH, colour: settings.strawColour })
  floor.position.y = 0.05
  hutch.add(floor)

  // The wooden roof.
  const roof = makeBox({ width: WIDTH + 0.2, height: 0.12, depth: DEPTH + 0.2, colour: settings.woodColour })
  roof.position.y = HEIGHT
  hutch.add(roof)

  // A wooden post in each corner.
  const corners = [
    { x: -WIDTH / 2, z: -DEPTH / 2 },
    { x: WIDTH / 2, z: -DEPTH / 2 },
    { x: -WIDTH / 2, z: DEPTH / 2 },
    { x: WIDTH / 2, z: DEPTH / 2 },
  ]
  for (const corner of corners) {
    addBar(hutch, { x: corner.x, z: corner.z, thickness: 0.12, colour: settings.woodColour })
  }

  // Bars along the front and the back.
  for (let x = -WIDTH / 2 + GAP_BETWEEN_BARS; x < WIDTH / 2; x += GAP_BETWEEN_BARS) {
    addBar(hutch, { x, z: -DEPTH / 2, thickness: BAR_THICKNESS, colour: settings.barColour })
    addBar(hutch, { x, z: DEPTH / 2, thickness: BAR_THICKNESS, colour: settings.barColour })
  }

  // Bars along the two sides.
  for (let z = -DEPTH / 2 + GAP_BETWEEN_BARS; z < DEPTH / 2; z += GAP_BETWEEN_BARS) {
    addBar(hutch, { x: -WIDTH / 2, z, thickness: BAR_THICKNESS, colour: settings.barColour })
    addBar(hutch, { x: WIDTH / 2, z, thickness: BAR_THICKNESS, colour: settings.barColour })
  }

  screen.add(hutch)

  return { hutch }
}

// One upright bar, from the floor to the roof.
function addBar(hutch, { x, z, thickness, colour }) {
  const bar = makeBox({ width: thickness, height: HEIGHT, depth: thickness, colour })
  bar.position.set(x, HEIGHT / 2, z)
  hutch.add(bar)
}
