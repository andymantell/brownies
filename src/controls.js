import * as THREE from 'three';

// Turns keyboard presses and taps into "which way should the character walk?"

const KEYS = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
};

export function createControls({ canvas, camera, scene }) {
  const held = new Set();
  window.addEventListener('keydown', (e) => {
    held.add(e.code);
    if (e.code.startsWith('Arrow')) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => held.delete(e.code));
  window.addEventListener('blur', () => held.clear());
  const isDown = (name) => KEYS[name].some((code) => held.has(code));

  // Tap / click on the grass to walk there.
  let target = null;
  const marker = createMarker(scene);
  const raycaster = new THREE.Raycaster();
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const pointer = new THREE.Vector2();

  canvas.addEventListener('pointerdown', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(floor, hit)) {
      target = hit;
      marker.show(hit);
    }
  });

  // "Up" on the keyboard means "away from the camera", whichever way the camera points.
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const direction = new THREE.Vector3();

  return {
    // Returns a direction on the ground for the character to walk in.
    getDirection(characterPosition, dt) {
      marker.update(dt);

      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, camera.up).normalize();

      direction.set(0, 0, 0);
      if (isDown('up')) direction.add(forward);
      if (isDown('down')) direction.sub(forward);
      if (isDown('right')) direction.add(right);
      if (isDown('left')) direction.sub(right);

      if (direction.lengthSq() > 0) {
        target = null; // keyboard wins over tapping
        marker.hide();
        return direction.normalize();
      }

      if (target) {
        direction.subVectors(target, characterPosition).setY(0);
        if (direction.length() < 0.1) {
          target = null;
          marker.hide();
          return direction.set(0, 0, 0);
        }
        return direction.normalize();
      }

      return direction;
    },
  };
}

// A little ring that shows where you tapped.
function createMarker(scene) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.3, 0.42, 32),
    new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  scene.add(ring);
  let t = 0;

  return {
    show(position) {
      ring.position.set(position.x, 0.02, position.z);
      ring.visible = true;
      t = 0;
    },
    hide() {
      ring.visible = false;
    },
    update(dt) {
      if (!ring.visible) return;
      t += dt;
      ring.scale.setScalar(1 + Math.sin(t * 6) * 0.1);
    },
  };
}
