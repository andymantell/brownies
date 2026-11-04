import { test, check } from '../engine/testing.js'
import { makeGroup } from '../engine/index.js'
import { createRealisticPhysics } from '../engine/realistic-physics.js'

// 🧪 Tests for realistic physics (Rapier): landing, stacking, toppling and rolling.
// This is a spare part: it isn't plugged into the game yet. See README.md in this folder.
//
// Like the simple physics tests, these make their own little world and run it on its own,
// so the answer is the same every time.

// Run physics for a number of seconds, in small steps like the game loop does.
function runPhysicsFor(physics, seconds) {
  const stepSize = 1 / 60
  for (let time = 0; time < seconds; time += stepSize) {
    physics.update(stepSize)
  }
}

// Something to put physics on. It's never drawn.
function makeThing(x, y, z) {
  const thing = makeGroup()
  thing.position.set(x, y, z)
  return thing
}

// A stack of boxes, one on top of another.
function makeStack(physics, howHigh) {
  const boxes = []
  for (let level = 0; level < howHigh; level++) {
    const box = makeThing(0, 0.5 + level * 1.01, 0)
    physics.addBox(box)
    boxes.push(box)
  }
  return boxes
}

test(
  'Realistic: a box lands on the floor',
  'A box dropped from the sky should land on the floor and stay there.',
  async () => {
    const physics = await createRealisticPhysics()
    physics.addFloor(20)
    const box = makeThing(0, 5, 0)
    physics.addBox(box)

    runPhysicsFor(physics, 2)

    // The box is 1 tall, so its middle is half a block above the floor.
    check('The box is resting on the floor', Math.abs(box.position.y - 0.5) < 0.05)
  },
)

test(
  'Realistic: a stack of boxes stays up',
  'A neat tower of boxes should stay standing if nobody touches it.',
  async () => {
    const physics = await createRealisticPhysics()
    physics.addFloor(20)
    const boxes = makeStack(physics, 5)

    runPhysicsFor(physics, 3)

    const topBox = boxes[boxes.length - 1]
    check('The top box is still at the top', topBox.position.y > 4.4)
  },
)

test(
  'Realistic: a ball knocks the tower over',
  'Throwing a heavy ball at a tower of boxes should make it fall down.',
  async () => {
    const physics = await createRealisticPhysics()
    physics.addFloor(20)
    const boxes = makeStack(physics, 5)

    const ball = makeThing(-4, 3, 0)
    physics.addBall(ball, { radius: 0.5, heaviness: 8 }).throw(15, 2, 0)

    runPhysicsFor(physics, 3)

    const topBox = boxes[boxes.length - 1]
    check('The top box has fallen down', topBox.position.y < 2)
  },
)

test(
  'Realistic: the character can push things over',
  'Walking into a tower of boxes should knock it over.',
  async () => {
    const physics = await createRealisticPhysics()
    physics.addFloor(20)
    const boxes = makeStack(physics, 5)

    const walker = makeThing(-3, 0, 0)
    physics.addPusher(walker)

    // Walk through where the tower is, a little bit each frame.
    for (let step = 0; step < 120; step++) {
      walker.position.x += 5 / 60
      runPhysicsFor(physics, 1 / 60)
    }
    runPhysicsFor(physics, 2)

    const topBox = boxes[boxes.length - 1]
    check('The top box has fallen down', topBox.position.y < 2)
  },
)

test(
  'Realistic: things fall off the edge',
  'A ball rolling off the edge of the floor should fall away.',
  async () => {
    const physics = await createRealisticPhysics()
    physics.addFloor(10) // from -5 to 5
    const ball = makeThing(3, 0.5, 0)
    physics.addBall(ball, { radius: 0.5 }).throw(8, 0, 0)

    runPhysicsFor(physics, 3)

    check('The ball has fallen below the floor', ball.position.y < -2)
  },
)
