import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// 🌋 A big blocky volcano, made of layers of rock that get smaller as they go up.
// There's a pool of hot lava in the top.

const HOW_MANY_LAYERS = 6
const LAYER_HEIGHT = 1
const BOTTOM_WIDTH = 9 // how wide the bottom layer is
const TOP_WIDTH = 3 // how wide the top layer is

export function createVolcano(screen) {
  const volcano = makeGroup()
  volcano.position.set(config.volcano.x, 0, config.volcano.z)

  // Stack up the layers of rock, each one a bit narrower than the one below.
  for (let layer = 0; layer < HOW_MANY_LAYERS; layer++) {
    const howFarUp = layer / (HOW_MANY_LAYERS - 1)
    const width = BOTTOM_WIDTH - (BOTTOM_WIDTH - TOP_WIDTH) * howFarUp

    let colour = config.volcano.rockColour
    if (layer % 2 === 1) {
      colour = config.volcano.darkRockColour
    }

    const rock = makeBox({ width, height: LAYER_HEIGHT, depth: width, colour })
    rock.position.y = LAYER_HEIGHT / 2 + layer * LAYER_HEIGHT
    volcano.add(rock)
  }

  // The lava pool, sitting in the top of the volcano.
  const lava = makeBox({
    width: TOP_WIDTH - 1,
    height: 0.2,
    depth: TOP_WIDTH - 1,
    colour: config.volcano.lavaColour,
  })
  lava.position.y = HOW_MANY_LAYERS * LAYER_HEIGHT
  volcano.add(lava)

  screen.add(volcano)

  // The very top of the volcano, where lava will shoot out.
  const top = { x: config.volcano.x, y: HOW_MANY_LAYERS * LAYER_HEIGHT, z: config.volcano.z }

  return { volcano, top }
}
