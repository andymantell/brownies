import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A blocky snowman, standing out on the grass.
// He's made of three big snowy blocks: a big one at the bottom,
// a middle one for his tummy, and a little one for his head.

export function createSnowman(screen) {
  const snowColour = config.snowman.snowColour

  // A group holds all the parts of the snowman together, so we can move him as one.
  const snowman = makeGroup()
  snowman.position.set(config.snowman.x, 0, config.snowman.z)

  // The big bottom block.
  const bottom = makeBox({ width: 1.6, height: 1.2, depth: 1.6, colour: snowColour })
  bottom.position.y = 0.6
  snowman.add(bottom)

  // The middle block, for his tummy.
  const middle = makeBox({ width: 1.2, height: 1, depth: 1.2, colour: snowColour })
  middle.position.y = 1.7
  snowman.add(middle)

  // The little block on top, for his head.
  const head = makeBox({ width: 0.9, height: 0.8, depth: 0.9, colour: snowColour })
  head.position.y = 2.6
  snowman.add(head)

  screen.add(snowman)

  return {
    snowman,
  }
}
