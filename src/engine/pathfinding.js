// Pathfinding: working out a route from one place to another, around anything in the way.
//
// This uses a famous recipe called "A-star" (written A*). Imagine standing on a grid:
//   1. Look at the squares next to you that you could walk to.
//   2. For each one, add up how far you've walked to get there, plus a guess of
//      how far there is still to go.
//   3. Always explore the square with the smallest total next.
//   4. Keep going until you reach the end, then follow your footsteps back.
//
//   const route = findPath(blocks, fromPosition, toPosition)
//   route is a list of spots like [{ x, y, z }, { x, y, z }, ...]

const HOW_FAR_YOU_CAN_DROP = 3 // don't jump off anything taller than this
const MOST_SQUARES_TO_TRY = 4000 // give up after this many, so the game doesn't freeze

// The 8 squares around you: 4 straight ones and 4 diagonal ones.
const NEIGHBOURS = [
  { across: 1, back: 0 },
  { across: -1, back: 0 },
  { across: 0, back: 1 },
  { across: 0, back: -1 },
  { across: 1, back: 1 },
  { across: 1, back: -1 },
  { across: -1, back: 1 },
  { across: -1, back: -1 },
]

export function findPath(blocks, from, to) {
  const goal = { x: Math.round(to.x), z: Math.round(to.z) }

  const start = makeSquare(Math.round(from.x), Math.round(from.z), Math.round(from.y))
  start.walkedSoFar = 0
  start.guessToGo = guessDistance(start, goal)

  const squaresToExplore = [start]
  const bestWayTo = new Map() // the best square-before-this-one we've found so far
  bestWayTo.set(nameOf(start), start)

  let closestSoFar = start
  let squaresTried = 0

  while (squaresToExplore.length > 0 && squaresTried < MOST_SQUARES_TO_TRY) {
    squaresTried++
    const square = takeMostPromising(squaresToExplore)

    // Remember the closest we've got, in case we can't reach the goal at all.
    if (square.guessToGo < closestSoFar.guessToGo) {
      closestSoFar = square
    }

    const reachedTheGoal = square.x === goal.x && square.z === goal.z
    if (reachedTheGoal) {
      return followFootstepsBack(square)
    }

    for (const next of squaresYouCanWalkTo(blocks, square)) {
      const walked = square.walkedSoFar + next.stepLength
      const earlierVisit = bestWayTo.get(nameOf(next))

      if (earlierVisit && earlierVisit.walkedSoFar <= walked) {
        continue // we already know a shorter way to get here
      }

      next.walkedSoFar = walked
      next.guessToGo = guessDistance(next, goal)
      next.cameFrom = square
      bestWayTo.set(nameOf(next), next)
      squaresToExplore.push(next)
    }
  }

  // We couldn't reach the goal, so get as close as we can.
  return followFootstepsBack(closestSoFar)
}

// Every square next to this one that someone could walk to.
function squaresYouCanWalkTo(blocks, square) {
  const results = []

  for (const neighbour of NEIGHBOURS) {
    const x = square.x + neighbour.across
    const z = square.z + neighbour.back

    if (!blocks.canWalkInto(x, z, square.y)) {
      continue
    }

    const groundHeight = blocks.groundHeightAt(x, z, square.y)
    if (groundHeight < square.y - HOW_FAR_YOU_CAN_DROP) {
      continue // too far to fall
    }

    // Going diagonally? Don't cut the corner of a block: both straight squares must be clear too.
    const isDiagonal = neighbour.across !== 0 && neighbour.back !== 0
    if (isDiagonal) {
      const clearAcross = blocks.canWalkInto(x, square.z, square.y)
      const clearBack = blocks.canWalkInto(square.x, z, square.y)
      if (!clearAcross || !clearBack) {
        continue
      }
    }

    const next = makeSquare(x, z, groundHeight)
    next.stepLength = 1
    if (isDiagonal) {
      next.stepLength = Math.SQRT2 // a diagonal step is a bit longer
    }
    results.push(next)
  }

  return results
}

function makeSquare(x, z, y) {
  return { x, y, z, walkedSoFar: 0, guessToGo: 0, cameFrom: null }
}

function nameOf(square) {
  return square.x + ',' + square.y + ',' + square.z
}

// A guess of how far is left to go: the straight-line distance.
function guessDistance(square, goal) {
  return Math.hypot(goal.x - square.x, goal.z - square.z)
}

// Take out the square with the smallest "walked so far + still to go".
function takeMostPromising(squares) {
  let bestNumber = 0

  for (let number = 1; number < squares.length; number++) {
    const best = squares[bestNumber]
    const thisOne = squares[number]
    if (thisOne.walkedSoFar + thisOne.guessToGo < best.walkedSoFar + best.guessToGo) {
      bestNumber = number
    }
  }

  const [mostPromising] = squares.splice(bestNumber, 1)
  return mostPromising
}

// Follow each square back to the one we came from, to get the whole route.
function followFootstepsBack(lastSquare) {
  const route = []
  let square = lastSquare

  while (square) {
    route.unshift({ x: square.x, y: square.y, z: square.z })
    square = square.cameFrom
  }

  return route
}
