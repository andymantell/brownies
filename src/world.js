import { config } from './config.js'
import {
  makeBox,
  makeFlatGround,
  makeSquaresPicture,
  keepInsideSquare,
  loadModel,
} from './engine/index.js'

// The world: for now just a big field of grass, floating in the sky.
// This is a good place to add trees, houses, ponds...

export function createWorld(screen) {
  const size = config.world.size

  // The grass on top.
  const grassPicture = makeSquaresPicture({ squaresAcross: size, colour: config.world.grassColour })
  const grass = makeFlatGround({ size, picture: grassPicture })
  screen.add(grass)

  // A chunky block of soil underneath, so the field looks like a floating island.
  const soil = makeBox({ width: size, height: 2, depth: size, colour: '#8b5e3c' })
  soil.position.y = -1.01 // just below the grass
  screen.add(soil)

  addToadstool(screen)

  return {
    // Stop someone walking off the edge of the field.
    keepOnField(position) {
      keepInsideSquare(position, size / 2 - 0.5)
    },
  }
}

// A toadstool, made in Blender (see tools/blender/make-toadstool.py).
// It pops up a few steps away from where the character starts.
async function addToadstool(screen) {
  const toadstool = await loadModel('models/toadstool.glb')
  toadstool.position.set(3, 0, -3)
  screen.add(toadstool)
}
