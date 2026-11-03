# The AuDHD Tarot

A three-card tarot reading for high-masking, late-diagnosed AuDHD adults, built
on one author's rereading of the 22 major arcana. Every card holds its gifts
and shadows together; there are no reversed cards and no predictions.

The app is a static site. It has no server, no accounts and no AI calls, makes
no requests to anyone else, and keeps nothing but your display options, which
stay on your device.

## The shuffle

The app opens on the shuffle, in the two parts a reader gives one.

**Shuffling.** The screen is the cloud of 22 face-down cards and nothing else:
"Shuffle the deck." Drag across it to stir the cards under your finger; tap to
nudge the ones nearest. Stirring also changes which cards are on top and which
are underneath. The cloud starts differently every time, and a touch only
disturbs the cards close to it, so nothing is thrown out of the screen. Take as
long as you like, then press "Draw cards".

**Drawing.** Three spaces, named for the positions of the reading, appear. Drag three cards into the three spaces, named for the positions
of the reading. The card you touch is the card you get: every card in the cloud
is one particular card from the moment it appears, and nothing is decided after
you choose. Tap a card in a space to put it back.

With reduced motion, on a device that cannot run the 3D scene, or after
pressing "Hold still", the cloud is replaced by a still deck to tap, and then
by the 22 cards laid out face down to choose from. Both are the same choice:
the cards' places are shuffled at random, and which card is which is hidden.
Choosing never needs a drag: Enter takes the card nearest the middle of the
cloud, and the face-down cards are plain buttons.

Nothing is derived from how a person taps or moves. The cards are dealt to
their places by the device's own randomness, and the person chooses.

The cloud is drawn with [three.js](https://threejs.org/), the app's one
runtime dependency besides React. It is bundled with the app, in its own file,
which is fetched after the first screen is shown and not at all for the still
deck.

## Run it

Built and tested with Node 24.

```sh
npm install
npm run dev        # development server
npm run build      # type-check and build to dist/
npm run preview    # serve the built site
```

## Check it

```sh
npm run lint
npm run typecheck
npm test           # unit tests
npm run test:e2e   # browser tests; builds first
```

The browser tests need Chromium once: `npx playwright install chromium`.

## Deploying

The site is served by Cloudflare from the built `dist/` folder, as configured
in `wrangler.jsonc`. The GitHub repository is connected to the Cloudflare
project, so every push to `main` builds and deploys by itself.

## Where things are

| Path | What |
| --- | --- |
| `src/content/` | The deck: card text, image descriptions and the validator |
| `src/reading/` | The draw, the reading state and the reading screens |
| `src/preferences/` | Theme, motion and text size options |
| `src/app/` | The page frame and the app's wording |
| `src/shuffle/` | The first screen: mixing and choosing, the three spaces, the still deck and the face-down cards, and the device's randomness |
| `src/shuffle/cloud/` | The cloud of cards: the three.js scene, how it moves, and its settings |
| `prototypes/ritual-cloud/` | The throwaway prototype the cloud was first tuned in; published at `/prototypes/ritual-cloud/`, and no longer the reference for how the cloud should feel |
| `src/styles/` | Design tokens, fonts and base styles |
| `public/cards/` | Card images, named by card number |
| `art/source/` | Full-size originals of the card art; not part of the app |
| `content/README.md` | Where the text came from, and how to edit text and art |
| `docs/accessibility.md` | What is checked, and what still needs checking by hand |
| `docs/ritual-draw.md` | The checks of the cloud and of choosing that need a real phone |
| `openspec/` | Specs and change proposals |

## Planned next

Each is its own change:

- Reading text that adapts to a card's position and its neighbours
- For the ritual draw: an intention, and a closing
- Spreads built around AuDHD time
- Sharing a reading by link and image
- The final, treated card art, and a check of the anchors against it
