import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A bathtub full of water, sitting outside on the grass.
// It's made of boxes: a bottom, four sides, little feet and some water.

const LENGTH = 2.6 // from end to end
const WIDTH = 1.4 // from side to side
const SIDE_HEIGHT = 0.7 // low enough to jump onto, or into!
const SIDE_THICKNESS = 0.15
const FOOT_HEIGHT = 0.15
const WATER_DEPTH = 0.45

export function createBath(screen) {
  const colour = config.bath.colour

  // A group holds all the parts of the bath together, so we can move it as one.
  const bath = makeGroup()
  bath.position.set(config.bath.x, 0, config.bath.z)

  // Four little golden feet.
  addFoot(bath, -LENGTH / 2 + 0.25, -WIDTH / 2 + 0.2)
  addFoot(bath, LENGTH / 2 - 0.25, -WIDTH / 2 + 0.2)
  addFoot(bath, -LENGTH / 2 + 0.25, WIDTH / 2 - 0.2)
  addFoot(bath, LENGTH / 2 - 0.25, WIDTH / 2 - 0.2)

  // The bottom of the bath.
  const bottom = makeBox({ width: LENGTH, height: SIDE_THICKNESS, depth: WIDTH, colour })
  bottom.position.y = FOOT_HEIGHT + SIDE_THICKNESS / 2
  bath.add(bottom)

  // The bottom and the four sides are solid. We keep them in a list,
  // so you bump into the sides, but can jump in and stand on the bottom.
  const solidParts = [bottom]
  solidParts.push(addSide(bath, { x: 0, z: -WIDTH / 2, width: LENGTH, depth: SIDE_THICKNESS, colour }))
  solidParts.push(addSide(bath, { x: 0, z: WIDTH / 2, width: LENGTH, depth: SIDE_THICKNESS, colour }))
  solidParts.push(addSide(bath, { x: -LENGTH / 2, z: 0, width: SIDE_THICKNESS, depth: WIDTH, colour }))
  solidParts.push(addSide(bath, { x: LENGTH / 2, z: 0, width: SIDE_THICKNESS, depth: WIDTH, colour }))

  // The water, filling up the inside.
  const water = makeBox({
    width: LENGTH - SIDE_THICKNESS,
    height: WATER_DEPTH,
    depth: WIDTH - SIDE_THICKNESS,
    colour: config.bath.waterColour,
  })
  water.position.y = FOOT_HEIGHT + SIDE_THICKNESS + WATER_DEPTH / 2
  bath.add(water)

  screen.add(bath)

  return { bath, solidParts }
}

// One side of the bath, standing on the feet.
function addSide(bath, { x, z, width, depth, colour }) {
  const side = makeBox({ width, height: SIDE_HEIGHT, depth, colour })
  side.position.set(x, FOOT_HEIGHT + SIDE_HEIGHT / 2, z)
  bath.add(side)
  return side
}

// One little foot, under a corner of the bath.
function addFoot(bath, x, z) {
  const foot = makeBox({ width: 0.2, height: FOOT_HEIGHT, depth: 0.2, colour: config.bath.feetColour })
  foot.position.set(x, FOOT_HEIGHT / 2, z)
  bath.add(foot)
}
