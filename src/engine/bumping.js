import * as THREE from 'three'

// Stops the character walking through solid things, like walls.
//
// Add things with add(). Each frame, after the character moves, call
// keepOutOf() with where they were before. If they've walked into
// something, they get put back, but they can still slide along it.

const HOW_FAT_THE_PERSON_IS = 0.35

export function createSolidThings() {
  const things = []
  let feetHeight = 0 // how high the person's feet are, so they can jump on top of things

  // Is this spot inside anything solid? (Things below your feet don't count.)
  function isBlocked(x, z) {
    for (const thing of things) {
      const box = outlineOf(thing)
      const isBelowFeet = box.max.y < feetHeight + 0.05
      if (isInside(box, x, z) && !isBelowFeet) {
        return true
      }
    }
    return false
  }

  return {
    // Make something solid. It can be one box, or a whole group of them.
    add(thing) {
      things.push(thing)
    },

    // If `position` has walked into something, move it back.
    // We try keeping just the sideways step, then just the forwards step,
    // so you slide along walls instead of getting stuck.
    keepOutOf(position, before) {
      feetHeight = position.y
      if (!isBlocked(position.x, position.z)) {
        return
      }
      // Already stuck inside something (maybe it moved onto us)? Let them walk out.
      if (isBlocked(before.x, before.z)) {
        return
      }
      if (!isBlocked(position.x, before.z)) {
        position.z = before.z
        return
      }
      if (!isBlocked(before.x, position.z)) {
        position.x = before.x
        return
      }
      position.x = before.x
      position.z = before.z
    },

    // How high is the top of the solid thing under this spot? So you can stand on it.
    // Only things you're above count (or nearly above, so you can step up a tiny bit).
    groundHeightAt(x, z, height) {
      let highestTop = -Infinity
      for (const thing of things) {
        const box = outlineOf(thing)
        const canStandOnIt = box.max.y < height + 0.25
        if (isInside(box, x, z) && canStandOnIt) {
          highestTop = Math.max(highestTop, box.max.y)
        }
      }
      return highestTop
    },
  }
}

// Is this spot inside a thing's outline? (Counting how fat the person is.)
function isInside(box, x, z) {
  const radius = HOW_FAT_THE_PERSON_IS
  const insideAcross = x > box.min.x - radius && x < box.max.x + radius
  const insideBack = z > box.min.z - radius && z < box.max.z + radius
  return insideAcross && insideBack
}

// The invisible box that fits snugly around a thing, wherever it is now.
function outlineOf(thing) {
  thing.updateWorldMatrix(true, true)
  return new THREE.Box3().setFromObject(thing)
}
