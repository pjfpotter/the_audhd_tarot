# Tasks

## 1. Project scaffold

- [x] 1.1 Scaffold a Vite + React + TypeScript app at the repository root (package name `the-audhd-tarot`), replacing the empty `package-lock.json`; verify `npm run dev` serves a page and `npm run build` produces `dist/`
- [x] 1.2 Add Vitest, Playwright and `@axe-core/playwright` with `npm test` and `npm run test:e2e` scripts, plus a `.gitignore` for `node_modules`, `dist` and test output; verify both scripts run and pass with one placeholder test each
- [x] 1.3 Add TypeScript strict mode and a lint script; verify `npm run lint` and `npx tsc --noEmit` pass on the scaffold

## 2. Card content

- [x] 2.1 Write a one-off extraction script that reads the v1 prototype's script and writes the 22-card array to a JSON snapshot in the repo (`content/v1-snapshot.json`); verify the snapshot has 22 cards and 68 unities and The Fool has five
- [x] 2.2 Define the card and unity types and create the typed deck module from the snapshot, renaming `superpower` to `gift` and `trap` to `shadow` and dropping `icon`; verify it compiles and exports 22 cards
- [x] 2.3 Implement the deck validator covering every `card-content` requirement (22 cards numbered 0–21, Justice at 8, Force at 11, non-empty fields, at least three unities, image and description present) with unit tests, including failing cases for a missing card, duplicate number, empty question and too few unities; verify the tests pass
- [x] 2.4 Add a unit test that compares every name, alias, essence, question and unity in the deck module with the v1 snapshot; verify it passes and fails when one word is changed
- [x] 2.5 Move the 22 files from `art/placeholders/` to `public/cards/NN.webp` named by card number, and add a test that every card's image file exists; verify the test passes and fails when one file is removed
- [x] 2.6 Write a plain-language description of each of the 22 placeholder images, by looking at each image, and store it with the card data; verify the validator passes and list the 22 descriptions for the author to review
- [x] 2.7 Record in `content/README.md` where the text came from, how to edit it, how to replace card art, and the open content item for the author (Death's scythe unity still says "Reversed, this becomes…"); verify the documented art-replacement steps work by swapping one image and seeing it in the app once the reading exists

## 3. Themes, type and preferences

- [x] 3.1 Self-host Atkinson Hyperlegible, a display face and a monospace as Latin-subset WOFF2 with `font-display: swap`; verify no request leaves the app's origin when the page loads
- [x] 3.2 Define the design tokens (colour, type roles, spacing, `--text-scale`) for the light and dark themes as CSS custom properties keyed on `data-theme`; verify every text/background token pair meets 4.5:1 with a unit test over the token values
- [x] 3.3 Implement the preferences store (theme, motion, text size) on `localStorage` with an in-memory fallback, and unit tests for defaults, persistence and blocked storage; verify the tests pass
- [x] 3.4 Add the inline pre-paint script that applies stored preferences to `<html>` and resolves "Match my device" for theme and motion; verify with an e2e test that reloading in dark at the largest size shows no light frame
- [x] 3.5 Add global motion rules so that reduced motion (device or in-app) removes all transforms and looping animation, leaving at most a short fade; verify with an e2e test under emulated reduced motion that no element has a running transform animation

## 4. App shell and landing

- [x] 4.1 Implement the reading reducer (landing, draw, revealing with art and text sub-states, complete, start again) with unit tests for every transition; verify the tests pass
- [x] 4.2 Build the responsive page frame (mobile first, 320px upward, reading text capped at about 75 characters per line) with a persistent control for the options panel; verify with e2e tests at 320px and 1280px that no screen scrolls horizontally
- [x] 4.3 Build the landing screen with the name "The AuDHD Tarot", draft introductory copy marked for the author's review, and one primary control leading to the draw; set the page title and metadata; verify by e2e that the title and heading read "The AuDHD Tarot" and that the built output contains no "neurospicy"
- [x] 4.4 Add an e2e test that records network activity through a full reading and asserts every request is same-origin and no cookies are set; verify it passes

## 5. Accessibility options

- [x] 5.1 Build the options panel on a native `<dialog>` with radio groups for theme (Match my device, Light, Dark), motion (Match my device, Reduced) and four text sizes up to at least 150%; verify by e2e that each choice takes effect immediately
- [x] 5.2 Verify by e2e that the panel opens from every screen, traps focus, closes on Escape, returns focus to its opener, and leaves a reading in progress unchanged
- [x] 5.3 Verify by e2e that at the largest text size on a 320px viewport every screen shows all text with vertical scrolling only

## 6. Draw and reading

- [x] 6.1 Implement `drawCards` (Fisher–Yates with an injected random source) and the `crypto.getRandomValues` source with rejection sampling, with unit tests for no repeats and for roughly uniform frequency of every card in every position over many seeded draws; verify the tests pass
- [x] 6.2 Implement the spread definition and `selectUnities` (two or three at random, chosen once at draw time and stored in the reading) with unit tests; verify the tests pass, including that revisiting a card returns the same unities
- [x] 6.3 Build the draw screen with a single-activation draw control and three face-down cards in position order that reveal one at a time in order; preload the three drawn images when the draw completes; verify by e2e that Enter, Space and a single tap each draw, and that nothing about a card is shown or announced before it is revealed
- [x] 6.4 Build the art moment: full-viewport contained image with number and name, a focused "Continue" control, auto-advance to the text after the beat, cross-fade only under reduced motion, focus and announcement of position, number, name and image description; build it to the `animate` skill's standards; verify by e2e that the text appears after the beat without input, that Continue shows it at once, and that under reduced motion no transform animation runs
- [x] 6.5 Build the card text view (position, number, name, aliases, essence, question, unities with anchor and text-labelled Gift and Shadow); verify by e2e that it shows two or three unities and that each shows all three parts
- [x] 6.6 Build the full reading (three cards in position order, side by side at desktop widths, each image reopenable at full size and dismissible back to the same place) and the start-again control available throughout; verify by e2e at 320px and 1280px, including that start again clears the reading

## 7. Accessibility verification

- [x] 7.1 Add an e2e test that completes a full reading using only Tab, Shift+Tab, Enter, Space and Escape, asserting a visible focus indicator at each step; verify it passes in both themes
- [x] 7.2 Run axe on every screen and on the options panel in both themes within the e2e flows, failing on any WCAG 2.2 AA violation; verify zero violations
- [x] 7.3 Add e2e assertions that every control is at least 44 by 44 CSS pixels, reading text is at least 16px, and no text is under 14px at the default size; verify they pass
- [ ] 7.4 Do one manual pass of a full reading with a screen reader (Orca or NVDA) and record what is announced at each step in `docs/accessibility.md`, fixing anything that is unnamed, out of order or silent; verify the recorded pass covers landing, draw, all three reveals, the full reading and the options panel

## 8. Integration

- [x] 8.1 Write `README.md` covering what the app is, how to run, test and build it, and the changes planned next; verify each documented command runs as written
- [x] 8.2 Run the full check (`lint`, `tsc`, unit, e2e, build) and serve the built `dist/` with a static server; verify a complete reading works from the built files at phone and desktop widths in both themes
