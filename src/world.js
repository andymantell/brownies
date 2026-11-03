import * as THREE from 'three';
import { config } from './config.js';

// The world: for now just a big flat field of grass. Add trees, houses, ponds... here!

export function createWorld(scene) {
  const size = config.world.size;

  // A grid of squares, each a slightly different green, so it doesn't look like plastic.
  const geometry = new THREE.PlaneGeometry(size, size, size, size).toNonIndexed();
  geometry.rotateX(-Math.PI / 2);

  const base = new THREE.Color(config.world.grassColour);
  const colours = [];
  const tile = new THREE.Color();
  const verticesPerSquare = 6; // two triangles
  const count = geometry.attributes.position.count;
  for (let i = 0; i < count; i += verticesPerSquare) {
    tile.copy(base).offsetHSL((Math.random() - 0.5) * 0.02, 0, (Math.random() - 0.5) * 0.025);
    for (let v = 0; v < verticesPerSquare; v++) colours.push(tile.r, tile.g, tile.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));

  const ground = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
  );
  ground.receiveShadow = true;
  ground.name = 'ground';
  scene.add(ground);

  // A chunky soil edge under the field so it looks like a floating island.
  const soil = new THREE.Mesh(
    new THREE.BoxGeometry(size, 2, size),
    new THREE.MeshStandardMaterial({ color: '#8b5e3c', roughness: 1 }),
  );
  soil.position.y = -1.001;
  scene.add(soil);

  return {
    ground,
    // Keep things on the field.
    clamp(position, margin = 0.5) {
      const half = size / 2 - margin;
      position.x = THREE.MathUtils.clamp(position.x, -half, half);
      position.z = THREE.MathUtils.clamp(position.z, -half, half);
    },
  };
}
