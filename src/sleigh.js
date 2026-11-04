import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// Santa's sleigh, made out of boxes.
// A red box to sit in, with a tall back and two golden runners underneath.

export function createSleigh(screen) {
  const colours = config.sleigh

  // A group holds all the parts of the sleigh together, so they move as one.
  const sleigh = makeGroup()
  // It starts far away, at the edge of the field, and rides in from there.
  sleigh.position.set(colours.x, 0, colours.startZ)

  // The two golden runners it slides along on.
  addRunner(sleigh, -0.7, colours)
  addRunner(sleigh, 0.7, colours)

  // The red bit you sit in.
  const seat = makeBox({ width: 1.8, height: 0.6, depth: 2.4, colour: colours.woodColour })
  seat.position.set(0, 0.6, 0)
  sleigh.add(seat)

  // A tall back to lean against, with a golden stripe along the top.
  const back = makeBox({ width: 1.8, height: 0.9, depth: 0.25, colour: colours.woodColour })
  back.position.set(0, 1.35, -1.1)
  sleigh.add(back)

  const stripe = makeBox({ width: 1.84, height: 0.12, depth: 0.29, colour: colours.trimColour })
  stripe.position.set(0, 0.45, 0)
  back.add(stripe)

  screen.add(sleigh)

  return {
    position: sleigh.position,
    sleigh,

    // Sit someone in the sleigh, so they ride along with it.
    carry(passenger) {
      passenger.position.set(0, 0.2, -0.4)
      sleigh.add(passenger)
    },

    // Tie a dog to the front of the sleigh with a rope, so it pulls the sleigh along.
    hitch(dog, { x, z }) {
      dog.position.set(x, 0, z)
      sleigh.add(dog)

      const ropeLength = z - 1.4
      const rope = makeBox({ width: 0.05, height: 0.05, depth: ropeLength, colour: colours.ropeColour })
      rope.position.set(x, 0.75, 1.4 + ropeLength / 2)
      sleigh.add(rope)
    },

    // Called every frame. Slide forwards until we reach the stopping place.
    update(secondsPassed) {
      const stillComing = sleigh.position.z < colours.z
      if (stillComing) {
        sleigh.position.z += colours.speed * secondsPassed
      }
    },

    // Has the sleigh reached its stopping place yet?
    hasArrived() {
      return sleigh.position.z >= colours.z
    },
  }
}

// One long golden runner, curling up at the front.
function addRunner(sleigh, x, colours) {
  const runner = makeBox({ width: 0.14, height: 0.12, depth: 2.8, colour: colours.trimColour })
  runner.position.set(x, 0.06, 0)
  sleigh.add(runner)

  const curl = makeBox({ width: 0.14, height: 0.5, depth: 0.12, colour: colours.trimColour })
  curl.position.set(0, 0.25, 1.4)
  runner.add(curl)

  // Two little posts holding the seat up off the runner.
  const frontPost = makeBox({ width: 0.12, height: 0.3, depth: 0.12, colour: colours.trimColour })
  frontPost.position.set(0, 0.2, 0.8)
  runner.add(frontPost)

  const backPost = makeBox({ width: 0.12, height: 0.3, depth: 0.12, colour: colours.trimColour })
  backPost.position.set(0, 0.2, -0.8)
  runner.add(backPost)
}
