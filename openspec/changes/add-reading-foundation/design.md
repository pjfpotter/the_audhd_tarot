# Design

## Context

See `proposal.md` for motivation. The constraints that shape the approach:

- The repository has no application code: only `art/source/` (22 full-size Marseille PNGs), `art/placeholders/` (the same 22 cards as 720px WebP, 85–126 KB each, heights 1347–1361px), OpenSpec, and agent skills.
- The v1 prototype is a Vite + React single-page app with all content inside its script. Its deck is one array of 22 objects: `n`, `name`, `aliases`, `icon`, `essence`, `question`, and `unities` of `{anchor, superpower, trap}`. The UI labels those two fields "GIFT" and "SHADOW". A reading shuffles with `Math.random`, takes three cards, and shows two or three randomly chosen unities per card. It loads three font families from Google Fonts.
- Later changes will replace the draw (ritual stim-shuffle), the unity selection (position-adaptive text), the spread (AuDHD-time spreads) and the art (treated images), and will add sharing by link. The foundation has to make each of those a contained replacement.
- The author's text is the product. It is carried over, never rewritten by tooling.

## Goals / Non-Goals

**Goals:**

- A static site that builds to plain files and runs with no server.
- Seams at the four points later changes will replace: draw, text selection, spread definition, art.
- Accessibility enforced by automated checks, so it cannot regress unnoticed.
- A visual token system for both themes that the later visual work extends.

**Non-Goals:**

- The finished visual identity. This change sets tokens, type and layout; arches, dissolve effects and ornament come with the treated art.
- Ambient or decorative animation. The only motion here is screen transitions and the card reveal.
- Routing, deep links or any reading state in the URL. That arrives with sharing.
- Offline install (service worker, manifest).

## Decisions

### Stack: Vite, React, TypeScript, plain CSS

Vite + React + TypeScript, agreed with the author. Styling is plain CSS with custom properties and CSS Modules: no Tailwind, no CSS-in-JS.

- *Why:* v1's inline styles are the direct cause of its 10–11px text and its half-honoured reduced motion; media queries, `:focus-visible` and theme tokens need real stylesheets. The installed `animate` and `pick-ui-library` skills assume React.
- *Alternatives:* Next.js (per-link preview images for sharing, but a server or build-per-route this change does not need; can be revisited in the sharing change). Tailwind (adds a vocabulary without solving anything tokens do not).

### No router, one reading state machine

The app is a single view driven by one reducer with these states:

```
  landing --> draw --> revealing(0..2) --> complete
     ^                  |    ^                |
     |                  v    |                |
     |               art moment               |
     +------------- start again --------------+
```

`revealing` carries the drawn card numbers, the unities chosen for each, and which cards are revealed. Each reveal passes through an `art` sub-state before `text`. The options panel is separate UI state and never touches the reading.

- *Why:* three screens do not need a router, and a single serialisable reading value is exactly what the sharing change will later encode in a link.
- *Alternative:* React Router with a route per screen. Rejected: back-button handling mid-reading would need its own design, with no benefit yet.

### Seams for the later changes

Three small pure modules, each with a narrow signature, are the only things the later changes replace:

- `drawCards(deck, count, random) -> cardNumbers`: Fisher–Yates over the deck using an injected random source. The app passes one backed by `crypto.getRandomValues` with rejection sampling to avoid modulo bias; tests pass a seeded one. The ritual change supplies a different source of entropy through the same parameter.
- `selectUnities(card, positionIndex, reading, random) -> unities`: today ignores position and reading and returns two or three at random, as v1 does. The adaptive-text change replaces the body.
- `spread`: a data value (`id`, ordered position names). Today there is one. Components read positions from it and never hardcode three.

Selection runs once at draw time and is stored in the reading, which is what keeps unities fixed when a person revisits a card.

### Content as typed data, validated at build

The deck lives in one TypeScript module of 22 typed entries, extracted from the v1 script by a one-off script and committed. Field names follow the UI and the author's own vocabulary: `gift` and `shadow`, not `superpower` and `trap`. v1's `icon` field (text for the "icon placeholder" emblem) is dropped, since real images replace it. A validation module checks every requirement in the `card-content` spec and runs in the unit test suite; a second test compares the extracted text field-for-field against a stored snapshot of the v1 array so later edits to wording are deliberate.

- *Why not JSON or Markdown files:* 3,300 words of text with a fixed shape gains type checking and editor support from TypeScript, and needs no loader. If the author's longer writing arrives later, this can move to Markdown without touching components.

### Card art: numbered files outside the bundle

Images are served from `public/cards/00.webp` … `public/cards/21.webp`, moved from `art/placeholders/` and renamed to the card number. The app builds the URL from the card number; there is no per-file import. `art/source/` stays in the repository as the editing source and is not part of the build.

