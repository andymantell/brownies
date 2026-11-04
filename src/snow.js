import { config } from './config.js'
import {
  makeParticles,
  makeGridOfBlocks,
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

// How much deeper the snow gets each time a snowflake lands.
const deeperEachFlake = 0.03

// The deepest the snow can get.
const deepestSnow = 0.5

// How deep the snow is in a footprint. 0 squashes it right down to the grass.
const footprintDepth = 0

// How many seconds before falling snow starts to fill a footprint back in.
const footprintsLastFor = 20

export function createSnow(screen) {
  const particles = makeParticles(screen)
  let flakesToMake = 0

  // A blanket of snow on the ground, made of little blocks that get deeper.
  const blanket = makeGridOfBlocks(screen, {
    size: config.world.size,
    blockSize: 0.5,
    colour: '#ffffff',
  })

  // Snowflakes that are still falling, and how long until each one lands.
  let fallingFlakes = []

  // Fresh footprints, and how many seconds until snow can fill each one in.
  const footprints = new Map()

  // Which square of snow is this spot in? Gives back a name like "4,7".
  function squareName(x, z) {
    const step = blanket.blockSize
    return Math.floor(x / step) + ',' + Math.floor(z / step)
  }

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
        settle(flake.spot)
      }
    }

    fallingFlakes = fallingFlakes.filter((flake) => {
      return flake.secondsUntilItLands > 0
    })

    for (const [name, secondsLeft] of footprints) {
      if (secondsLeft <= secondsPassed) {
        footprints.delete(name)
      } else {
        footprints.set(name, secondsLeft - secondsPassed)
      }
    }

    particles.update(secondsPassed)
  }

  // A snowflake has landed! Make the snow a little deeper where it fell,
  // and on the squares all around it, so it piles up quickly.
  function settle(spot) {
    const step = blanket.blockSize
    for (let across = -1; across <= 1; across++) {
      for (let back = -1; back <= 1; back++) {
        const x = spot.x + across * step
        const z = spot.z + back * step
        const isInAFootprint = footprints.has(squareName(x, z))
        if (!isUnderARoof({ x, z }) && !isInAFootprint) {
          const deeper = blanket.heightAt(x, z) + deeperEachFlake
          blanket.setHeightAt(x, z, Math.min(deeper, deepestSnow))
        }
      }
    }
  }

  // Keep the snow off the ground under this thing, like a roof:
  //   snow.keepOffUnder(house.roof)
  function keepOffUnder(thing) {
    roofs.push(areaUnder(thing))
  }

  // Someone is walking through the snow, so squash it down where their feet are.
  // Call this every frame for each player:
  //   snow.trudgeThrough(character.position)
  function trudgeThrough(position) {
    if (blanket.heightAt(position.x, position.z) > footprintDepth) {
      blanket.setHeightAt(position.x, position.z, footprintDepth)
    }
    footprints.set(squareName(position.x, position.z), footprintsLastFor)
  }

  return { update, keepOffUnder, trudgeThrough }
}
