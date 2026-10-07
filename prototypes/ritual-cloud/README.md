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

Each input also adds a stroke to a seal at the top of the screen: a path
through nine points on a ring, straight for a beat and curved for a stir, with
a tick on the rim for a sway of the phone. The ten most recent strokes are
bright and earlier ones fade to a trace. Drawing adds three closing strokes and
a bar across the end, and the seal enlarges.

Left out on purpose: the intention, the real reading, and all accessibility
work.

Tilt is refused inside a claude.ai page. To test it, the file needs wrapping in
a normal HTML document and serving from an ordinary HTTPS address.
