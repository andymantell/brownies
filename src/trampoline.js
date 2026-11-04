import { config } from './config.js'
import { makeBox, makeGroup, areaUnder, isInsideRectangle } from './engine/index.js'

// A trampoline on the deck of the yacht. Stand on it and BOING, up you go!
// It's a bouncy black mat, with a blue frame round the edge and four little legs.

const SIZE = 2.4 // from side to side
const LEG_HEIGHT = 0.3
const FRAME_THICKNESS = 0.2

export function createTrampoline(screen) {
  const colours = config.trampoline

  // A group holds all the parts, so we can move the whole trampoline as one.
  const trampoline = makeGroup()
  trampoline.position.set(colours.x, colours.y, colours.z)

  // Four little legs, one at each corner.
  addLeg(trampoline, -SIZE / 2 + 0.15, -SIZE / 2 + 0.15)
  addLeg(trampoline, SIZE / 2 - 0.15, -SIZE / 2 + 0.15)
  addLeg(trampoline, -SIZE / 2 + 0.15, SIZE / 2 - 0.15)
  addLeg(trampoline, SIZE / 2 - 0.15, SIZE / 2 - 0.15)

  // The frame: four bars making a square.
  addFrameBar(trampoline, { x: 0, z: -SIZE / 2, width: SIZE, depth: FRAME_THICKNESS })
  addFrameBar(trampoline, { x: 0, z: SIZE / 2, width: SIZE, depth: FRAME_THICKNESS })
  addFrameBar(trampoline, { x: -SIZE / 2, z: 0, width: FRAME_THICKNESS, depth: SIZE })
  addFrameBar(trampoline, { x: SIZE / 2, z: 0, width: FRAME_THICKNESS, depth: SIZE })

  // The bouncy mat in the middle.
  const mat = makeBox({ width: SIZE - 0.1, height: 0.05, depth: SIZE - 0.1, colour: colours.matColour })
  mat.position.y = LEG_HEIGHT + FRAME_THICKNESS / 2
  trampoline.add(mat)

  screen.add(trampoline)

  const area = areaUnder(trampoline)
  const top = colours.y + LEG_HEIGHT + FRAME_THICKNESS

  // Is someone standing right on top of the trampoline?
  function isStandingOn(position) {
    const isOverTheMat = isInsideRectangle(position, area, 0)
    const isOnTop = Math.abs(position.y - top) < 0.1
    return isOverTheMat && isOnTop
  }

  return { trampoline, isStandingOn }
}

// One leg, holding up a corner.
function addLeg(trampoline, x, z) {
  const leg = makeBox({ width: 0.15, height: LEG_HEIGHT, depth: 0.15, colour: config.trampoline.legColour })
  leg.position.set(x, LEG_HEIGHT / 2, z)
  trampoline.add(leg)
}

// One bar of the frame, round the edge of the mat.
function addFrameBar(trampoline, { x, z, width, depth }) {
  const bar = makeBox({ width, height: FRAME_THICKNESS, depth, colour: config.trampoline.frameColour })
  bar.position.set(x, LEG_HEIGHT + FRAME_THICKNESS / 2, z)
  trampoline.add(bar)
}
