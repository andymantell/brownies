import * as THREE from 'three'
import { waitForGameSeconds } from './loop.js'
import { findPath } from './pathfinding.js'
import { angleOf, directionFromTo } from './maths.js'

// The testing toolbox: helpers for writing tests in src/tests.js, plus the bits that run them.
//
// A test does something to the game (holds a key, taps the grass, waits)
// and then checks that the right thing happened.

const allTests = []
let game = null // the character, controls, screen, world, particles and house, once connectTests() has been called
let currentChecks = null // where check() writes its results while a test is running
let keysPressedByTest = new Set()
let fingerIsDown = false // is a pretend finger held down on the grass?
const fingerSpot = { x: 0, z: 0 } // where the pretend finger last was
let blocksPutByTest = [] // tidied away when each test finishes

// ---- Helpers for writing tests ----

// Add a test to the list.
export function test(name, description, steps) {
  allTests.push({ name, description, steps })
}

// Check that something is true. `sentence` says what we expect, in plain words.
export function check(sentence, isTrue) {
  currentChecks.push({ sentence, passed: Boolean(isTrue) })
}

// Wait for a number of seconds (of game time, so slow computers get a fair test).
export function wait(seconds) {
  return waitForGameSeconds(seconds)
}

// Hold a key down for a number of seconds, then let go.
export async function holdKey(key, seconds) {
  pressKey(key)
  await wait(seconds)
  releaseKey(key)
}

// Press a key and let go straight away.
export async function tapKey(key) {
  pressKey(key)
  await wait(0.1)
  releaseKey(key)
}

// Pretend to tap the grass at a spot in the world (finger down, then straight up).
export function tapGround(x, z) {
  pressGround(x, z)
  liftFinger()
}

// Pretend to put a finger down on the grass at a spot in the world, and keep it there.
export function pressGround(x, z) {
  fingerIsDown = true
  sendFingerEvent('pointerdown', x, z)
}

// Pretend to slide the held-down finger to a new spot in the world.
export function slideFingerTo(x, z) {
  sendFingerEvent('pointermove', x, z)
}

// Pretend to lift the finger off the screen.
export function liftFinger() {
  if (fingerIsDown) {
    fingerIsDown = false
    sendFingerEvent('pointerup', fingerSpot.x, fingerSpot.z)
  }
}

// Where is the character right now? Gives back { x, z }.
export function whereIsCharacter() {
  const position = game.character.position
  return { x: position.x, z: position.z }
}

// How high are the character's feet? (0 is the normal ground level.)
export function howHighIsCharacter() {
  return game.character.position.y
}

// Pick the character up and put them down somewhere else, standing on the ground.
export function putCharacterAt(x, z) {
  const ground = groundHeightAt(x, z)
  game.character.position.set(x, ground, z)
}

// Is the house's door open?
export function isTheDoorOpen() {
  return game.house.isDoorOpen()
}

// Can we see through the house's roof?
export function isTheRoofSeeThrough() {
  return game.house.isRoofSeeThrough()
}

// Where is the toilet in the house? Gives back { x, z }.
export function whereIsTheToilet() {
  return game.house.whereIsTheToilet()
}

// Is the toilet flushing right now?
export function isTheToiletFlushing() {
  return game.house.isToiletFlushing()
}

// Turn the character to face a spot.
export function turnCharacterTowards(x, z) {
  const towards = directionFromTo(game.character.position, { x, z })
  game.character.person.rotation.y = angleOf(towards.direction)
}

// Put a block in the world, just for this test. It's taken away when the test finishes.
export function putBlock(x, y, z, type) {
  game.world.blocks.put(x, y, z, type)
  blocksPutByTest.push({ x, y, z })
}

// Is there a block here?
export function isThereABlockAt(x, y, z) {
  return game.world.blocks.isSolid(x, y, z)
}

// Use pathfinding to find a route between two spots on the ground.
// Gives back a list of squares, each { x, y, z }.
export function findRoute(from, to) {
  const fromSpot = { x: from.x, y: groundHeightAt(from.x, from.z), z: from.z }
  return findPath(game.world.blocks, fromSpot, to)
}

