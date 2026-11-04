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

  // The places people can swim, like the sea.
  const placesToSwim = []

  return {
    // Let people walk on this too, even though it's past the edge of the field.
    //   world.letPeopleWalkOn(jetty.planks)
    letPeopleWalkOn(thing) {
      placesToWalk.push(areaUnder(thing))
    },

    // Let people swim in this, like the sea.
    //   world.letPeopleSwimIn(sea.water)
    letPeopleSwimIn(thing) {
      const water = areaUnder(thing)
      // Make it a tiny bit bigger, so it reaches right up to the edge of the grass.
      water.width += 1
      water.depth += 1
      placesToSwim.push(water)
    },

    // Stop someone walking off the edge of the field (or off the jetty, into the sea).
    // If they step off, put them back on the nearest bit of ground.
    // Players can swim, so the sea counts too: { canSwim: true }
    keepOnField(position, { canSwim = false } = {}) {
      let places = placesToWalk
      if (canSwim) {
        places = [...placesToWalk, ...placesToSwim]
      }

      let nearest = null
      let nearestDistance = Infinity
      for (const place of places) {
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
    // In the sea, you sink down until your head is just poking out of the water.
    // (Physics uses this, so things land on the grass and can fall off the edge.)
    groundHeightAt(x, z) {
      for (const place of placesToWalk) {
        if (isInsideRectangle({ x, z }, place, 0.5)) {
          return 0
        }
      }
      for (const place of placesToSwim) {
        if (isInsideRectangle({ x, z }, place, 0)) {
          return config.sea.level - config.swimming.depth + bobbing()
        }
      }
      return -Infinity
    },

    // Is this person swimming? They are if their feet are under the water.
    isSwimming(position) {
      return position.y < config.sea.level
    },
  }
}

// Swimmers bob gently up and down in the water.
function bobbing() {
  const seconds = Date.now() / 1000
  return Math.sin(seconds * 3) * config.swimming.bobHeight
}
