import * as THREE from 'three'
import { randomNumberBetween, pickAtRandom } from './maths.js'

// ✨ Particles: lots of tiny pieces that fly out, float or fall, then disappear.
//
// Make the helper once:
//   const particles = makeParticles(screen)
//
// Call this every frame in the game loop, so the pieces move:
//   particles.update(secondsPassed)
//
// Then one line makes an effect, anywhere you like:
//   particles.burst('sparkles', character.position)
//   particles.burst('crumbs', { x: 2, y: 0, z: 3 }, 'brown')
//
// Or keep an effect going, like a campfire:
//   const campfire = particles.keepGoing('fire', { x: 3, y: 0, z: 3 })

// Each style says how its pieces look and move. Copy one to make a new style!
//   howMany        how many pieces in one burst
//   size           how big each piece is (1 is the size of a block)
//   colours        each piece picks one of these at random
//   lastsFor       how many seconds before a piece disappears
//   upwardsSpeed   how fast pieces shoot up at the start: [slowest, fastest]
//   sidewaysSpeed  how fast pieces spread out to the sides
//   gravity        how strongly pieces are pulled down (less than 0 makes them float up)
//   endSize        how big a piece is when it disappears (0.1 shrinks, 3 grows)
//   fades          do pieces turn see-through as they get old?
//   glows          do pieces shine, even in the shade?
//   spins          do pieces tumble round as they fly?
//   flat           are pieces flat, like paper, instead of cubes?
export const PARTICLE_STYLES = {
  sparkles: {
    howMany: 20,
    size: 0.16,
    colours: ['#ffe14a', '#ffb703', '#ffffff'],
    lastsFor: 1,
    upwardsSpeed: [1, 3],
    sidewaysSpeed: 1.5,
    gravity: -1,
    endSize: 0.1,
    fades: false,
    glows: true,
    spins: true,
    flat: false,
  },

  smoke: {
    howMany: 16,
    size: 0.3,
    colours: ['#9a9a9a', '#b8b8b8', '#7d7d7d'],
    lastsFor: 2,
    upwardsSpeed: [0.6, 1.2],
    sidewaysSpeed: 0.4,
    gravity: -0.3,
    endSize: 3,
    fades: true,
    glows: false,
    spins: false,
    flat: false,
  },

  splash: {
    howMany: 14,
    size: 0.14,
    colours: ['#4aa8ff', '#8fd0ff', '#2f7fd8'],
    lastsFor: 0.9,
    upwardsSpeed: [3, 6],
    sidewaysSpeed: 2,
    gravity: 14,
    endSize: 0.6,
    fades: false,
    glows: false,
    spins: false,
    flat: false,
  },

  confetti: {
    howMany: 30,
    size: 0.2,
    colours: ['#ff4d6d', '#ffd23f', '#3ec300', '#3a86ff', '#b15cff'],
    lastsFor: 2.5,
    upwardsSpeed: [4, 7],
    sidewaysSpeed: 2.5,
    gravity: 5,
    endSize: 1,
    fades: false,
    glows: false,
    spins: true,
    flat: true,
  },

  fire: {
    howMany: 24,
    size: 0.28,
    colours: ['#ff3d00', '#ff8a00', '#ffd000'],
    lastsFor: 0.8,
    upwardsSpeed: [1.5, 3],
    sidewaysSpeed: 0.4,
    gravity: -2,
    endSize: 0.1,
    fades: true,
    glows: true,
    spins: true,
    flat: false,
  },

  // The same as the crumbs that fly out when a block breaks.
  crumbs: {
    howMany: 10,
    size: 0.18,
    colours: ['#8b5a2b'],
    lastsFor: 0.8,
    upwardsSpeed: [2, 5],
    sidewaysSpeed: 2,
    gravity: 12,
    endSize: 0.01,
    fades: false,
    glows: false,
    spins: false,
    flat: false,
  },
}

const cubeShape = new THREE.BoxGeometry(1, 1, 1)
const flatShape = new THREE.BoxGeometry(1, 0.1, 1)

