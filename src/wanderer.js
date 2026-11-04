import { spotInFront, turnTowards, randomNumberBetween } from './engine/index.js'

// Makes an animal wander around on its own, going wherever it likes.
// Every now and then it picks a new way to go. If it bumps into something,
// it turns round and tries a different way.
//
//   const horseWanderer = makeWanderer(horse.horse, { speed: 2 })
//   ...then every frame:
//   horseWanderer.wander(secondsPassed)
//   (keep it out of things here)
//   horseWanderer.turnIfBumped(whereTheHorseWas, secondsPassed)

const FULL_CIRCLE = Math.PI * 2

export function makeWanderer(animal, { speed }) {
  let wayToGo = randomNumberBetween(0, FULL_CIRCLE)
  let secondsUntilNewIdea = randomNumberBetween(2, 5)

  return {
    wander(secondsPassed) {
      // Every few seconds, have a new idea about which way to go.
      secondsUntilNewIdea -= secondsPassed
      if (secondsUntilNewIdea < 0) {
        wayToGo = randomNumberBetween(0, FULL_CIRCLE)
        secondsUntilNewIdea = randomNumberBetween(2, 5)
      }

      // Turn bit by bit to face the way we want to go.
      const howFastToTurn = 3 * secondsPassed
      animal.rotation.y = turnTowards(animal.rotation.y, wayToGo, howFastToTurn)

      // Take a step forwards, the way we're facing.
      const stepLength = speed * secondsPassed
      const nextSpot = spotInFront(animal.position, animal.rotation.y, stepLength)
      animal.position.x = nextSpot.x
      animal.position.z = nextSpot.z
    },

    // If we hardly moved, we must have bumped into something.
    // So pick a new way to go, somewhere behind us.
    turnIfBumped(whereItWas, secondsPassed) {
      const howFarWeWent = Math.hypot(animal.position.x - whereItWas.x, animal.position.z - whereItWas.z)
      const howFarWeWanted = speed * secondsPassed

      if (howFarWeWent < howFarWeWanted / 2) {
        const turnRound = randomNumberBetween(Math.PI / 2, Math.PI * 1.5)
        wayToGo = animal.rotation.y + turnRound
        secondsUntilNewIdea = randomNumberBetween(2, 5)
      }
    },
  }
}
