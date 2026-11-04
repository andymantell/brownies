import { test, check } from '../engine/testing.js'
import { createPhysics, makeGroup } from '../engine/index.js'

// 🧪 Tests for physics: falling, bouncing, jumping and bumping into walls.
// This is a spare part: it isn't plugged into the game yet. See README.md in this folder.
//
// These tests don't use the real game world. Each one makes a pretend world
// and runs physics on its own, so the answer is the same every time.

// A pretend world: flat ground at height 0, as far as you can see.
const flatWorld = {
  groundHeightAt() {
    return 0
  },
}

// A pretend world with flat ground and a tall wall along x = 3.
const worldWithAWall = {
  groundHeightAt() {
    return 0
  },
  isSolid(x, y, z) {
    return Math.round(x) === 3
  },
}

// A pretend world with a block-high step: x of 2 and more is 1 block higher.
const worldWithAStep = {
  groundHeightAt(x) {
    if (x >= 1.5) {
      return 1
    }
    return 0
  },
}

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

test(
  'Things fall and land on the ground',
  'Something let go of in the air should fall and stop on the ground.',
  async () => {
    const physics = createPhysics(flatWorld)
    const box = makeThing(0, 5, 0)
    const boxPhysics = physics.add(box)

    runPhysicsFor(physics, 0.2)
    check('The box is falling', box.position.y < 5)

    runPhysicsFor(physics, 2)
    check('The box is on the ground', Math.abs(box.position.y) < 0.01)
    check('The box knows it is on the ground', boxPhysics.isOnTheGround())
  },
)

test(
  'Bouncy things bounce',
  'A bouncy ball dropped on the ground should bounce back up, but not as high.',
  async () => {
    const physics = createPhysics(flatWorld)
    const ball = makeThing(0, 4, 0)
    physics.add(ball, { bounciness: 0.7 })

    // Wait until it's hit the ground, then see how high it gets after that.
    let hasHitTheGround = false
    let highestBounce = 0
    for (let step = 0; step < 120; step++) {
      runPhysicsFor(physics, 1 / 60)
      if (ball.position.y === 0) {
        hasHitTheGround = true
      }
      if (hasHitTheGround) {
        highestBounce = Math.max(highestBounce, ball.position.y)
      }
    }

    check('The ball bounced up off the ground', highestBounce > 1)
    check('The bounce was lower than where we dropped it', highestBounce < 4)
  },
)

test(
  'Jumps the right height',
  'A jump 2 blocks high should go up about 2 blocks, then come back down.',
  async () => {
    const physics = createPhysics(flatWorld)
    const jumper = makeThing(0, 0, 0)
    const jumperPhysics = physics.add(jumper)

    runPhysicsFor(physics, 0.1) // settle onto the ground first
    const jumped = jumperPhysics.jump(2)

    let highest = 0
    for (let step = 0; step < 90; step++) {
      runPhysicsFor(physics, 1 / 60)
      highest = Math.max(highest, jumper.position.y)
    }

    check('It jumped', jumped)
    check('It went up about 2 blocks', Math.abs(highest - 2) < 0.2)
    check('It came back down', Math.abs(jumper.position.y) < 0.01)
  },
)

test(
  "Can't jump in mid-air",
  'Jumping again while already in the air should not work.',
  async () => {
    const physics = createPhysics(flatWorld)
    const jumper = makeThing(0, 3, 0)
    const jumperPhysics = physics.add(jumper)

    const jumped = jumperPhysics.jump(2)

    check("It didn't jump", !jumped)
  },
)

test(
  'Bounces off a wall',
  'Something thrown at a wall should stop at the wall and not go through it.',
  async () => {
    const physics = createPhysics(worldWithAWall)
    const ball = makeThing(0, 0, 0)
    const ballPhysics = physics.add(ball, { bounciness: 0.5, grip: 0 })

    ballPhysics.throw(10, 0, 0) // throw it hard towards the wall
    runPhysicsFor(physics, 2)

    check("The ball didn't go through the wall", ball.position.x < 2.5)
  },
)

test(
  'Lands on top of a step',
  'Something thrown up onto a step should land on top of it.',
  async () => {
    const physics = createPhysics(worldWithAStep)
    const box = makeThing(0, 0, 0)
    const boxPhysics = physics.add(box)

    boxPhysics.throw(3, 8, 0) // up and over the edge of the step
    runPhysicsFor(physics, 2)

    check('The box is past the edge of the step', box.position.x > 1.5)
    check('The box is standing on top of the step', Math.abs(box.position.y - 1) < 0.01)
  },
)

test(
  'Things fall off the edge of the world',
  'Something with no ground under it should fall away and be tidied up.',
  async () => {
    const noGround = {
      groundHeightAt() {
        return -Infinity
      },
    }
    const physics = createPhysics(noGround)
    const box = makeThing(0, 0, 0)
    const boxPhysics = physics.add(box)

    runPhysicsFor(physics, 5)

    check('The box has fallen off the world', boxPhysics.hasFallenOffTheWorld())
  },
)
