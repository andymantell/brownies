// ⭐ The fun knobs. Change these live and refresh the page!

export const config = {
  title: 'Our Game',

  world: {
    size: 60, // how big the grassy field is
    grassColour: '#7cc85a',
    skyColour: '#bfe6ff',
  },

  // Our hero: a girl with light brown hair. She walks with the arrow keys.
  character: {
    speed: 5, // walking speed
    bodyColour: '#ff6b6b',
    headColour: '#ffd6a5',
    hairColour: '#b5835a', // light brown
    legColour: '#3d5a80',
    armColour: '#ff6b6b',
    eyeColour: '#222222',
    hasLongHair: true,
  },

  // The second player: a girl, made of boxes too. She walks with W A S D.
  girl: {
    speed: 5,
    bodyColour: '#b388eb',
    headColour: '#f1c27d',
    hairColour: '#f2c94c',
    legColour: '#5c4d7d',
    armColour: '#b388eb',
    eyeColour: '#222222',
    hasLongHair: true,
    startX: 3, // where she starts, next to our hero
    startZ: 0,
  },

  house: {
    x: -14, // where the house is
    z: -2,
    width: 12, // from side to side
    depth: 9, // from front to back
    wallHeight: 3.5,
    wallColour: '#e8d8b8',
    roofColour: '#222222',
    doorColour: '#8b5a2b',
    bedColour: '#a0522d', // the wooden bed frame
    blanketColour: '#5b8def',
    sofaColour: '#2a9d8f',
  },

  cat: {
    x: 3, // where the cat is
    z: 3,
    furColour: '#8a8d91',
    eyeColour: '#9be36b',
    noseColour: '#ff9eb5',
    followSpeed: 3.5, // how fast the cat trots after the hero
    staysThisClose: 1.5, // the cat stops when it's this close
  },

  labrador: {
    x: -2, // where the labrador is
    z: 5,
    furColour: '#e8c170',
    snoutColour: '#e8c170',
    earColour: '#d4a85a',
    eyeColour: '#3b2416',
    noseColour: '#2b1d14',
    followSpeed: 3.5, // how fast the labrador runs after the girl
    staysThisClose: 1.5, // the labrador stops when it's this close
  },

  husky: {
    x: 0.5, // where the husky is
    z: 6,
    furColour: '#7d8590',
    snoutColour: '#f4f4f4', // huskies have a white face
    earColour: '#5f6670',
    eyeColour: '#3fa9f5', // bright blue eyes
    noseColour: '#222222',
    pointyEars: true,
    followSpeed: 4, // how fast the husky runs after the hero
    staysThisClose: 2.5, // a bit further back than the cat, so they don't squash together
  },

  horse: {
    x: 3, // where the horse starts
    z: 8,
    coatColour: '#8b5a2b',
    maneColour: '#3b2416',
    noseColour: '#5e3a1a',
    eyeColour: '#111111',
    hoofColour: '#2b2b2b',
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

  santa: {
    x: 0, // where Santa is
    z: -6,
    suitColour: '#d62828',
    beltColour: '#222222',
    buckleColour: '#f4c430',
    skinColour: '#ffd6a5',
    beardColour: '#ffffff',
    eyeColour: '#222222',
    noseColour: '#ff8a8a',
  },

  sleigh: {
    x: 0, // where Santa's sleigh is
    z: -8, // where the sleigh stops
    startZ: -30, // where the sleigh comes from: right at the far edge of the field
    speed: 4, // how fast the sleigh rides in
    woodColour: '#b3122e',
    trimColour: '#f4c430',
    ropeColour: '#6b4226',
  },

  volcano: {
    isOn: false, // switch the volcano on (true) or off (false)
    x: 16, // where the volcano is: far away from the house, garden and pets
    z: -16,
    rockColour: '#5a4a42',
    darkRockColour: '#3b302b',
    lavaColour: '#ff5a00',
    secondsBetweenEruptions: 30, // how often the volcano erupts
    secondsBeforeFirstEruption: 5, // so we don't have to wait long for the first one
    eruptionLasts: 3, // how many seconds lava shoots out for
    lavaRainLasts: 6, // how many seconds lava rains down on the world after an eruption
    lavaDropsPerSecond: 250, // how heavy the lava rain is
  },

  bath: {
    x: -6, // where the bath is: out on the grass, in front of the house
    z: 10,
    colour: '#ffffff',
    waterColour: '#6ec6ff',
    feetColour: '#f4c430',
  },

  portaloo: {
    x: -9.5, // where the portaloo is: right next to the bath
    z: 10,
    wallColour: '#2f80ed',
    roofColour: '#e0e0e0',
  },

  camera: {
    zoom: 14, // how much of the world fits on screen: bigger number = zoomed further out
    followSpeed: 4, // how quickly the camera catches up with the character
  },

  sun: {
    colour: '#fff4e0',
    strength: 2.2,
  },

  // The sea, along the right-hand edge of the field.
  sea: {
    width: 24, // how far out the sea goes
    level: -0.4, // how high the water is: a bit lower than the grass
    colour: '#2f8fd8',
    deepColour: '#1d5f9e', // the darker water underneath the waves
  },
}
