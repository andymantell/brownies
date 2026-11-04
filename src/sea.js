import { config } from './config.js'
import { makeBox, makeWaves } from './engine/index.js'

// The sea, splashing against one edge of the field.
// It sits just past the grass, so nobody can walk out onto the water.

export function createSea(screen) {
  const size = config.world.size
  const width = config.sea.width
  const middleOfTheSea = size / 2 + width / 2 // just past the edge of the field

  // A big block of deep blue water, a little lower than the grass.
  const water = makeBox({ width, height: 2, depth: size, colour: config.sea.deepColour })
  water.position.x = middleOfTheSea
  water.position.y = config.sea.level - 1.3
  screen.add(water)

  // Blocky waves bobbing up and down on top.
  const waves = makeWaves(screen, {
    x: middleOfTheSea,
    z: 0,
    width,
    depth: size,
    level: config.sea.level,
    colour: config.sea.colour,
  })

  // Call this every frame, so the waves keep rolling.
  function update(secondsPassed) {
    waves.update(secondsPassed)
  }

  return { water, update }
}
