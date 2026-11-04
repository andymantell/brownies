import { config } from './config.js'
import {
  makeParticles,
  makeLotsOfBoxes,
  areaUnder,
  isInsideRectangle,
  PARTICLE_STYLES,
  randomNumberBetween,
} from './engine/index.js'

// ❄️ Snow: little white blocks that fall gently from the sky.

// How snowflakes look and move. It works just like the other particle styles.
PARTICLE_STYLES.snow = {
  howMany: 1,
  size: 0.12,
  colours: ['#ffffff', '#f2f8ff'],
  lastsFor: 7,
  upwardsSpeed: [-1.5, -1.5],
  sidewaysSpeed: 0, // straight down, so snow can't drift in under a roof
  gravity: 0,
  endSize: 1,
  fades: false,
  glows: false,
  spins: true,
  flat: false,
}

// How high up the snowflakes start.
const cloudHeight = 10

// Snow falls all over the field, right up to the edges.
const halfTheField = config.world.size / 2

// How many snowflakes start falling every second.
const flakesPerSecond = 250

// How many seconds a snowflake takes to reach the ground.
const secondsToFall = 7

// The most bits of snow that can lie on the ground at once.
const mostSnowOnTheGround = 20000

export function createSnow(screen) {
  const particles = makeParticles(screen)
  let flakesToMake = 0

  // Snow that has landed stays on the ground, so it slowly turns white.
  const snowOnTheGround = makeLotsOfBoxes(screen, {
    howMany: mostSnowOnTheGround,
    width: 0.3,
    height: 0.04,
    depth: 0.3,
    colour: '#ffffff',
  })

  // Snowflakes that are still falling, and how long until each one lands.
  let fallingFlakes = []

  // The ground under roofs, where snow can't fall.
  const roofs = []

  function isUnderARoof(spot) {
    for (const roof of roofs) {
      if (isInsideRectangle(spot, roof, 0.2)) {
        return true
      }
    }
    return false
  }

  // Call this every frame. It drops new snowflakes all over the field,
  // and moves the ones that are already falling.
  function update(secondsPassed) {
    flakesToMake += flakesPerSecond * secondsPassed

    while (flakesToMake >= 1) {
      const spot = {
        x: randomNumberBetween(-halfTheField, halfTheField),
        y: cloudHeight,
        z: randomNumberBetween(-halfTheField, halfTheField),
      }
      if (!isUnderARoof(spot)) {
        particles.burst('snow', spot)
        fallingFlakes.push({ spot, secondsUntilItLands: secondsToFall })
      }
      flakesToMake -= 1
    }

    for (const flake of fallingFlakes) {
      flake.secondsUntilItLands -= secondsPassed
      if (flake.secondsUntilItLands <= 0) {
        snowOnTheGround.addOne({ x: flake.spot.x, y: 0.02, z: flake.spot.z })
      }
    }

    fallingFlakes = fallingFlakes.filter((flake) => {
      return flake.secondsUntilItLands > 0
    })

    particles.update(secondsPassed)
  }

  // Keep the snow off the ground under this thing, like a roof:
  //   snow.keepOffUnder(house.roof)
  function keepOffUnder(thing) {
    roofs.push(areaUnder(thing))
  }

  return { update, keepOffUnder }
}
