import { config } from './config.js'
import { createScreen, startGameLoop } from './engine/index.js'
import { createWorld } from './world.js'
import { createHouse } from './house.js'
import { createCat } from './cat.js'
import { createGarden } from './garden.js'
import { createCatHouse } from './cat-house.js'
import { createCharacter } from './character.js'
import { createControls } from './controls.js'
import { createSpeech } from './speech.js'
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
const house = createHouse(screen)
const cat = createCat(screen)
const garden = createGarden(screen)
const catHouse = createCatHouse(screen)
const character = createCharacter(screen)
const controls = createControls(screen)
const speech = createSpeech(screen, character)

// The game loop runs about 60 times every second.
// Each time, we move things a tiny bit and draw a new picture.
startGameLoop((secondsPassed) => {
  const direction = controls.getDirection(character.position)
  character.update(secondsPassed, direction)
  world.keepOnField(character.position)
  house.update(secondsPassed, character.position)

  screen.follow(character.position, secondsPassed)
  speech.update(secondsPassed)
  screen.draw()
})

// Hook up the tests, and the sidebar that runs them (see tests.js).
connectTests({ character, controls, screen, house })
createTestSidebar()

// Lets you play with the game from the browser console. Try:
//   game.character.person.scale.set(3, 3, 3)
window.game = { screen, world, house, cat, catHouse, garden, character, config }
