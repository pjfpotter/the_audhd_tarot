# Tasks

## 1. Randomness and the reading

- [x] 1.1 Add `src/shuffle/random.ts` (`deviceFraction`, `deviceRandom`, `shuffled`) with tests for range, for different starts and for every card in every place about equally often
- [x] 1.2 Replace `drawCards` and `drawReading` with `readingFrom(deck, numbers, random)`, which makes the reading from the chosen cards and picks only the unities; test that it is exactly the cards chosen, in order, and refuses an unknown card
- [x] 1.3 Remove the hidden number (`number.ts`) and its tests, and phone tilt (`tilt.ts`, its tests and e2e)

## 2. The cloud

- [x] 2.1 Give each card in the scene its number, a start from a shuffled order, a random turn of the spiral and a random offset
- [x] 2.2 Make a touch local, slower and capped; add `motion.ts` (`limitSpeed`, `keepInRoom`) and keep every cloud card in the clear part of the screen; unit test containment under a hard shove every frame
- [x] 2.3 Add taking hold (`grab`, `drag`, `drop`), the hand (`setHand` with the spaces' places read from the page) and `nearestToMiddle`

## 3. The screen

- [x] 3.1 Rebuild `Shuffle.tsx` in two parts with `Hand.tsx` (three named spaces) and `Fan.tsx` (face-down cards); move focus on each change of part and to "Lay out my cards" when three are chosen; announce progress by place
- [x] 3.2 Replace the draw button and hidden-number copy in `src/app/copy.ts` with drafts marked for the author's review; pass chosen numbers from `App.tsx` to `readingFrom`

## 3b. After the first test on a phone

- [x] 3b.1 Make the first part the cloud alone: no spaces, the instruction "Shuffle the deck.", the button "Draw cards"; the spaces appear with the draw
- [x] 3b.2 Strengthen ripple and stir, and widen how far a touch reaches
- [x] 3b.3 Let stirring change the order of the pile, and draw cards far to near so they never cut into each other

## 4. Tests and documents

- [x] 4.1 Rewrite the browser tests for the still deck and for the cloud: mixing, containment after a hard scrub, no two clouds alike, choosing by drag, by keyboard and by tapping, the reading matching the hand, putting back, full spaces, mixing again, loading, fallbacks and holding still keeping the hand; extend the axe, target-size and text-size runs to choosing
- [x] 4.2 Update `README.md`, `docs/accessibility.md` and `docs/ritual-draw.md`
- [ ] 4.3 Author check on a real phone (`docs/ritual-draw.md`): how mixing feels, how reliably a card can be taken and dropped, and legibility in both themes; record the phone and any retuned settings
- [ ] 4.4 Pass with a real screen reader over mixing and choosing, listed in `docs/accessibility.md`
- [ ] 4.5 Remove `prototypes/ritual-cloud/`, `scripts/publish-prototypes.mjs` and the build step that runs it, once 4.3 is recorded
