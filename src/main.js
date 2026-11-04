import { config } from './config.js'
import { createScreen, startGameLoop } from './engine/index.js'
import { createWorld } from './world.js'
import { createCharacter } from './character.js'
import { createControls } from './controls.js'
import { createSpeech } from './speech.js'
import { createDuck } from './duck.js'
import { connectTests } from './engine/testing.js'
import { createTestSidebar } from './engine/test-sidebar.js'
import './tests.js'

// This is where the game starts. It builds everything, then runs the game loop.

// Put the game's name on the browser tab.
document.title = config.title

// Build everything.
const screen = createScreen(document.getElementById('game'), {
  skyColour: config.world.skyColour,
  zoom: config.camera.zoom,
  cameraFollowSpeed: config.camera.followSpeed,
  sunColour: config.sun.colour,
  sunStrength: config.sun.strength,
})
const world = createWorld(screen)
const character = createCharacter(screen, world)
const controls = createControls(screen, world)
const speech = createSpeech(screen, character)
const duck = createDuck(screen, world, character)

// The game loop runs about 60 times every second.
// Each time, we move things a tiny bit and draw a new picture.
startGameLoop((secondsPassed) => {
  const direction = controls.getDirection(character.position)
  character.update(secondsPassed, direction)

  // Space bar breaks the block in front of the character.
  if (controls.wantsToBreakBlock()) {
    world.breakBlockInFrontOf(character)
  }

  duck.update(secondsPassed)
  world.update(secondsPassed)

  screen.follow(character.position, secondsPassed)
  speech.update(secondsPassed)
  screen.draw()
})

// Hook up the tests, and the sidebar that runs them (see tests.js).
connectTests({ character, controls, screen, world })
createTestSidebar()

// Lets you play with the game from the browser console. Try:
//   game.character.person.scale.set(3, 3, 3)
window.game = { screen, world, character, duck, config }
