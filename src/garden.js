import { config } from './config.js'
import { makeBox, makeGroup } from './engine/index.js'

// A flower garden, with blocky flowers like in a block-building game.

export function createGarden(screen) {
  // A group holds all the flowers together, so we can move the garden as one.
  const garden = makeGroup()
  garden.position.set(config.garden.x, 0, config.garden.z)

  const soil = makeSoil(config.garden.size)
  garden.add(soil)

  const flower = makeFlower(config.garden.petalColour)
  garden.add(flower)

  screen.add(garden)

  return { garden }
}

// A flat patch of brown soil, for the flowers to grow in.
function makeSoil(size) {
  const soil = makeBox({ width: size, height: 0.1, depth: size, colour: config.garden.soilColour })
  soil.position.y = 0.05
  return soil
}

// One flower: a green stem, with petals around a yellow middle on top.
function makeFlower(petalColour) {
  const flower = makeGroup()

  const stem = makeBox({ width: 0.12, height: 0.8, depth: 0.12, colour: '#3a8f3a' })
  stem.position.y = 0.4
  flower.add(stem)

  const leaf = makeBox({ width: 0.3, height: 0.08, depth: 0.12, colour: '#3a8f3a' })
  leaf.position.set(0.15, 0.35, 0)
  flower.add(leaf)

  const middle = makeBox({ width: 0.2, height: 0.2, depth: 0.2, colour: '#ffd23f' })
  middle.position.y = 0.9
  flower.add(middle)

  // Four petals: in front, behind, left and right of the middle.
  addPetal(flower, { x: 0, z: 0.2, colour: petalColour })
  addPetal(flower, { x: 0, z: -0.2, colour: petalColour })
  addPetal(flower, { x: -0.2, z: 0, colour: petalColour })
  addPetal(flower, { x: 0.2, z: 0, colour: petalColour })

  return flower
}

// One petal, next to the middle of the flower.
function addPetal(flower, { x, z, colour }) {
  const petal = makeBox({ width: 0.2, height: 0.16, depth: 0.2, colour })
  petal.position.set(x, 0.9, z)
  flower.add(petal)
}
