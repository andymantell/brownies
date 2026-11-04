import { config } from './config.js'
import {
  makeBox,
  makeGroup,
  turnTowards,
  isInsideRectangle,
  makeSeeThrough,
  makeDrawingScreen,
  createKeyboard,
} from './engine/index.js'

// A little house for our character, built out of boxes.
//
// Seen from above, the house is a rectangle. The front wall faces the camera,
// and it has a gap in the middle for the door.

const WIDTH = config.house.width // from side to side
const DEPTH = config.house.depth // from front to back
const WALL_HEIGHT = config.house.wallHeight
const WALL_THICKNESS = 0.3
const DOOR_WIDTH = 1.4
const DOOR_HEIGHT = 2.4
const WATER_HEIGHT = 0.47 // how high the water in the toilet is

export function createHouse(screen) {
  const colour = config.house.wallColour

  // A group holds all the parts of the house together, so we can move it as one.
  const house = makeGroup()
  house.position.set(config.house.x, 0, config.house.z)

  // We remember where every wall is, so we can stop people walking through them.
  const walls = []

  // The back wall, and the two side walls.
  addWall(house, walls, { x: 0, z: -DEPTH / 2, width: WIDTH, depth: WALL_THICKNESS, colour })
  addWall(house, walls, { x: -WIDTH / 2, z: 0, width: WALL_THICKNESS, depth: DEPTH, colour })
  addWall(house, walls, { x: WIDTH / 2, z: 0, width: WALL_THICKNESS, depth: DEPTH, colour })

  // The front wall is in two halves, with a gap for the door in the middle...
  const halfWidth = (WIDTH - DOOR_WIDTH) / 2
  const halfMiddle = DOOR_WIDTH / 2 + halfWidth / 2
  addWall(house, walls, { x: -halfMiddle, z: DEPTH / 2, width: halfWidth, depth: WALL_THICKNESS, colour })
  addWall(house, walls, { x: halfMiddle, z: DEPTH / 2, width: halfWidth, depth: WALL_THICKNESS, colour })

  // ...and a bit of wall over the top of the door.
  const aboveTheDoor = makeBox({
    width: DOOR_WIDTH,
    height: WALL_HEIGHT - DOOR_HEIGHT,
    depth: WALL_THICKNESS,
    colour,
  })
  aboveTheDoor.position.set(0, (WALL_HEIGHT + DOOR_HEIGHT) / 2, DEPTH / 2)
  house.add(aboveTheDoor)

  const door = makeDoor()
  door.position.set(-DOOR_WIDTH / 2, 0, DEPTH / 2)
  house.add(door)

  // A bed in the back left corner.
  const bed = makeBed()
  addFurniture(house, walls, bed, { x: -WIDTH / 2 + 1.3, z: -DEPTH / 2 + 1.9, width: 2, depth: 3.2 })

  // A sofa on the right, turned right round to face the TV on the back wall.
  const sofa = makeSofa()
  sofa.rotation.y = Math.PI // a half turn
  addFurniture(house, walls, sofa, { x: 2, z: -1.2, width: 2.6, depth: 1.1 })

  // A TV against the back wall, a bit to the right.
  const tvScreen = makeDrawingScreen({ width: 1.6, height: 0.9 })
  const tv = makeTv(tvScreen.screen)
  addFurniture(house, walls, tv, { x: 2, z: -DEPTH / 2 + 0.5, width: 2, depth: 0.6 })

  // A toilet against the back wall, between the bed and the TV.
  const toilet = makeToilet()
  const toiletX = -1.5
  const toiletZ = -DEPTH / 2 + 0.6
  addFurniture(house, walls, toilet, { x: toiletX, z: toiletZ, width: 0.8, depth: 0.9 })

  const roof = makeRoof()
  house.add(roof)

  screen.add(house)

  // Is this spot inside any of the walls?
  function isInAWall(spot) {
    const howFatThePersonIs = 0.35
    for (const wall of walls) {
      if (isInsideRectangle(spot, wall, howFatThePersonIs)) {
        return true
      }
    }
    return false
  }

  // Where the door is in the world (the middle of the doorway).
  const doorway = { x: config.house.x, z: config.house.z + DEPTH / 2 }

  // Is this spot inside the walls of the house?
  function isInside(position) {
    const acrossFromMiddle = Math.abs(position.x - config.house.x)
    const backFromMiddle = Math.abs(position.z - config.house.z)
    return acrossFromMiddle < WIDTH / 2 && backFromMiddle < DEPTH / 2
  }

  // How solid the roof is: 1 is solid, 0 is invisible.
  let roofSolidness = 1

  // How long the TV programme has been on, in seconds.
  let showTime = 0

  // Where the toilet is in the world.
  const toiletSpot = { x: config.house.x + toiletX, z: config.house.z + toiletZ }

  // How many seconds of flushing are left. 0 means it isn't flushing.
  const FLUSH_SECONDS = 2
  let flushTimeLeft = 0

  // The house listens to the keyboard too, for the F key that flushes the toilet.
  const keyboard = createKeyboard()

  // Start flushing the toilet (unless it's already flushing).
  function flush() {
    if (flushTimeLeft === 0) {
      flushTimeLeft = FLUSH_SECONDS
    }
  }

  // While it's flushing, the water spins round and sinks down, then fills up again.
  function updateFlushing(secondsPassed) {
    flushTimeLeft = Math.max(flushTimeLeft - secondsPassed, 0)
    const water = toilet.water
    const handle = toilet.handle

    if (flushTimeLeft === 0) {
      water.rotation.y = 0
      water.scale.set(1, 1, 1)
      water.position.y = WATER_HEIGHT
      handle.rotation.z = 0
      return
    }

    // How far through the flush we are: 0 at the start, 1 at the end.
    const howFarThrough = 1 - flushTimeLeft / FLUSH_SECONDS

    // Down to the bottom half way through, and back up by the end.
    const howSunk = Math.sin(howFarThrough * Math.PI)

    water.rotation.y += secondsPassed * 12 // spin!
    water.position.y = WATER_HEIGHT - howSunk * 0.15
    water.scale.set(1 - howSunk * 0.6, 1, 1 - howSunk * 0.6) // swirl down the plughole

    // The handle dips down at the start of the flush.
    if (howFarThrough < 0.3) {
      handle.rotation.z = 0.6
    } else {
      handle.rotation.z = 0
    }
  }

  return {
    house,
    roof,
    door,

    // Called every frame. Opens the door when the character is close to it,
    // and makes the roof see-through when they're inside, so we can still see them.
    update(secondsPassed, characterPosition) {
      let wantedSolidness = 1 // solid
      if (isInside(characterPosition)) {
        wantedSolidness = 0.15 // nearly invisible
      }

      // Fade a little bit closer to how solid we want it, every frame.
      const fadeSpeed = Math.min(secondsPassed * 5, 1)
      roofSolidness += (wantedSolidness - roofSolidness) * fadeSpeed
      makeSeeThrough(roof, roofSolidness)

      // Press F next to the toilet to flush it!
      const distanceToToilet = Math.hypot(characterPosition.x - toiletSpot.x, characterPosition.z - toiletSpot.z)
      if (keyboard.wasJustPressed('f') && distanceToToilet < 2) {
        flush()
      }
      updateFlushing(secondsPassed)

      // Paint the next picture of the TV programme.
      showTime += secondsPassed
      tvScreen.paint((brush) => {
        drawTvProgramme(brush, showTime)
      })

      const distanceToDoor = Math.hypot(characterPosition.x - doorway.x, characterPosition.z - doorway.z)
      const isCloseToDoor = distanceToDoor < 2

      let wantedAngle = 0 // shut
      if (isCloseToDoor) {
        wantedAngle = 1.7 // swung open, into the house
      }

      const swingSpeed = secondsPassed * 6
      door.rotation.y = turnTowards(door.rotation.y, wantedAngle, swingSpeed)
    },

    // If someone has walked into a wall, put them back where they were.
    // We try just the across step, then just the back step, so they can slide along the wall.
    keepOutOfWalls(position, whereTheyWere) {
      if (!isInAWall(position)) {
        return
      }

      const onlySteppedAcross = { x: position.x, z: whereTheyWere.z }
      const onlySteppedBack = { x: whereTheyWere.x, z: position.z }

      if (!isInAWall(onlySteppedAcross)) {
        position.z = whereTheyWere.z
      } else if (!isInAWall(onlySteppedBack)) {
        position.x = whereTheyWere.x
      } else {
        position.x = whereTheyWere.x
        position.z = whereTheyWere.z
      }
    },

    isDoorOpen() {
      return door.rotation.y > 1
    },

    isRoofSeeThrough() {
      return roofSolidness < 0.5
    },

    flushTheToilet() {
      flush()
    },

    isToiletFlushing() {
      return flushTimeLeft > 0
    },

    whereIsTheToilet() {
      return toiletSpot
    },
  }
}

