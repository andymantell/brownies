import { config } from './config.js'
import { makeBox, makeGroup, createKeyboard } from './engine/index.js'
import { createToilet } from './toilet.js'

// A portaloo: a tall plastic toilet box, standing next to the bath.
// It has walls, a doorway at the front, a flat roof on top,
// and a toilet inside that flushes when you press F!

const WIDTH = 1.6 // from side to side
const DEPTH = 1.6 // from front to back
const WALL_HEIGHT = 2.6
const WALL_THICKNESS = 0.1
const DOOR_WIDTH = 1.1
const DOOR_HEIGHT = 2.1

export function createPortaloo(screen) {
  const colour = config.portaloo.wallColour

  // A group holds all the parts of the portaloo together, so we can move it as one.
  const portaloo = makeGroup()
  portaloo.position.set(config.portaloo.x, 0, config.portaloo.z)

  // The walls are solid, so we keep them in a list.
  // (Not the bit over the doorway, or you couldn't walk in!)
  const walls = []

  // The back wall, and the two side walls.
  addWall(portaloo, walls, { x: 0, z: -DEPTH / 2, width: WIDTH, depth: WALL_THICKNESS, colour })
  addWall(portaloo, walls, { x: -WIDTH / 2, z: 0, width: WALL_THICKNESS, depth: DEPTH, colour })
  addWall(portaloo, walls, { x: WIDTH / 2, z: 0, width: WALL_THICKNESS, depth: DEPTH, colour })

  // The front wall is in two thin strips, with the doorway in the middle...
  const stripWidth = (WIDTH - DOOR_WIDTH) / 2
  const stripMiddle = DOOR_WIDTH / 2 + stripWidth / 2
  addWall(portaloo, walls, { x: -stripMiddle, z: DEPTH / 2, width: stripWidth, depth: WALL_THICKNESS, colour })
  addWall(portaloo, walls, { x: stripMiddle, z: DEPTH / 2, width: stripWidth, depth: WALL_THICKNESS, colour })

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

  // The same flushing toilet as the one in the house, against the back wall.
  const toilet = createToilet()
  toilet.toilet.position.z = -DEPTH / 2 + 0.55
  portaloo.add(toilet.toilet)

  screen.add(portaloo)

  // The portaloo listens to the keyboard, for the F key that flushes the toilet.
  const keyboard = createKeyboard()

  return {
    portaloo,
    walls,

    // Called every frame. Press F next to the portaloo to flush its toilet!
    update(secondsPassed, characterPosition) {
      const distance = Math.hypot(
        characterPosition.x - config.portaloo.x,
        characterPosition.z - config.portaloo.z,
      )
      if (keyboard.wasJustPressed('f') && distance < 2) {
        toilet.flush()
      }
      toilet.update(secondsPassed)
    },
  }
}

// One wall, standing on the ground.
function addWall(portaloo, walls, { x, z, width, depth, colour }) {
  const wall = makeBox({ width, height: WALL_HEIGHT, depth, colour })
  wall.position.set(x, WALL_HEIGHT / 2, z)
  portaloo.add(wall)
  walls.push(wall)
}
