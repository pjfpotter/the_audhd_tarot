# The AuDHD Tarot

A three-card tarot reading for high-masking, late-diagnosed AuDHD adults, built
on one author's rereading of the 22 major arcana. Every card holds its gifts
and shadows together; there are no reversed cards and no predictions.

The app is a static site. It has no server, no accounts and no AI calls, makes
no requests to anyone else, and keeps nothing but your display options, which
stay on your device.

## The shuffle

The app opens on the shuffle. The deck is a cloud of 22 face-down cards:
tap or press any key for rhythm, drag to stir, and on a phone you can let the
cards follow its movement. Every one of those is folded into a hidden number,
shown as a row of eight glyphs, and that number alone picks the three cards.
The device adds no randomness of its own; pressing draw counts as an input, so
one press is still a complete reading.

With reduced motion, on a device that cannot run the 3D scene, or after
pressing "Hold still", the cloud is replaced by a still deck that shuffles the
same way.

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
| `src/shuffle/` | The first screen: the shuffle, its hidden number, the still deck and phone movement |
| `src/shuffle/cloud/` | The cloud of cards: the three.js scene and its tuned settings |
| `prototypes/ritual-cloud/` | The throwaway prototype the cloud was tuned in; published at `/prototypes/ritual-cloud/` until the cloud has been checked against it |
| `src/styles/` | Design tokens, fonts and base styles |
| `public/cards/` | Card images, named by card number |
| `art/source/` | Full-size originals of the card art; not part of the app |
| `content/README.md` | Where the text came from, and how to edit text and art |
| `docs/accessibility.md` | What is checked, and what still needs checking by hand |
| `docs/ritual-draw.md` | The checks of the cloud and of phone movement that need a real phone |
| `openspec/` | Specs and change proposals |

## Planned next

Each is its own change:

- Reading text that adapts to a card's position and its neighbours
- For the ritual draw: an intention, and a closing
- Spreads built around AuDHD time
- Sharing a reading by link and image
- The final, treated card art, and a check of the anchors against it
