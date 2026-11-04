import { makeParticles, PARTICLE_STYLES, randomNumberBetween } from './engine/index.js'

// ❄️ Snow: little white blocks that fall gently from the sky.

// How snowflakes look and move. It works just like the other particle styles.
PARTICLE_STYLES.snow = {
  howMany: 1,
  size: 0.12,
  colours: ['#ffffff', '#f2f8ff'],
  lastsFor: 7,
  upwardsSpeed: [-1.6, -1.2],
  sidewaysSpeed: 0.3,
  gravity: 0,
  endSize: 1,
  fades: false,
  glows: false,
  spins: true,
  flat: false,
}

// How high up the snowflakes start.
const cloudHeight = 10

// How far away from the character snow can fall.
const snowyArea = 14

// How many snowflakes start falling every second.
const flakesPerSecond = 60

export function createSnow(screen) {
  const particles = makeParticles(screen)
  let flakesToMake = 0

  // Call this every frame. It drops new snowflakes near the character,
  // and moves the ones that are already falling.
  function update(secondsPassed, characterPosition) {
    flakesToMake += flakesPerSecond * secondsPassed

    while (flakesToMake >= 1) {
      const spot = {
        x: characterPosition.x + randomNumberBetween(-snowyArea, snowyArea),
        y: cloudHeight,
        z: characterPosition.z + randomNumberBetween(-snowyArea, snowyArea),
      }
      particles.burst('snow', spot)
      flakesToMake -= 1
    }

    particles.update(secondsPassed)
  }

  return { update }
}