- *Why:* swapping in the treated art becomes "replace 22 files", which is the spec's requirement. Imported assets would get hashed names and need a rebuild of the manifest.
- *Aspect ratio:* the placeholders vary by a few pixels in height. Every card is displayed in a fixed-ratio box (720:1354) with `object-fit: contain`, so nothing is cropped and replacement art of a slightly different ratio still fits.
- *Loading:* the three drawn images are preloaded as soon as the draw completes, while the cards are still face down, which meets the "no blank reveal" requirement without loading all 22 up front.

### The art moment

On reveal, the card's image is shown in a full-viewport layer (`100dvh`, image contained, number and name beneath). After a beat of about 1.8 seconds the layer gives way to the card's reading text, with the image settling to the top of the text view. A visible "Continue" control is present from the first frame and has focus.

- *Motion:* a single transform-and-opacity transition, written to the `animate` skill's standards. With reduced motion in effect it is a plain cross-fade with no movement.
- *Screen readers:* the layer is a labelled region; on reveal, focus moves to its heading (position, number, name) and the image description is its accessible description. The text view is next in reading order and does not depend on the timer.
- *Why auto-advance at all:* the author wants the art held "for a beat" and then the text to emerge. It is not a time limit in the accessibility sense: nothing is lost, the image stays on the next view, and it can be reopened from the full reading.
- *Alternative:* wait for a tap every time. Rejected as the default because it adds three extra activations to every reading; kept as the behaviour a person gets simply by using "Continue".

### Themes and tokens

All colour, type and spacing come from CSS custom properties on `:root`, with one set per theme selected by a `data-theme` attribute. The dark theme is black with pale lavender text and deep violet reserved for borders and glow; the light theme is lavender paper with black ink. Deep violet is never used for text on black, since it fails contrast. Type is three roles: Atkinson Hyperlegible for all reading and UI text, one display face for the wordmark and card names, and a monospace for small labels. Fonts are self-hosted from the repository, which removes v1's Google Fonts requests and satisfies the no-third-party requirement. Text size is one `--text-scale` multiplier applied through `rem`.

Preferences are read by a small inline script in `index.html` that sets `data-theme`, `data-motion` and the text scale on `<html>` before first paint, so there is no flash. Storage is `localStorage` under one key, wrapped so that a blocked store degrades to in-memory.

### Options panel on the native dialog element

The options panel is a native `<dialog>` opened with `showModal()`, which provides focus trapping, Escape to close, inert background and focus return without a library. Controls are native radio groups.

- *Alternative:* base-ui (the `pick-ui-library` recommendation for dialogs). Not needed for one modal; revisit if the app grows menus or popovers.

### Testing

- **Vitest** for the deck validator, the draw (distribution over many seeded draws, no repeats), unity selection and the reducer.
- **Playwright** for end-to-end flows at 320px and 1280px in both themes: a full reading by keyboard only, the options panel, persistence across reload, reduced-motion emulation, and a network log asserting same-origin requests only.
- **axe-core** run inside the Playwright flows on every screen in both themes, failing on any WCAG 2.2 AA violation. Target size and minimum font size are asserted directly, since axe does not cover them fully.

## Risks / Trade-offs

- [The 68 anchors were written from a different, more colourful deck and may point at details the Lequart placeholders do not show] → Out of scope here and listed as a later change; the text is carried over unchanged, and the image descriptions describe what is actually pictured so screen-reader users are not misled.
- [Death's scythe unity still says "Reversed, this becomes…", which contradicts gift-and-shadow-together] → Not reworded by tooling. Flagged for the author in the tasks; the snapshot test is updated when they supply new wording.
- [Landing copy from v1 addresses "autistic · ADHD · AuDHD", broader than the stated audience] → Implementation drafts replacement copy marked for the author's review; the wording is the author's to finalise.
- [Image descriptions are written for placeholder art and will be wrong once treated or replaced art arrives] → Descriptions live beside the card data, and the card-art change owns rewriting them.
- [The placeholder scans carry a library stamp and a maker's mark] → Accepted for placeholders; the art is public domain and will be replaced.
- [The "nothing moves on its own" requirement will conflict with the floating-particle atmosphere the author wants for the ritual] → Deliberate for the foundation. The ritual change will modify that requirement, most likely by allowing ambient motion that is off under reduced motion and has a visible pause.
- [Automated checks cannot judge whether a screen reader experience is good] → One manual pass with a screen reader is a task, in addition to axe.
- [Self-hosted fonts add weight] → Subset to Latin and ship WOFF2 only; three families at the weights actually used.

## Open Questions

- Where the app will be hosted. It does not affect anything here, since the output is static files; v1's Cloudflare Workers setup would serve it unchanged.
- Which display face to use for the wordmark and card names. The implementation picks one within the token system and it can be swapped in one place.
