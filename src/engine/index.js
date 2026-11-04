// 🔧 The engine room.
//
// Everything in this folder is the fiddly behind-the-scenes stuff: talking to three.js,
// drawing on the screen, reading the keyboard, a bit of maths.
// You don't need to read it to make the game. The files outside this folder use these
// helpers, and their names say what they do.

export { createScreen } from './screen.js'
export { startGameLoop } from './loop.js'
export { makeBox, makeGroup, makeSwingingBox, makeSeeThrough } from './boxes.js'
export { makeSquaresPicture } from './pictures.js'
export { makeFlatGround } from './ground.js'
export { createKeyboard, createFinger, SCREEN } from './input.js'
export { makeTapMarker } from './marker.js'
export { loadModel } from './models.js'
export { makeSpeechBubble } from './speech-bubble.js'
export { createBlockWorld } from './block-world.js'
export { buildIsland } from './terrain.js'
export { findPath } from './pathfinding.js'
export { createPathWalker } from './path-walker.js'
export { makeParticles, PARTICLE_STYLES } from './particles.js'
export { makeLotsOfBoxes } from './lots-of-boxes.js'
export { createPhysics, groundMadeOf } from './physics.js'
export { makeFlippable } from './flipping.js'
export { createSolidThings } from './bumping.js'
export {
  stillDirection,
  directionFromTo,
  angleOf,
  spotInFront,
  turnTowards,
  keepInsideSquare,
  isInsideRectangle,
  randomNumberBetween,
  pickAtRandom,
} from './maths.js'
