import * as THREE from 'three'

// Sets up the screen: the renderer (draws the picture), the scene (holds everything),
// the camera (where we look from) and the lights.

// The camera floats up in a corner looking down at an angle. That's what makes it "isometric".
const CAMERA_DISTANCE = new THREE.Vector3(20, 20, 20)
const SUN_DISTANCE = new THREE.Vector3(8, 16, 5)

export function createScreen(canvas, settings) {
  const { skyColour, zoom, cameraFollowSpeed, sunColour, sunStrength } = settings

  const renderer = createRenderer(canvas)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(skyColour)

  // "Orthographic" means far-away things don't get smaller. That's the isometric look.
  const camera = new THREE.OrthographicCamera()
  camera.position.copy(CAMERA_DISTANCE)
  camera.lookAt(0, 0, 0)

  addSkyLight(scene)
  const sun = addSun(scene, sunColour, sunStrength)

  let currentZoom = zoom // grows when we zoom out to fit two players in
  fitCameraToWindow(camera, renderer, currentZoom)
  window.addEventListener('resize', () => {
    fitCameraToWindow(camera, renderer, currentZoom)
  })

  const lookingAt = new THREE.Vector3()

  return {
    scene,
    camera,
    canvas,

    // Put something into the world so we can see it.
    add(thing) {
      scene.add(thing)
    },

    // Glide the camera (and the sun) towards a position.
    follow(position, secondsPassed) {
      const catchUp = Math.min(cameraFollowSpeed * secondsPassed, 1)
      lookingAt.lerp(position, catchUp)

      camera.position.copy(lookingAt).add(CAMERA_DISTANCE)
      camera.lookAt(lookingAt)

      // The sun moves too, so there are always shadows near whatever we follow.
      sun.position.copy(lookingAt).add(SUN_DISTANCE)
      sun.target.position.copy(lookingAt)
    },

    // Keep two players in view: look at the spot halfway between them,
    // and zoom out if they walk far apart (then back in when they come together).
    followBoth(firstPosition, secondPosition, secondsPassed) {
      const halfway = new THREE.Vector3().lerpVectors(firstPosition, secondPosition, 0.5)
      this.follow(halfway, secondsPassed)

      const wantedZoom = zoomToFitBoth(camera, firstPosition, secondPosition, zoom)
      const catchUp = Math.min(cameraFollowSpeed * secondsPassed, 1)
      currentZoom += (wantedZoom - currentZoom) * catchUp
      fitCameraToWindow(camera, renderer, currentZoom)
    },

    // Draw one new picture of the world.
    draw() {
      renderer.render(scene, camera)
    },
  }
}

function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap // soft-edged shadows
  renderer.toneMapping = THREE.ACESFilmicToneMapping // nicer, film-like colours
  return renderer
}

// Soft light from all around: blue-ish from the sky above, green-ish bouncing up off the grass.
function addSkyLight(scene) {
  scene.add(new THREE.HemisphereLight('#dff3ff', '#5a7d3a', 1.2))
}

// The sun: a bright light from one direction that makes shadows.
function addSun(scene, colour, strength) {
  const sun = new THREE.DirectionalLight(colour, strength)
  sun.position.copy(SUN_DISTANCE)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048) // shadow sharpness
  sun.shadow.camera.left = -20 // how big an area gets shadows
  sun.shadow.camera.right = 20
  sun.shadow.camera.top = 20
  sun.shadow.camera.bottom = -20
  sun.shadow.bias = -0.0005 // stops stripy shadow glitches
  scene.add(sun)
  scene.add(sun.target)
  return sun
}

// How far out we need to zoom so two things both fit on the screen, with some space round the edges.
// It never zooms in closer than `normalZoom`.
function zoomToFitBoth(camera, firstPosition, secondPosition, normalZoom) {
  const spaceRoundTheEdges = 8
  const gap = new THREE.Vector3().subVectors(firstPosition, secondPosition)

  // How far apart they look on the screen: across, and up-and-down.
  const screenAcross = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
  const screenUp = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1)
  const apartAcross = Math.abs(gap.dot(screenAcross))
  const apartUpAndDown = Math.abs(gap.dot(screenUp))

  const windowShape = window.innerWidth / window.innerHeight
  const zoomForAcross = (apartAcross + spaceRoundTheEdges) / windowShape
  const zoomForUpAndDown = apartUpAndDown + spaceRoundTheEdges
  return Math.max(normalZoom, zoomForAcross, zoomForUpAndDown)
}

// Make the picture fill the window without stretching. `zoom` is how much of the world fits top-to-bottom.
function fitCameraToWindow(camera, renderer, zoom) {
  const width = window.innerWidth
  const height = window.innerHeight
  const viewWidth = zoom * (width / height)

  camera.left = -viewWidth / 2
  camera.right = viewWidth / 2
  camera.top = zoom / 2
  camera.bottom = -zoom / 2
  camera.near = 0.1
  camera.far = 200
  camera.updateProjectionMatrix()

  renderer.setSize(width, height, false)
}
