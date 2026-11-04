import * as THREE from 'three'

// How much ground does a thing cover, seen from above?
// Gives back a rectangle { x, z, width, depth }, where x and z are its middle.
//   areaUnder(house.roof)
export function areaUnder(thing) {
  thing.updateWorldMatrix(true, true) // make sure we know where it really is
  const outline = new THREE.Box3().setFromObject(thing)
  return {
    x: (outline.min.x + outline.max.x) / 2,
    z: (outline.min.z + outline.max.z) / 2,
    width: outline.max.x - outline.min.x,
    depth: outline.max.z - outline.min.z,
  }
}
