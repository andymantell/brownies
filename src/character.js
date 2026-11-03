import * as THREE from 'three';
import { config } from './config.js';
import { makeBox, turnTowards } from './helpers.js';

// Our little hero, made entirely of boxes.

export function createCharacter(scene) {
  const c = config.character;
  const root = new THREE.Group();

  const body = makeBox({ width: 0.8, height: 0.9, depth: 0.5, colour: c.bodyColour });
  body.position.y = 1.15;
  root.add(body);

  const head = makeBox({ width: 0.7, height: 0.7, depth: 0.7, colour: c.headColour });
  head.position.y = 1.95;
  root.add(head);

  // Eyes go on the front of the head (+z is "forwards" for the character).
  for (const x of [-0.16, 0.16]) {
    const eye = makeBox({ width: 0.1, height: 0.14, depth: 0.05, colour: c.eyeColour });
    eye.position.set(x, 0.05, 0.36);
    head.add(eye);
  }

  // Arms and legs hang from a pivot at the top, so they swing like real limbs.
  function limb(x, y, colour, width, length) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    const box = makeBox({ width, height: length, depth: width, colour });
    box.position.y = -length / 2;
    pivot.add(box);
    root.add(pivot);
    return pivot;
  }
  const leftLeg = limb(-0.2, 0.7, c.legColour, 0.3, 0.7);
  const rightLeg = limb(0.2, 0.7, c.legColour, 0.3, 0.7);
  const leftArm = limb(-0.52, 1.55, c.armColour, 0.22, 0.75);
  const rightArm = limb(0.52, 1.55, c.armColour, 0.22, 0.75);

  scene.add(root);

  let walkTime = 0;
  let walkAmount = 0; // 0 = standing still, 1 = full walk

  return {
    object: root,
    position: root.position,

    // direction: a Vector3 on the ground (length 0 = stand still, 1 = full speed)
    update(dt, direction) {
      const moving = direction.lengthSq() > 0.0001;

      if (moving) {
        root.position.addScaledVector(direction, c.speed * dt);
        const facing = Math.atan2(direction.x, direction.z);
        root.rotation.y = turnTowards(root.rotation.y, facing, dt * 12);
      }

      // Blend between standing and walking so it never snaps.
      walkAmount = THREE.MathUtils.damp(walkAmount, moving ? 1 : 0, 10, dt);
      walkTime += dt * c.speed * 2;

      const swing = Math.sin(walkTime) * 0.7 * walkAmount;
      leftLeg.rotation.x = swing;
      rightLeg.rotation.x = -swing;
      leftArm.rotation.x = -swing;
      rightArm.rotation.x = swing;

      // A little bounce when walking, and gentle breathing when idle.
      const bounce = Math.abs(Math.sin(walkTime)) * 0.08 * walkAmount;
      const breathe = Math.sin(performance.now() / 600) * 0.015 * (1 - walkAmount);
      body.position.y = 1.15 + bounce + breathe;
      head.position.y = 1.95 + bounce + breathe * 1.5;
    },
  };
}
