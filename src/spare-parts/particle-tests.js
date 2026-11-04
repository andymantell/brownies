import { PARTICLE_STYLES } from '../engine/particles.js'
import {
  test,
  check,
  wait,
  makeEffect,
  keepEffectGoing,
  howManyParticles,
  whereAreTheParticles,
} from '../engine/testing.js'

// 🧪 Tests for particles (sparkles, smoke, splashes, confetti, fire and crumbs).
// This is a spare part: it isn't plugged into the game yet. See README.md in this folder.

test(
  'Sparkles appear, then disappear',
  'A burst of sparkles should show up straight away, and be all gone a little later.',
  async () => {
    const before = howManyParticles()

    makeEffect('sparkles', 2, 2)
    check('Some sparkles appeared', howManyParticles() > before)

    await wait(3)
    check('The sparkles have all gone', howManyParticles() === 0)
  },
)

test(
  'Smoke floats up',
  'Smoke should drift upwards into the sky, not fall down.',
  async () => {
    makeEffect('smoke', 0, 0)
    await wait(1)

    const pieces = whereAreTheParticles()
    let totalHeight = 0
    for (const piece of pieces) {
      totalHeight += piece.y
    }
    const averageHeight = totalHeight / pieces.length

    check('The smoke is still there', pieces.length > 0)
    check('The smoke has floated up', averageHeight > 1)
  },
)

test(
  'Every particle style works',
  'Each style in the list should make the right number of pieces.',
  async () => {
    for (const styleName of Object.keys(PARTICLE_STYLES)) {
      const before = howManyParticles()

      makeEffect(styleName, -2, 2)

      const madeThisTime = howManyParticles() - before
      const shouldMake = PARTICLE_STYLES[styleName].howMany
      check(`"${styleName}" made ${shouldMake} pieces`, madeThisTime === shouldMake)
    }
  },
)

test(
  'A campfire keeps burning, then goes out',
  'A fire that keeps going should still have flames after a while, and none once we stop it.',
  async () => {
    const campfire = keepEffectGoing('fire', 2, -2)
    await wait(2)
    check('The fire is still burning after 2 seconds', howManyParticles() > 0)

    campfire.stop()
    await wait(3)
    check('The fire has gone out', howManyParticles() === 0)
  },
)
