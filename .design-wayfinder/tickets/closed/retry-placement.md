---
title: Where should Retry appear after a soaked delivery?
type: compare
status: closed
created: 2026-11-13
---

# Where should Retry appear after a soaked delivery?

Compare Retry beside Mina’s response with Retry directly below it. The player needs to see what happened and find a way to try the delivery again.

## MVC tracer

- **Route:** Open the playable Dock at `/island-post/`. Add `?retry=below` for the second layout.
- **Controller:** Move right four times to hand over a soaked parcel, then activate Retry.
- **Model:** The existing Dock rules handle movement, the soaked handoff, and the fresh parcel.
- **View:** Mina’s response and the Retry button appear in the result panel.
- **Return:** The courier is back at the fork with a fresh parcel. The board receives focus.

## Evidence

Both previews passed the soaked delivery and Retry on desktop Chrome at 1440 × 900 and emulated touch at 375 × 812. The chapter links the captures.

## Resolution

[Read the decision, reason, and evidence in UI & UX Design](../../../docs/resources/island-post-example.md#where-should-retry-appear).
