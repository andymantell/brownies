import * as THREE from 'three'

// Physics: things that fall, bounce, slide and land.
//
//   const physics = createPhysics(world)
//   const ball = physics.add(ballMesh, { bounciness: 0.7 })
//   ball.throw(3, 6, 0) // 3 across, 6 up, 0 back
//   ball.jump(2) // jump 2 blocks high
//
//   // and in the game loop:
//   physics.update(secondsPassed)
//
// `world` tells physics where the ground is. It needs:
//   groundHeightAt(x, z, height): how high the ground is under this spot
//     (-Infinity if there is no ground, so things fall off the edge)
// And if the world has walls, it can have this too:
//   isSolid(x, y, z): is there something solid at this spot?
//
// The block world (createBlockWorld) already has both.

// Lets physics land on more than one kind of ground, like the grass AND the top of a box.
//   const physics = createPhysics(groundMadeOf(world, solidThings))
export function groundMadeOf(...grounds) {
  return {
    groundHeightAt(x, z, height) {
      const heights = grounds.map((ground) => {
        return ground.groundHeightAt(x, z, height)
      })
      return Math.max(...heights)
    },
  }
}

const GRAVITY = 20 // how strongly things are pulled down
const FALLEN_OFF_THE_WORLD = -50 // below this height, things are gone for good
const STILL_ENOUGH = 0.5 // a bounce slower than this just stops, instead of jiggling forever

export function createPhysics(world, { gravity = GRAVITY } = {}) {
  let things = []

  return {
    // Give something physics. `object` is anything with a position, like a box or a person.
    //   bounciness: 0 lands with a thud, 1 bounces back up as high as it fell
    //   grip: how quickly it stops sliding along the ground (0 slides forever, like ice)
    //   radius: how far its sides stick out from its middle, for bumping into walls
    //   height: how tall it is, for bumping its head
    add(object, { bounciness = 0, grip = 8, radius = 0.3, height = 1 } = {}) {
      const thing = {
        object,
        position: object.position,
        speed: new THREE.Vector3(0, 0, 0),
        bounciness,
        grip,
        radius,
        height,
        onTheGround: false,
        gone: false,
      }
      things.push(thing)
      return makeControlsFor(thing, gravity)
    },

    // Call this every frame. It moves everything a tiny bit.
    update(secondsPassed) {
      for (const thing of things) {
        moveThing(thing, world, gravity, secondsPassed)
      }

      things = things.filter((thing) => {
        return !thing.gone
      })
    },
  }
}

// The things you can do to something with physics.
function makeControlsFor(thing, gravity) {
  return {
    object: thing.object,
    speed: thing.speed,

    // Give it a shove: add some speed across, up and back.
    throw(across, up, back) {
      thing.speed.x += across
      thing.speed.y += up
      thing.speed.z += back
      thing.onTheGround = false
    },

    // Jump this many blocks high. You can only jump from the ground.
    // Gives back true if it jumped.
    jump(howHigh) {
      if (!thing.onTheGround) {
        return false
      }

      // The speed you need to leave the ground at, to get exactly this high.
      thing.speed.y = Math.sqrt(2 * gravity * howHigh)
      thing.onTheGround = false
      return true
    },

    // Stop it dead.
    stop() {
      thing.speed.set(0, 0, 0)
    },

    isOnTheGround() {
      return thing.onTheGround
    },

    hasFallenOffTheWorld() {
      return thing.gone
    },

    // Stop doing physics on it (it stays where it is).
    remove() {
      thing.gone = true
    },
  }
}

function moveThing(thing, world, gravity, secondsPassed) {
  // Gravity pulls it down a bit faster every moment.
  thing.speed.y -= gravity * secondsPassed

  moveAcross(thing, world, secondsPassed)
  moveBack(thing, world, secondsPassed)
  moveUpOrDown(thing, world, secondsPassed)

  if (thing.onTheGround) {
    slowDownOnTheGround(thing, secondsPassed)
  }

  if (thing.position.y < FALLEN_OFF_THE_WORLD) {
    thing.gone = true
    thing.object.removeFromParent()
  }
}

// Move along x. If there's a wall in the way, bounce off it.
function moveAcross(thing, world, secondsPassed) {
  const step = thing.speed.x * secondsPassed
  if (step === 0) {
    return
  }

  const frontEdge = thing.position.x + step + Math.sign(step) * thing.radius
  if (isWallAt(world, frontEdge, thing.position.z, thing)) {
    thing.speed.x = -thing.speed.x * thing.bounciness
  } else {
    thing.position.x += step
  }
}

// Move along z. If there's a wall in the way, bounce off it.
function moveBack(thing, world, secondsPassed) {
  const step = thing.speed.z * secondsPassed
  if (step === 0) {
    return
  }

  const frontEdge = thing.position.z + step + Math.sign(step) * thing.radius
  if (isWallAt(world, thing.position.x, frontEdge, thing)) {
    thing.speed.z = -thing.speed.z * thing.bounciness
  } else {
    thing.position.z += step
  }
}

// Move up or down. Land on the ground, and bump your head on ceilings.
function moveUpOrDown(thing, world, secondsPassed) {
  const step = thing.speed.y * secondsPassed
  const ground = world.groundHeightAt(thing.position.x, thing.position.z, thing.position.y)

  // Going up: is there anything above our head?
  if (step > 0 && world.isSolid) {
    const topOfHead = thing.position.y + thing.height + step
    if (world.isSolid(thing.position.x, topOfHead, thing.position.z)) {
      thing.speed.y = 0 // bonk!
      return
    }
  }

  const newHeight = thing.position.y + step

  if (newHeight > ground) {
    // Still in the air.
    thing.position.y = newHeight
    thing.onTheGround = false
    return
  }

  // We've hit the ground.
  thing.position.y = ground
  const bounceSpeed = -thing.speed.y * thing.bounciness

  if (bounceSpeed > STILL_ENOUGH) {
    thing.speed.y = bounceSpeed
    thing.onTheGround = false
  } else {
    thing.speed.y = 0
    thing.onTheGround = true
  }
}

// Rubbing along the ground slows things down, like a ball rolling on grass.
function slowDownOnTheGround(thing, secondsPassed) {
  const slowDown = Math.max(1 - thing.grip * secondsPassed, 0)
  thing.speed.x *= slowDown
  thing.speed.z *= slowDown
}

// Is there a wall here? Something solid just above the feet counts as a wall,
// and so does ground that's higher than the feet.
function isWallAt(world, x, z, thing) {
  if (world.isSolid) {
    const justAboveFeet = thing.position.y + 0.1
    if (world.isSolid(x, justAboveFeet, z)) {
      return true
    }
  }

  const ground = world.groundHeightAt(x, z, thing.position.y)
  return ground > thing.position.y + 0.01
}
