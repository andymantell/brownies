import * as THREE from 'three'

// Paints the pictures that go on the sides of each kind of block.
// Each side is a tiny 16 × 16 picture of squares in slightly different shades,
// shown big and crisp so it looks chunky and blocky.

const PICTURE_SIZE = 16

// Make the look of every kind of block, ready to put on the screen.
// Gives back { grass: { faces, mainColour }, dirt: { ... }, ... }
export function makeBlockLooks(blockTypes) {
  const looks = {}

  for (const name of Object.keys(blockTypes)) {
    const type = blockTypes[name]
    looks[name] = makeOneBlockLook(type)
  }

  return looks
}

function makeOneBlockLook(type) {
  const sideColour = type.colour
  const topColour = type.top ?? type.colour
  const bottomColour = type.bottom ?? type.colour

  let sidePicture = paintSquares(sideColour)
  if (type.grassyEdges) {
    sidePicture = paintSquaresWithGrassyTop(sideColour, topColour)
  }
  const topPicture = paintSquares(topColour)
  const bottomPicture = paintSquares(bottomColour)

  // A box has 6 faces, and three.js wants them in this order:
  // right, left, top, bottom, front, back.
  const faces = [
    makePaint(sidePicture),
    makePaint(sidePicture),
    makePaint(topPicture),
    makePaint(bottomPicture),
    makePaint(sidePicture),
    makePaint(sidePicture),
  ]

  return { faces, mainColour: sideColour }
}

function makePaint(picture) {
  // vertexColors lets each block be a slightly different shade.
  return new THREE.MeshStandardMaterial({ map: picture, vertexColors: true })
}

// A square of little squares, all slightly different shades of one colour.
function paintSquares(colour) {
  const { canvas, pen } = makeBlankPicture()

  for (let x = 0; x < PICTURE_SIZE; x++) {
    for (let y = 0; y < PICTURE_SIZE; y++) {
      pen.fillStyle = slightlyDifferentShade(colour, 0.08)
      pen.fillRect(x, y, 1, 1)
    }
  }

  return turnIntoTexture(canvas)
}

// Like paintSquares, but with a wobbly strip of grass along the top.
function paintSquaresWithGrassyTop(colour, grassColour) {
  const { canvas, pen } = makeBlankPicture()

  for (let x = 0; x < PICTURE_SIZE; x++) {
    // Each column of squares has grass a random 2, 3 or 4 squares deep.
    const grassDepth = 2 + Math.floor(Math.random() * 3)

    for (let y = 0; y < PICTURE_SIZE; y++) {
      if (y < grassDepth) {
        pen.fillStyle = slightlyDifferentShade(grassColour, 0.08)
      } else {
        pen.fillStyle = slightlyDifferentShade(colour, 0.08)
      }
      pen.fillRect(x, y, 1, 1)
    }
  }

  return turnIntoTexture(canvas)
}

function makeBlankPicture() {
  const canvas = document.createElement('canvas')
  canvas.width = PICTURE_SIZE
  canvas.height = PICTURE_SIZE
  const pen = canvas.getContext('2d')
  return { canvas, pen }
}

function slightlyDifferentShade(colour, howDifferent) {
  const shade = new THREE.Color(colour)
  shade.offsetHSL(0, 0, (Math.random() - 0.5) * howDifferent)
  return '#' + shade.getHexString()
}

function turnIntoTexture(canvas) {
  const picture = new THREE.CanvasTexture(canvas)
  picture.colorSpace = THREE.SRGBColorSpace
  picture.magFilter = THREE.NearestFilter // keep the squares crisp, not blurry
  picture.minFilter = THREE.NearestFilter
  return picture
}
