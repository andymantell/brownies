import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// Loading 3D models made in other programs, like Blender.
// They're saved as ".glb" files in the models folder.

const loader = new GLTFLoader()

// Load a model and give it back, ready to put in the world.
//   const toadstool = await loadModel('models/toadstool.glb')
export async function loadModel(path) {
  // The path starts from the game's main folder (two folders up from this file).
  const address = new URL('../../' + path, import.meta.url)
  const file = await loader.loadAsync(address.href)
  const model = file.scene

  // Every part of the model makes shadows, and can have shadows fall on it.
  model.traverse((part) => {
    if (part.isMesh) {
      part.castShadow = true
      part.receiveShadow = true
    }
  })

  return model
}
