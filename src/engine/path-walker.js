import * as THREE from 'three'
import { findPath } from './pathfinding.js'
import { directionFromTo, stillDirection } from './maths.js'

// Makes something walk along a route found by pathfinding, one square at a time.
//
//   const walker = createPathWalker(screen, blocks, creature.position, { speed: 3 })
//   walker.walkTo(somewhere)
//   ...then every frame:
//   const direction = walker.update(secondsPassed)

export function createPathWalker(screen, blocks, position, { speed, showRoute = false }) {
  let route = []
  const footprints = makeFootprints(screen, showRoute)

  return {
    // Work out a route to a spot, and start walking along it.
    walkTo(spot) {
      route = findPath(blocks, position, spot)
      route.shift() // the first square is where we already are
      footprints.show(route)
    },

    stop() {
      route = []
      footprints.show(route)
    },

    isWalking() {
      return route.length > 0
    },

    // Take a step along the route. Gives back the direction we walked in.
    update(secondsPassed) {
      if (route.length === 0) {
        blocks.settleOntoGround(position, secondsPassed)
        return stillDirection()
      }

      const nextSquare = route[0]
      const towards = directionFromTo(position, nextSquare)

      if (towards.distance < 0.1) {
        route.shift() // made it to this square, on to the next one
        footprints.show(route)
        return towards.direction
      }

      const stepLength = Math.min(speed * secondsPassed, towards.distance)
      const stepAcross = towards.direction.x * stepLength
      const stepBack = towards.direction.z * stepLength
      blocks.moveAlong(position, stepAcross, stepBack, secondsPassed)

      return towards.direction
    },
  }
}

// Little white dots on the ground showing the route (handy for seeing how pathfinding works).
function makeFootprints(screen, isSwitchedOn) {
  const dots = new THREE.Group()
  const dotShape = new THREE.BoxGeometry(0.2, 0.04, 0.2)
  const dotPaint = new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: 0.7 })
  screen.add(dots)

  return {
    show(route) {
      if (!isSwitchedOn) {
        return
      }

      dots.clear()
      for (const square of route) {
        const dot = new THREE.Mesh(dotShape, dotPaint)
        dot.position.set(square.x, square.y + 0.03, square.z)
        dots.add(dot)
      }
    },
  }
}
