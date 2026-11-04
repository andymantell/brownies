// A score board in the top corner of the screen.
//   const scoreBoard = makeScoreBoard('Lava punched')
//   scoreBoard.addPoints(1)

export function makeScoreBoard(label) {
  const board = document.createElement('div')
  board.style.position = 'fixed'
  board.style.top = '16px'
  board.style.left = '16px'
  board.style.zIndex = '1' // below the test sidebar
  board.style.padding = '10px 18px'
  board.style.borderRadius = '14px'
  board.style.background = 'rgba(255, 255, 255, 0.85)'
  board.style.color = '#2d2640'
  board.style.fontFamily = '"Comic Sans MS", "Chalkboard SE", "Comic Neue", system-ui, sans-serif'
  board.style.fontSize = '22px'
  board.style.fontWeight = '700'
  board.style.pointerEvents = 'none' // taps go straight through to the game
  document.body.append(board)

  let score = 0

  function show() {
    board.textContent = `${label}: ${score}`
  }
  show()

  return {
    // Add some points to the score.
    addPoints(howMany) {
      score += howMany
      show()
    },

    // What's the score right now?
    score() {
      return score
    },
  }
}
