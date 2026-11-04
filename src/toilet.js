import { makeBox, makeGroup } from './engine/index.js'

// A white toilet that flushes! The house has one, and so does the portaloo.
//
//   const toilet = createToilet()
//   toilet.flush()                  // start flushing
//   toilet.update(secondsPassed)    // call every frame, to animate it

const WATER_HEIGHT = 0.47 // how high the water in the toilet is
const FLUSH_SECONDS = 2 // how long one flush lasts

export function createToilet() {
  const { toilet, water, handle } = makeToilet()

  // How many seconds of flushing are left. 0 means it isn't flushing.
  let flushTimeLeft = 0

  return {
    toilet,

    // Start flushing the toilet (unless it's already flushing).
    flush() {
      if (flushTimeLeft === 0) {
        flushTimeLeft = FLUSH_SECONDS
      }
    },

    isFlushing() {
      return flushTimeLeft > 0
    },

    // While it's flushing, the water spins round and sinks down, then fills up again.
    update(secondsPassed) {
      flushTimeLeft = Math.max(flushTimeLeft - secondsPassed, 0)

      if (flushTimeLeft === 0) {
        water.rotation.y = 0
        water.scale.set(1, 1, 1)
        water.position.y = WATER_HEIGHT
        handle.rotation.z = 0
        return
      }

      // How far through the flush we are: 0 at the start, 1 at the end.
      const howFarThrough = 1 - flushTimeLeft / FLUSH_SECONDS

      // Down to the bottom half way through, and back up by the end.
      const howSunk = Math.sin(howFarThrough * Math.PI)

      water.rotation.y += secondsPassed * 12 // spin!
      water.position.y = WATER_HEIGHT - howSunk * 0.15
      water.scale.set(1 - howSunk * 0.6, 1, 1 - howSunk * 0.6) // swirl down the plughole

      // The handle dips down at the start of the flush.
      if (howFarThrough < 0.3) {
        handle.rotation.z = 0.6
      } else {
        handle.rotation.z = 0
      }
    },
  }
}

// The toilet itself: a bowl, a seat, a tank of water at the back, and a handle.
// The water and the handle move when you flush, so we keep hold of them.
function makeToilet() {
  const toilet = makeGroup()

  const bowl = makeBox({ width: 0.6, height: 0.45, depth: 0.7, colour: 'white' })
  bowl.position.set(0, 0.225, 0.1)
  toilet.add(bowl)

  // The seat is a ring, made of four thin boxes around the edge of the bowl.
  const seatColour = '#f0f0f0'
  const seatBack = makeBox({ width: 0.66, height: 0.06, depth: 0.12, colour: seatColour })
  seatBack.position.set(0, 0.48, -0.22)
  toilet.add(seatBack)

  const seatFront = makeBox({ width: 0.66, height: 0.06, depth: 0.12, colour: seatColour })
  seatFront.position.set(0, 0.48, 0.42)
  toilet.add(seatFront)

  const seatLeft = makeBox({ width: 0.12, height: 0.06, depth: 0.76, colour: seatColour })
  seatLeft.position.set(-0.27, 0.48, 0.1)
  toilet.add(seatLeft)

  const seatRight = makeBox({ width: 0.12, height: 0.06, depth: 0.76, colour: seatColour })
  seatRight.position.set(0.27, 0.48, 0.1)
  toilet.add(seatRight)

  // The water, inside the seat.
  const water = makeBox({ width: 0.4, height: 0.04, depth: 0.5, colour: '#4aa3df' })
  water.position.set(0, WATER_HEIGHT, 0.1)
  toilet.add(water)

  // The tank at the back, where the flushing water comes from.
  const tank = makeBox({ width: 0.8, height: 0.8, depth: 0.3, colour: 'white' })
  tank.position.set(0, 0.9, -0.3)
  toilet.add(tank)

  // The handle, on the front of the tank. It turns at one end, like a lever.
  const handle = makeGroup()
  const lever = makeBox({ width: 0.2, height: 0.05, depth: 0.05, colour: '#999999' })
  lever.position.x = 0.1
  handle.add(lever)
  handle.position.set(-0.3, 1.15, -0.13)
  toilet.add(handle)

  return { toilet, water, handle }
}
