# Design

## Context

See `proposal.md` for motivation. What shapes the approach:

- A working prototype exists at `prototypes/ritual-cloud/ritual-cloud.html`: about 600 lines of plain three.js, with the author's tuned settings as its defaults and a still-deck mode. Its feel is the acceptance criterion for the cloud, so the build should carry its motion code over rather than re-derive it.
- The foundation left seams for exactly this. `drawCards(deck, count, random)` takes its randomness as a parameter (`src/reading/draw.ts`), the reducer already has a `draw` screen before `revealing` (`src/reading/state.ts`), and `Table.tsx` renders both the draw and the dealt cards.
- The app makes no third-party requests and has a zero-violation accessibility audit on every screen. Both must still hold. The prototype loads three.js and fonts from CDNs; the app cannot.
- Rejected in the prototype and not to be reintroduced: a seal or sigil drawn from the input.

## Goals / Non-Goals

**Goals:**

- The cloud feels the way the prototype does on the author's phone.
- One shuffle implementation with two presentations (cloud, still deck) that always agree on the cards.
- The landing screen is no slower than it is now.
- Everything stays operable by keyboard, switch and screen reader.

**Non-Goals:**

- Recording or replaying a shuffle, or putting its number in a link.
- Physical accuracy. The cloud is choreography, not a simulation.
- Supporting WebGL 1-only or very old devices beyond falling back to the still deck.

## Decisions

### The hidden number is its own small module

`src/shuffle/number.ts` holds the number as two 32-bit lanes and exposes `fold(number, ...values)`, `glyphs(number)` and `toRandom(number)`, all pure. `fold` is the prototype's mixing function (FNV-style multiply and xor into lane A, a second multiply-and-shift into lane B). `toRandom` seeds a mulberry32 generator from both lanes and returns the `Random` the existing `drawReading` already accepts, so `draw.ts` needs no new concept: `deviceRandom` is simply no longer passed in.

- *Timing:* `performance.now() * 1000`, floored, giving microseconds where the browser allows and milliseconds where it coarsens.
- *Why two lanes:* eight glyphs need 32 bits to display, and a 64-bit state keeps distinct input histories from colliding on the same draw in practice.
- *Why no device randomness:* the spec's claim is that the input alone decides. The moment of the draw press is itself input, which is what makes two unshuffled draws differ.
- *Alternative:* hashing with `crypto.subtle.digest`. Rejected: it is asynchronous, which would put a gap between a tap and the glyphs rolling.

Inputs are encoded as `[kind, moment, a, b]` with kind 1 for a beat by pointer (a, b = position), 2 for a stir (position), 3 for a key (key code, key length), 4 for a sway (tilt × 1000), 5 for the draw. The still deck and the cloud call the same `fold` with the same encoding, which is what makes them agree.

### One shuffle component, two presentations

`src/shuffle/Shuffle.tsx` owns the number (in a ref, with the glyph row updated directly so a fast stir does not re-render React sixty times a second), the input handlers, the glyph row, the draw control and the hold-still control. It renders one of:

- `StillDeck`: three stacked `<img>` card backs, no canvas.
- `Cloud`: a `<canvas>` driven by plain three.js.

The shuffle surface is a single `<button>` in both cases, labelled "The deck. Tap, press any key, or drag to shuffle." In the cloud it contains the canvas, which is `aria-hidden`. This gives keyboard focus, a role and a name without any custom widget semantics. `keydown` on it calls `preventDefault` so Enter and Space are beats and do not also fire a click.

The mode is `still` when any of these hold: reduced motion is in effect (`data-motion="reduced"`, already resolved by the preferences module), the person has chosen to hold still, the cloud chunk has not finished loading, WebGL context creation failed, or the context was lost. Otherwise `cloud`.

### Plain three.js, ported from the prototype, in its own chunk

`src/shuffle/cloud/scene.ts` is the prototype's scene code as a module: `createCloud(canvas, settings)` returning `{ pulse, stir, setTilt, draw(indices), release, resize, dispose }`. `Cloud.tsx` is a thin React wrapper that creates it in an effect and disposes it on unmount. It is imported with `React.lazy`, so three.js is a separate chunk fetched when the shuffle is first reached.

- *Why not @react-three/fiber:* the prototype is imperative and tuned. Re-expressing its per-frame loop as React components risks changing the feel for no gain, and adds a second dependency. Revisit only if the scene grows many interactive parts.
- *Version:* current `three` from npm, bundled. The prototype used r128 from a CDN; the port must account for the colour-space API change (`outputColorSpace` and `texture.colorSpace` replace the `encoding` properties) and check the card back's colours against the prototype by eye.
- *Tuned defaults,* from the author, as constants in `src/shuffle/cloud/settings.ts`: drift 0.3, pulse 1.75, stir 1, depth 0.3, settling 1.25, particles 360, tilt 1.8. Depth at 0.3 is a deliberate choice, not a legibility workaround.
- *Performance:* device pixel ratio capped at 2; the frame loop stops when the document is hidden and when the mode is `still`; geometry, material and texture are shared by all 22 cards.
- *Failure:* `webglcontextlost` and a failed context creation both switch the mode to `still` for the rest of the visit.

