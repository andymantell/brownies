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
    legColour: '#3d5a80',
    armColour: '#ff6b6b',
    eyeColour: '#222222',
  },

  camera: {
    zoom: 14, // how much of the world fits on screen: bigger number = zoomed further out
    followSpeed: 4, // how quickly the camera catches up with the character
  },

  sun: {
    colour: '#fff4e0',
    strength: 2.2,
  },
}
