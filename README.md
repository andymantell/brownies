# Brownies Game

A blank-canvas isometric game, built live with a group of Brownies from their ideas.

Plain HTML and JavaScript with [Three.js](https://threejs.org/). No build step, no `npm install`, and Three.js is included in `vendor/` so it works without internet.

## Run it on your laptop

Browsers won't load JavaScript modules from a `file://` page, so start a tiny local web server in this folder:

```sh
python3 -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000 and refresh after each change.

## Play

- **Arrow keys** or **WASD** to walk
- **Click / tap** the grass to walk there

## Where things live

| File | What it does |
| --- | --- |
| `src/config.js` | The fun knobs: colours, speed, zoom, title. Start here. |
| `src/character.js` | The box character and its walk animation |
| `src/world.js` | The grassy field. Add trees, houses, ponds here. |
| `src/helpers.js` | `makeBox({ width, height, depth, colour })` for building anything out of cubes |
| `src/controls.js` | Keyboard and tap-to-move |
| `src/scene.js` | Renderer, isometric camera, sun and shadows |
| `src/main.js` | Plugs it all together and runs the game loop |

You can also poke the game from the browser console through `window.game`, for example:

```js
game.character.object.scale.setScalar(3)
```

## Deploying

Every push to `main` deploys to GitHub Pages using `.github/workflows/pages.yml`.
