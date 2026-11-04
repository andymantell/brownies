import RAPIER from 'rapier'

// Realistic physics, using a physics library called Rapier (rapier.rs).
//
// Our simple physics (physics.js) is great for jumping and bouncing. This one does the
// tricky stuff too: boxes knock each other over, towers topple, balls roll and spin.
//
//   const physics = await createRealisticPhysics()
//   physics.addFloor(60)
//   physics.addBox(crate, { width: 1, height: 1, depth: 1 })
//   physics.addBall(ball, { radius: 0.5, bounciness: 0.8 })
//   physics.addPusher(character.person) // so the character can knock things over
//
//   // and in the game loop:
//   physics.update(secondsPassed)
//
// It lives on its own (not in engine/index.js) because Rapier is a big download.
// Only games that import this file load it:
//   import { createRealisticPhysics } from './engine/realistic-physics.js'
//
// Rapier keeps its own pretend copy of the world. Each frame it works out where
// everything has moved to, and we copy that onto the things you can see.

const GRAVITY = 20 // the same as our simple physics, so things feel the same

export async function createRealisticPhysics({ gravity = GRAVITY } = {}) {
  await RAPIER.init() // Rapier needs a moment to wake up the first time

  const world = new RAPIER.World({ x: 0, y: -gravity, z: 0 })

  // Everything Rapier moves, paired with the thing you can see.
  const movingThings = []
  const pushers = []

  return {
    // A flat floor at height 0, this many blocks across. Things fall off the edges.
    addFloor(size) {
      const floor = RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.5, 0)
      const body = world.createRigidBody(floor)
      const shape = RAPIER.ColliderDesc.cuboid(size / 2, 0.5, size / 2)
      world.createCollider(shape, body)
    },

    // A box that falls, slides and topples. `object` is the box you can see.
    // The settings are all optional:
    //   bounciness: 0 lands with a thud, 1 bounces back as high as it fell
    //   slipperiness: 0 is grippy like rubber, 1 slides like ice
    //   heaviness: how heavy it is for its size (1 is like wood, 8 is like iron)
    //   fixed: true makes it stay put, like a wall or a block in the block world
    addBox(object, { width = 1, height = 1, depth = 1, ...settings } = {}) {
      const shape = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
      return addThing(object, shape, { bounciness: 0.1, ...settings })
    },

    // A ball that rolls and bounces. It has the same settings as a box.
    addBall(object, { radius = 0.5, ...settings } = {}) {
      const shape = RAPIER.ColliderDesc.ball(radius)
      return addThing(object, shape, { bounciness: 0.6, ...settings })
    },

    // Something that pushes other things out of the way, but isn't pushed back,
    // like the character walking into a tower of boxes.
    // It's a tall round shape, standing on the ground where `object` is.
    addPusher(object, { radius = 0.4, height = 2 } = {}) {
      const halfOfTheStraightBit = height / 2 - radius
      const start = RAPIER.RigidBodyDesc.kinematicPositionBased()
      const body = world.createRigidBody(start)
      const shape = RAPIER.ColliderDesc.capsule(halfOfTheStraightBit, radius).setTranslation(0, height / 2, 0)
      world.createCollider(shape, body)
      pushers.push({ object, body })
    },

    // Call this every frame.
    update(secondsPassed) {
      // Tell Rapier where the pushers have walked to.
      for (const pusher of pushers) {
        pusher.body.setNextKinematicTranslation(pusher.object.position)
      }

      // Move the pretend world on.
      world.timestep = Math.max(secondsPassed, 1 / 1000)
      world.step()

      // Copy where everything ended up onto the things you can see.
      for (const thing of movingThings) {
        const place = thing.body.translation()
        const turn = thing.body.rotation()
        thing.object.position.set(place.x, place.y, place.z)
        thing.object.quaternion.set(turn.x, turn.y, turn.z, turn.w)
      }
    },
  }

  function addThing(object, shape, { bounciness, slipperiness = 0.4, heaviness = 1, fixed = false }) {
    let start = RAPIER.RigidBodyDesc.dynamic()
    if (fixed) {
      start = RAPIER.RigidBodyDesc.fixed()
    }

    const where = object.position
    const turn = object.quaternion
    start.setTranslation(where.x, where.y, where.z)
    start.setRotation({ x: turn.x, y: turn.y, z: turn.z, w: turn.w })
    const body = world.createRigidBody(start)

    // Rapier calls slipperiness "friction", and does it the other way round: 0 is ice.
    shape.setRestitution(bounciness)
    shape.setFriction(1 - slipperiness)
    shape.setDensity(heaviness)
    world.createCollider(shape, body)

    const thing = { object, body }
    if (!fixed) {
      movingThings.push(thing)
    }

    function takeOut() {
      const place = movingThings.indexOf(thing)
      if (place !== -1) {
        movingThings.splice(place, 1)
      }
      world.removeRigidBody(body)
    }

    return makeControlsFor(body, takeOut)
  }
}

// The things you can do to something with realistic physics.
function makeControlsFor(body, takeOut) {
  return {
    // Give it a shove: across, up and back. Heavier shoves move it further.
    throw(across, up, back) {
      const mass = body.mass()
      body.applyImpulse({ x: across * mass, y: up * mass, z: back * mass }, true)
    },

    // Make it spin.
    spin(howFast) {
      body.setAngvel({ x: 0, y: howFast, z: 0 }, true)
    },

    // Is it moving right now?
    isMoving() {
      const speed = body.linvel()
      return Math.hypot(speed.x, speed.y, speed.z) > 0.05
    },

    // Take it out of the physics world (it stays where it is on screen).
    remove() {
      takeOut()
    },
  }
}
