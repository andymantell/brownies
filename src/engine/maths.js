import * as THREE from 'three';

// Handy maths for moving things around.
// A "direction" is an arrow pointing along the ground. Length 0 means "stay still".

// A direction that goes nowhere. Add other directions to it to build one up.
export function stillDirection() {
  return new THREE.Vector3(0, 0, 0);
}

// The direction from one place to another, and how far away it is.
export function directionFromTo(from, to) {
  const arrow = new THREE.Vector3(to.x - from.x, 0, to.z - from.z);
  const distance = arrow.length();
  return { direction: arrow.normalize(), distance };
}

// Which way a direction points, as an angle (to turn something to face it).
export function angleOf(direction) {
  return Math.atan2(direction.x, direction.z);
}

// Turn a little bit from one angle towards another, going the short way round.
// (Angles are in "radians": a full circle is about 6.28, which is 2 × π.)
export function turnTowards(currentAngle, wantedAngle, howMuch) {
  const fullCircle = Math.PI * 2;
  let difference = wantedAngle - currentAngle;

  // If it's more than half a circle, it's quicker to turn the other way.
  while (difference > Math.PI) difference -= fullCircle;
  while (difference < -Math.PI) difference += fullCircle;

  return currentAngle + difference * Math.min(howMuch, 1);
}

// Stop a position going outside a square centred in the middle of the world.
export function keepInsideSquare(position, halfWidth) {
  position.x = Math.min(Math.max(position.x, -halfWidth), halfWidth);
  position.z = Math.min(Math.max(position.z, -halfWidth), halfWidth);
}
