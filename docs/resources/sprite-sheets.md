# From a character to a playable sprite sheet

Use this workflow in Engine & Assets, then carry the same sheet and animation map into the Development Sandbox. The result is a character whose actions read at game size and whose movement follows the real game rules.

## Plan the frames

Start from the chosen visual reference. List the actions the current playable needs: idle, walk, interact, sit, sleep, or other actions the design actually uses. Choose the directions each needs. A four-direction walking character might use four frames per direction, giving sixteen frames in one sheet. Keep an action/direction table with frame names or indices, order, frame rate, loop behavior, and what ends the action.

Choose one cell size large enough for the widest pose. Fix the foot anchor, body scale, perspective, palette, and silhouette. Keep collision bounds separate from artwork bounds so a swinging arm does not push the character through a wall. For equipment layers, define matching frame names and anchors before adding clothing or weapons.

## Make and inspect the sheet

Generate or draw a coherent strip from one chosen seed frame. For generated art, request the full strip with the exact frame count, facing direction, outfit, palette, scale, and transparent background. Preserve the source and prompt. Inspect every frame: generated sheets can repeat poses, change clothing, drift in size, or paint a checkerboard instead of providing transparency.

Export either a fixed-cell sheet or an image with an atlas JSON describing each frame. A reference sheet with uneven poses, captions, and spacing is useful to look at, but needs explicit frame rectangles before the engine can use it. Normalize with a shared scale and anchor, or preserve the image and use atlas trim metadata to align frames. Resizing each pose independently changes body size during the animation.

Embed the source sheet and runtime export in the chapter with a caption, status, and source link. Keep third-party asset licenses and required credits with any reused files. A reference supplied to explain a layout does not by itself establish permission to ship its art.

## Load and animate in Phaser

Read the sprite, loader, and animation references for the project's installed Phaser version. This fixed-grid example uses four rows in down, left, right, up order, with four frames per row. Replace the dimensions with the sheet's actual cell size.

```js
// preload()
this.load.spritesheet('walker', 'art/walker.png', {
  frameWidth: 64, frameHeight: 64
});

// create(): global definitions are registered once across scene restarts.
const directions = ['down', 'left', 'right', 'up'];
for (const [row, direction] of directions.entries()) {
  const key = `walk-${direction}`;
  if (!this.anims.exists(key)) {
    this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers('walker', {
        start: row * 4, end: row * 4 + 3
      }),
      frameRate: 8,
      repeat: -1
    });
  }
}
const player = this.add.sprite(100, 100, 'walker', 0).setOrigin(0.5, 1);

// After movement rules accept displacement:
player.play('walk-left', true);
// When movement stops: stop playback and keep the facing direction.
player.stop().setFrame(4);
```

For uneven frames, use `this.load.atlas` and named animation frames. A static `Image` cannot play frame animations. Use `Sprite` for the actor and `Image` for scenery that remains still. Set animation from accepted movement and action state; blocked movement, dialogue, pause, and scene changes must leave a sensible pose. Keep footsteps and gameplay events tied to the intended rule or animation event without restarting the loop every update.

## Prove the result

Use a resettable sandbox space to walk in every direction, turn rapidly, stop, press into a wall, enter dialogue, resume, and change scenes. Inspect at the game's real scale. Watch the feet for jitter, the silhouette for size changes, and the last-to-first transition for a visible snap. Try low and high frame rates. Check the character remains readable against the actual backgrounds.

Save the engine version, asset revision, action/frame map, target, observed results, and remaining art work. A passing loader test proves the sheet imported; a visible moving loop proves more. Keep art approval separate from technical verification.

References: [Phaser sprite and image skills](https://github.com/phaserjs/phaser/tree/v4.2.1/skills/sprites-and-images), [animation skills](https://github.com/phaserjs/phaser/tree/v4.2.1/skills/animations), and [loader skills](https://github.com/phaserjs/phaser/tree/v4.2.1/skills/loading-assets).
