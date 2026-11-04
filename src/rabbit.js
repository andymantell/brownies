import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A little blocky rabbit, who lives in the hutch.
// She's built facing the front: her head and ears at the front, her fluffy tail at the back.

export function createRabbit(screen) {
  const settings = config.rabbit
  const fur = settings.furColour

  // A group holds all the parts of the rabbit together, so we can move her as one.
  const rabbit = makeGroup()
  rabbit.position.set(config.rabbitHutch.x, 0.1, config.rabbitHutch.z) // standing on the straw

  const body = makeBox({ width: 0.35, height: 0.3, depth: 0.5, colour: fur })
  body.position.set(0, 0.2, 0)
  rabbit.add(body)

  const head = makeBox({ width: 0.28, height: 0.26, depth: 0.26, colour: fur })
  head.position.set(0, 0.38, 0.3)
  rabbit.add(head)

  // Two long ears, sticking up.
  const leftEar = makeBox({ width: 0.07, height: 0.3, depth: 0.05, colour: fur })
  leftEar.position.set(-0.07, 0.65, 0.26)
  rabbit.add(leftEar)

  const rightEar = makeBox({ width: 0.07, height: 0.3, depth: 0.05, colour: fur })
  rightEar.position.set(0.07, 0.65, 0.26)
  rabbit.add(rightEar)

  // Two eyes and a pink nose, on the front of her face.
  const leftEye = makeBox({ width: 0.05, height: 0.05, depth: 0.02, colour: settings.eyeColour })
  leftEye.position.set(-0.07, 0.42, 0.43)
  rabbit.add(leftEye)

  const rightEye = makeBox({ width: 0.05, height: 0.05, depth: 0.02, colour: settings.eyeColour })
  rightEye.position.set(0.07, 0.42, 0.43)
  rabbit.add(rightEye)

  const nose = makeBox({ width: 0.05, height: 0.04, depth: 0.02, colour: settings.noseColour })
  nose.position.set(0, 0.35, 0.43)
  rabbit.add(nose)

  // A fluffy white tail at the back.
  const tail = makeBox({ width: 0.12, height: 0.12, depth: 0.1, colour: settings.tailColour })
  tail.position.set(0, 0.28, -0.28)
  rabbit.add(tail)

  screen.add(rabbit)

  return { rabbit }
}
