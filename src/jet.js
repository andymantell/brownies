import { config } from './config.js'
import {
  makeBox,
  makeGroup,
  createKeyboard,
  spotInFront,
  angleOf,
  turnTowards,
  keepInsideSquare,
} from './engine/index.js'

// A blocky passenger jet, parked on the grass.
// It has a long body with windows, two big wings with engines underneath,
// a tail fin at the back, and little wheels to stand on.
// The nose points forwards (along z), so it can turn to face where it flies.
//
// Stand by the door and press E to get in. Press E again to get out.
// The pilot flies it with their walking keys. Let go of the keys to come down and land.

const LENGTH = 14 // from the nose to the tail
const BODY_SIZE = 2.4 // how wide and tall the body is
const BODY_HEIGHT = 2.6 // how high the middle of the body is off the ground
const WING_SPAN = 15 // from one wing tip to the other
const WING_HEIGHT = 1.65 // low enough to jump up onto!
const DOOR_FORWARD = 5 // how far forward of the middle the door is
const DOOR_REACH = 3 // how close you need to be to the door to get in
const SPEED_UP = 4 // how quickly the jet gets faster
const SLOW_DOWN = 2 // how quickly the jet slows down, when you let go of the keys

export function createJet(screen) {
  const colours = config.jet

  // A group holds all the parts, so we can move the whole jet as one.
  const jet = makeGroup()
  jet.position.set(colours.x, 0, colours.z)
  jet.rotation.order = 'YXZ' // so it tips its nose and wings the way a real plane does

  // The long body.
  const body = makeBox({ width: BODY_SIZE, height: BODY_SIZE, depth: LENGTH, colour: colours.bodyColour })
  body.position.y = BODY_HEIGHT
  jet.add(body)

  // The nose: two smaller boxes that get narrower, at the front.
  addNosePart(jet, LENGTH / 2 + 0.4, 2, colours.bodyColour)
  addNosePart(jet, LENGTH / 2 + 1.1, 1.3, colours.bodyColour)

  // The windscreen, where the pilot looks out.
  const windscreen = makeBox({ width: 1.8, height: 0.5, depth: 0.6, colour: colours.windowColour })
  windscreen.position.set(0, BODY_HEIGHT + 0.6, LENGTH / 2 + 0.3)
  jet.add(windscreen)

  // A row of little windows along each side, for the passengers.
  addWindows(jet, -BODY_SIZE / 2 - 0.03, colours.windowColour)
  addWindows(jet, BODY_SIZE / 2 + 0.03, colours.windowColour)

  // The door, at the front on one side.
  const door = makeBox({ width: 0.06, height: 1.6, depth: 0.9, colour: colours.doorColour })
  door.position.set(BODY_SIZE / 2 + 0.04, BODY_HEIGHT - 0.1, DOOR_FORWARD)
  jet.add(door)

  // The pilot's hat, peeking out of the windscreen. It only shows when someone is flying.
  const pilotHat = makeBox({ width: 0.7, height: 0.3, depth: 0.7, colour: colours.pilotHatColour })
  pilotHat.position.set(0, BODY_HEIGHT + BODY_SIZE / 2 + 0.1, LENGTH / 2 - 0.5)
  pilotHat.visible = false
  jet.add(pilotHat)

  // A blue stripe along each side, under the windows.
  addStripe(jet, -BODY_SIZE / 2 - 0.03, colours.stripeColour)
  addStripe(jet, BODY_SIZE / 2 + 0.03, colours.stripeColour)

  // The big wings, sticking out from the middle.
  const wings = makeBox({ width: WING_SPAN, height: 0.3, depth: 3, colour: colours.bodyColour })
  wings.position.set(0, WING_HEIGHT, 0.5)
  jet.add(wings)

  // Two engines, hanging under the wings.
  addEngine(jet, -4, colours.engineColour)
  addEngine(jet, 4, colours.engineColour)

  // The tail fin, standing up at the back, painted red.
  const tailFin = makeBox({ width: 0.3, height: 3, depth: 2.2, colour: colours.tailColour })
  tailFin.position.set(0, BODY_HEIGHT + BODY_SIZE / 2 + 1.5, -LENGTH / 2 + 1.2)
  jet.add(tailFin)

  // The little wings at the back.
  const tailWings = makeBox({ width: 6, height: 0.25, depth: 1.5, colour: colours.bodyColour })
  tailWings.position.set(0, BODY_HEIGHT + 0.6, -LENGTH / 2 + 1)
  jet.add(tailWings)

  // Wheels to stand on: one at the front, two under the wings.
  addWheel(jet, 0, LENGTH / 2 - 1.5, colours.wheelColour)
  addWheel(jet, -1.5, -0.5, colours.wheelColour)
  addWheel(jet, 1.5, -0.5, colours.wheelColour)

  screen.add(jet)

  // The parts you bump into. The wings are low, so you can jump up and stand on them.
  const solidParts = [body, wings, tailWings]

  const keyboard = createKeyboard()
  let pilot = null // who is flying the jet (null means nobody)
  let speed = 0

  // The spot on the grass just outside the door.
  function spotByTheDoor() {
    const besideTheDoor = spotInFront(jet.position, jet.rotation.y, DOOR_FORWARD)
    return spotInFront(besideTheDoor, jet.rotation.y + Math.PI / 2, BODY_SIZE / 2 + 1)
  }

  // Whoever is standing nearest the door gets in, and becomes the pilot.
  function letInWhoeverIsByTheDoor(players) {
    const door = spotByTheDoor()
    let nearestDistance = DOOR_REACH
    for (const player of players) {
      const distance = Math.hypot(player.position.x - door.x, player.position.z - door.z)
      if (distance < nearestDistance) {
        pilot = player
        nearestDistance = distance
      }
    }
    if (pilot) {
      pilot.person.visible = false // they're inside the jet now
      pilotHat.visible = true
    }
  }

  // The pilot climbs out, and stands by the door.
  function letThePilotOut() {
    const door = spotByTheDoor()
    pilot.position.set(door.x, 0, door.z)
    pilot.person.visible = true
    speed = 0
    jet.rotation.z = 0
    pilotHat.visible = false
    pilot = null
  }

  // Is the jet back down on the grass?
  function hasLanded() {
    return jet.position.y === 0
  }

  return {
    jet,
    position: jet.position,
    solidParts,

    // Is this player the pilot?
    pilotIs(player) {
      return pilot === player
    },

    // Call this every frame, with everyone who could be the pilot.
    update(secondsPassed, players) {
      if (keyboard.wasJustPressed('e')) {
        if (!pilot) {
          letInWhoeverIsByTheDoor(players)
        } else if (hasLanded()) {
          letThePilotOut() // you can only get out once you've landed!
        }
      }
    },

    // Fly the jet. `direction` is which way the pilot wants to go, from their walking keys.
    fly(direction, secondsPassed) {
      const angleBefore = jet.rotation.y

      // Holding a key? Speed up, and turn to face that way. Let go, and slow down.
      if (direction.length() > 0) {
        speed = Math.min(speed + SPEED_UP * secondsPassed, colours.flySpeed)
        jet.rotation.y = turnTowards(jet.rotation.y, angleOf(direction), colours.turnSpeed * secondsPassed)
      } else {
        speed = Math.max(speed - SLOW_DOWN * secondsPassed, 0)
      }

      // Zoom forwards, the way the nose is pointing. Stay over the field.
      const ahead = spotInFront(jet.position, jet.rotation.y, speed * secondsPassed)
      jet.position.x = ahead.x
      jet.position.z = ahead.z
      keepInsideSquare(jet.position, config.world.size / 2)

      // Fast enough? Take off and climb up into the sky. Too slow? Come down and land.
      const climb = colours.climbSpeed * secondsPassed
      if (speed >= colours.takeOffSpeed) {
        jet.position.y = Math.min(jet.position.y + climb, colours.flyingHeight)
        jet.rotation.x = -0.15 // nose up
      } else {
        jet.position.y = Math.max(jet.position.y - climb, 0)
        jet.rotation.x = 0
      }
      if (jet.position.y === colours.flyingHeight || jet.position.y === 0) {
        jet.rotation.x = 0 // flying level, or sitting on the grass
      }

      // Lean into the turns, like a real plane.
      const howFastItsTurning = (jet.rotation.y - angleBefore) / secondsPassed
      jet.rotation.z = Math.max(-0.5, Math.min(0.5, -howFastItsTurning * 0.3))

      // The pilot sits in the jet, and goes wherever it goes.
      pilot.position.set(jet.position.x, jet.position.y, jet.position.z)
    },
  }
}

