import * as THREE from 'three'

// A white ring lying on the grass, to show where someone tapped.
export function makeTapMarker() {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.42, 32),
    new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: 0.8 }),
  )
  ring.rotation.x = -Math.PI / 2 // lie flat on the ground
  ring.visible = false

  return {
    ring,
    showAt(spot) {
      ring.position.set(spot.x, 0.02, spot.z) // just above the grass so it isn't hidden
      ring.visible = true
    },
    hide() {
      ring.visible = false
    },
  }
}
