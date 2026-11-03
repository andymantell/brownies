import * as THREE from 'three';
import { config } from './config.js';

// Renderer, camera and lights. You shouldn't need to touch this much.

// The camera sits up in the corner looking down at 45°: that's what makes it isometric.
const CAMERA_OFFSET = new THREE.Vector3(20, 20, 20);

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.world.skyColour);

  // Orthographic = no perspective, so things far away aren't smaller. Classic isometric look.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  camera.position.copy(CAMERA_OFFSET);
  camera.lookAt(0, 0, 0);

  // Soft light from the sky (blue-ish) and bounced from the grass (green-ish).
  const skyLight = new THREE.HemisphereLight('#dff3ff', '#5a7d3a', 1.2);
  scene.add(skyLight);

  // The sun. It casts the shadows.
  const sun = new THREE.DirectionalLight(config.sun.colour, config.sun.strength);
  sun.position.set(8, 16, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 60;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 4;
  scene.add(sun);
  scene.add(sun.target);

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    const view = config.camera.viewSize;
    camera.left = (-view * aspect) / 2;
    camera.right = (view * aspect) / 2;
    camera.top = view / 2;
    camera.bottom = -view / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  window.addEventListener('resize', resize);
  resize();

  // Camera and sun gently follow whatever we're looking at (usually the character).
  const lookTarget = new THREE.Vector3();
  const sunOffset = sun.position.clone();
  function follow(position, dt) {
    lookTarget.lerp(position, 1 - Math.exp(-config.camera.followSpeed * dt));
    camera.position.copy(lookTarget).add(CAMERA_OFFSET);
    camera.lookAt(lookTarget);
    sun.position.copy(lookTarget).add(sunOffset);
    sun.target.position.copy(lookTarget);
  }

  return { renderer, scene, camera, sun, follow };
}
