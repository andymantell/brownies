import * as THREE from 'three';
import { config } from './config.js';
import { createScene } from './scene.js';
import { createWorld } from './world.js';
import { createCharacter } from './character.js';
import { createControls } from './controls.js';

// This is where everything gets plugged together, and the game loop runs.

document.getElementById('title').textContent = config.title;
document.title = config.title;

const canvas = document.getElementById('game');
const { renderer, scene, camera, follow } = createScene(canvas);
const world = createWorld(scene);
const character = createCharacter(scene);
const controls = createControls({ canvas, camera, scene });

const clock = new THREE.Clock();

function tick() {
  const dt = Math.min(clock.getDelta(), 0.1); // don't jump miles if the tab was hidden

  const direction = controls.getDirection(character.position, dt);
  character.update(dt, direction);
  world.clamp(character.position);

  follow(character.position, dt);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(tick);

// Handy for poking at things from the browser console, e.g. game.character.object.scale.setScalar(3)
window.game = { THREE, scene, camera, world, character, config };
