# Proposal

## Why

Test users were clear about the ritual draw. They did not understand the row of symbols or the idea that their taps became a number that picked the cards. They wanted the card they were touching to be the card they got. And on a phone the cloud was too dramatic: a touch sent every card flying off the screen.

A tarot reader directs a shuffle in stages: the querent mixes, then chooses. The shuffle should work the same way, with every card a particular card from the start.

## What Changes

- **BREAKING** The three cards are no longer picked by a number folded from the person's taps, stirs and sways. The person chooses them. The hidden number, the glyph row, the spoken beat count and the line explaining them are removed.
- The shuffle has two parts. Mixing: the cloud of 22 face-down cards is stirred by touch. Choosing: the person drags three cards into three spaces named for the positions of the reading. "Choose your cards" moves from the first part to the second, and "Mix again" goes back.
- Every card in the cloud is one particular card from the moment it appears, and stays that card. The card a person touches is the card they get. Which card starts where is random, and so is the layout of the cloud, so no two shuffles start alike.
- A touch disturbs only the cards near it, with a fixed top speed, and a card can never leave the clear part of the screen.
- Where there is no cloud (reduced motion, no WebGL, "Hold still", or the cloud still loading) mixing is a tap on a deck that reshuffles the order, and choosing is tapping three of 22 face-down cards laid out in that order. Both parts have the same shape as the cloud's.
- Choosing never needs a drag: in the cloud Enter takes the card nearest the middle, and the third card chosen moves focus to "Lay out my cards".
- The draw button ("Draw three cards") goes, and so does phone tilt, which only ever fed the hidden number and a parallax.

Out of scope: showing card faces while mixing; drag-to-reorder between spaces; sound; changes to the reveal or reading text.

## Capabilities

### New Capabilities

- `shuffle`: replaces the shuffle of `add-ritual-draw` (hidden number, glyphs, tilt) with mixing and choosing.

### Modified Capabilities

- `reading`: the cards of a reading are the cards the person chose, in the order of the spaces; only the unities shown for each card are random.

## Impact

- **Code:** `src/shuffle/` is rewritten around `Shuffle.tsx`, `Hand.tsx` and `Fan.tsx`; `random.ts` replaces `number.ts`; `src/shuffle/cloud/scene.ts` gives each card an identity, a randomised start, local touch, containment (`motion.ts`) and drag-to-space; `tilt.ts` is removed; `src/reading/draw.ts` gains `readingFrom` and loses `drawCards` and `drawReading`; `App.tsx` passes chosen numbers to the reading.
- **Replaces:** the shuffle, reading and accessibility deltas of `add-ritual-draw` where they conflict with this. That change's tilt tasks (section 5) and the comparison with the prototype (4.8) no longer apply.
- **Testing:** unit tests for the randomness and containment; browser tests for mixing, choosing by drag, by keyboard and by tapping, the reading matching the hand, and the fallbacks. How the cloud feels under a thumb can only be judged on a phone (`docs/ritual-draw.md`).
