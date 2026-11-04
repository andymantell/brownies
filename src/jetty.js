import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A wooden jetty, sticking out from the grass over the sea.
// It's made of planks laid side by side, held up by posts in the water.

const PLANK_WIDTH = 0.5
const GAP = 0.08 // a little gap between the planks
const PLANK_THICKNESS = 0.2
const POST_SIZE = 0.3

export function createJetty(screen) {
  const { startX, z, length, width } = config.jetty

  // A group holds all the parts, so we can move the whole jetty as one.
  const jetty = makeGroup()
  jetty.position.set(startX, 0, z)

  // The planks, one after another, going out to sea.
  const planks = makeGroup()
  for (let x = PLANK_WIDTH / 2; x < length; x += PLANK_WIDTH + GAP) {
    addPlank(planks, x, width)
  }
  jetty.add(planks)

  // Posts holding it up, along both sides.
  for (let x = 1; x < length; x += 3) {
    addPost(jetty, x, -width / 2)
    addPost(jetty, x, width / 2)
  }

  screen.add(jetty)

  return { jetty, planks }
}

// One plank, going across the jetty. The top of it is level with the grass.
function addPlank(planks, x, width) {
  const plank = makeBox({ width: PLANK_WIDTH, height: PLANK_THICKNESS, depth: width, colour: config.jetty.woodColour })
  plank.position.set(x, -PLANK_THICKNESS / 2, 0)
  planks.add(plank)
}

// One post, standing in the sea and poking up a little above the planks.
function addPost(jetty, x, z) {
  const post = makeBox({ width: POST_SIZE, height: 2.5, depth: POST_SIZE, colour: config.jetty.postColour })
  post.position.set(x, -1, z)
  jetty.add(post)
}