// A wooden door with a little gold knob.
// It turns on a hinge at its left-hand edge, like a real door.
function makeDoor() {
  const hinge = makeGroup()

  const door = makeBox({ width: DOOR_WIDTH, height: DOOR_HEIGHT, depth: 0.15, colour: config.house.doorColour })
  door.position.set(DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0)
  hinge.add(door)

  const knob = makeBox({ width: 0.15, height: 0.15, depth: 0.15, colour: 'gold' })
  knob.position.set(DOOR_WIDTH - 0.25, DOOR_HEIGHT / 2, 0.12)
  hinge.add(knob)

  return hinge
}

// A cosy bed: a wooden frame, a white mattress, a pillow and a blanket.
// The pillow end is at the back.
function makeBed() {
  const bed = makeGroup()
  const wood = config.house.bedColour

  const frame = makeBox({ width: 2, height: 0.5, depth: 3.2, colour: wood })
  frame.position.y = 0.25
  bed.add(frame)

  const headboard = makeBox({ width: 2, height: 1.3, depth: 0.2, colour: wood })
  headboard.position.set(0, 0.65, -1.5)
  bed.add(headboard)

  const mattress = makeBox({ width: 1.8, height: 0.3, depth: 2.9, colour: 'white' })
  mattress.position.set(0, 0.65, 0.05)
  bed.add(mattress)

  const pillow = makeBox({ width: 1.2, height: 0.2, depth: 0.5, colour: '#f4f4f4' })
  pillow.position.set(0, 0.9, -1.05)
  bed.add(pillow)

  const blanket = makeBox({ width: 1.9, height: 0.1, depth: 2, colour: config.house.blanketColour })
  blanket.position.set(0, 0.85, 0.5)
  bed.add(blanket)

  return bed
}

