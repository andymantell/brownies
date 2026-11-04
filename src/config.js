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
    walkSpeed: 2, // how fast the horse wanders about
  },

  garden: {
    x: 13, // where the flower garden is: out on the grass, away from everything else
    z: 4,
    size: 6, // how big the soil patch is, from side to side
    soilColour: '#7a4b2a',
    flowersInARow: 6, // 6 rows of 6 flowers
    petalColours: ['#ff5fa2', '#ff4d4d', '#ffffff', '#9b5de5', '#ff9f1c'], // pink, red, white, purple, orange
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

  // A blocky snowman, out on the grass between Santa and the volcano.
  snowman: {
    x: 8, // where the snowman stands
    z: -8,
    snowColour: '#f7fbff',
    coalColour: '#1e1e1e', // his eyes and buttons
    carrotColour: '#ff8c1a', // his nose
    scarfColour: '#d62828',
    hatColour: '#222222',
  },

  // A big passenger jet, parked on the grass. Get in and fly it!
  jet: {
    x: -17, // where it's parked: in the far corner, away from everything else
    z: -20,
    bodyColour: '#f4f6f8',
    stripeColour: '#1d4e89',
    tailColour: '#d62828',
    windowColour: '#2b3a4a',
    engineColour: '#b8c0c8',
    wheelColour: '#222222',
    doorColour: '#9aa5b1',
    pilotHatColour: '#1b2a49',
  },

  // A hutch for the rabbit, inside the house: in the front right corner,
  // away from the bed, the sofa, the TV, the toilet and the door.
  rabbitHutch: {
    x: -9.7, // where the hutch is
    z: 0.8,
    woodColour: '#8b5a2b',
    barColour: '#c0c0c0',
    strawColour: '#e8d27a',
  },

  // The rabbit who lives in the hutch.
  rabbit: {
    furColour: '#a0785a', // a soft brown
    tailColour: '#ffffff',
    eyeColour: '#111111',
    noseColour: '#ff9eb5',
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

  // A wooden jetty, going out from the grass over the sea.
  jetty: {
    startX: 28, // where it starts, on the grass near the edge
    z: 8,
    length: 12, // how far out to sea it goes
    width: 2,
    woodColour: '#b07a45',
    postColour: '#6b4226',
  },

  // A yacht, tied up at the end of the jetty.
  yacht: {
    x: 39, // where it is: right next to the end of the jetty
    z: 5, // on the far side of the jetty (so it doesn't hide the players), right up against it
    hullColour: '#ffffff',
    stripeColour: '#1d4e89',
    deckColour: '#c8955c',
    cabinColour: '#e9eef2',
    mastColour: '#8b5a2b',
    sailColour: '#fffaf0',
  },

  // A trampoline, on the front of the yacht's deck.
  trampoline: {
    x: 42.3, // where it is: near the pointy front of the yacht
    y: 1, // standing on the deck
    z: 5,
    matColour: '#222222',
    frameColour: '#2f80ed',
    legColour: '#888888',
    bounceHeight: 6, // how many blocks high you bounce
  },

  // Swimming in the sea: walk or jump off the land, then climb back out.
  swimming: {
    depth: 1.5, // how far down into the water you sink
    speed: 0.5, // how fast you swim: 0.5 is half as fast as walking
    bobHeight: 0.08, // how far you bob up and down in the water
  },
}
