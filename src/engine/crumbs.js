import * as THREE from 'three'

// When a block breaks, little crumbs of it fly out and fall down.

const HOW_MANY_CRUMBS = 10
const CRUMB_SIZE = 0.18
const CRUMBS_LAST_FOR = 0.8 // seconds
const GRAVITY = 12

const crumbShape = new THREE.BoxGeometry(CRUMB_SIZE, CRUMB_SIZE, CRUMB_SIZE)

export function makeCrumbs(screen) {
  let flyingCrumbs = []

  return {
    // Throw out a burst of crumbs from the block at (x, y, z).
    burst(x, y, z, colour) {
      const paint = new THREE.MeshStandardMaterial({ color: colour })

      for (let number = 0; number < HOW_MANY_CRUMBS; number++) {
        const crumb = new THREE.Mesh(crumbShape, paint)
        crumb.castShadow = true
        crumb.position.set(
          x + randomBetween(-0.4, 0.4),
          y + 0.5 + randomBetween(-0.4, 0.4),
          z + randomBetween(-0.4, 0.4),
        )
        screen.scene.add(crumb)

        flyingCrumbs.push({
          crumb,
          speed: new THREE.Vector3(randomBetween(-2, 2), randomBetween(2, 5), randomBetween(-2, 2)),
          age: 0,
        })
      }
    },

    // Move the crumbs a little: they fly, fall, shrink, and then disappear.
    update(secondsPassed) {
      for (const flying of flyingCrumbs) {
        flying.age += secondsPassed
        flying.speed.y -= GRAVITY * secondsPassed
        flying.crumb.position.addScaledVector(flying.speed, secondsPassed)

        const shrink = Math.max(1 - flying.age / CRUMBS_LAST_FOR, 0.01)
        flying.crumb.scale.set(shrink, shrink, shrink)

        if (flying.age > CRUMBS_LAST_FOR) {
          screen.scene.remove(flying.crumb)
        }
      }

      flyingCrumbs = flyingCrumbs.filter((flying) => {
        return flying.age <= CRUMBS_LAST_FOR
      })
    },
  }
}

function randomBetween(smallest, biggest) {
  return smallest + Math.random() * (biggest - smallest)
}
