import { config } from './config.js'
import {
  makeBox,
  makeGroup,
  makeParticles,
  PARTICLE_STYLES,
  randomNumberBetween,
  areaUnder,
  isInsideRectangle,
} from './engine/index.js'

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

// How the lava drops look as they rain down from the sky.
PARTICLE_STYLES.lavaDrop = {
  howMany: 1,
  size: 0.3,
  colours: ['#ff3d00', '#ff8a00'],
  lastsFor: 2,
  upwardsSpeed: [-6, -6], // falling straight down
  sidewaysSpeed: 0,
  gravity: 0,
  endSize: 1,
  fades: false,
  glows: true,
  spins: true,
  flat: false,
}

// How high up the lava drops start, and how fast they fall.
const SKY_HEIGHT = 12
const DROP_SPEED = 6

// How close a lava drop has to get to someone to hit them.
const HIT_DISTANCE = 0.7
const PERSON_HEIGHT = 2.2

// How close a lava drop has to be for a backflip to punch it away.
const PUNCH_DISTANCE = 1.5

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

  // How long the lava keeps raining down, and how many drops start falling every second.
  let secondsOfRainLeft = 0
  let dropsToMake = 0

  // Lava drops that are still falling.
  let fallingDrops = []

  // The ground under roofs, where lava can't fall. You're safe in there!
  const roofs = []

  function isUnderARoof(spot) {
    for (const roof of roofs) {
      if (isInsideRectangle(spot, roof, 0.2)) {
        return true
      }
    }
    return false
  }

  // Start an eruption: lava keeps shooting out of the top for a few seconds.
  function erupt() {
    fountain = particles.keepGoing('eruption', top, 0.05)
    secondsOfEruptionLeft = config.volcano.eruptionLasts
    secondsOfRainLeft = config.volcano.lavaRainLasts
  }

  // Drop a blob of lava from the sky, somewhere on the field.
  function dropSomeLava() {
    const halfTheField = config.world.size / 2
    const spot = {
      x: randomNumberBetween(-halfTheField, halfTheField),
      y: SKY_HEIGHT,
      z: randomNumberBetween(-halfTheField, halfTheField),
    }
    if (isUnderARoof(spot)) {
      return
    }
    const pieces = particles.burst('lavaDrop', spot)
    spot.piece = pieces[0] // remember the piece, so we can move it if it gets punched
    fallingDrops.push(spot)
  }

  // While it's raining lava, keep dropping new blobs. Move the ones already falling.
  function updateLavaRain(secondsPassed) {
    if (secondsOfRainLeft > 0) {
      secondsOfRainLeft -= secondsPassed
      dropsToMake += config.volcano.lavaDropsPerSecond * secondsPassed
    }

    while (dropsToMake >= 1) {
      dropSomeLava()
      dropsToMake -= 1
    }

    for (const drop of fallingDrops) {
      drop.y -= DROP_SPEED * secondsPassed
    }

    fallingDrops = fallingDrops.filter((drop) => {
      return drop.y > 0
    })
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

    updateLavaRain(secondsPassed)

    particles.update(secondsPassed)
  }

  // Has a lava drop just landed on someone standing here? If so, the drop splats.
  function isHitByLava(position) {
    for (const drop of fallingDrops) {
      const howFarAway = Math.hypot(drop.x - position.x, drop.z - position.z)
      const howHighAbove = drop.y - position.y
      if (howFarAway < HIT_DISTANCE && howHighAbove < PERSON_HEIGHT) {
        particles.burst('fire', drop)
        drop.piece.mesh.visible = false
        forgetDrop(drop)
        return true
      }
    }
    return false
  }

  // Punch away any lava drops close to this spot, sending them flying off into the sky.
  // It gives back how many drops got punched.
  function punchAwayLavaNear(position) {
    let howManyPunched = 0
    for (const drop of fallingDrops) {
      const howFarAway = Math.hypot(drop.x - position.x, drop.z - position.z)
      const howHighAbove = drop.y - position.y
      if (howFarAway < PUNCH_DISTANCE && howHighAbove < PERSON_HEIGHT + 1) {
        flingAway(drop, position)
        forgetDrop(drop)
        howManyPunched += 1
      }
    }
    return howManyPunched
  }

  // Send a lava drop flying up and away from a spot.
  function flingAway(drop, from) {
    const awayX = drop.x - from.x
    const awayZ = drop.z - from.z
    drop.piece.speed.set(awayX * 8, 10, awayZ * 8)
    particles.burst('sparkles', drop)
  }

  // Stop keeping track of a lava drop: it can't hit anyone now.
  function forgetDrop(drop) {
    fallingDrops = fallingDrops.filter((other) => {
      return other !== drop
    })
  }

  // Keep the lava off the ground under this thing, like a roof:
  //   volcano.keepLavaOffUnder(house.roof)
  function keepLavaOffUnder(thing) {
    roofs.push(areaUnder(thing))
  }

  // Is the volcano erupting right now?
  function isErupting() {
    return fountain !== null
  }

  return { volcano, top, update, erupt, isErupting, isHitByLava, punchAwayLavaNear, keepLavaOffUnder }
}