// Part of the pointy nose at the front.
function addNosePart(jet, z, size, colour) {
  const part = makeBox({ width: size, height: size, depth: 0.8, colour })
  part.position.set(0, BODY_HEIGHT, z)
  jet.add(part)
}

// A row of little windows along one side of the body.
function addWindows(jet, x, colour) {
  for (let z = -LENGTH / 2 + 2.5; z < LENGTH / 2 - 1; z += 1) {
    const passengerWindow = makeBox({ width: 0.05, height: 0.4, depth: 0.4, colour })
    passengerWindow.position.set(x, BODY_HEIGHT + 0.4, z)
    jet.add(passengerWindow)
  }
}

// A stripe painted along one side of the body.
function addStripe(jet, x, colour) {
  const stripe = makeBox({ width: 0.05, height: 0.2, depth: LENGTH, colour })
  stripe.position.set(x, BODY_HEIGHT - 0.2, 0)
  jet.add(stripe)
}

// An engine: a fat box hanging under a wing.
function addEngine(jet, x, colour) {
  const engine = makeBox({ width: 1.2, height: 1.2, depth: 2.4, colour })
  engine.position.set(x, WING_HEIGHT - 0.75, 1)
  jet.add(engine)
}

// A wheel, holding the jet up off the grass.
function addWheel(jet, x, z, colour) {
  const wheel = makeBox({ width: 0.5, height: 1.4, depth: 0.6, colour })
  wheel.position.set(x, 0.7, z)
  jet.add(wheel)
}
