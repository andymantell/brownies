import * as THREE from 'three'

// Paint a picture of little squares in slightly different shades of one colour.
// Stick it on the ground and it looks like grass tiles instead of flat plastic.
export function makeSquaresPicture({ squaresAcross, colour, howDifferent = 0.04 }) {
  const canvas = document.createElement('canvas')
  canvas.width = squaresAcross
  canvas.height = squaresAcross
  const pen = canvas.getContext('2d')

  for (let x = 0; x < squaresAcross; x++) {
    for (let y = 0; y < squaresAcross; y++) {
      const shade = new THREE.Color(colour)
      shade.offsetHSL(0, 0, (Math.random() - 0.5) * howDifferent) // a bit lighter or darker

      pen.fillStyle = '#' + shade.getHexString()
      pen.fillRect(x, y, 1, 1)
    }
  }

  const picture = new THREE.CanvasTexture(canvas)
  picture.colorSpace = THREE.SRGBColorSpace
  picture.magFilter = THREE.NearestFilter // keep the squares crisp, not blurry
  return picture
}
