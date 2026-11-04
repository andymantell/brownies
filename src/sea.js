import { config } from './config.js'
import { makeBox } from './engine/index.js'

// The sea, splashing against one edge of the field.
// It sits just past the grass, so nobody can walk out onto the water.

export function createSea(screen) {
  const size = config.world.size
  const width = config.sea.width

  // A big block of blue water, a little lower than the grass.
  const water = makeBox({ width, height: 2, depth: size, colour: config.sea.colour })
  water.position.x = size / 2 + width / 2 // just past the edge of the field
  water.position.y = config.sea.level - 1
  screen.add(water)

  return { water }
}
