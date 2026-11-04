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
//   if (keyboard.wasJustPressed(' ')) { ... }
export function createKeyboard() {
  const keysHeldDown = new Set()
  const keysJustPressed = new Set() // pressed, but we haven't asked about them yet

  window.addEventListener('keydown', (event) => {
    keysHeldDown.add(event.key.toLowerCase())

    // Holding a key down makes it "repeat". We only count the first press.
    if (!event.repeat) {
      keysJustPressed.add(event.key.toLowerCase())
    }

    // Stop the arrow keys and space bar scrolling the page.
    if (event.key.startsWith('Arrow') || event.key === ' ') {
      event.preventDefault()
    }
  })

  window.addEventListener('keyup', (event) => {
    keysHeldDown.delete(event.key.toLowerCase())
  })

  // Forget all the keys if you switch to another window.
  window.addEventListener('blur', () => {
    keysHeldDown.clear()
    keysJustPressed.clear()
  })

  return {
    isHeld(...keys) {
      return keys.some((key) => keysHeldDown.has(key.toLowerCase()))
    },

    // Was this key pressed since we last asked? (Each press only counts once.)
    wasJustPressed(key) {
      const wasPressed = keysJustPressed.has(key.toLowerCase())
      keysJustPressed.delete(key.toLowerCase())
      return wasPressed
    },
  }
}

// Keeps track of a finger (or a mouse button) held down on the ground.
// `whenPressed(spot)` runs as soon as the finger goes down, with the spot it touched.
// `blocks` is optional: pass a block world to find which block the finger is on.
// Without it, the finger finds a spot on flat ground.
//   const finger = createFinger(screen, (spot) => { ... })
//   const finger = createFinger(screen, (spot) => { ... }, blocks)
//   if (finger.isDown()) { const spot = finger.spotOnGround() }
export function createFinger(screen, whenPressed, blocks = null) {
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

    whenPressed(findSpotOnGround(whereOnScreen, screen.camera, blocks))
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
      return findSpotOnGround(whereOnScreen, screen.camera, blocks)
    },
  }
}

// Find the spot on the ground under a point on the screen (in pixels).
function findSpotOnGround(whereOnScreen, camera, blocks) {
  // three.js wants the screen position as numbers from -1 to 1.
  const across = (whereOnScreen.x / window.innerWidth) * 2 - 1
  const up = -(whereOnScreen.y / window.innerHeight) * 2 + 1
  const screenPosition = new THREE.Vector2(across, up)

  // Shine an imaginary laser from the camera through that point, and see which block it hits.
  const laser = new THREE.Raycaster()
  laser.setFromCamera(screenPosition, camera)

  let hit = null
  if (blocks) {
    hit = blocks.findBlockAlongLaser(laser)
  }
  if (hit) {
    // Stand on top of the block we hit, as near as we can to where the laser touched it.
    const nearlyHalf = 0.49
    return new THREE.Vector3(
      keepBetween(hit.spot.x, hit.block.x - nearlyHalf, hit.block.x + nearlyHalf),
      hit.block.y + 1,
      keepBetween(hit.spot.z, hit.block.z - nearlyHalf, hit.block.z + nearlyHalf),
    )
  }

  // No blocks, or missed them all (off the edge of the world)? Use the flat ground instead.
  const flatGround = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  return laser.ray.intersectPlane(flatGround, new THREE.Vector3())
}

function keepBetween(number, smallest, biggest) {
  return Math.min(Math.max(number, smallest), biggest)
}
