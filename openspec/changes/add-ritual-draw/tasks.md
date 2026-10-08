# Tasks

## 1. Hidden number

- [x] 1.1 Implement `src/shuffle/number.ts` (`start`, `fold`, `glyphs`, `toRandom`) as pure functions ported from the prototype, with unit tests for determinism, for a one-microsecond change giving a different number, and for `glyphs` returning eight symbols with no letters or digits; verify the tests pass
- [x] 1.2 Add a unit test that simulates at least 20,000 shuffles with varied input counts and both uniform and clustered timings, draws three cards from each, and checks every card appears in every position within 10% of even and never twice in one reading; verify it passes
- [x] 1.3 Change `drawReading` callers to take their `Random` from `toRandom(number)` and remove `deviceRandom` if nothing else uses it; verify the existing draw tests still pass with a seeded source

## 2. Card back

- [x] 2.1 Create `public/cards/back.webp` at 720px wide from `art/source/audhd-tarot-card-back.png`, export `cardBack` from `src/content/deck.ts`, and extend the image test to require it; verify the test passes and fails when the file is removed
- [x] 2.2 Show the card back image on face-down cards in `Table.tsx` in place of the CSS frame, at the same box as the fronts; verify by browser test that every face-down card shows the same image and that the audit still finds no violations
- [x] 2.3 Document the card back in `content/README.md` (where it is, how to replace it); verify the documented steps by replacing the file and seeing the new back in the app

## 3. Still-deck shuffle

- [x] 3.1 Build `Shuffle.tsx` with the deck as one button, pointer and key handlers folding inputs with the design's encoding, the glyph row updated without re-rendering, the draw control, and the throttled spoken count; render it on the `draw` screen and remove the pre-draw state from `Table.tsx`; verify by browser test that taps and keys change the glyphs and that draw reaches the dealt cards
- [x] 3.2 Build `StillDeck` (three stacked card backs, glyphs shown large, a roll marked by a brief fade only) and draft the instruction line and button labels, marked for the author's review in `src/app/copy.ts`; verify by browser test under reduced motion that no animation other than an opacity fade runs
- [x] 3.3 Reset the number when a person starts again; verify by browser test that the glyphs return to the starting row
- [x] 3.4 Add browser tests for the shuffle spec's still-deck scenarios: draw without shuffling, a single key is enough, the same scripted beats under a mocked clock draw the same cards on two loads, two unshuffled draws can differ, and the count is announced in a status region; verify they pass
- [x] 3.5 Extend the keyboard-only run, the axe audit, the target-size check and the text-size check to include the shuffle screen in both themes; verify zero violations
- [x] 3.6 Update `docs/accessibility.md` with what the shuffle exposes to a screen reader and add it to the manual screen-reader pass still owed from the foundation; verify the table matches the browser's accessibility tree
- [x] 3.7 Make the shuffle the first screen: remove the `landing` screen and `enter` action from `src/reading/state.ts`, remove `Landing.tsx` and its styles, and move the wordmark (as the `<h1>`), a one-line introduction and the privacy line onto the shuffle screen on solid-colour bands, with the introduction drafted and marked for the author's review in `src/app/copy.ts`; update the browser tests that began with "Begin a reading"; verify by browser test that the app opens on the deck with the name and introduction shown, that one press of draw deals three cards, and that start again returns to this screen

## 4. The cloud

- [ ] 4.1 Add `three` as a dependency and port the prototype's scene to `src/shuffle/cloud/scene.ts` with the author's tuned settings as constants, updating the colour-space calls for the current three.js; verify it builds and that the app still makes no third-party requests
- [ ] 4.2 Build `Cloud.tsx` as a lazily loaded wrapper, with the still deck shown until it is ready, and wire beats and stirs from `Shuffle` to the scene; verify by browser tests that, with the chunk delayed, the name, introduction, still deck and draw control are shown and a draw completes, and that the chunk is never requested under reduced motion or with the deck held still
- [ ] 4.3 On draw in cloud mode, bring three cards forward, then hand over to the dealt cards; verify by browser test that draw over the cloud reaches the three positions with the first card ready to turn over
- [ ] 4.4 Fall back to the still deck when the context cannot be created or is lost, and stop the frame loop when the document is hidden; verify by browser tests that force a context loss and that hide the page
- [ ] 4.5 Add the hold-still control and the `shuffleStill` preference, absent under reduced motion; verify by browser test that it swaps to the still deck, that no frames run afterwards, and that the choice survives a reload
- [ ] 4.6 Add a browser test that the same scripted beats draw the same cards on the cloud and on the still deck; verify it passes
- [ ] 4.7 Extend the axe audit and keyboard-only run to the cloud presentation; verify zero violations
- [ ] 4.8 Author check on a real phone: compare the app's cloud side by side with the live prototype for look, feel and frame rate, judge whether the name, introduction and controls stay legible over it in both themes, and record the result and any retuned settings in `docs/ritual-draw.md`; verify the document names the phone and browser used

## 5. Phone movement

- [ ] 5.1 Implement `src/shuffle/tilt.ts` (availability, permission, start from a click, first reading as level, clamping, stop) with unit tests using a fake event source; verify the tests pass
- [ ] 5.2 Add the invitation button to the cloud, shift the scene's view with tilt at the tuned strength, fold a deliberate sway into the number, and let the person stop it; verify by browser test with synthetic orientation events that nothing is read before acceptance, that tilt moves the camera after it, that jitter adds no input, and that stopping ends both
- [ ] 5.3 Handle a declined or refused permission and a device with no sensor without any error; verify by browser tests that stub the permission call to deny and to throw
- [ ] 5.4 Author check on real phones: accept, decline and stop the invitation on an iPhone and on an Android phone, and record what happened in `docs/ritual-draw.md`; verify both platforms are recorded

## 6. Retire the prototype

- [ ] 6.1 Remove `prototypes/ritual-cloud/`, `scripts/publish-prototypes.mjs` and the build step that calls it, once task 4.8 is recorded; verify `npm run build` produces no `dist/prototypes` and the full check passes
- [ ] 6.2 Update `README.md` (what the shuffle is and that the app opens on it, the new dependency, the planned-next list); verify each documented command runs as written
- [ ] 6.3 Run the full check (`lint`, `typecheck`, unit, browser, build) and complete a reading on the deployed site on a phone and a desktop in both themes; verify the reading completes with the cloud and with reduced motion
