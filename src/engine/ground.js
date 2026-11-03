import * as THREE from 'three'

// A flat square of ground, lying down, with a picture painted on it.
export function makeFlatGround({ size, picture }) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({ map: picture }),
  )
  ground.rotation.x = -Math.PI / 2 // a plane starts standing up, so lay it down flat
  ground.receiveShadow = true
  return ground
}
