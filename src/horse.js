import { config } from './config.js'
import { makeBox, makeGroup, makeSpeechBubble, randomNumberBetween } from './engine/index.js'

// A big friendly horse, made out of boxes.
// Every now and then it shouts NEIGH!

// How long the NEIGH stays on screen, in seconds.
const SECONDS_OF_NEIGHING = 1.5

export function createHorse(screen) {
  const looks = config.horse

  // A group holds all the parts of the horse together, so they move as one.
  const horse = makeGroup()
  horse.position.set(looks.x, 0, looks.z)

  // A long body, up high on long legs.
  const body = makeBox({ width: 0.8, height: 0.8, depth: 1.9, colour: looks.coatColour })
  body.position.y = 1.4
  horse.add(body)

  // A neck sloping up from the front of the body.
  const neck = makeBox({ width: 0.4, height: 0.9, depth: 0.45, colour: looks.coatColour })
  neck.position.set(0, 2, 0.85)
  neck.rotation.x = 0.5 // lean the neck forwards
  horse.add(neck)

  // A long head on the end of the neck.
  const head = makeBox({ width: 0.4, height: 0.4, depth: 0.85, colour: looks.coatColour })
  head.position.set(0, 2.4, 1.3)
  horse.add(head)

  // A darker nose on the end of the head.
  const nose = makeBox({ width: 0.42, height: 0.3, depth: 0.2, colour: looks.noseColour })
  nose.position.set(0, -0.05, 0.4)
  head.add(nose)

  // Two eyes, one on each side of the head.
  const leftEye = makeBox({ width: 0.04, height: 0.1, depth: 0.1, colour: looks.eyeColour })
  leftEye.position.set(-0.21, 0.08, 0.05)
  head.add(leftEye)

  const rightEye = makeBox({ width: 0.04, height: 0.1, depth: 0.1, colour: looks.eyeColour })
  rightEye.position.set(0.21, 0.08, 0.05)
  head.add(rightEye)

  // Two little ears sticking up.
  const leftEar = makeBox({ width: 0.1, height: 0.2, depth: 0.08, colour: looks.coatColour })
  leftEar.position.set(-0.12, 0.28, -0.3)
  head.add(leftEar)

  const rightEar = makeBox({ width: 0.1, height: 0.2, depth: 0.08, colour: looks.coatColour })
  rightEar.position.set(0.12, 0.28, -0.3)
  head.add(rightEar)

  // A shaggy mane running down the back of the neck.
  const mane = makeBox({ width: 0.15, height: 1, depth: 0.15, colour: looks.maneColour })
  mane.position.set(0, 0.05, -0.27)
  neck.add(mane)

  // Four long legs, one at each corner of the body.
  addLeg(horse, { x: -0.28, z: 0.7, looks })
  addLeg(horse, { x: 0.28, z: 0.7, looks })
  addLeg(horse, { x: -0.28, z: -0.7, looks })
  addLeg(horse, { x: 0.28, z: -0.7, looks })

  // A swishy tail hanging down at the back.
  const tail = makeBox({ width: 0.15, height: 0.9, depth: 0.15, colour: looks.maneColour })
  tail.position.set(0, 1.2, -1.05)
  tail.rotation.x = -0.3 // swing the tail out a little
  horse.add(tail)

  screen.add(horse)

  // A speech bubble, so the horse can shout.
  const bubble = makeSpeechBubble(screen)
  let secondsUntilNextNeigh = randomNumberBetween(3, 8)
  let secondsLeftOfNeighing = 0

  return {
    position: horse.position,
    horse,

    // Called every frame. Every now and then, the horse shouts NEIGH!
    update(secondsPassed) {
      secondsUntilNextNeigh -= secondsPassed
      if (secondsUntilNextNeigh < 0) {
        bubble.say('NEIGH!')
        secondsLeftOfNeighing = SECONDS_OF_NEIGHING
        secondsUntilNextNeigh = randomNumberBetween(4, 10)
      }

      // After a little while, stop neighing.
      secondsLeftOfNeighing -= secondsPassed
      if (secondsLeftOfNeighing < 0) {
        bubble.hide()
      }

      // Keep the bubble floating above the ladybird's head.
      bubble.stayAbove(horse.position, 4.2)
    },
  }
}

// One long leg, with a dark hoof at the bottom.
function addLeg(horse, { x, z, looks }) {
  const leg = makeBox({ width: 0.2, height: 1, depth: 0.2, colour: looks.coatColour })
  leg.position.set(x, 0.5, z)
  horse.add(leg)

  const hoof = makeBox({ width: 0.22, height: 0.15, depth: 0.22, colour: looks.hoofColour })
  hoof.position.y = -0.43
  leg.add(hoof)
}
