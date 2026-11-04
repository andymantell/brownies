import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A blocky yacht, tied up at the end of the jetty.
// It has a hull (the boat part that floats), a wooden deck, a little cabin,
// and a tall mast with a sail.

const LENGTH = 10 // from front to back
const WIDTH = 4 // from side to side
const HULL_HEIGHT = 1.8
const DECK_HEIGHT = 1 // how high the deck is above the jetty: jump to get on!
const MAST_HEIGHT = 7

export function createYacht(screen) {
  const colours = config.yacht

  // A group holds all the parts, so we can move the whole yacht as one.
  const yacht = makeGroup()
  yacht.position.set(colours.x, 0, colours.z)

  // The hull: a big white box, sitting low in the water.
  const hull = makeBox({ width: LENGTH, height: HULL_HEIGHT, depth: WIDTH, colour: colours.hullColour })
  hull.position.y = DECK_HEIGHT - HULL_HEIGHT / 2
  yacht.add(hull)

  // A pointy front, made of two smaller boxes that get narrower.
  addBowPart(yacht, LENGTH / 2 + 0.5, WIDTH * 0.7, colours.hullColour)
  addBowPart(yacht, LENGTH / 2 + 1.3, WIDTH * 0.35, colours.hullColour)

  // A blue stripe along each side.
  addStripe(yacht, -WIDTH / 2 - 0.03, colours.stripeColour)
  addStripe(yacht, WIDTH / 2 + 0.03, colours.stripeColour)

  // The wooden deck on top.
  const deck = makeBox({ width: LENGTH - 0.3, height: 0.05, depth: WIDTH - 0.3, colour: colours.deckColour })
  deck.position.y = DECK_HEIGHT
  yacht.add(deck)

  // A little cabin at the back.
  const cabin = makeBox({ width: 2.5, height: 1.2, depth: WIDTH - 1, colour: colours.cabinColour })
  cabin.position.set(-LENGTH / 2 + 1.6, DECK_HEIGHT + 0.6, 0)
  yacht.add(cabin)

  // The mast, standing up in the middle.
  const mast = makeBox({ width: 0.25, height: MAST_HEIGHT, depth: 0.25, colour: colours.mastColour })
  mast.position.set(0.5, DECK_HEIGHT + MAST_HEIGHT / 2, 0)
  yacht.add(mast)

  // The sail: blocks that get narrower towards the top, like a triangle.
  for (let step = 0; step < 6; step++) {
    const sailWidth = 4 - step * 0.6
    const sailPart = makeBox({ width: sailWidth, height: 1, depth: 0.1, colour: colours.sailColour })
    sailPart.position.set(0.5 - sailWidth / 2 - 0.15, DECK_HEIGHT + 1.5 + step, 0)
    yacht.add(sailPart)
  }

  screen.add(yacht)

  return { yacht, hull, cabin, mast }
}

// Part of the pointy front of the boat.
function addBowPart(yacht, x, width, colour) {
  const part = makeBox({ width: 0.8, height: HULL_HEIGHT, depth: width, colour })
  part.position.set(x, DECK_HEIGHT - HULL_HEIGHT / 2, 0)
  yacht.add(part)
}

// A stripe painted along one side of the boat.
function addStripe(yacht, z, colour) {
  const stripe = makeBox({ width: LENGTH, height: 0.25, depth: 0.05, colour })
  stripe.position.set(0, DECK_HEIGHT - 0.35, z)
  yacht.add(stripe)
}
