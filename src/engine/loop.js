// The game loop: call `everyFrame` about 60 times a second, forever.
// It's told how many seconds have passed since last time, so things move at the same
// speed on fast and slow computers.

let gameClock = 0 // how many seconds the game has been running for

export function startGameLoop(everyFrame) {
  let lastTime = performance.now()

  function nextFrame(now) {
    // Capped, so nothing jumps miles if the browser tab was hidden for a while.
    const secondsPassed = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now
    gameClock += secondsPassed

    everyFrame(secondsPassed)
    requestAnimationFrame(nextFrame)
  }

  requestAnimationFrame(nextFrame)
}

// Wait until the game itself has run for this many seconds.
// On a slow computer the game clock can run behind the real clock, so this keeps tests fair.
export function waitForGameSeconds(seconds) {
  const finishAt = gameClock + seconds
  return new Promise((done) => {
    function checkClock() {
      if (gameClock >= finishAt) {
        done()
      } else {
        requestAnimationFrame(checkClock)
      }
    }
    checkClock()
  })
}
