import { makeBox } from '../engine/index.js'

// A tower of boxes for realistic physics to knock over.
// This is a spare part: it isn't plugged into the game yet. See README.md in this folder.
//
//   buildTowerOfBoxes(screen, physics, { x: 4, z: 0, howHigh: 6 })

const BOX_SIZE = 0.9
const COLOURS = ['#ff6b6b', '#ffd166', '#06d6a0', '#4dabf7', '#c77dff']

export function buildTowerOfBoxes(screen, physics, { x, z, howHigh = 6, howWide = 2 }) {
  const boxes = []

  for (let level = 0; level < howHigh; level++) {
    for (let across = 0; across < howWide; across++) {
      const colour = COLOURS[(level + across) % COLOURS.length]
      const box = makeBox({ width: BOX_SIZE, height: BOX_SIZE, depth: BOX_SIZE, colour })

      // A tiny gap between boxes, so they start off not squashed together.
      box.position.set(x + across * (BOX_SIZE + 0.02), BOX_SIZE / 2 + level * (BOX_SIZE + 0.01), z)
      screen.add(box)

      physics.addBox(box, { width: BOX_SIZE, height: BOX_SIZE, depth: BOX_SIZE })
      boxes.push(box)
    }
  }

  return boxes
}
