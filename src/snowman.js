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

  // Two coal eyes, on the front of his head.
  const coalColour = config.snowman.coalColour
  const leftEye = makeBox({ width: 0.14, height: 0.14, depth: 0.05, colour: coalColour })
  leftEye.position.set(-0.2, 2.75, 0.46)
  snowman.add(leftEye)
  const rightEye = makeBox({ width: 0.14, height: 0.14, depth: 0.05, colour: coalColour })
  rightEye.position.set(0.2, 2.75, 0.46)
  snowman.add(rightEye)

  // A long, pointy carrot nose, sticking out of his face.
  const nose = makeBox({ width: 0.12, height: 0.12, depth: 0.5, colour: config.snowman.carrotColour })
  nose.position.set(0, 2.55, 0.7)
  snowman.add(nose)

  // Three coal buttons, down the front of his tummy.
  for (const height of [1.4, 1.7, 2.0]) {
    const button = makeBox({ width: 0.14, height: 0.14, depth: 0.05, colour: coalColour })
    button.position.set(0, height, 0.61)
    snowman.add(button)
  }

  // A cosy scarf, wrapped round his neck, with one end hanging down.
  const scarfColour = config.snowman.scarfColour
  const scarf = makeBox({ width: 1.0, height: 0.18, depth: 1.0, colour: scarfColour })
  scarf.position.y = 2.25
  snowman.add(scarf)
  const scarfEnd = makeBox({ width: 0.22, height: 0.6, depth: 0.08, colour: scarfColour })
  scarfEnd.position.set(0.3, 1.95, 0.63)
  snowman.add(scarfEnd)

  // A tall black top hat: a flat brim, with a tall block on top.
  const hatColour = config.snowman.hatColour
  const brim = makeBox({ width: 1.2, height: 0.08, depth: 1.2, colour: hatColour })
  brim.position.y = 3.04
  snowman.add(brim)
  const topOfHat = makeBox({ width: 0.75, height: 0.7, depth: 0.75, colour: hatColour })
  topOfHat.position.y = 3.43
  snowman.add(topOfHat)

  screen.add(snowman)

  return {
    snowman,
  }
}
