# Sprite Generator

Open **Sprite Generator** from the footer of an enabled private Project Bible reader. The editor shows which project and set you’re working on and whether your changes are saved.

Choose a saved set or create a new one. Import transparent PNGs for the artwork you already have. Keep the artwork and set in the project's own workspace so a Bible update doesn’t overwrite them.

## Check a part on a character

Create a pose, then register an image against a named view and slot. The slot follows one anchor in the pose, such as the head, body, or origin. Import face parts on the same reference canvas, or enter an offset during registration. An expression chooses replacement parts by slot. You can change just the mouth and keep the eye art, body, and pose timing.

Set the layers in back-to-front order. Step through the poses before you play the motion. Check the close-up for alignment and the game-size view for readability. Turn on the anchor guides while lining up an attachment; the guides stay out of the rendered sheet.

## Build a fixed grid

Open **Combine & Export**. Select an imported sheet and set its rows, columns, and origin. Pick the cells you want and put them in order. Set the output cell dimensions and the number of rows and columns. Choose **Combine** to preview the sheet before downloading it.

The frames go left to right and then down. The tool keeps the source pixels, and any space to the right or below a frame stays transparent. Spare cells stay transparent too. If a frame needs more space or there aren't enough cells, revise the grid and Combine again.

Use **Export** to download the PNG and frame map. The frame map records the layout, origin and source of each frame. For a fixed-cell Phaser spritesheet, use the map's cell width and height in the loader; apply the frame's origin in the game.

## Installation

This tool uses the shared Bible checkout and an explicitly enabled private reader. Follow the [private reader setup instructions](https://github.com/garbledhamster/bible.ourstuff.space/blob/main/tools/bible-reader/README.md#sprite-generator) to point each reader at its project-owned sprite workspace and start the updated reader server.
