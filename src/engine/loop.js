// The game loop: call `everyFrame` about 60 times a second, forever.
// It's told how many seconds have passed since last time, so things move at the same
// speed on fast and slow computers.

export function startGameLoop(everyFrame) {
  let lastTime = performance.now();

  function nextFrame(now) {
    // Capped, so nothing jumps miles if the browser tab was hidden for a while.
    const secondsPassed = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    everyFrame(secondsPassed);
    requestAnimationFrame(nextFrame);
  }

  requestAnimationFrame(nextFrame);
}
