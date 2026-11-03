import {
  createKeyboard,
  onTapGround,
  makeTapMarker,
  SCREEN,
  stillDirection,
  directionFromTo,
} from './engine/index.js';

// Works out which way the player wants to walk: from the keyboard, or by tapping the grass.

export function createControls(screen) {
  const keyboard = createKeyboard();

  // Tapping the grass picks a spot to walk to, and shows a ring there.
  let tappedSpot = null; // null means "nowhere"
  const marker = makeTapMarker();
  screen.add(marker.ring);

  onTapGround(screen, (spot) => {
    tappedSpot = spot;
    marker.showAt(spot);
  });

  function forgetTappedSpot() {
    tappedSpot = null;
    marker.hide();
  }

  return {
    // Which way should the character walk right now?
    getDirection(characterPosition) {
      const direction = stillDirection();

      if (keyboard.isHeld('ArrowUp', 'w')) direction.add(SCREEN.up);
      if (keyboard.isHeld('ArrowDown', 's')) direction.add(SCREEN.down);
      if (keyboard.isHeld('ArrowLeft', 'a')) direction.add(SCREEN.left);
      if (keyboard.isHeld('ArrowRight', 'd')) direction.add(SCREEN.right);

      // Using the keys? Then forget about any tapped spot.
      if (direction.length() > 0) {
        forgetTappedSpot();
        return direction.normalize(); // so walking diagonally isn't faster
      }

      // Walking to a tapped spot?
      if (tappedSpot) {
        const { direction: towardsSpot, distance } = directionFromTo(characterPosition, tappedSpot);
        if (distance < 0.1) {
          forgetTappedSpot(); // we've arrived!
          return stillDirection();
        }
        return towardsSpot;
      }

      return direction; // stand still
    },
  };
}
