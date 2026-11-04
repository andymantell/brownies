import * as THREE from 'three'

// Stops the character walking through solid things, like walls.
//
// Add things with add(). Each frame, after the character moves, call
// keepOutOf() with where they were before. If they've walked into
// something, they get put back, but they can still slide along it.

const HOW_FAT_THE_PERSON_IS = 0.35

export function createSolidThings() {
  const things = []

  // Is this spot inside anything solid?
  function isBlocked(x, z) {
    const radius = HOW_FAT_THE_PERSON_IS
    for (const thing of things) {
      const box = outlineOf(thing)
      const insideAcross = x > box.min.x - radius && x < box.max.x + radius
      const insideBack = z > box.min.z - radius && z < box.max.z + radius
      if (insideAcross && insideBack) {
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
  }
}

// The invisible box that fits snugly around a thing, wherever it is now.
function outlineOf(thing) {
  thing.updateWorldMatrix(true, true)
  return new THREE.Box3().setFromObject(thing)
}
