import { directionFromTo, angleOf, turnTowards } from './engine/index.js'

// Makes a pet follow someone around, like a loyal friend.
// It walks towards them, and stops when it's close enough.
//
//   const catFollower = makeFollower(cat.cat, { speed: 3, staysThisClose: 1.5 })
//   ...then every frame:
//   catFollower.follow(character.position, secondsPassed)

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
  }
}
