// ⭐ The fun knobs. Change these live and refresh the page!

export const config = {
  title: 'Our Game',

  world: {
    size: 60, // how big the grassy field is
    grassColour: '#7cc85a',
    skyColour: '#bfe6ff',
  },

  character: {
    speed: 5, // walking speed
    bodyColour: '#ff6b6b',
    headColour: '#ffd6a5',
    hairColour: '#6b4226',
    legColour: '#3d5a80',
    armColour: '#ff6b6b',
    eyeColour: '#222222',
  },

  house: {
    x: -6, // where the house is
    z: -2,
    wallColour: '#e8d8b8',
    roofColour: '#222222',
    doorColour: '#8b5a2b',
  },

  cat: {
    x: 3, // where the cat is
    z: 3,
    furColour: '#8a8d91',
    eyeColour: '#9be36b',
    noseColour: '#ff9eb5',
  },

  garden: {
    x: 5, // where the flower garden is
    z: -2,
    petalColour: '#ff5fa2',
  },

  catHouse: {
    x: 6, // where the cat house is
    z: 3,
    wallColour: '#c8e0f4',
    roofColour: '#d9534f',
  },

  catBowls: {
    waterX: 5.4, // where the bowl of water is
    waterZ: 4.6,
    foodX: 6.6, // where the bowl of food is
    foodZ: 4.6,
    bowlColour: '#f2f2f2',
    waterColour: '#4aa3df',
    biscuitColour: '#8b5a2b',
  },

  camera: {
    zoom: 14, // how much of the world fits on screen: bigger number = zoomed further out
    followSpeed: 4, // how quickly the camera catches up with the character
  },

  speech: {
    showForSeconds: 3, // how long the speech bubble stays up
    quietForAtLeast: 10, // the shortest wait (in seconds) before saying something else
    quietForAtMost: 15, // the longest wait
  },

  sun: {
    colour: '#fff4e0',
    strength: 2.2,
  },
}
