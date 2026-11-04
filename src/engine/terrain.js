// Builds a floating island of blocks, with gentle hills.
//
//   buildIsland(blocks, { size: 60, hilliness: 4, flatInTheMiddle: 10 })
//
// size: how many blocks across
// hilliness: how tall the hills get, in blocks (0 for completely flat)
// flatInTheMiddle: how far from the middle stays flat (so there's room to play)

const DEPTH_OF_DIRT = 2 // how many blocks of dirt under the grass
const BOTTOM = -4 // the height of the bedrock at the bottom of the island

export function buildIsland(blocks, { size, hilliness = 0, flatInTheMiddle = 0 }) {
  const half = size / 2
  const hills = makeHillShape()

  for (let x = -half; x < half; x++) {
    for (let z = -half; z < half; z++) {
      const height = howHighIsTheGround(x, z, hills, hilliness, flatInTheMiddle)
      buildColumn(blocks, x, z, height)
    }
  }
}

// Stack up one column of blocks: bedrock, then stone, then dirt, then grass on top.
// `height` is where the top of the grass is. 0 is the normal ground level.
function buildColumn(blocks, x, z, height) {
  const grassLevel = height - 1

  for (let y = BOTTOM; y <= grassLevel; y++) {
    let type = 'stone'

    if (y === BOTTOM) {
      type = 'bedrock'
    } else if (y === grassLevel) {
      type = 'grass'
    } else if (y >= grassLevel - DEPTH_OF_DIRT) {
      type = 'dirt'
    }

    blocks.put(x, y, z, type)
  }
}

// A random hill shape, made by adding some wavy lines together.
// It's different every time you load the game.
function makeHillShape() {
  const waves = []

  for (let number = 0; number < 3; number++) {
    waves.push({
      stretchAcross: 0.05 + Math.random() * 0.12,
      stretchBack: 0.05 + Math.random() * 0.12,
      shiftAcross: Math.random() * 100,
      shiftBack: Math.random() * 100,
    })
  }

  return waves
}

function howHighIsTheGround(x, z, waves, hilliness, flatInTheMiddle) {
  // Add up the waves. This gives a number roughly between 0 and 1.
  let bumpiness = 0
  for (const wave of waves) {
    const across = Math.sin(x * wave.stretchAcross + wave.shiftAcross)
    const back = Math.sin(z * wave.stretchBack + wave.shiftBack)
    bumpiness += (across * back + 1) / 2 / waves.length
  }

  // Squash the hills down near the middle, so the middle is flat.
  const distanceFromMiddle = Math.hypot(x, z)
  const howFarPastFlat = distanceFromMiddle - flatInTheMiddle
  const hillStrength = Math.min(Math.max(howFarPastFlat / 8, 0), 1)

  // Only the bumpiest bits become hills, so there are flat valleys between them.
  const hillHeight = Math.max((bumpiness - 0.4) / 0.35, 0)
  return Math.round(hillHeight * hilliness * hillStrength)
}