// A comfy sofa: a seat, a back and two arm rests.
// It's built facing the front, and we turn it round afterwards.
function makeSofa() {
  const sofa = makeGroup()
  const colour = config.house.sofaColour

  const seat = makeBox({ width: 2.6, height: 0.5, depth: 1.1, colour })
  seat.position.y = 0.25
  sofa.add(seat)

  const back = makeBox({ width: 2.6, height: 0.8, depth: 0.3, colour })
  back.position.set(0, 0.9, -0.4)
  sofa.add(back)

  const leftArm = makeBox({ width: 0.3, height: 0.8, depth: 1.1, colour })
  leftArm.position.set(-1.15, 0.4, 0)
  sofa.add(leftArm)

  const rightArm = makeBox({ width: 0.3, height: 0.8, depth: 1.1, colour })
  rightArm.position.set(1.15, 0.4, 0)
  sofa.add(rightArm)

  return sofa
}

// A TV on a little wooden cabinet. `screen` is the picture on the front.
function makeTv(screen) {
  const tv = makeGroup()

  const cabinet = makeBox({ width: 2, height: 0.7, depth: 0.6, colour: config.house.bedColour })
  cabinet.position.y = 0.35
  tv.add(cabinet)

  const stand = makeBox({ width: 0.4, height: 0.15, depth: 0.3, colour: '#222222' })
  stand.position.set(0, 0.77, -0.1)
  tv.add(stand)

  const screenBox = makeBox({ width: 1.8, height: 1.1, depth: 0.12, colour: '#111111' })
  screenBox.position.set(0, 1.4, -0.1)
  tv.add(screenBox)

  // The picture goes just in front of the black box.
  screen.position.set(0, 1.4, -0.03)
  tv.add(screen)

  return tv
}

