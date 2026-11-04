import * as THREE from 'three'

// A flat screen you can paint pictures on, like a little TV.
// Paint a new picture every frame and it looks like it's moving!
//
//   const tvScreen = makeDrawingScreen({ width: 1.6, height: 0.9 })
//   tvScreen.paint((brush) => {
//     brush.fillAll('skyblue')
//     brush.circle(50, 30, 10, 'yellow')
//   })
//
// The picture is 256 dots across and 144 dots down.
// Dot 0, 0 is the top left corner.
export function makeDrawingScreen({ width, height }) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 144
  const pen = canvas.getContext('2d')

  const picture = new THREE.CanvasTexture(canvas)
  picture.colorSpace = THREE.SRGBColorSpace

  // "Basic" paint ignores the lights, so the screen glows like a real TV.
  const paint = new THREE.MeshBasicMaterial({ map: picture })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(width, height), paint)

  // The brush has simple ways to paint shapes.
  const brush = {
    across: canvas.width,
    down: canvas.height,

    fillAll(colour) {
      pen.fillStyle = colour
      pen.fillRect(0, 0, canvas.width, canvas.height)
    },

    rectangle(x, y, width, height, colour) {
      pen.fillStyle = colour
      pen.fillRect(x, y, width, height)
    },

    circle(x, y, radius, colour) {
      pen.fillStyle = colour
      pen.beginPath()
      pen.arc(x, y, radius, 0, Math.PI * 2)
      pen.fill()
    },

    words(text, x, y, colour, size) {
      pen.fillStyle = colour
      pen.font = `bold ${size}px sans-serif`
      pen.fillText(text, x, y)
    },
  }

  return {
    screen,

    // Paint a new picture. `drawPicture` is given the brush to paint with.
    paint(drawPicture) {
      drawPicture(brush)
      picture.needsUpdate = true // tell three.js the picture has changed
    },
  }
}
