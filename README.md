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
- **Click / tap** the grass to walk there

## Where things live

| File | What it does |
| --- | --- |
| `src/config.js` | The fun knobs: colours, speed, zoom, title. Start here. |
| `src/main.js` | Builds everything and runs the game loop |
| `src/world.js` | The grassy field. Add trees, houses, ponds here. |
| `src/spare-parts/` | Ready-made pieces that aren't plugged in yet (a block world, pathfinding, a duck) |
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

## Spare parts: blocks, pathfinding and breaking

`src/spare-parts/` holds a block world with hills and trees, breakable blocks, a pathfinding duck and their tests. They're **not plugged in** right now. Its `README.md` says how to switch them back on. The engine helpers they use (`createBlockWorld`, `buildIsland`, `findPath`, `createPathWalker`) are still in `src/engine/`.

There's also a particle helper, `makeParticles()`, with sparkles, smoke, splashes, confetti, fire and crumbs, ready for when it's needed. The same `README.md` says how to plug it in.

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
