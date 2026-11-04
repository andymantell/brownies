import { config } from './config.js'
import { createScreen, startGameLoop, createSolidThings } from './engine/index.js'
import { createWorld } from './world.js'
import { createHouse } from './house.js'
import { createCat } from './cat.js'
import { createDog } from './dog.js'
import { createGarden } from './garden.js'
import { createCatHouse } from './cat-house.js'
import { createCatBowls } from './cat-bowls.js'
import { createSanta } from './santa.js'
import { createCharacter } from './character.js'
import { createControls } from './controls.js'
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
const labrador = createDog(screen, config.labrador)
const husky = createDog(screen, config.husky)
const husky = createDog(screen, config.husky)
const garden = createGarden(screen)
const catHouse = createCatHouse(screen)
const catBowls = createCatBowls(screen)
const santa = createSanta(screen)
const character = createCharacter(screen)
const controls = createControls(screen)

// Things the character bumps into, instead of walking through.
const solidThings = createSolidThings()
solidThings.add(cat.cat)

// The game loop runs about 60 times every second.
// Each time, we move things a tiny bit and draw a new picture.
startGameLoop((secondsPassed) => {
  const whereTheCharacterWas = { x: character.position.x, z: character.position.z }
  const direction = controls.getDirection(character.position)
  character.update(secondsPassed, direction)
  world.keepOnField(character.position)
  house.keepOutOfWalls(character.position, whereTheCharacterWas)
  solidThings.keepOutOf(character.position, whereTheCharacterWas)
  house.update(secondsPassed, character.position)

  screen.follow(character.position, secondsPassed)
  screen.draw()
})

// Hook up the tests, and the sidebar that runs them (see tests.js).
connectTests({ character, controls, screen, house })
createTestSidebar()

// Lets you play with the game from the browser console. Try:
//   game.character.person.scale.set(3, 3, 3)
window.game = { screen, world, house, cat, labrador, husky, husky, catHouse, catBowls, garden, character, config }
