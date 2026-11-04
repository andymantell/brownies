import { config } from './config.js'
import {
  makeParticles,
  areaUnder,
  isInsideRectangle,
  PARTICLE_STYLES,
  randomNumberBetween,
} from './engine/index.js'

// 🍗 Chicken nuggets: golden-brown blocky nuggets that fall from the sky!

// How high up the nuggets start.
const cloudHeight = 12

// How fast the nuggets fall.
const fallSpeed = 4

// How many seconds a nugget takes to reach the ground.
const secondsToFall = cloudHeight / fallSpeed

// Nuggets fall all over the field, right up to the edges.
const halfTheField = config.world.size / 2

// How falling nuggets look and move. It works just like the other particle styles.
PARTICLE_STYLES.nugget = {
  howMany: 1,
  size: 0.3,
  colours: ['#d9a441', '#c98b2e', '#e0b25a'],
  lastsFor: secondsToFall, // so it disappears just as it reaches the ground
  upwardsSpeed: [-fallSpeed, -fallSpeed],
  sidewaysSpeed: 0, // straight down, so nuggets can't drift in under a roof
  gravity: 0,
  endSize: 1,
  fades: false,
  glows: false,
  spins: true,
  flat: false,
}

export function createNuggets(screen) {
  const particles = makeParticles(screen)
  let nuggetsToMake = 0

  // The ground under roofs, where nuggets can't fall.
  const roofs = []

  function isUnderARoof(spot) {
    for (const roof of roofs) {
      if (isInsideRectangle(spot, roof, 0.3)) {
        return true
      }
    }
    return false
  }

  // Call this every frame. It drops new nuggets all over the field.
  function update(secondsPassed) {
    if (config.nuggets.isOn) {
      nuggetsToMake += config.nuggets.perSecond * secondsPassed
    }

    while (nuggetsToMake >= 1) {
      const spot = {
        x: randomNumberBetween(-halfTheField, halfTheField),
        y: cloudHeight,
        z: randomNumberBetween(-halfTheField, halfTheField),
      }
      if (!isUnderARoof(spot)) {
        particles.burst('nugget', spot)
      }
      nuggetsToMake -= 1
    }

    particles.update(secondsPassed)
  }

  // Keep the nuggets off the ground under this thing, like a roof:
  //   nuggets.keepOffUnder(house.roof)
  function keepOffUnder(thing) {
    roofs.push(areaUnder(thing))
  }

  return { update, keepOffUnder }
}
