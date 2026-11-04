import { config } from './config.js'
import { makeBox, makeGroup, turnTowards, isInsideRectangle, makeSeeThrough } from './engine/index.js'

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
  const tv = makeTv()
  addFurniture(house, walls, tv, { x: 2, z: -DEPTH / 2 + 0.5, width: 2, depth: 0.6 })

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

// A TV on a little wooden cabinet, with a glowing blue screen.
function makeTv() {
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

  // The picture on the front of the screen.
  const picture = makeBox({ width: 1.6, height: 0.9, depth: 0.02, colour: '#9fd3ff' })
  picture.position.set(0, 1.4, -0.03)
  tv.add(picture)

  return tv
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
