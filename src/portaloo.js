import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A portaloo: a tall plastic toilet box, standing next to the bath.
// It has walls, a doorway at the front, and a flat roof on top.

const WIDTH = 1.4 // from side to side
const DEPTH = 1.4 // from front to back
const WALL_HEIGHT = 2.6
const WALL_THICKNESS = 0.1
const DOOR_WIDTH = 0.9
const DOOR_HEIGHT = 2.1

export function createPortaloo(screen) {
  const colour = config.portaloo.wallColour

  // A group holds all the parts of the portaloo together, so we can move it as one.
  const portaloo = makeGroup()
  portaloo.position.set(config.portaloo.x, 0, config.portaloo.z)

  // The back wall, and the two side walls.
  addWall(portaloo, { x: 0, z: -DEPTH / 2, width: WIDTH, depth: WALL_THICKNESS, colour })
  addWall(portaloo, { x: -WIDTH / 2, z: 0, width: WALL_THICKNESS, depth: DEPTH, colour })
  addWall(portaloo, { x: WIDTH / 2, z: 0, width: WALL_THICKNESS, depth: DEPTH, colour })

  // The front wall is in two thin strips, with the doorway in the middle...
  const stripWidth = (WIDTH - DOOR_WIDTH) / 2
  const stripMiddle = DOOR_WIDTH / 2 + stripWidth / 2
  addWall(portaloo, { x: -stripMiddle, z: DEPTH / 2, width: stripWidth, depth: WALL_THICKNESS, colour })
  addWall(portaloo, { x: stripMiddle, z: DEPTH / 2, width: stripWidth, depth: WALL_THICKNESS, colour })

  // ...and a bit of wall over the top of the doorway.
  const aboveTheDoor = makeBox({
    width: DOOR_WIDTH,
    height: WALL_HEIGHT - DOOR_HEIGHT,
    depth: WALL_THICKNESS,
    colour,
  })
  aboveTheDoor.position.set(0, (WALL_HEIGHT + DOOR_HEIGHT) / 2, DEPTH / 2)
  portaloo.add(aboveTheDoor)

  // A flat roof that sticks out a little bit.
  const roof = makeBox({ width: WIDTH + 0.2, height: 0.15, depth: DEPTH + 0.2, colour: config.portaloo.roofColour })
  roof.position.y = WALL_HEIGHT + 0.075
  portaloo.add(roof)

  screen.add(portaloo)

  return { portaloo }
}

// One wall, standing on the ground.
function addWall(portaloo, { x, z, width, depth, colour }) {
  const wall = makeBox({ width, height: WALL_HEIGHT, depth, colour })
  wall.position.set(x, WALL_HEIGHT / 2, z)
  portaloo.add(wall)
}
