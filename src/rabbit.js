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

  // She hops from spot to spot, and has a little rest after each hop.
  let restTime = settings.secondsBetweenHops
  let isHopping = false
  let hopProgress = 0 // 0 at the start of a hop, 1 when she lands
  let hopFrom = { x: 0, z: 0 }
  let hopTo = { x: 0, z: 0 }

  return {
    rabbit,

    // Called every frame, to make her hop about.
    update(secondsPassed) {
      if (isHopping) {
        hopProgress += secondsPassed / settings.hopLasts
        if (hopProgress >= 1) {
          hopProgress = 1
          isHopping = false
          restTime = settings.secondsBetweenHops
        }

        // Move a bit closer to where she's hopping to...
        rabbit.position.x = hopFrom.x + (hopTo.x - hopFrom.x) * hopProgress
        rabbit.position.z = hopFrom.z + (hopTo.z - hopFrom.z) * hopProgress

        // ...going up into the air, and back down again.
        rabbit.position.y = 0.1 + Math.sin(hopProgress * Math.PI) * settings.hopHeight
        return
      }

      restTime -= secondsPassed
      if (restTime <= 0) {
        hopFrom = { x: rabbit.position.x, z: rabbit.position.z }
        hopTo = pickASpotInTheHutch(hopFrom)
        hopProgress = 0
        isHopping = true

        // Turn to face where she's hopping.
        rabbit.rotation.y = Math.atan2(hopTo.x - hopFrom.x, hopTo.z - hopFrom.z)
      }
    },
  }
}

// Pick somewhere a little hop away, but still inside the hutch.
function pickASpotInTheHutch(from) {
  const direction = Math.random() * Math.PI * 2
  const distance = config.rabbit.hopDistance
  let x = from.x + Math.sin(direction) * distance
  let z = from.z + Math.cos(direction) * distance

  // Keep away from the bars, so she stays inside.
  const middleX = config.rabbitHutch.x
  const middleZ = config.rabbitHutch.z
  x = Math.min(Math.max(x, middleX - 0.85), middleX + 0.85)
  z = Math.min(Math.max(z, middleZ - 0.45), middleZ + 0.45)

  return { x, z }
}
