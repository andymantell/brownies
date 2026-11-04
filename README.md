# Brownies Game

A blank-canvas isometric game, built live with a group of Brownies from their ideas.

Plain HTML and JavaScript with [Three.js](https://threejs.org/). No build step, no `npm install`, and Three.js is included in `vendor/` so it works without internet.

## Run it on your laptop

Browsers won't load JavaScript modules from a `file://` page, so start the tiny local web server in this folder:

```sh
python3 serve.py
```

Then open http://localhost:8000 and refresh after each change. `serve.py` tells the browser not to cache anything, so you always see your latest code.

## Play

- **Arrow keys** or **WASD** to walk
- **Click / tap** the ground to walk there
- **Space bar** to break the block in front of you

## Where things live

| File | What it does |
| --- | --- |
| `src/config.js` | The fun knobs: colours, speed, zoom, title. Start here. |
| `src/main.js` | Builds everything and runs the game loop |
| `src/world.js` | The island of blocks, and the trees on it. Add houses, ponds here. |
| `src/blocks.js` | The kinds of block (grass, stone, wood...) and their colours. Add your own! |
| `src/duck.js` | A demo duck that uses pathfinding to follow you around (temporary) |
| `src/character.js` | The box character and its walk animation |
| `src/controls.js` | Keyboard and tap-to-move |
| `src/speech.js` | The things the character says in a speech bubble |
| `slides/` | The intro slide deck, at `/slides` (press → or click to move on, F for full screen) |
| `models/` | 3D models made in Blender, as `.glb` files |
| `src/engine/` | The fiddly behind-the-scenes stuff (three.js, canvas, maths), hidden behind helpers with clear names like `makeBox`, `createKeyboard` and `startGameLoop`. You don't need to read it to change the game. |

The files outside `engine/` never touch three.js directly, so they stay short and readable.

You can also poke the game from the browser console through `window.game`, for example:

```js
game.character.person.scale.set(3, 3, 3)
```

## Blocks, pathfinding and breaking

The world is made of 1 × 1 × 1 blocks on a grid (see `src/engine/block-world.js`). In `src/world.js`, `blocks.put(x, y, z, 'stone')` adds a block and `blocks.remove(x, y, z)` takes one away. A block's bottom is at height `y`, so the normal ground is the grass at `y = -1` and you stand at height 0.

- `buildIsland` (in `src/engine/terrain.js`) makes the island. Set `hilliness: 0` and `howManyTrees: 0` in `config.js` for a flat, empty world.
- You can step up one block, but not two, and you drop off ledges. Everyone who walks uses `blocks.moveAlong(...)`, so the rules are the same for everyone.
- `createPathWalker` (in `src/engine/path-walker.js`) walks a creature along a route from `findPath` (A* pathfinding, in `src/engine/pathfinding.js`). The duck in `src/duck.js` shows how, with white dots showing its route.
- `blocks.break(x, y, z)` breaks a block with a burst of crumbs. Blocks marked `unbreakable` in `blocks.js` (like bedrock) can't be broken.

## Making models in Blender

Scripts in `tools/blender/` build a model in [Blender](https://www.blender.org/) and export it as a `.glb` file into `models/`. `make-toadstool.py` is a worked example to copy. Blender doesn't need to be open. On this laptop it isn't on the PATH, so use its full path, from this folder:

```sh
"C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" --background --python tools/blender/make-toadstool.py
```

To put a model in the game, import `loadModel` from `./engine/index.js` in `src/world.js`, add a little helper, and call `addToadstool(screen)` from `createWorld`:

```js
async function addToadstool(screen) {
  const toadstool = await loadModel('models/toadstool.glb')
  toadstool.position.set(3, 0, -3) // 3 steps across, 3 steps back
  screen.add(toadstool)
}
```

## Tests

Click the peeling corner in the top right of the game to open the tests, then press ▶ to watch the character do each one. The tests live in `src/tests.js`, and each one is a name, a description, some steps and a `check('what we expect', ...)`.

The same tests run in a headless browser on every push (`tools/run-tests.mjs`), and the site only deploys if they all pass.

## Deploying

Every push to `main` deploys to GitHub Pages using `.github/workflows/pages.yml`. Each deploy puts the code in a new folder named after the commit, and `index.html` reads `version.txt` to find it, so nobody gets a stale cached copy.