// Make a burst of particles in one of the styles (see engine/particles.js), at a spot on the ground.
export function makeEffect(styleName, x, z) {
  game.particles.burst(styleName, { x, y: groundHeightAt(x, z), z })
}

// Keep an effect going at a spot on the ground, like a campfire. Call stop() on it when you're done.
export function keepEffectGoing(styleName, x, z) {
  return game.particles.keepGoing(styleName, { x, y: groundHeightAt(x, z), z })
}

// How many particle pieces are flying about right now?
export function howManyParticles() {
  return game.particles.howManyAreFlying()
}

// Where are the particle pieces? Gives back a list of { x, y, z }.
export function whereAreTheParticles() {
  return game.particles.whereAreThePieces()
}

// How many steps (metres) apart are two spots?
export function stepsBetween(spotA, spotB) {
  return Math.hypot(spotA.x - spotB.x, spotA.z - spotB.z)
}

// ---- Behind the scenes: running the tests ----

// Give the tests the bits of the game they need to poke at.
// The animals go back to where they started at the start of every test,
// so a dog that followed you in one test isn't in the way in the next one.
export function connectTests({ character, controls, screen, world, particles, house, animals = [] }) {
  game = { character, controls, screen, world, particles, house }
  game.animals = animals.map((animal) => {
    return { animal, startX: animal.position.x, startZ: animal.position.z }
  })
}

export function getAllTests() {
  return allTests
}

// Run one test. Gives back the list of checks, each with { sentence, passed }.
export async function runTest(oneTest) {
  currentChecks = []
  resetGame()

  try {
    await oneTest.steps()
    if (currentChecks.length === 0) {
      check('The test checked something (it has no checks yet!)', false)
    }
  } catch (error) {
    check(`The test ran without crashing (it said: "${error.message}")`, false)
  } finally {
    keysPressedByTest.forEach(releaseKey)
    liftFinger()
    takeAwayTestBlocks()
  }

  const results = currentChecks
  currentChecks = null
  return results
}

// Start every test from the same place: in the middle, standing still.
function resetGame() {
  keysPressedByTest.forEach(releaseKey)
  liftFinger()
  game.controls.stopWalking()
  putCharacterAt(0, 0)
  putTheAnimalsBack()
}

// Put every animal back where it started.
function putTheAnimalsBack() {
  for (const { animal, startX, startZ } of game.animals) {
    animal.position.x = startX
    animal.position.z = startZ
  }
}

// How high is the ground here? It's 0 everywhere, unless the world is made of blocks.
function groundHeightAt(x, z) {
  if (!game.world || !game.world.blocks) {
    return 0
  }
  return Math.max(game.world.blocks.topOfColumn(x, z), 0)
}

function takeAwayTestBlocks() {
  for (const spot of blocksPutByTest) {
    game.world.blocks.remove(spot.x, spot.y, spot.z)
  }
  blocksPutByTest = []
}

function pressKey(key) {
  keysPressedByTest.add(key)
  window.dispatchEvent(new KeyboardEvent('keydown', { key }))
}

function releaseKey(key) {
  keysPressedByTest.delete(key)
  window.dispatchEvent(new KeyboardEvent('keyup', { key }))
}

// Send a pretend finger event at the place on the screen where a world spot is right now.
function sendFingerEvent(type, x, z) {
  fingerSpot.x = x
  fingerSpot.z = z

  // Work out where that spot is on the screen, in pixels (on top of the ground there).
  const ground = groundHeightAt(x, z)
  const onScreen = new THREE.Vector3(x, ground, z).project(game.screen.camera)
  const pixelsAcross = ((onScreen.x + 1) / 2) * window.innerWidth
  const pixelsDown = ((1 - onScreen.y) / 2) * window.innerHeight

  const fingerEvent = new PointerEvent(type, {
    pointerId: 1,
    clientX: pixelsAcross,
    clientY: pixelsDown,
    bubbles: true,
  })
  game.screen.canvas.dispatchEvent(fingerEvent)
}
