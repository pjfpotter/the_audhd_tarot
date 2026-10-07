# Ritual cloud prototype

A throwaway prototype for judging the feel of the ritual draw before it is
specified. It is not part of the app and is not meant to be merged into `main`.

- `ritual-cloud.html` is the whole prototype. It is written in the form the
  claude.ai Artifact tool publishes (page content only, no `<html>` wrapper),
  and is published privately at
  <https://claude.ai/artifact/EfyJjR2eQ5L5L1ACKX827u>.
- `card-back.webp` is a web-sized copy of `art/source/audhd-tarot-card-back.png`.

It shows 22 face-down cards drifting in depth among particles. A tap or key
press is a beat, a drag stirs, and tilting the phone shifts the view. Every
input is folded into a hidden number, shown as glyphs, which picks the three
cards when "Draw three cards" is pressed. The "Tune" panel has sliders for the
feel and can copy the current settings.

With reduced motion (the device setting, or the switch in "Tune") there is no
cloud: one still deck, with the number shown large. Tapping the deck or
pressing any key rolls the number; there is no stir or tilt. A seal that grew
with each input was tried and removed.

Left out on purpose: the intention, the real reading, and all
accessibility work.

Tilt is refused inside a claude.ai page, so the prototype is also published with
the site, at `/prototypes/ritual-cloud/`. `scripts/publish-prototypes.mjs` wraps
it in a document and copies it into `dist/` at the end of `npm run build`. It
comes out of the site when the real ritual draw replaces it.
