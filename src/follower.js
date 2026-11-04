import { directionFromTo, angleOf, turnTowards } from './engine/index.js'

// Makes a pet follow someone around, like a loyal friend.
// It walks towards them, and stops when it's close enough.
//
//   const catFollower = makeFollower(cat.cat, { speed: 3, staysThisClose: 1.5 })
//   ...then every frame:
//   catFollower.follow(character.position, secondsPassed)

// How close you can get to a pet before you bump into it.
const BUMPING_DISTANCE = 0.8

// How close someone has to be before the pet shuffles out of their way.
const TOO_CLOSE = 1.2

export function makeFollower(pet, { speed, staysThisClose }) {
  return {
    follow(friend, secondsPassed) {
      const towards = directionFromTo(pet.position, friend)

      // Close enough? Then sit still and wait.
      if (towards.distance < staysThisClose) {
        return
      }

      // Take a little step towards our friend.
      const stepLength = speed * secondsPassed
      pet.position.x += towards.direction.x * stepLength
      pet.position.z += towards.direction.z * stepLength

      // Turn to face the way we're walking.
      const howFastToTurn = 8 * secondsPassed
      pet.rotation.y = turnTowards(pet.rotation.y, angleOf(towards.direction), howFastToTurn)
    },

    // Stop someone walking through the pet.
    // If they've walked too close, put them back where they were.
    // (Walking away from the pet is always allowed, so you can never get stuck.)
    stopWalkingThrough(someone, whereTheyWere) {
      const distanceNow = directionFromTo(pet.position, someone).distance
      const distanceBefore = directionFromTo(pet.position, whereTheyWere).distance
      const isTooClose = distanceNow < BUMPING_DISTANCE
      const isGettingCloser = distanceNow < distanceBefore

      if (isTooClose && isGettingCloser) {
        someone.x = whereTheyWere.x
        someone.z = whereTheyWere.z
      }
    },

    // If someone pushes right up against the pet, it shuffles out of their way.
    // That way a pet can never trap you in a corner.
    moveOutOfTheWayOf(someone, secondsPassed) {
      const awayFrom = directionFromTo(someone, pet.position)

      // Not too close? Then there's no need to move.
      if (awayFrom.distance > TOO_CLOSE) {
        return
      }

      const stepLength = speed * secondsPassed
      pet.position.x += awayFrom.direction.x * stepLength
      pet.position.z += awayFrom.direction.z * stepLength
    },
  }
}
