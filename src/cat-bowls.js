import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// Bowls for the cat, in front of the cat house.
// Each bowl is a flat base with four thin sides around it.

const BOWL_SIZE = 0.5 // from side to side, and from front to back
const BOWL_HEIGHT = 0.15
const SIDE_THICKNESS = 0.05
const BASE_HEIGHT = 0.03

export function createCatBowls(screen) {
  const settings = config.catBowls

  // The bowl of water.
  const waterBowl = makeBowl(settings.bowlColour)
  waterBowl.position.set(settings.waterX, 0, settings.waterZ)

  // The water sits inside the bowl, nearly up to the top.
  const water = makeBox({
    width: BOWL_SIZE - SIDE_THICKNESS * 2,
    height: BOWL_HEIGHT * 0.7,
    depth: BOWL_SIZE - SIDE_THICKNESS * 2,
    colour: settings.waterColour,
  })
  water.position.y = BASE_HEIGHT + (BOWL_HEIGHT * 0.7) / 2
  waterBowl.add(water)

  screen.add(waterBowl)

  return { waterBowl }
}

// An empty bowl: a flat base, with a short side all the way round.
function makeBowl(colour) {
  const bowl = makeGroup()

  const base = makeBox({ width: BOWL_SIZE, height: BASE_HEIGHT, depth: BOWL_SIZE, colour })
  base.position.y = BASE_HEIGHT / 2
  bowl.add(base)

  // The front and back sides go all the way across.
  const edge = BOWL_SIZE / 2 - SIDE_THICKNESS / 2
  addSide(bowl, { x: 0, z: -edge, width: BOWL_SIZE, depth: SIDE_THICKNESS, colour })
  addSide(bowl, { x: 0, z: edge, width: BOWL_SIZE, depth: SIDE_THICKNESS, colour })

  // The left and right sides fit in between them.
  const gap = BOWL_SIZE - SIDE_THICKNESS * 2
  addSide(bowl, { x: -edge, z: 0, width: SIDE_THICKNESS, depth: gap, colour })
  addSide(bowl, { x: edge, z: 0, width: SIDE_THICKNESS, depth: gap, colour })

  return bowl
}

// One side of a bowl, standing on the ground.
function addSide(bowl, { x, z, width, depth, colour }) {
  const side = makeBox({ width, height: BOWL_HEIGHT, depth, colour })
  side.position.set(x, BOWL_HEIGHT / 2, z)
  bowl.add(side)
}
