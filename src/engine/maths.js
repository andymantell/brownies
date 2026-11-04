import * as THREE from 'three'

// Handy maths for moving things around.
// A "direction" is an arrow pointing along the ground. Length 0 means "stay still".

// A direction that goes nowhere. Add other directions to it to build one up.
export function stillDirection() {
  return new THREE.Vector3(0, 0, 0)
}

// The direction from one place to another, and how far away it is.
export function directionFromTo(from, to) {
  const arrow = new THREE.Vector3(to.x - from.x, 0, to.z - from.z)
  const distance = arrow.length()
  return { direction: arrow.normalize(), distance }
}

// Which way a direction points, as an angle (to turn something to face it).
export function angleOf(direction) {
  return Math.atan2(direction.x, direction.z)
}

// The spot a certain distance in front of something facing a certain angle.
export function spotInFront(position, facingAngle, distance) {
  return {
    x: position.x + Math.sin(facingAngle) * distance,
    y: position.y,
    z: position.z + Math.cos(facingAngle) * distance,
  }
}

// Turn a little bit from one angle towards another, going the short way round.
// (Angles are in "radians": a full circle is about 6.28, which is 2 × π.)
export function turnTowards(currentAngle, wantedAngle, howMuch) {
  const fullCircle = Math.PI * 2
  let difference = wantedAngle - currentAngle

  // If it's more than half a circle, it's quicker to turn the other way.
  while (difference > Math.PI) {
    difference -= fullCircle
  }
  while (difference < -Math.PI) {
    difference += fullCircle
  }

  const turnAmount = Math.min(howMuch, 1) // never turn further than we wanted
  return currentAngle + difference * turnAmount
}

// Stop a position going outside a square centred in the middle of the world.
export function keepInsideSquare(position, halfWidth) {
  position.x = keepBetween(position.x, -halfWidth, halfWidth)
  position.z = keepBetween(position.z, -halfWidth, halfWidth)
}

// If a number is too small or too big, move it back to the nearest edge.
function keepBetween(number, smallest, biggest) {
  const notTooSmall = Math.max(number, smallest)
  const notTooBig = Math.min(notTooSmall, biggest)
  return notTooBig
}

// A random number somewhere between two numbers, like 10.7 between 10 and 15.
export function randomNumberBetween(smallest, biggest) {
  return smallest + Math.random() * (biggest - smallest)
}

// Pick one thing from a list, at random.
export function pickAtRandom(list) {
  const position = Math.floor(Math.random() * list.length)
  return list[position]
}
