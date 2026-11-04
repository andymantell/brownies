import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A little house for our character, built out of boxes.
//
// Seen from above, the house is a rectangle. The front wall faces the camera,
// and it has a gap in the middle for the door.

const WIDTH = 6 // from side to side
const DEPTH = 5 // from front to back
const WALL_HEIGHT = 3
const WALL_THICKNESS = 0.3
const DOOR_WIDTH = 1.4
const DOOR_HEIGHT = 2.4

export function createHouse(screen) {
  const colour = config.house.wallColour

  // A group holds all the parts of the house together, so we can move it as one.
  const house = makeGroup()
  house.position.set(config.house.x, 0, config.house.z)

  // The back wall, and the two side walls.
  addWall(house, { x: 0, z: -DEPTH / 2, width: WIDTH, depth: WALL_THICKNESS, colour })
  addWall(house, { x: -WIDTH / 2, z: 0, width: WALL_THICKNESS, depth: DEPTH, colour })
  addWall(house, { x: WIDTH / 2, z: 0, width: WALL_THICKNESS, depth: DEPTH, colour })

  // The front wall is in two halves, with a gap for the door in the middle...
  const halfWidth = (WIDTH - DOOR_WIDTH) / 2
  const halfMiddle = DOOR_WIDTH / 2 + halfWidth / 2
  addWall(house, { x: -halfMiddle, z: DEPTH / 2, width: halfWidth, depth: WALL_THICKNESS, colour })
  addWall(house, { x: halfMiddle, z: DEPTH / 2, width: halfWidth, depth: WALL_THICKNESS, colour })

  // ...and a bit of wall over the top of the door.
  const aboveTheDoor = makeBox({
    width: DOOR_WIDTH,
    height: WALL_HEIGHT - DOOR_HEIGHT,
    depth: WALL_THICKNESS,
    colour,
  })
  aboveTheDoor.position.set(0, (WALL_HEIGHT + DOOR_HEIGHT) / 2, DEPTH / 2)
  house.add(aboveTheDoor)

  const roof = makeRoof()
  house.add(roof)

  screen.add(house)

  return { house, roof }
}

// A pointy roof, made of layers of boxes that get thinner as they go up,
// like a stack of steps.
function makeRoof() {
  const roof = makeGroup()
  const colour = config.house.roofColour

  const overhang = 0.4 // how far the roof sticks out past the walls
  const layerHeight = 0.4
  const howManyLayers = 5

  for (let layer = 0; layer < howManyLayers; layer++) {
    // Each layer is a bit narrower than the one below it.
    const depth = DEPTH + overhang * 2 - layer * 1.2

    const step = makeBox({ width: WIDTH + overhang * 2, height: layerHeight, depth, colour })
    step.position.y = WALL_HEIGHT + layerHeight / 2 + layer * layerHeight
    roof.add(step)
  }

  return roof
}

// One wall, standing on the ground.
function addWall(house, { x, z, width, depth, colour }) {
  const wall = makeBox({ width, height: WALL_HEIGHT, depth, colour })
  wall.position.set(x, WALL_HEIGHT / 2, z)
  house.add(wall)
}
