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
| `src/character.js` | The box character and its walk animation |
| `src/controls.js` | Keyboard and tap-to-move |
| `src/engine/` | The fiddly behind-the-scenes stuff (three.js, canvas, maths), hidden behind helpers with clear names like `makeBox`, `createKeyboard` and `startGameLoop`. You don't need to read it to change the game. |

The files outside `engine/` never touch three.js directly, so they stay short and readable.

You can also poke the game from the browser console through `window.game`, for example:

```js
game.character.person.scale.set(3, 3, 3)
```

## Deploying

Every push to `main` deploys to GitHub Pages using `.github/workflows/pages.yml`. Each deploy puts the code in a new folder named after the commit, and `index.html` reads `version.txt` to find it, so nobody gets a stale cached copy.
