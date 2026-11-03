import { config } from './config.js';
import { createScreen, startGameLoop } from './engine/index.js';
import { createWorld } from './world.js';
import { createCharacter } from './character.js';
import { createControls } from './controls.js';

// This is where the game starts. It builds everything, then runs the game loop.

// Put the game's name at the top of the screen and on the browser tab.
document.getElementById('title').textContent = config.title;
document.title = config.title;

// Build everything.
const screen = createScreen(document.getElementById('game'), {
  skyColour: config.world.skyColour,
  zoom: config.camera.zoom,
  cameraFollowSpeed: config.camera.followSpeed,
  sunColour: config.sun.colour,
  sunStrength: config.sun.strength,
});
const world = createWorld(screen);
const character = createCharacter(screen);
const controls = createControls(screen);

// The game loop runs about 60 times every second.
// Each time, we move things a tiny bit and draw a new picture.
startGameLoop((secondsPassed) => {
  const direction = controls.getDirection(character.position);
  character.update(secondsPassed, direction);
  world.keepOnField(character.position);

  screen.follow(character.position, secondsPassed);
  screen.draw();
});

// Lets you play with the game from the browser console. Try:
//   game.character.person.scale.set(3, 3, 3)
window.game = { screen, world, character, config };
