# From a character to a playable sprite sheet

Use this workflow in Engine & Assets, then carry the same sheet and animation map into the Development Sandbox. The result is a character whose actions read at game size and whose movement follows the real game rules.

## Plan the frames

Start from the chosen visual reference and plan the character's action set, including what they do while the player is doing nothing. A walking strip is one part of that set. Use this common checklist, then keep the actions that fit the character's role and the game. A peaceful villager does not need the same combat frames as an enemy.

| Action family | Common frames to consider | What makes it complete for this character |
| --- | --- | --- |
| Resting idle | Neutral pose, breathing, blink, small weight shift | A quiet base that reads in each required direction |
| Movement | Walk and stop; run, turn, jump or climb when used | Every movement mode and facing required by the rules |
| Interaction | Reach, pick up, hold, use, put away, talk or gesture | Readable entry, action, and return to the ordinary pose |
| Posture | Sit, stand, lie down, sleep or wake when used | Transitions and anchors match the chair, bed, or floor |
| Reaction | Surprise, greeting, success, refusal; hurt or defeat when used | Feedback matches the game's actual outcomes |
| Personal habits | Two or three small actions specific to this character | Distinct, occasional behavior that gives the character some personality |

Keep an action/direction table with frame names or indices, order, frame rate, looping, start condition, interruption rule, and return pose. Mark each row Needed, Drawn, Wired, Verified, or N/A with a reason. A character's sheet is complete for the release when its required rows pass, not when an image contains a particular number of poses. Record missing directional variants explicitly.

### Give the character little idle habits

A character can blink, fidget with a sleeve, shuffle a boot, kick their feet while sitting, or pull something from a pocket and use it after standing still for a while. Choose a couple of habits that fit this person. An explorer might check a notebook; a courier might adjust a bag strap. These actions give an otherwise still character a little life.

Keep a subtle base idle, then use short occasional variations with a longer delay for an involved action. As a starting point, try a blink after several seconds, a small fidget later, and a pocket-item action after a longer uninterrupted wait. Tune the delays in the game and vary them within a bounded range so a crowd does not blink together. Leave quiet time between habits and avoid repeating the same large action back-to-back.

Make a pocket action readable as take out → use → put away. Give it enough frames to keep the object, hands, and body consistent. Two to four good frames may be enough for a blink or foot tap; use more when the action needs them. Preserve the facing direction unless an intentional turn is part of the animation. Use a direction-specific habit only in a direction for which it has artwork.

Movement and interaction take priority immediately. Reset the idle wait after player input. Suppress unrelated habits during dialogue, a listening puzzle, a cutscene, or another authored action. A cosmetic blink must not count as movement, advance a need, consume an item, award progress, or interrupt a stillness challenge. For online play, decide which visible actions need to be shared; cosmetic idle timing can be local, while an actual item use still follows server rules. Pause or reset the wait when the app loses focus so a returning player does not get a burst of queued animations. Include reduced incidental motion when the game's accessibility scope calls for it.

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

Use a resettable sandbox space to play every action from the action table and inspect its entry, loop or hold, interruption, and return. Include an action picker for long-delay habits so contributors can inspect the actual frames without waiting, and test the natural idle timing separately. Walk in every direction, turn rapidly, stop, press into a wall, enter dialogue, resume, and change scenes. Interrupt a pocket-item habit with movement and interaction; verify the prop disappears and the next input works immediately. Check that idle variations never alter the simulation or complete a stillness challenge. Inspect at the game's real scale. Watch the feet for jitter, the silhouette for size changes, and the last-to-first transition for a visible snap. Try low and high frame rates. Check the character remains readable against the actual backgrounds.

Save the engine version, asset revision, action/frame map, target, observed results, and remaining art work. A passing loader test proves the sheet imported; a visible moving loop proves more. Keep art approval separate from technical verification.

References: [Phaser sprite and image skills](https://github.com/phaserjs/phaser/tree/v4.2.1/skills/sprites-and-images), [animation skills](https://github.com/phaserjs/phaser/tree/v4.2.1/skills/animations), and [loader skills](https://github.com/phaserjs/phaser/tree/v4.2.1/skills/loading-assets).
