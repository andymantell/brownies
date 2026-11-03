"""Build a low-poly toadstool in Blender and save it for the game.

Run it from the brownies folder (Blender doesn't need to be open):

    blender --background --python tools/blender/make-toadstool.py

It writes models/toadstool.glb, which the game loads in src/world.js.

The toadstool is about 1.5 steps tall, with the bottom of its stalk at the
middle of the world (0, 0, 0). Blender's "up" is Z; the exporter turns that
into the game's "up", which is Y.
"""

import math
from pathlib import Path

import bmesh
import bpy

BROWNIES_FOLDER = Path(__file__).resolve().parents[2]
SAVE_TO = BROWNIES_FOLDER / "models" / "toadstool.glb"

STALK_HEIGHT = 1.0
STALK_WIDTH_AT_BOTTOM = 0.32
STALK_WIDTH_AT_TOP = 0.24

CAP_WIDTH = 0.7  # from the middle of the cap out to its edge
CAP_SQUASH = 0.7  # 1 would be a round dome, smaller is flatter
SPOT_SIZE = 0.09


def colour_from_hex(hex_colour):
    """Turn '#ff0000' into the numbers Blender wants (red, green, blue, alpha)."""
    hex_colour = hex_colour.lstrip("#")
    numbers = []
    for start in (0, 2, 4):
        brightness = int(hex_colour[start:start + 2], 16) / 255
        # Screens use "sRGB" colours but Blender's materials use "linear" ones.
        if brightness <= 0.04045:
            numbers.append(brightness / 12.92)
        else:
            numbers.append(((brightness + 0.055) / 1.055) ** 2.4)
    return (numbers[0], numbers[1], numbers[2], 1.0)


def make_paint(name, hex_colour):
    """A simple material with one colour, a little bit shiny."""
    paint = bpy.data.materials.new(name)
    colour = colour_from_hex(hex_colour)

    surface = paint.node_tree.nodes["Principled BSDF"]
    surface.inputs["Base Color"].default_value = colour
    surface.inputs["Roughness"].default_value = 0.6

    paint.diffuse_color = colour  # how it looks in Blender's own viewport
    return paint


def make_stalk(paint):
    """A slightly tapered cylinder with its bottom on the ground."""
    bpy.ops.mesh.primitive_cone_add(
        vertices=8,
        radius1=STALK_WIDTH_AT_BOTTOM,
        radius2=STALK_WIDTH_AT_TOP,
        depth=STALK_HEIGHT,
        location=(0, 0, STALK_HEIGHT / 2),
    )
    stalk = bpy.context.active_object
    stalk.name = "Stalk"
    stalk.data.materials.append(paint)
    return stalk


def make_cap(paint):
    """Half a sphere, squashed a bit, sitting on top of the stalk."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=CAP_WIDTH)
    cap = bpy.context.active_object
    cap.name = "Cap"

    # Cut off the bottom half of the sphere, then fill in the hole underneath.
    shape = bmesh.new()
    shape.from_mesh(cap.data)
    bottom_half = [corner for corner in shape.verts if corner.co.z < -0.001]
    bmesh.ops.delete(shape, geom=bottom_half, context="VERTS")
    bmesh.ops.holes_fill(shape, edges=shape.edges, sides=0)
    shape.to_mesh(cap.data)
    shape.free()

    cap.scale.z = CAP_SQUASH
    cap.location.z = STALK_HEIGHT
    cap.data.materials.append(paint)
    return cap


def point_on_cap(tilt_degrees, turn_degrees):
    """A point on the outside of the cap.

    tilt_degrees: 0 is the very top, 90 is the edge.
    turn_degrees: how far round the cap, like a compass.
    """
    tilt = math.radians(tilt_degrees)
    turn = math.radians(turn_degrees)
    x = CAP_WIDTH * math.sin(tilt) * math.cos(turn)
    y = CAP_WIDTH * math.sin(tilt) * math.sin(turn)
    z = STALK_HEIGHT + CAP_WIDTH * CAP_SQUASH * math.cos(tilt)
    return (x, y, z)


def make_spots(paint):
    """Little white blobs dotted around the cap."""
    places = [
        (0, 0),
        (35, 20),
        (35, 140),
        (35, 260),
        (65, 80),
        (65, 200),
        (65, 320),
    ]
    spots = []
    for tilt_degrees, turn_degrees in places:
        bpy.ops.mesh.primitive_ico_sphere_add(
            subdivisions=1,
            radius=SPOT_SIZE,
            location=point_on_cap(tilt_degrees, turn_degrees),
        )
        spot = bpy.context.active_object
        spot.name = "Spot"
        spot.data.materials.append(paint)
        spots.append(spot)
    return spots


def main():
    # Start with a completely empty scene (no default cube, camera or light).
    bpy.ops.wm.read_factory_settings(use_empty=True)

    stalk = make_stalk(make_paint("Stalk", "#f3e6c8"))
    cap = make_cap(make_paint("Cap", "#d92b2b"))
    spots = make_spots(make_paint("Spots", "#ffffff"))

    # Glue all the pieces into one object called "Toadstool".
    bpy.ops.object.select_all(action="DESELECT")
    for piece in [stalk, cap] + spots:
        piece.select_set(True)
    bpy.context.view_layer.objects.active = stalk
    bpy.ops.object.join()
    toadstool = bpy.context.active_object
    toadstool.name = "Toadstool"

    # Move its "handle" (origin) to the middle of the world, so the bottom of
    # the stalk is the point the game places on the grass.
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # Low-poly look: flat faces, not smoothed.
    bpy.ops.object.shade_flat()

    SAVE_TO.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(SAVE_TO), export_format="GLB")
    print(f"Saved the toadstool to {SAVE_TO}")


main()
