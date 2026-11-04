import {
  makeBox,
  makeGroup,
  makeSwingingBox,
  createPathWalker,
  angleOf,
  turnTowards,
  directionFromTo,
  randomNumberBetween,
} from './engine/index.js'

// 🦆 A little blocky duck that follows you around.
// It uses pathfinding to waddle around trees and hills to get to you.
// When you're far away, it wanders about on its own.

const DUCK_SPEED = 3
const FOLLOWS_YOU_FROM = 12 // how close you need to be before it follows you
const STOPS_NEXT_TO_YOU = 2 // how close it gets before it stops
const THINKS_EVERY = 0.5 // seconds between working out where to go next

export function createDuck(screen, world, character) {
  const duck = makeGroup()

  const body = makeBox({ width: 0.6, height: 0.45, depth: 0.8, colour: '#f4f1e8' })
  body.position.y = 0.5
  duck.add(body)

  const tail = makeBox({ width: 0.3, height: 0.2, depth: 0.2, colour: '#f4f1e8' })
  tail.position.set(0, 0.7, -0.45)
  duck.add(tail)

  const head = makeBox({ width: 0.4, height: 0.4, depth: 0.4, colour: '#2f8f5b' })
  head.position.set(0, 0.95, 0.35)
  duck.add(head)

  const beak = makeBox({ width: 0.25, height: 0.1, depth: 0.25, colour: '#ffa62b' })
  beak.position.set(0, -0.05, 0.3)
  head.add(beak)

  const leftEye = makeBox({ width: 0.05, height: 0.08, depth: 0.08, colour: '#222222' })
  leftEye.position.set(-0.21, 0.05, 0.08)
  head.add(leftEye)

  const rightEye = makeBox({ width: 0.05, height: 0.08, depth: 0.08, colour: '#222222' })
  rightEye.position.set(0.21, 0.05, 0.08)
  head.add(rightEye)

  const leftLeg = makeSwingingBox({ width: 0.1, height: 0.3, depth: 0.1, colour: '#ffa62b' })
  leftLeg.position.set(-0.15, 0.3, 0)
  duck.add(leftLeg)

  const rightLeg = makeSwingingBox({ width: 0.1, height: 0.3, depth: 0.1, colour: '#ffa62b' })
  rightLeg.position.set(0.15, 0.3, 0)
  duck.add(rightLeg)

  // Start a little way away from the middle.
  duck.position.set(6, world.blocks.topOfColumn(6, 6), 6)
  screen.add(duck)

  const walker = createPathWalker(screen, world.blocks, duck.position, {
    speed: DUCK_SPEED,
    showRoute: true, // little white dots show the way it's going
  })

  let secondsUntilThinking = 0
  let waddleTimer = 0

  // Decide where to go: follow the character if they're near, otherwise wander.
  function thinkAboutWhereToGo() {
    const howFar = directionFromTo(duck.position, character.position).distance

    if (howFar < STOPS_NEXT_TO_YOU) {
      walker.stop()
    } else if (howFar < FOLLOWS_YOU_FROM) {
      walker.walkTo(character.position)
    } else if (!walker.isWalking()) {
      wanderSomewhereNearby()
    }
  }

  function wanderSomewhereNearby() {
    const spot = {
      x: duck.position.x + randomNumberBetween(-8, 8),
      z: duck.position.z + randomNumberBetween(-8, 8),
    }
    walker.walkTo(spot)
  }

  return {
    position: duck.position,

    update(secondsPassed) {
      secondsUntilThinking -= secondsPassed
      if (secondsUntilThinking <= 0) {
        thinkAboutWhereToGo()
        secondsUntilThinking = THINKS_EVERY
      }

      const direction = walker.update(secondsPassed)
      const isWalking = direction.length() > 0

      if (isWalking) {
        duck.rotation.y = turnTowards(duck.rotation.y, angleOf(direction), secondsPassed * 10)
        waddleTimer += secondsPassed * 14
      } else {
        waddleTimer = 0
      }

      // Waddle: legs swing and the body rocks side to side.
      const swing = Math.sin(waddleTimer) * 0.6
      leftLeg.rotation.x = swing
      rightLeg.rotation.x = -swing
      duck.rotation.z = Math.sin(waddleTimer) * 0.12
    },
  }
}
