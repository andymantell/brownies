import * as THREE from 'three';

// Make a coloured box. Everything in this game is built out of these!
//   makeBox({ width: 1, height: 2, depth: 1, colour: 'hotpink' })
export function makeBox({ width = 1, height = 1, depth = 1, colour = '#ffffff' } = {}) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color: colour, roughness: 0.8 }),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Smoothly turn angle `from` towards `to` (radians), taking the short way round.
export function turnTowards(from, to, amount) {
  let diff = to - from;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  return from + diff * Math.min(1, amount);
}
