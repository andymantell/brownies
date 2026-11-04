import { config } from './config.js'
import { makeBox, makeGroup, makeParticles, PARTICLE_STYLES } from './engine/index.js'

// 🌋 A big blocky volcano, made of layers of rock that get smaller as they go up.
// There's a pool of hot lava in the top, and every so often it erupts!

const HOW_MANY_LAYERS = 6
const LAYER_HEIGHT = 1
const BOTTOM_WIDTH = 9 // how wide the bottom layer is
const TOP_WIDTH = 3 // how wide the top layer is

// How the lava looks when it shoots out of the top. It works just like the other particle styles.
PARTICLE_STYLES.eruption = {
  howMany: 12,
  size: 0.35,
  colours: ['#ff3d00', '#ff8a00', '#ffd000'],
  lastsFor: 2.5,
  upwardsSpeed: [8, 14],
  sidewaysSpeed: 3,
  gravity: 9,
  endSize: 0.5,
  fades: false,
  glows: true,
  spins: true,
  flat: false,
}

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

  // The very top of the volcano, where lava shoots out.
  const top = { x: config.volcano.x, y: HOW_MANY_LAYERS * LAYER_HEIGHT, z: config.volcano.z }

  const particles = makeParticles(screen)

  // How long until the next eruption, and how long the current one has left.
  let secondsUntilEruption = config.volcano.secondsBeforeFirstEruption
  let secondsOfEruptionLeft = 0
  let fountain = null

  // Start an eruption: lava keeps shooting out of the top for a few seconds.
  function erupt() {
    fountain = particles.keepGoing('eruption', top, 0.05)
    secondsOfEruptionLeft = config.volcano.eruptionLasts
  }

  // Stop the lava shooting out.
  function stopErupting() {
    fountain.stop()
    fountain = null
  }

  // Call this every frame. It counts down to the next eruption.
  function update(secondsPassed) {
    secondsUntilEruption -= secondsPassed
    if (secondsUntilEruption <= 0) {
      erupt()
      secondsUntilEruption = config.volcano.secondsBetweenEruptions
    }

    if (fountain) {
      secondsOfEruptionLeft -= secondsPassed
      if (secondsOfEruptionLeft <= 0) {
        stopErupting()
      }
    }

    particles.update(secondsPassed)
  }

  // Is the volcano erupting right now?
  function isErupting() {
    return fountain !== null
  }

  return { volcano, top, update, erupt, isErupting }
}
