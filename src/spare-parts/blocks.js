// 🧱 The kinds of block our world is built from.
//
// Each block has a colour. You can also give it:
//   top: a different colour for the top
//   bottom: a different colour for the bottom
//   grassyEdges: true, to paint a strip of the top colour down the sides (like grass)
//   unbreakable: true, so nobody can dig it up
//
// Add your own! Then use them in spare-parts/world.js, like this:
//   blocks.put(0, 0, 0, 'cheese')

export const blockTypes = {
  grass: {
    colour: '#8b5e3c',
    top: '#7cc85a',
    grassyEdges: true,
  },

  dirt: {
    colour: '#8b5e3c',
  },

  stone: {
    colour: '#9a9a9a',
  },

  sand: {
    colour: '#e8d48a',
  },

  wood: {
    colour: '#9a6a3c',
    top: '#b8894f',
    bottom: '#b8894f',
  },

  leaves: {
    colour: '#4f9a3c',
  },

  // The very bottom of the world, so nobody can dig a hole right through it.
  bedrock: {
    colour: '#4a4a52',
    unbreakable: true,
  },
}
