import { config } from './config.js'
import { makeBox, makeGroup, makeSwingingBox, angleOf, turnTowards, makeFlippable } from './engine/index.js'

// Our little hero, made entirely of boxes.
// Pass in different looks (like config.girl) to make someone else.

export function createCharacter(screen, looks = config.character) {
  const colours = looks

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

  // Hair: a flat top, a fringe at the front, and bits over the ears and at the back.
  const hairOnTop = makeBox({ width: 0.76, height: 0.16, depth: 0.76, colour: colours.hairColour })
  hairOnTop.position.set(0, 0.36, 0)
  head.add(hairOnTop)

  const fringe = makeBox({ width: 0.76, height: 0.1, depth: 0.06, colour: colours.hairColour })
  fringe.position.set(0, 0.25, 0.36)
  head.add(fringe)

  const hairAtTheBack = makeBox({ width: 0.76, height: 0.45, depth: 0.06, colour: colours.hairColour })
  hairAtTheBack.position.set(0, 0.1, -0.36)
  head.add(hairAtTheBack)

  const leftSideHair = makeBox({ width: 0.06, height: 0.3, depth: 0.76, colour: colours.hairColour })
  leftSideHair.position.set(-0.36, 0.17, -0.03)
  head.add(leftSideHair)

  const rightSideHair = makeBox({ width: 0.06, height: 0.3, depth: 0.76, colour: colours.hairColour })
  rightSideHair.position.set(0.36, 0.17, -0.03)
  head.add(rightSideHair)

  // Long hair hangs down the back, past the shoulders.
  if (colours.hasLongHair) {
    const longHair = makeBox({ width: 0.76, height: 0.5, depth: 0.12, colour: colours.hairColour })
    longHair.position.set(0, -0.4, -0.36)
    head.add(longHair)
  }

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

  // This lets the whole body spin around its tummy, for backflips.
  const flipper = makeFlippable(person, 1.1)
  let isFlipping = false
  let hasFlippedThisJump = false // only one backflip per jump!

  let stepTimer = 0 // counts up while walking, to time the arm and leg swings

  return {
    position: person.position,
    person,

    // Start a backflip (if we haven't done one on this jump yet).
    doABackflip() {
      if (hasFlippedThisJump) {
        return
      }
      isFlipping = true
      hasFlippedThisJump = true
    },

    // Are we in the middle of a backflip right now?
    isDoingABackflip() {
      return isFlipping
    },

    // Called when we land, so we always end up the right way up.
    landed() {
      isFlipping = false
      hasFlippedThisJump = false
      flipper.rotation.x = 0
    },

    // Called every frame. `direction` says which way to walk (or nowhere).
    update(secondsPassed, direction) {
      const isWalking = direction.length() > 0

      // Spin backwards, one whole turn. (14 is how fast we spin. Try changing it!)
      if (isFlipping) {
        flipper.rotation.x -= 14 * secondsPassed
        if (flipper.rotation.x <= -Math.PI * 2) {
          flipper.rotation.x = 0
          isFlipping = false
        }
      }

      if (isWalking) {
        // Step forwards.
        const distance = colours.speed * secondsPassed
        person.position.x += direction.x * distance
        person.position.z += direction.z * distance

        // Turn to face the way we're walking.
        const wantedAngle = angleOf(direction)
        const turnSpeed = secondsPassed * 12
        person.rotation.y = turnTowards(person.rotation.y, wantedAngle, turnSpeed)

        stepTimer += secondsPassed * colours.speed * 2
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