### From the cloud to the table

On draw, `Shuffle` folds the draw input, computes the reading with `drawReading(deck, spread, toRandom(number))`, and in cloud mode calls `scene.draw()` so three cards come forward and the rest fall back. After that settle (about 900ms, or immediately in still mode) it dispatches the existing `draw` action with the reading. The reducer and everything after it are unchanged.

`Table.tsx` loses its "The draw" state: the `draw` screen now renders `Shuffle`, and `Table` only ever shows dealt cards. Its face-down cards use the card back image instead of the CSS frame.

The three cards in the cloud are just three of 22 identical backs, so there is nothing to keep consistent between which meshes come forward and which cards were drawn; the first three meshes by index are used.

### Phone movement

`src/shuffle/tilt.ts` wraps `deviceorientation`. It exposes `available` (the event type exists), `needsPermission` (the iOS `requestPermission` function exists), `start()` and `stop()`. `start()` must be called from a click; on iOS it calls `requestPermission()` first. The first reading after start is taken as level. Values are clamped to ±1 over 35 degrees and smoothed in the scene.

The invitation is a button on the cloud, "Let the cards feel you move", shown only when `available`. After acceptance it becomes "Stop following movement". It is not shown with the still deck. Acceptance is not persisted: a fresh visit asks again, which keeps "only after the person has asked" true without a stored flag and matches what iOS requires anyway.

A sway is folded in at most every 250ms and only when tilt has changed by more than 0.06 since the last fold, which is what separates a deliberate sway from jitter.

### Hold still

A button on the shuffle screen, "Hold still" / "Let it move", toggles a new preference `shuffleStill: boolean` in the existing preferences store. It is shown only when the cloud would otherwise be available; under reduced motion the deck is already still and the control is absent. This control is what satisfies the modified "moves on its own" requirement.

### Screen readers

The glyph row is `aria-hidden`. A visually hidden `role="status"` element reports "N beats" and is updated on a two-second trailing throttle, so a fast rhythm is not narrated beat by beat. Focus on reaching the shuffle goes to the screen heading, as on other screens; the deck button is the next stop.

### Card back

`public/cards/back.webp`, 720px wide, made from `art/source/audhd-tarot-card-back.png` (already at the fronts' 720:1354 ratio). `src/content/deck.ts` exports `cardBack`. The image test in `src/content/images.test.ts` is extended to require it. The cloud's texture is the same file.

### Testing

- **Unit:** `fold` determinism and sensitivity to a one-microsecond change; `glyphs` length and alphabet; a distribution test that simulates thousands of shuffles with varied input counts and timings and checks every card in every position within 10% of even; `toRandom` giving three distinct cards.
- **Browser, still deck** (reduced motion emulated): shuffle by tap, by keys and by a single key; glyphs change; draw; identical scripted beats on two page loads with a mocked clock draw the same cards; axe, target sizes and keyboard-only run extended to the shuffle.
- **Browser, cloud** (software WebGL in the test browser): the canvas is created; a tap changes the glyphs; hold still swaps to the still deck and no animation frames run; draw reaches the table; forcing context loss falls back to the still deck; the three.js chunk is not requested on the landing screen; every request is same-origin.
- **By hand, on real phones:** feel against the prototype; frame rate; the tilt invitation on an iPhone and on Android. These cannot be automated and are tasks for the author.

## Risks / Trade-offs

- [The port to current three.js changes the look or feel] → Port the motion code unchanged, keep the prototype live until the author has compared them side by side on a phone, and treat that comparison as a task.
- [Tilt has been tried by the author on one phone only] → It is opt-in and isolated in one module; if it misbehaves on other devices the invitation can be withheld there without touching the rest.
- [A continuously drifting scene costs battery] → Calm defaults, a capped pixel ratio, stopping when hidden, and the hold-still control.
- [Input-derived numbers could be biased if people's timings cluster] → Microsecond timing and position are mixed in on every input, and the distribution test simulates clustered human-like timings, not only uniform ones.
- [Low-end phones may run the cloud badly] → No automatic downgrade in this change; the hold-still control is the escape. Revisit with real measurements.
- [The cloud is invisible to screen readers] → They get the same shuffle through the same button, plus the spoken count; nothing in the cloud carries information.
- [three.js adds roughly 150 KB compressed] → It is a separate chunk loaded only at the shuffle, with the still deck usable meanwhile.

## Migration Plan

Built in four parts, each on its own branch and merged in order, so the app is working after every merge:

1. Hidden number, still-deck shuffle and card back. After this the app has a complete, accessible ritual shuffle with no 3D.
2. The cloud, replacing the still deck where it can run.
3. Phone movement.
4. Removal of the prototype page and its build step.

Rollback is reverting the merge of any part; parts 2 to 4 each leave part 1 intact.

## Open Questions

- The exact wording of the shuffle screen's instruction line and of the two buttons. Drafts are used in the build and marked for the author's review, as with the landing copy.
