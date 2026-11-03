import { config } from './config.js';
import {
  test,
  check,
  wait,
  holdKey,
  tapGround,
  whereIsCharacter,
  putCharacterAt,
  stepsBetween,
} from './engine/testing.js';

// 🧪 Our tests!
//
// Each test has:
//   - a name
//   - a description of what we're testing
//   - some steps: do something to the game, then check() what happened
//
// Every test starts with the character standing still in the middle of the field.
// Open the tests with the peeling corner in the top right of the game.

test(
  'Walks when you press a key',
  'Holding down the right arrow key for 1 second should make the character walk.',
  async () => {
    const start = whereIsCharacter();

    await holdKey('ArrowRight', 1);

    const end = whereIsCharacter();
    check('The character walked at least 3 steps', stepsBetween(start, end) >= 3);
  },
);

test(
  'Stands still when nobody touches anything',
  "If we don't press any keys, the character should stay where they are.",
  async () => {
    const start = whereIsCharacter();

    await wait(1);

    const end = whereIsCharacter();
    check('The character has not moved', stepsBetween(start, end) < 0.01);
  },
);

test(
  'Walks to where you tap',
  'Tapping the grass should make the character walk to that spot and stop there.',
  async () => {
    const spot = { x: 3, z: 3 };

    tapGround(spot.x, spot.z);
    await wait(2);

    const end = whereIsCharacter();
    check('The character is on the spot we tapped', stepsBetween(end, spot) < 0.5);
  },
);

test(
  "Can't fall off the edge",
  'Walking towards the edge of the field for a long time should not take the character off it.',
  async () => {
    putCharacterAt(25, 0); // near the edge
    await wait(1); // give the camera time to catch up so we can watch

    await holdKey('ArrowRight', 2);

    const end = whereIsCharacter();
    check('The character is still on the field', isOnTheField(end));
  },
);

// Is a spot inside the field? (The field goes from -half to +half in both directions.)
function isOnTheField(spot) {
  const half = config.world.size / 2;
  return Math.abs(spot.x) < half && Math.abs(spot.z) < half;
}
