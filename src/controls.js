import {
  createKeyboard,
  createFinger,
  makeTapMarker,
  SCREEN,
  stillDirection,
  directionFromTo,
} from './engine/index.js'

// Works out which way the player wants to walk: from the arrow keys, or by
// tapping the grass (or holding a finger down and sliding it around).

export function createControls(screen) {
  const keyboard = createKeyboard()

  // Tapping the grass picks a spot to walk to, and shows a ring there.
  let tappedSpot = null // null means "nowhere"
  const marker = makeTapMarker()
  screen.add(marker.ring)

  const finger = createFinger(screen, (spot) => {
    walkTo(spot)
  })

  function walkTo(spot) {
    tappedSpot = spot
    marker.showAt(spot)
  }

  function forgetTappedSpot() {
    tappedSpot = null
    marker.hide()
  }

  return {
    // Forget about any tapped spot, so the character stops.
    stopWalking: forgetTappedSpot,

    // Did the player just press the space bar to jump?
    wantsToJump() {
      return keyboard.wasJustPressed(' ')
    },

    // Which way should the character walk right now?
    getDirection(characterPosition) {
      const direction = stillDirection()

      if (keyboard.isHeld('ArrowUp')) {
        direction.add(SCREEN.up)
      }
      if (keyboard.isHeld('ArrowDown')) {
        direction.add(SCREEN.down)
      }
      if (keyboard.isHeld('ArrowLeft')) {
        direction.add(SCREEN.left)
      }
      if (keyboard.isHeld('ArrowRight')) {
        direction.add(SCREEN.right)
      }

      // Using the keys? Then forget about any tapped spot.
      if (direction.length() > 0) {
        forgetTappedSpot()
        return direction.normalize() // so walking diagonally isn't faster
      }

      // Finger held down? Keep walking to wherever it is now.
      // When it lets go, we carry on to the last spot, just like a tap.
      if (finger.isDown()) {
        walkTo(finger.spotOnGround())
      }

      // Walking to a tapped spot?
      if (tappedSpot) {
        const route = directionFromTo(characterPosition, tappedSpot)
        const towardsSpot = route.direction
        const distance = route.distance

        if (distance < 0.1) {
          // We've arrived! Stop here (but keep the ring if the finger is still down).
          if (!finger.isDown()) {
            forgetTappedSpot()
          }
          return stillDirection()
        }
        return towardsSpot
      }

      return direction // stand still
    },
  }
}

// The second player (the girl) walks with the W A S D keys.
export function createGirlControls() {
  const keyboard = createKeyboard()

  return {
    // Which way should the girl walk right now?
    getDirection() {
      const direction = stillDirection()

      if (keyboard.isHeld('w')) {
        direction.add(SCREEN.up)
      }
      if (keyboard.isHeld('s')) {
        direction.add(SCREEN.down)
      }
      if (keyboard.isHeld('a')) {
        direction.add(SCREEN.left)
      }
      if (keyboard.isHeld('d')) {
        direction.add(SCREEN.right)
      }

      if (direction.length() > 0) {
        return direction.normalize() // so walking diagonally isn't faster
      }
      return direction // stand still
    },

    // Did the girl just press Q to jump?
    wantsToJump() {
      return keyboard.wasJustPressed('q')
    },
  }
}
