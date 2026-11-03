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

// Run `whenTapped(spot)` whenever someone clicks or taps the ground.
// `spot` is the place in the world they tapped.
export function onTapGround(screen, whenTapped) {
  screen.canvas.addEventListener('pointerdown', (event) => {
    const spot = findSpotOnGround(event, screen.camera)
    if (spot) {
      whenTapped(spot)
    }
  })
}

function findSpotOnGround(event, camera) {
  // three.js wants the screen position as numbers from -1 to 1.
  const across = (event.clientX / window.innerWidth) * 2 - 1
  const up = -(event.clientY / window.innerHeight) * 2 + 1
  const screenPosition = new THREE.Vector2(across, up)

  // Shine an imaginary laser from the camera through that point, and see where it hits the ground.
  const laser = new THREE.Raycaster()
  laser.setFromCamera(screenPosition, camera)

  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  return laser.ray.intersectPlane(ground, new THREE.Vector3())
}
