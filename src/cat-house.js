import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A little house for the cat, built out of boxes.
// It's like a tiny version of the big house: walls, a door, and a stepped roof.

const WIDTH = 1.6 // from side to side
const DEPTH = 1.6 // from front to back
const WALL_HEIGHT = 1
const WALL_THICKNESS = 0.12
const DOOR_WIDTH = 0.6
const DOOR_HEIGHT = 0.7

export function createCatHouse(screen) {
  const colour = config.catHouse.wallColour

  // A group holds all the parts of the cat house together, so we can move it as one.
  const catHouse = makeGroup()
  catHouse.position.set(config.catHouse.x, 0, config.catHouse.z)

  // The back wall, and the two side walls.
  addWall(catHouse, { x: 0, z: -DEPTH / 2, width: WIDTH, depth: WALL_THICKNESS, colour })
  addWall(catHouse, { x: -WIDTH / 2, z: 0, width: WALL_THICKNESS, depth: DEPTH, colour })
  addWall(catHouse, { x: WIDTH / 2, z: 0, width: WALL_THICKNESS, depth: DEPTH, colour })

  // The front wall is in two halves, with a gap for the cat flap in the middle...
  const halfWidth = (WIDTH - DOOR_WIDTH) / 2
  const halfMiddle = DOOR_WIDTH / 2 + halfWidth / 2
  addWall(catHouse, { x: -halfMiddle, z: DEPTH / 2, width: halfWidth, depth: WALL_THICKNESS, colour })
  addWall(catHouse, { x: halfMiddle, z: DEPTH / 2, width: halfWidth, depth: WALL_THICKNESS, colour })

  // ...and a bit of wall over the top of the door.
  const aboveTheDoor = makeBox({
    width: DOOR_WIDTH,
    height: WALL_HEIGHT - DOOR_HEIGHT,
    depth: WALL_THICKNESS,
    colour,
  })
  aboveTheDoor.position.set(0, (WALL_HEIGHT + DOOR_HEIGHT) / 2, DEPTH / 2)
  catHouse.add(aboveTheDoor)

  const roof = makeRoof()
  catHouse.add(roof)

  screen.add(catHouse)

  return { catHouse }
}

// A pointy roof, made of layers of boxes that get thinner as they go up.
function makeRoof() {
  const roof = makeGroup()
  const colour = config.catHouse.roofColour

  const overhang = 0.15 // how far the roof sticks out past the walls
  const layerHeight = 0.15
  const howManyLayers = 4

  for (let layer = 0; layer < howManyLayers; layer++) {
    // Each layer is a bit narrower than the one below it.
    const depth = DEPTH + overhang * 2 - layer * 0.45

    const step = makeBox({ width: WIDTH + overhang * 2, height: layerHeight, depth, colour })
    step.position.y = WALL_HEIGHT + layerHeight / 2 + layer * layerHeight
    roof.add(step)
  }

  return roof
}

// One wall, standing on the ground.
function addWall(catHouse, { x, z, width, depth, colour }) {
  const wall = makeBox({ width, height: WALL_HEIGHT, depth, colour })
  wall.position.set(x, WALL_HEIGHT / 2, z)
  catHouse.add(wall)
}
