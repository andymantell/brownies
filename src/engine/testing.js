import * as THREE from 'three'
import { waitForGameSeconds } from './loop.js'

// The testing toolbox: helpers for writing tests in src/tests.js, plus the bits that run them.
//
// A test does something to the game (holds a key, taps the grass, waits)
// and then checks that the right thing happened.

const allTests = []
let game = null // the character, controls and screen, once connectTests() has been called
let currentChecks = null // where check() writes its results while a test is running
let keysPressedByTest = new Set()
let fingerIsDown = false // is a pretend finger held down on the grass?
const fingerSpot = { x: 0, z: 0 } // where the pretend finger last was

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

// Pick the character up and put them down somewhere else.
export function putCharacterAt(x, z) {
  game.character.position.set(x, 0, z)
}

// How many steps (metres) apart are two spots?
export function stepsBetween(spotA, spotB) {
  return Math.hypot(spotA.x - spotB.x, spotA.z - spotB.z)
}

// ---- Behind the scenes: running the tests ----

// Give the tests the bits of the game they need to poke at.
export function connectTests({ character, controls, screen }) {
  game = { character, controls, screen }
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

  // Work out where that spot is on the screen, in pixels.
  const onScreen = new THREE.Vector3(x, 0, z).project(game.screen.camera)
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
