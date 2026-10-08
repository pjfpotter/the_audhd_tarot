# The AuDHD Tarot

A three-card tarot reading for high-masking, late-diagnosed AuDHD adults, built
on one author's rereading of the 22 major arcana. Every card holds its gifts
and shadows together; there are no reversed cards and no predictions.

The app is a static site. It has no server, no accounts and no AI calls, makes
no requests to anyone else, and keeps nothing but your display options, which
stay on your device.

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
| `src/shuffle/` | The first screen: the shuffle, its hidden number and the deck |
| `src/styles/` | Design tokens, fonts and base styles |
| `public/cards/` | Card images, named by card number |
| `art/source/` | Full-size originals of the card art; not part of the app |
| `content/README.md` | Where the text came from, and how to edit text and art |
| `docs/accessibility.md` | What is checked, and what still needs checking by hand |
| `openspec/` | Specs and change proposals |

## Planned next

Each is its own change:

- Reading text that adapts to a card's position and its neighbours
- The ritual draw: shuffling by stimming, an intention, a closing
- Spreads built around AuDHD time
- Sharing a reading by link and image
- The final, treated card art, and a check of the anchors against it