// A white toilet: a bowl, a seat, a tank of water at the back, and a handle.
// The water and the handle move when you flush, so we keep hold of them.
function makeToilet() {
  const toilet = makeGroup()

  const bowl = makeBox({ width: 0.6, height: 0.45, depth: 0.7, colour: 'white' })
  bowl.position.set(0, 0.225, 0.1)
  toilet.add(bowl)

  // The seat is a ring, made of four thin boxes around the edge of the bowl.
  const seatColour = '#f0f0f0'
  const seatBack = makeBox({ width: 0.66, height: 0.06, depth: 0.12, colour: seatColour })
  seatBack.position.set(0, 0.48, -0.22)
  toilet.add(seatBack)

  const seatFront = makeBox({ width: 0.66, height: 0.06, depth: 0.12, colour: seatColour })
  seatFront.position.set(0, 0.48, 0.42)
  toilet.add(seatFront)

  const seatLeft = makeBox({ width: 0.12, height: 0.06, depth: 0.76, colour: seatColour })
  seatLeft.position.set(-0.27, 0.48, 0.1)
  toilet.add(seatLeft)

  const seatRight = makeBox({ width: 0.12, height: 0.06, depth: 0.76, colour: seatColour })
  seatRight.position.set(0.27, 0.48, 0.1)
  toilet.add(seatRight)

  // The water, inside the seat.
  const water = makeBox({ width: 0.4, height: 0.04, depth: 0.5, colour: '#4aa3df' })
  water.position.set(0, WATER_HEIGHT, 0.1)
  toilet.add(water)

  // The tank at the back, where the flushing water comes from.
  const tank = makeBox({ width: 0.8, height: 0.8, depth: 0.3, colour: 'white' })
  tank.position.set(0, 0.9, -0.3)
  toilet.add(tank)

  // The handle, on the front of the tank. It turns at one end, like a lever.
  const handle = makeGroup()
  const lever = makeBox({ width: 0.2, height: 0.05, depth: 0.05, colour: '#999999' })
  lever.position.x = 0.1
  handle.add(lever)
  handle.position.set(-0.3, 1.15, -0.13)
  toilet.add(handle)

  toilet.water = water
  toilet.handle = handle
  return toilet
}

// 📺 Brownies TV! A little cartoon: a box person bouncing over a hill.
// `time` is how many seconds the programme has been on.
// The picture is 256 dots across and 144 dots down. Dot 0, 0 is the top left.
function drawTvProgramme(brush, time) {
  // The blue sky.
  brush.fillAll('#7ec8ff')

  // The sun, up in the corner.
  brush.circle(220, 34, 18, '#ffd93b')

  // A big green hill. (It's a giant circle, mostly hidden below the screen.)
  brush.circle(128, 330, 220, '#4caf50')

  // The box person walks across the screen, then starts again from the left.
  const across = (time * 50) % 300 - 30

  // ...and bounces up and down as they go.
  const bounce = Math.abs(Math.sin(time * 5)) * 30
  const feet = 112 - bounce

  brush.rectangle(across, feet - 24, 20, 24, '#ff6b6b') // body
  brush.rectangle(across + 2, feet - 40, 16, 16, '#ffd6a5') // head
  brush.rectangle(across + 11, feet - 35, 3, 3, '#222222') // eye

  // The name of the channel.
  brush.words('Brownies TV', 10, 26, 'white', 20)
}

// A pointy roof, made of layers of boxes that get thinner as they go up,
// like a stack of steps.
function makeRoof() {
  const roof = makeGroup()
  const colour = config.house.roofColour

  const overhang = 0.4 // how far the roof sticks out past the walls
  const layerHeight = 0.4
  const fullDepth = DEPTH + overhang * 2 // how deep the bottom layer is
  const stepIn = 1.2 // how much narrower each layer is than the one below it

  // Keep adding layers until there's no room left at the top.
  const howManyLayers = Math.floor(fullDepth / stepIn)

  for (let layer = 0; layer < howManyLayers; layer++) {
    const depth = fullDepth - layer * stepIn

    const step = makeBox({ width: WIDTH + overhang * 2, height: layerHeight, depth, colour })
    step.position.y = WALL_HEIGHT + layerHeight / 2 + layer * layerHeight
    roof.add(step)
  }

  return roof
}

// Put a piece of furniture in the house.
// We remember where it is, so people bump into it instead of walking through.
function addFurniture(house, walls, thing, { x, z, width, depth }) {
  thing.position.set(x, 0, z)
  house.add(thing)
  walls.push({ x: config.house.x + x, z: config.house.z + z, width, depth })
}

// One wall, standing on the ground.
function addWall(house, walls, { x, z, width, depth, colour }) {
  const wall = makeBox({ width, height: WALL_HEIGHT, depth, colour })
  wall.position.set(x, WALL_HEIGHT / 2, z)
  house.add(wall)

  // Remember where it is in the world (the house's spot, plus where the wall is in the house).
  walls.push({ x: config.house.x + x, z: config.house.z + z, width, depth })
}
