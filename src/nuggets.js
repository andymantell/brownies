import { config } from './config.js'
import {
  makeParticles,
  areaUnder,
  isInsideRectangle,
  PARTICLE_STYLES,
  randomNumberBetween,
} from './engine/index.js'
import { makePileOfBoxes } from './engine/pile-of-boxes.js'

// 🍗 Chicken nuggets: golden-brown blocky nuggets that fall from the sky!

// The golden-brown colours a nugget can be.
const nuggetColours = ['#d9a441', '#c98b2e', '#e0b25a']

// How high up the nuggets start.
const cloudHeight = 12

// How fast the nuggets fall.
const fallSpeed = 4

// How many seconds a nugget takes to reach the ground.
const secondsToFall = cloudHeight / fallSpeed

// Nuggets fall all over the field, right up to the edges.
const halfTheField = config.world.size / 2

// How big a nugget on the ground is.
const nuggetWidth = 0.35
const nuggetHeight = 0.2
const nuggetDepth = 0.28

// The most nuggets there can be on the ground at once, so the laptop doesn't get tired.
const mostNuggetsOnTheGround = 400

// How big each square of ground is. Nuggets that land in the same square pile up.
const squareSize = 0.5

// How falling nuggets look and move. It works just like the other particle styles.
PARTICLE_STYLES.nugget = {
  howMany: 1,
  size: 0.3,
  colours: nuggetColours,
  lastsFor: secondsToFall, // so it disappears just as it reaches the ground
  upwardsSpeed: [-fallSpeed, -fallSpeed],
  sidewaysSpeed: 0, // straight down, so nuggets can't drift in under a roof
  gravity: 0,
  endSize: 1,
  fades: false,
  glows: false,
  spins: true,
  flat: false,
}

export function createNuggets(screen) {
  const particles = makeParticles(screen)
  let nuggetsToMake = 0

  // The nuggets that have landed, piled up on the ground.
  const pile = makePileOfBoxes(screen, {
    howMany: mostNuggetsOnTheGround,
    width: nuggetWidth,
    height: nuggetHeight,
    depth: nuggetDepth,
    colours: nuggetColours,
  })

  // Nuggets that are still falling, and how long until each one lands.
  let fallingNuggets = []

  // Nuggets on the ground, and how long until each one goes away.
  let landedNuggets = []

  // How many nuggets are piled up in each square of ground.
  const pileHeights = new Map()

  // Which square of ground is this spot in? Gives back a name like "4,7".
  function squareName(x, z) {
    return Math.floor(x / squareSize) + ',' + Math.floor(z / squareSize)
  }

  // The ground under roofs, where nuggets can't fall.
  const roofs = []

  function isUnderARoof(spot) {
    for (const roof of roofs) {
      if (isInsideRectangle(spot, roof, 0.3)) {
        return true
      }
    }
    return false
  }

  // Call this every frame. It drops new nuggets all over the field,
  // lands the ones that reach the ground, and takes away old ones.
  function update(secondsPassed) {
    if (config.nuggets.isOn) {
      nuggetsToMake += config.nuggets.perSecond * secondsPassed
    }

    while (nuggetsToMake >= 1) {
      const spot = {
        x: randomNumberBetween(-halfTheField, halfTheField),
        y: cloudHeight,
        z: randomNumberBetween(-halfTheField, halfTheField),
      }
      if (!isUnderARoof(spot)) {
        particles.burst('nugget', spot)
        fallingNuggets.push({ spot, secondsUntilItLands: secondsToFall })
      }
      nuggetsToMake -= 1
    }

    for (const nugget of fallingNuggets) {
      nugget.secondsUntilItLands -= secondsPassed
      if (nugget.secondsUntilItLands <= 0) {
        land(nugget.spot)
      }
    }

    fallingNuggets = fallingNuggets.filter((nugget) => {
      return nugget.secondsUntilItLands > 0
    })

    for (const nugget of landedNuggets) {
      nugget.secondsLeft -= secondsPassed
      if (nugget.secondsLeft <= 0) {
        takeAway(nugget)
      }
    }

    landedNuggets = landedNuggets.filter((nugget) => {
      return nugget.secondsLeft > 0
    })

    particles.update(secondsPassed)
  }

  // A nugget has landed! Put it on top of any nuggets already in that square.
  function land(spot) {
    const square = squareName(spot.x, spot.z)
    const howManyHere = pileHeights.get(square) || 0
    if (howManyHere >= config.nuggets.tallestPile) {
      return
    }

    const spotOnThePile = {
      x: spot.x,
      y: howManyHere * nuggetHeight + nuggetHeight / 2,
      z: spot.z,
    }
    const number = pile.addOne(spotOnThePile)
    if (number === -1) {
      return
    }

    pileHeights.set(square, howManyHere + 1)
    landedNuggets.push({
      number,
      square,
      spot: spotOnThePile,
      secondsLeft: config.nuggets.secondsOnTheGround,
    })
  }

  // A nugget has been on the ground long enough, so it goes away.
  // Any nuggets on top of it drop down to fill the gap.
  function takeAway(gone) {
    pile.removeOne(gone.number)
    pileHeights.set(gone.square, pileHeights.get(gone.square) - 1)

    for (const nugget of landedNuggets) {
      const isOnTop = nugget.square === gone.square && nugget.spot.y > gone.spot.y
      if (isOnTop) {
        nugget.spot.y -= nuggetHeight
        pile.moveOne(nugget.number, nugget.spot)
      }
    }
  }

  // Keep the nuggets off the ground under this thing, like a roof:
  //   nuggets.keepOffUnder(house.roof)
  function keepOffUnder(thing) {
    roofs.push(areaUnder(thing))
  }

  return { update, keepOffUnder }
}
