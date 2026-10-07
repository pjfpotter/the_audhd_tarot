# Proposal

## Why

The AuDHD Tarot exists only as a v1 prototype published under its old name ("Neurospicy Tarot"); this repository holds card art and tooling but no application. The prototype also has gaps that matter for its audience of high-masking, late-diagnosed AuDHD adults: the draw is a timed press-and-hold that cannot be done by keyboard, switch or screen reader, much of the text is 10–11px, there is one light theme, reduced motion is only partly honoured, the cards show no art, and on desktop it is a phone column centred on the page.

Everything planned next (position-adaptive text, the ritual stim-shuffle, AuDHD-time spreads, sharing, the treated card art) needs an accessible, working reading app in this repository to build on.

## What Changes

- Create the web application in this repository as a static, client-only site: no backend, no accounts, no AI calls, and no requests to third parties.
- Carry over the v1 card content unchanged as the app's text database: 22 major arcana in Marseille order (Justice at 8, Force at 11), each with a name, aliases, an essence line, a question, and its "unities" (an anchor detail of the card image with a gift and a shadow), 68 unities in total.
- Rename throughout to The AuDHD Tarot and remove the old name and the old domain.
- Provide a three-card reading using v1's positions (Where I am / How I should travel / Where I'm going next), drawn fairly at random with no repeats.
- Replace the timed press-and-hold with a draw that works with any single activation (tap, click, key, switch), with no timing, holding or dragging.
- Show real card imagery for the first time, using the Marseille placeholder art in `art/placeholders/`, addressed by card number so the treated art can replace it later without code changes.
- Give the art a hero moment: when a card is revealed its image fills the screen for a beat before the reading text emerges.
- Add light and dark themes in the project's violet, black and lavender visual vocabulary, with Atkinson Hyperlegible for all reading text.
- Add an accessibility options panel (theme, motion, text size) remembered on the device, and meet baseline accessibility requirements from the first screen: full keyboard use, screen-reader support including a written description of every card image, readable text sizes and contrast, large targets.
- Lay out for mobile first and make real use of desktop width.

Out of scope, each planned as its own later change: position-adaptive reading text; the ritual draw (stim-as-shuffle, intention, closing); spreads built around AuDHD time; a typed question or capacity check; sharing (link, image, alt text); the final treated card art; an audit of the 68 anchors against the chosen deck; deployment.

## Capabilities

### New Capabilities

- `card-content`: The deck as data: the 22 major arcana, what each card carries (identity, essence, question, unities, image and image description), and the guarantees the rest of the app relies on.
- `reading`: Drawing a three-card reading and presenting it: the positions, the draw, the per-card reveal with its hero moment, the reading text, and starting again.
- `accessibility`: The accessibility options a person can set and the baseline accessibility behaviour every screen must meet.
- `app-shell`: The application as a whole: its name and landing screen, static client-only operation and privacy, themes, and responsive layout.

### Modified Capabilities

None. The project has no existing specs.

## Impact

- **Code:** new application source, tests and build configuration at the repository root; the project currently has none. The stray empty `package-lock.json` is replaced by a real one.
- **Dependencies:** Vite, React and TypeScript, plus test tooling. No runtime services.
- **Content:** card text is imported from the v1 prototype at `https://drop-a964c8a2-030.pjpotter.workers.dev/`. 22 new image descriptions must be written for the placeholder art.
- **Assets:** the 22 WebP placeholders are served by the app; `art/source/` stays out of the build.
- **Existing prototype:** untouched; it stays online at its current address.
