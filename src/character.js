import { config } from './config.js'
import { makeBox, makeGroup, makeSwingingBox, angleOf, turnTowards } from './engine/index.js'

// Our little hero, made entirely of boxes.

export function createCharacter(screen) {
  const colours = config.character

  // A group holds all the body parts together, so they move as one.
  const person = makeGroup()

  const body = makeBox({ width: 0.8, height: 0.9, depth: 0.5, colour: colours.bodyColour })
  body.position.y = 1.15
  person.add(body)

  const head = makeBox({ width: 0.7, height: 0.7, depth: 0.7, colour: colours.headColour })
  head.position.y = 1.95
  person.add(head)

  // Two eyes on the front of the head.
  const leftEye = makeBox({ width: 0.1, height: 0.14, depth: 0.05, colour: colours.eyeColour })
  leftEye.position.set(-0.16, 0.05, 0.36)
  head.add(leftEye)

  const rightEye = makeBox({ width: 0.1, height: 0.14, depth: 0.05, colour: colours.eyeColour })
  rightEye.position.set(0.16, 0.05, 0.36)
  head.add(rightEye)

  // Arms and legs swing from the top, like shoulders and hips.
  const leftLeg = makeSwingingBox({ width: 0.3, height: 0.7, depth: 0.3, colour: colours.legColour })
  leftLeg.position.set(-0.2, 0.7, 0)
  person.add(leftLeg)

  const rightLeg = makeSwingingBox({ width: 0.3, height: 0.7, depth: 0.3, colour: colours.legColour })
  rightLeg.position.set(0.2, 0.7, 0)
  person.add(rightLeg)

  const leftArm = makeSwingingBox({ width: 0.22, height: 0.75, depth: 0.22, colour: colours.armColour })
  leftArm.position.set(-0.52, 1.55, 0)
  person.add(leftArm)

  const rightArm = makeSwingingBox({ width: 0.22, height: 0.75, depth: 0.22, colour: colours.armColour })
  rightArm.position.set(0.52, 1.55, 0)
  person.add(rightArm)

  screen.add(person)

  let stepTimer = 0 // counts up while walking, to time the arm and leg swings

  return {
    position: person.position,
    person,

    // Called every frame. `direction` says which way to walk (or nowhere).
    update(secondsPassed, direction) {
      const isWalking = direction.length() > 0

      if (isWalking) {
        // Step forwards.
        const distance = config.character.speed * secondsPassed
        person.position.x += direction.x * distance
        person.position.z += direction.z * distance

        // Turn to face the way we're walking.
        const wantedAngle = angleOf(direction)
        const turnSpeed = secondsPassed * 12
        person.rotation.y = turnTowards(person.rotation.y, wantedAngle, turnSpeed)

        stepTimer += secondsPassed * config.character.speed * 2
      } else {
        stepTimer = 0 // stand up straight
      }

      // Swing arms and legs backwards and forwards.
      const swing = Math.sin(stepTimer) * 0.7
      leftLeg.rotation.x = swing
      rightLeg.rotation.x = -swing
      leftArm.rotation.x = -swing
      rightArm.rotation.x = swing

      // Bob up and down a little with each step.
      const bounce = Math.abs(Math.sin(stepTimer)) * 0.08
      body.position.y = 1.15 + bounce
      head.position.y = 1.95 + bounce
    },
  }
}
