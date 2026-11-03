import * as THREE from 'three'

// Reading the keyboard, and finding where on the ground someone tapped.

// Our camera looks from a corner, so "up the screen" is a diagonal in the world.
// These are the world directions that match up, down, left and right on the screen.
export const SCREEN = {
  up: new THREE.Vector3(-1, 0, -1).normalize(),
  down: new THREE.Vector3(1, 0, 1).normalize(),
  left: new THREE.Vector3(-1, 0, 1).normalize(),
  right: new THREE.Vector3(1, 0, -1).normalize(),
}

// Keeps track of which keys are being held down.
//   const keyboard = createKeyboard()
//   if (keyboard.isHeld('ArrowUp', 'w')) { ... }
export function createKeyboard() {
  const keysHeldDown = new Set()

  window.addEventListener('keydown', (event) => {
    keysHeldDown.add(event.key.toLowerCase())

    // Stop the arrow keys scrolling the page.
    if (event.key.startsWith('Arrow')) {
      event.preventDefault()
    }
  })

  window.addEventListener('keyup', (event) => {
    keysHeldDown.delete(event.key.toLowerCase())
  })

  // Forget all the keys if you switch to another window.
  window.addEventListener('blur', () => {
    keysHeldDown.clear()
  })

  return {
    isHeld(...keys) {
      return keys.some((key) => keysHeldDown.has(key.toLowerCase()))
    },
  }
}

// Keeps track of a finger (or a mouse button) held down on the ground.
// `whenPressed(spot)` runs as soon as the finger goes down, with the spot it touched.
//   const finger = createFinger(screen, (spot) => { ... })
//   if (finger.isDown()) { const spot = finger.spotOnGround() }
export function createFinger(screen, whenPressed) {
  let isDown = false
  let fingerId = null // which finger, if there's more than one on the screen
  const whereOnScreen = { x: 0, y: 0 }

  screen.canvas.addEventListener('pointerdown', (event) => {
    // Only follow the first finger. Ignore any others.
    if (isDown) {
      return
    }
    isDown = true
    fingerId = event.pointerId
    whereOnScreen.x = event.clientX
    whereOnScreen.y = event.clientY

    // Keep listening to this finger even if it slides off the game
    // (fake fingers from the tests can't be captured, so that's OK to skip).
    try {
      screen.canvas.setPointerCapture(event.pointerId)
    } catch {}

    whenPressed(findSpotOnGround(whereOnScreen, screen.camera))
  })

  window.addEventListener('pointermove', (event) => {
    if (isDown && event.pointerId === fingerId) {
      whereOnScreen.x = event.clientX
      whereOnScreen.y = event.clientY
    }
  })

  function letGo(event) {
    if (event.pointerId === fingerId) {
      isDown = false
      fingerId = null
    }
  }
  window.addEventListener('pointerup', letGo)
  window.addEventListener('pointercancel', letGo)

  return {
    // Is a finger held down on the game right now?
    isDown() {
      return isDown
    },

    // The spot on the ground under the finger, right now.
    // (Worked out fresh each time, because the camera moves under the finger.)
    spotOnGround() {
      return findSpotOnGround(whereOnScreen, screen.camera)
    },
  }
}

// Find the spot on the ground under a point on the screen (in pixels).
function findSpotOnGround(whereOnScreen, camera) {
  // three.js wants the screen position as numbers from -1 to 1.
  const across = (whereOnScreen.x / window.innerWidth) * 2 - 1
  const up = -(whereOnScreen.y / window.innerHeight) * 2 + 1
  const screenPosition = new THREE.Vector2(across, up)

  // Shine an imaginary laser from the camera through that point, and see where it hits the ground.
  const laser = new THREE.Raycaster()
  laser.setFromCamera(screenPosition, camera)

  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  return laser.ray.intersectPlane(ground, new THREE.Vector3())
}
