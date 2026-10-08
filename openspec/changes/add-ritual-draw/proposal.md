# Proposal

## Why

The draw is the moment the app should feel like ritual magic, and today it is a single button. The v1 prototype missed that feeling too: its press-and-hold did nothing, because the cards were already chosen. The author wants the shuffle to be a stim that really decides the cards, with partly hidden operations and a sense of the app responding to you.

A throwaway prototype (`prototypes/ritual-cloud/`, live on the site) has settled the feel: a cloud of face-down cards drifting in depth among particles, shuffled by tapping and stirring, with a row of glyphs showing the hidden number that picks the cards. The author tuned its settings on a phone and confirmed it, including a still version for reduced motion. This change builds that into the app.

## What Changes

- Add a shuffle before the draw. Every tap, key press, stir and (if invited) sway of the phone is folded into a hidden number, and that number alone picks the three cards. Pressing draw counts as an input, so one press still gives a complete reading.
- Show the hidden number as a row of eight glyphs that rolls with every input, like a dice roll.
- Present the deck as a cloud of 22 face-down cards in real depth, among drifting particles: a tap sends a beat through it, a drag stirs it, tilting the phone shifts the view. On the draw, three cards come forward and settle into the three positions, and the existing reveal takes over.
- Present a still deck instead of the cloud when reduced motion is in effect, when the device cannot run the 3D scene, or when the person chooses it. The same rhythm shuffles; the glyphs are shown large; nothing else moves.
- Give the person a control on the shuffle screen to hold the cloud still, since it drifts without being touched.
- Make phone movement opt-in through an invitation on the shuffle screen, never required, and possible to turn off.
- Add the author's card back art, shown on every face-down card in place of the plain frame.
- **BREAKING** for the `reading` spec: the three cards are no longer picked by the device's own randomness. They are determined by the person's input.
- Remove the prototype page and its build step from the site once the real shuffle replaces it.

Out of scope: a typed intention or question; a seal or other keepsake drawn from the input (tried in the prototype and rejected); reopening a reading from its number or a link; sound; any change to the three positions, the reveal or the reading text.

## Capabilities

### New Capabilities

- `shuffle`: The act before the draw: what counts as input, the hidden number and how it picks the cards, the glyph row, the cloud and the still deck, and the invitation to use phone movement.

### Modified Capabilities

- `reading`: the requirement that the draw uses the device's randomness is replaced by one where the person's shuffle determines the cards.
- `accessibility`: the rule that nothing moves on its own gains a bounded exception for the shuffle's cloud, with a control to hold it still; a new requirement makes device motion optional.
- `app-shell`: the fast-load requirement gains a scenario that the 3D scene's code is not loaded until the shuffle is reached.
- `card-content`: a new requirement for the deck's card back image.

## Impact

- **Code:** new shuffle modules and screens under `src/`; `src/reading/draw.ts`, `Table.tsx` and `App.tsx` change; the draw's random source is replaced by one seeded from the hidden number.
- **Dependencies:** adds `three` (bundled with the app and served from its own origin, loaded only when the shuffle is reached). No other runtime dependency.
- **Assets:** `public/cards/back.webp`, made from `art/source/audhd-tarot-card-back.png`.
- **Preferences:** one new saved choice, whether the shuffle is held still.
- **Removed:** `prototypes/ritual-cloud/`, `scripts/publish-prototypes.mjs` and the build step that publishes it.
- **Testing:** the feel of the cloud and the behaviour of tilt can only be judged by a person on a real phone; automated tests cover the logic, the still deck, accessibility and that the cloud runs.
