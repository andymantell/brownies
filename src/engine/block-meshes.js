import * as THREE from 'three'

// Turns a pile of blocks into shapes the graphics card can draw quickly.
//
// The trick: we only draw the sides of blocks you could actually see. If a block has
// another block right next to it, that side is hidden, so we skip it.
// Underground blocks are completely surrounded, so they aren't drawn at all!

// The 6 sides of a block, in the order three.js uses for a box:
// right, left, top, bottom, front, back.
// Each side has the direction it faces, and its 4 corners (as 0 or 1 across, up and back).
const SIDES = [
  {
    facing: [1, 0, 0],
    corners: [[1, 1, 1], [1, 0, 1], [1, 1, 0], [1, 0, 0]],
    pictureCorners: [[0, 1], [0, 0], [1, 1], [1, 0]],
  },
  {
    facing: [-1, 0, 0],
    corners: [[0, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 1]],
    pictureCorners: [[0, 1], [0, 0], [1, 1], [1, 0]],
  },
  {
    facing: [0, 1, 0],
    corners: [[0, 1, 1], [1, 1, 1], [0, 1, 0], [1, 1, 0]],
    pictureCorners: [[1, 1], [0, 1], [1, 0], [0, 0]],
  },
  {
    facing: [0, -1, 0],
    corners: [[1, 0, 1], [0, 0, 1], [1, 0, 0], [0, 0, 0]],
    pictureCorners: [[1, 0], [0, 0], [1, 1], [0, 1]],
  },
  {
    facing: [0, 0, 1],
    corners: [[0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]],
    pictureCorners: [[0, 0], [1, 0], [0, 1], [1, 1]],
  },
  {
    facing: [0, 0, -1],
    corners: [[1, 0, 0], [0, 0, 0], [1, 1, 0], [0, 1, 0]],
    pictureCorners: [[0, 0], [1, 0], [0, 1], [1, 1]],
  },
]

// Make one mesh for each kind of block in this list.
// `blocks` is a list of { x, y, z, type }. `isSolid(x, y, z)` says if there's a block there.
export function makeBlockMeshes(blocks, isSolid, looks) {
  const blocksOfEachType = {}
  for (const block of blocks) {
    if (!blocksOfEachType[block.type]) {
      blocksOfEachType[block.type] = []
    }
    blocksOfEachType[block.type].push(block)
  }

  const meshes = []
  for (const type of Object.keys(blocksOfEachType)) {
    const mesh = makeMeshForOneType(blocksOfEachType[type], isSolid, looks[type].faces)
    if (mesh) {
      meshes.push(mesh)
    }
  }
  return meshes
}

function makeMeshForOneType(blocks, isSolid, faces) {
  const corners = []
  const directions = []
  const pictureSpots = []
  const shades = []
  const triangles = []
  const geometry = new THREE.BufferGeometry()

  // Draw all the right-hand sides, then all the left-hand sides, and so on,
  // so each set of sides can have its own picture.
  SIDES.forEach((side, sideNumber) => {
    const firstTriangle = triangles.length

    for (const block of blocks) {
      const neighbourX = block.x + side.facing[0]
      const neighbourY = block.y + side.facing[1]
      const neighbourZ = block.z + side.facing[2]

      if (isSolid(neighbourX, neighbourY, neighbourZ)) {
        continue // hidden behind another block
      }

      addSquare(block, side, { corners, directions, pictureSpots, shades, triangles })
    }

    const howManyTriangleCorners = triangles.length - firstTriangle
    geometry.addGroup(firstTriangle, howManyTriangleCorners, sideNumber)
  })

  if (triangles.length === 0) {
    return null // nothing to see
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(corners, 3))
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(directions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(pictureSpots, 2))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(shades, 3))
  geometry.setIndex(triangles)

  const mesh = new THREE.Mesh(geometry, faces)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

// Add one square side of a block: 4 corners, made of 2 triangles.
function addSquare(block, side, lists) {
  const firstCorner = lists.corners.length / 3

  // Each block is a tiny bit lighter or darker, so the ground doesn't look like wallpaper.
  const brightness = 0.9 + 0.14 * steadyRandom(block.x, block.y, block.z)

  side.corners.forEach((corner, number) => {
    // Block (x, y, z) goes from x - 0.5 to x + 0.5 across, y to y + 1 up, z - 0.5 to z + 0.5 back.
    lists.corners.push(block.x - 0.5 + corner[0], block.y + corner[1], block.z - 0.5 + corner[2])
    lists.directions.push(...side.facing)
    lists.pictureSpots.push(...side.pictureCorners[number])
    lists.shades.push(brightness, brightness, brightness)
  })

  lists.triangles.push(firstCorner, firstCorner + 1, firstCorner + 2)
  lists.triangles.push(firstCorner + 2, firstCorner + 1, firstCorner + 3)
}

// A number between 0 and 1 that looks random, but is always the same for the same position.
function steadyRandom(x, y, z) {
  const big = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
  return big - Math.floor(big)
}
