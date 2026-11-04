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
import { createSleigh } from './sleigh.js'
import { createSnow } from './snow.js'
import { createVolcano } from './volcano.js'
import { createCharacter } from './character.js'
import { createControls, createGirlControls } from './controls.js'
import { createPhysics, groundMadeOf } from './engine/index.js'
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
const garden = createGarden(screen)
const catHouse = createCatHouse(screen)
const catBowls = createCatBowls(screen)
const santa = createSanta(screen)
const sleigh = createSleigh(screen)
sleigh.carry(santa.santa)

// Two labradors and two huskies pull Santa's sleigh.
const sleighLabrador = createDog(screen, config.labrador)
sleigh.hitch(sleighLabrador.dog, { x: -0.6, z: 2.8 })
const sleighHusky = createDog(screen, config.husky)
sleigh.hitch(sleighHusky.dog, { x: 0.6, z: 2.8 })
const secondHusky = createDog(screen, config.husky)
sleigh.hitch(secondHusky.dog, { x: -0.6, z: 4.4 })
const secondLabrador = createDog(screen, config.labrador)
sleigh.hitch(secondLabrador.dog, { x: 0.6, z: 4.4 })

const snow = createSnow(screen)
snow.keepOffUnder(house.roof)
snow.keepOffUnder(catHouse.catHouse)
const volcano = createVolcano(screen)
const character = createCharacter(screen)
const controls = createControls(screen)

// The second player: a girl, standing next to our hero.
const girl = createCharacter(screen, config.girl)
girl.position.x = config.girl.startX
girl.position.z = config.girl.startZ
const girlControls = createGirlControls()

// Things the character bumps into, instead of walking through.
const solidThings = createSolidThings()
solidThings.add(cat.cat)
solidThings.add(sleigh.sleigh) // Santa, his sleigh and the dogs pulling it
solidThings.add(labrador.dog)
solidThings.add(husky.dog)
solidThings.add(catHouse.catHouse)
solidThings.add(garden.garden)
solidThings.add(catBowls.waterBowl)
solidThings.add(catBowls.foodBowl)
solidThings.add(volcano.volcano)

// Physics gives the character gravity, so it can jump and land again.
// It lands on the grass, or on top of solid things (if it jumps high enough).
const physics = createPhysics(groundMadeOf(world, solidThings))
const characterPhysics = physics.add(character.person, { height: 2.2 })

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

  // The girl walks with W A S D, and bumps into things too.
  const whereTheGirlWas = { x: girl.position.x, z: girl.position.z }
  girl.update(secondsPassed, girlControls.getDirection())
  world.keepOnField(girl.position)
  house.keepOutOfWalls(girl.position, whereTheGirlWas)
  solidThings.keepOutOf(girl.position, whereTheGirlWas)
  sleigh.update(secondsPassed)
  if (sleigh.hasArrived()) {
    santa.say('Ho ho ho!')
  }
  santa.update(sleigh.position)

  // Space bar to jump, 2 blocks high. Press it again in the air to do a backflip!
  if (controls.wantsToJump()) {
    const jumped = characterPhysics.jump(2)
    if (!jumped) {
      character.doABackflip()
    }
  }
  physics.update(secondsPassed)
  if (characterPhysics.isOnTheGround()) {
    character.landed()
  }

  snow.update(secondsPassed)

  // The camera keeps both players in view, zooming out if they walk apart.
  screen.followBoth(character.position, girl.position, secondsPassed)
  screen.draw()
})

// Hook up the tests, and the sidebar that runs them (see tests.js).
connectTests({ character, controls, screen, house })
createTestSidebar()

// Lets you play with the game from the browser console. Try:
//   game.character.person.scale.set(3, 3, 3)
window.game = { screen, world, house, cat, labrador, husky, catHouse, catBowls, garden, character, girl, config }
