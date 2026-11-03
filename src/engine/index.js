// 🔧 The engine room.
//
// Everything in this folder is the fiddly behind-the-scenes stuff: talking to three.js,
// drawing on the screen, reading the keyboard, a bit of maths.
// You don't need to read it to make the game. The files outside this folder use these
// helpers, and their names say what they do.

export { createScreen } from './screen.js'
export { startGameLoop } from './loop.js'
export { makeBox, makeGroup, makeSwingingBox } from './boxes.js'
export { makeSquaresPicture } from './pictures.js'
export { makeFlatGround } from './ground.js'
export { createKeyboard, onTapGround, SCREEN } from './input.js'
export { makeTapMarker } from './marker.js'
export { loadModel } from './models.js'
export { stillDirection, directionFromTo, angleOf, turnTowards, keepInsideSquare } from './maths.js'
