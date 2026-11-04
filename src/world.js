import { config } from './config.js'
import {
  makeBox,
  makeFlatGround,
  makeSquaresPicture,
  areaUnder,
  isInsideRectangle,
  nearestSpotInRectangle,
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

  // The places people can walk: the field, plus extra bits like the jetty.
  const field = { x: 0, z: 0, width: size - 1, depth: size - 1 }
  const placesToWalk = [field]

  return {
    // Let people walk on this too, even though it's past the edge of the field.
    //   world.letPeopleWalkOn(jetty.planks)
    letPeopleWalkOn(thing) {
      const area = areaUnder(thing)
      area.width -= 0.6 // stay a little way in from the edges, so you don't hang over the water
      area.depth -= 0.6
      placesToWalk.push(area)
    },

    // Stop someone walking off the edge of the field (or off the jetty, into the sea).
    // If they step off, put them back on the nearest bit of ground.
    keepOnField(position) {
      let nearest = null
      let nearestDistance = Infinity
      for (const place of placesToWalk) {
        const spot = nearestSpotInRectangle(position, place)
        const distance = Math.hypot(spot.x - position.x, spot.z - position.z)
        if (distance < nearestDistance) {
          nearest = spot
          nearestDistance = distance
        }
      }
      position.x = nearest.x
      position.z = nearest.z
    },

    // How high is the ground here? It's 0 on the field and the jetty, and there's none anywhere else.
    // (Physics uses this, so things land on the grass and can fall off the edge.)
    groundHeightAt(x, z) {
      for (const place of placesToWalk) {
        if (isInsideRectangle({ x, z }, place, 0.5)) {
          return 0
        }
      }
      return -Infinity
    },
  }
}
