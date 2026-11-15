# Chair and crate art

[Compare the prop sheets](prop-preview.html) to see the same variants in five art styles. Pick **Frame at 1×** to inspect one slot in both styles. Use the [JSON frame map](prop-frames.json) for the asset names, cell size, ground anchor, and visible bounds.

## Runtime sheets

| Prop | 8-bit | 16-bit | 32-bit | 64-bit | 128-bit |
| --- | --- | --- | --- | --- | --- |
| Chair | [PNG](chair-8-spritesheet.png) | [PNG](chair-16-spritesheet.png) | [PNG](chair-32-spritesheet.png) | [PNG](chair-64-spritesheet.png) | [PNG](chair-128-spritesheet.png) |
| Crate | [PNG](crate-8-spritesheet.png) | [PNG](crate-16-spritesheet.png) | [PNG](crate-32-spritesheet.png) | [PNG](crate-64-spritesheet.png) | [PNG](crate-128-spritesheet.png) |

Each transparent PNG is 512 × 512, with sixteen 128 × 128 cells. Frame 0 is the base. Read the slots from left to right, then top to bottom. The ground origin is (64, 112) from the cell’s upper-left corner. The bit labels name the look. The engine can use the same cell and origin for every style.

| Row | Chair, left to right | Crate, left to right |
| --- | --- | --- |
| 1 | Wood, teal, red upholstery, sleeping orange cat | Wood, sage, iron-reinforced, open with red cloth |
| 2 | Moss green, red, ivory, indigo | Blue, red, ivory, violet |
| 3 | Woven seat, blue cushion, armrests, tall carved back | Rope-wrapped, brass corners, cross brace, turquoise seal |
| 4 | Red blanket, missing slat, snow, sleeping black cat | Open and empty, open with apples, cracked plank, snow |

The occupied chair and open crate are example states. A scene can draw those frames after its own rules change the state. The samples show art placement at 1×. Check seat fit, collisions, and interactions against the game’s scene.

## Generated references

[Chair master](chair-source-sheet.webp) · [Crate master](crate-source-sheet.webp)

ImageGen drew the 4 × 4 masters from four reference variants of each prop, then redrew the same layouts in four other styles. The export trims each cell, matches the visible rectangle to its master frame, and places it on the common ground anchor. The coarser exports use larger pixel clusters and a smaller palette.

### Master prompts

**Chair.** Make a production source sprite sheet using the uploaded four prop variants as reference for design, camera, and proportions. This new sheet is EXACTLY FOUR columns and FOUR rows, a strict uniform 4 by 4 grid on a square transparent canvas. Sixteen isolated instances, one per equal square cell. Cell centers are exactly 12.5%, 37.5%, 62.5%, 87.5% across and vertically. Maintain transparent gutters around each prop, alpha zero outside. Align every prop ground-footprint center slightly below each cell center, same scale, same front three-quarter top-down viewpoint, right side visible. No numbering, lines, visible grid, labels, scenery, ground, cast shadows, spare props, backdrop or checkerboard. Rich hand-painted HD 2D adventure game sprite look with clear edges, rich material highlights, and small well-controlled pixel texture. Do not alter the layout or rearrange the following rows. CHAIR variants only. ROW 1 left to right: plain golden wooden ladder-back chair, same chair painted slate teal, rounded carved walnut chair with red seat, golden base chair with a sleeping orange tabby curled on its seat. Use the four reference variants as those first four designs. ROW 2 left to right: base chair painted moss green, cherry red, pale ivory, and dark indigo respectively. ROW 3 left to right: wooden chair with woven cane seat, with blue cushion, with armrests, with taller ornate carved back. ROW 4 left to right: golden base chair with a folded red blanket on the seat, with a single missing slat in the back, with snowy dust edging the seat, with a sleeping black cat curled on its seat. Keep each separate, in exact row order. Total sixteen.

**Crate.** Make a production source sprite sheet using the uploaded four prop variants as reference for design, camera, and proportions. This new sheet is EXACTLY FOUR columns and FOUR rows, a strict uniform 4 by 4 grid on a square transparent canvas. Sixteen isolated instances, one per equal square cell. Cell centers are exactly 12.5%, 37.5%, 62.5%, 87.5% across and vertically. Maintain transparent gutters around each prop, alpha zero outside. Align every prop ground-footprint center slightly below each cell center, same scale, same front three-quarter top-down viewpoint, right side visible. No numbering, lines, visible grid, labels, scenery, ground, cast shadows, spare props, backdrop or checkerboard. Rich hand-painted HD 2D adventure game sprite look with clear edges, rich material highlights, and small well-controlled pixel texture. Do not alter the layout or rearrange the following rows. CRATE variants only. ROW 1 left to right: closed golden wood shipping crate with single diagonal front brace, same crate with sage paint, dark wood version with wide iron corner reinforcement, golden base crate open with hinged lid up and folded red cloth inside. Use the four reference variants as those first four designs. ROW 2 left to right: same closed base crate painted blue, red, ivory, dark violet. ROW 3 left to right: closed crate with braided rope around it, closed dark walnut crate with brass corners, closed pale birch crate with a wooden X brace, closed cedar crate with a small plain turquoise seal. ROW 4 left to right: base crate open and empty, base crate open with visible apples inside, closed crate with a single cracked plank, closed golden crate lightly dusted with snow. Keep each separate in exact row order. Total sixteen.

### Style prompts

Convert the attached complete 4-by-4 production prop sheet into a new style. STYLE CHANGE ONLY. Replace the rendering in all 16 cells. Keep every object in its original square, in identical row-major order, with identical proportions, orientation, approximate bounding box, footprint, and ground contact point. Keep all four rows and all four columns, same margins, no clipping. Keep each variant's original design and colors recognizable: match each cell one-to-one from the supplied image. Do not exchange or repeat cells, and preserve the open spaces in each silhouette. Keep zero-alpha transparency outside all props and inside holes. No background, floor, shadows, grid, text, or checkerboard. Do not add props, embellishments, or scenery.

- 8-bit console style: deliberately blocky angular silhouettes, visibly very large square pixels, very few opaque colors per sprite, short strong outline, flat shadows, only essential highlights. Condense each variant to the simplest shapes that keep it identifiable, especially red seat, curled cats, open lid and contents.
- 16-bit console RPG style: classic visibly stepped mid-sized pixel clusters, three-tone shading, clean dark outline and clean limited palettes. Use a few hand-placed highlights to show wood and fabric. No smooth painterly gradients.
- 32-bit arcade RPG style: clean medium-fine pixel clusters, strong color saturation, broad hand-pixeled crisp highlight bands, richer but controlled color ramps, graphic silhouette outlines. Visible pixel structure is retained.
- 64-bit-inspired detailed 2D sprite style: fine hand-pixeled clusters, softer multi-step blue or warm shadows and more readable material texture than arcade sprites, subtle edges, controlled semi-realistic highlights. Keep a slightly stepped sprite edge and deliberate highlights. More detailed than 32-bit arcade art, less painted than the supplied reference.