export function makeParticles(screen) {
  let flyingPieces = []
  let keepGoingEffects = [] // effects that make a new burst every so often, like a campfire

  const particles = {
    // Make a burst of pieces in one of the styles, at a spot { x, y, z }.
    // `colour` is optional: give one to use it instead of the style's colours.
    // It gives back the pieces it made, in case you want to move them yourself.
    burst(styleName, spot, colour) {
      const style = PARTICLE_STYLES[styleName]
      if (!style) {
        const allNames = Object.keys(PARTICLE_STYLES).join(', ')
        throw new Error(`There's no particle style called "${styleName}". Try one of: ${allNames}`)
      }

      const madePieces = []
      for (let number = 0; number < style.howMany; number++) {
        const piece = makePiece(style, colour)
        piece.mesh.position.set(
          spot.x + randomNumberBetween(-0.3, 0.3),
          spot.y + 0.5 + randomNumberBetween(-0.3, 0.3),
          spot.z + randomNumberBetween(-0.3, 0.3),
        )
        screen.scene.add(piece.mesh)
        flyingPieces.push(piece)
        madePieces.push(piece)
      }
      return madePieces
    },

    // Keep making bursts at a spot, again and again, until you call stop() on it.
    // Good for a campfire, a smoking chimney or a fountain:
    //   const campfire = particles.keepGoing('fire', { x: 3, y: 0, z: 3 })
    //   campfire.stop()
    keepGoing(styleName, spot, secondsBetweenBursts = 0.15) {
      const effect = {
        styleName,
        spot,
        secondsBetweenBursts,
        secondsUntilNextBurst: 0,
        stop() {
          keepGoingEffects = keepGoingEffects.filter((other) => {
            return other !== effect
          })
        },
      }
      keepGoingEffects.push(effect)
      return effect
    },

    // Move every piece a little. Call this every frame.
    update(secondsPassed) {
      for (const effect of keepGoingEffects) {
        effect.secondsUntilNextBurst -= secondsPassed
        if (effect.secondsUntilNextBurst <= 0) {
          particles.burst(effect.styleName, effect.spot)
          effect.secondsUntilNextBurst = effect.secondsBetweenBursts
        }
      }

      for (const piece of flyingPieces) {
        movePiece(piece, secondsPassed)

        if (piece.age > piece.style.lastsFor) {
          screen.scene.remove(piece.mesh)
          piece.mesh.material.dispose()
        }
      }

      flyingPieces = flyingPieces.filter((piece) => {
        return piece.age <= piece.style.lastsFor
      })
    },

    // How many pieces are flying about right now? (Handy for tests.)
    howManyAreFlying() {
      return flyingPieces.length
    },

    // Where are all the pieces? Gives back a list of { x, y, z }. (Handy for tests.)
    whereAreThePieces() {
      return flyingPieces.map((piece) => {
        const position = piece.mesh.position
        return { x: position.x, y: position.y, z: position.z }
      })
    },
  }

  return particles
}

// Make one piece: its look, plus how fast it's going and how old it is.
function makePiece(style, colour) {
  let pickedColour = colour
  if (!pickedColour) {
    pickedColour = pickAtRandom(style.colours)
  }

  let paint
  if (style.glows) {
    paint = new THREE.MeshBasicMaterial({ color: pickedColour })
  } else {
    paint = new THREE.MeshStandardMaterial({ color: pickedColour })
  }
  paint.transparent = style.fades

  let shape = cubeShape
  if (style.flat) {
    shape = flatShape
  }

  const mesh = new THREE.Mesh(shape, paint)
  mesh.castShadow = !style.glows
  mesh.scale.setScalar(style.size)

  const speed = new THREE.Vector3(
    randomNumberBetween(-style.sidewaysSpeed, style.sidewaysSpeed),
    randomNumberBetween(style.upwardsSpeed[0], style.upwardsSpeed[1]),
    randomNumberBetween(-style.sidewaysSpeed, style.sidewaysSpeed),
  )

  const spinSpeed = new THREE.Vector3(
    randomNumberBetween(-8, 8),
    randomNumberBetween(-8, 8),
    randomNumberBetween(-8, 8),
  )

  return { mesh, style, speed, spinSpeed, age: 0 }
}

// Move one piece for a moment: it flies, falls (or floats), grows or shrinks, and fades.
function movePiece(piece, secondsPassed) {
  const style = piece.style
  piece.age += secondsPassed

  // Gravity pulls it down, a bit more every moment.
  piece.speed.y -= style.gravity * secondsPassed
  piece.mesh.position.addScaledVector(piece.speed, secondsPassed)

  // Confetti flutters: the air slows it down so it drifts.
  if (style.flat) {
    piece.speed.multiplyScalar(1 - 2 * secondsPassed)
  }

  if (style.spins) {
    piece.mesh.rotation.x += piece.spinSpeed.x * secondsPassed
    piece.mesh.rotation.y += piece.spinSpeed.y * secondsPassed
    piece.mesh.rotation.z += piece.spinSpeed.z * secondsPassed
  }

  // How far through its life is it? 0 at the start, 1 at the end.
  const howOld = Math.min(piece.age / style.lastsFor, 1)

  const sizeNow = style.size * (1 + (style.endSize - 1) * howOld)
  piece.mesh.scale.setScalar(Math.max(sizeNow, 0.001))

  if (style.fades) {
    piece.mesh.material.opacity = 1 - howOld
  }
}
