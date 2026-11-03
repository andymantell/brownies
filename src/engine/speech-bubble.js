import * as THREE from 'three'

// A speech bubble that floats above something in the world, like a comic.
//   const bubble = makeSpeechBubble(screen)
//   bubble.say('Hello!')
//   bubble.stayAbove(character.position, 2.6)   (every frame)
//   bubble.hide()

export function makeSpeechBubble(screen) {
  loadStyles()

  const bubble = document.createElement('div')
  bubble.className = 'speech-bubble'
  document.body.append(bubble)

  const spotAboveHead = new THREE.Vector3()

  return {
    // Show the bubble with some words in it.
    say(text) {
      bubble.textContent = text
      bubble.classList.add('showing')
    },

    // Tuck the bubble away again.
    hide() {
      bubble.classList.remove('showing')
    },

    // Move the bubble so it sits above a spot in the world.
    stayAbove(position, heightAboveGround) {
      spotAboveHead.set(position.x, position.y + heightAboveGround, position.z)

      // Work out where that spot is on the screen, in pixels.
      screen.camera.updateMatrixWorld()
      const onScreen = spotAboveHead.project(screen.camera)
      const pixelsAcross = ((onScreen.x + 1) / 2) * window.innerWidth
      const pixelsDown = ((1 - onScreen.y) / 2) * window.innerHeight

      bubble.style.left = `${pixelsAcross}px`
      bubble.style.top = `${pixelsDown}px`
    },
  }
}

function loadStyles() {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = new URL('./speech-bubble.css', import.meta.url).href
  document.head.append(link)
}
