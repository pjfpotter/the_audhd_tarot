# The ritual draw: checks on a real phone

The feel of the cloud and the behaviour of phone movement cannot be judged by
automated tests. These are the checks that need a person and a phone, and the
place to record them. Nothing below has been done yet.

The app is at <https://drop-a964c8a2-030.pjpotter.workers.dev/> and the
prototype it was tuned in is at
<https://drop-a964c8a2-030.pjpotter.workers.dev/prototypes/ritual-cloud/>.

## 1. The cloud against the prototype

Open both on the same phone and compare.

- **Look:** card colours, particle brightness, how far the cards fade with
  distance. The app uses a newer three.js than the prototype, with different
  colour handling, so this is where a difference is most likely.
- **Feel:** the drift at rest, the throw of a tap, the carry of a drag, how
  quickly it settles.
- **Frame rate:** whether it stays smooth while stirring.
- **Legibility:** whether the name, the introduction, the glyphs, the
  instruction line and the buttons stay easy to read over the cloud, in the
  dark theme and in the light theme. Automated contrast checks cannot see
  through a canvas.
- **The light theme:** the prototype was dark only. On the pale page the
  particles are drawn as dark motes, which nobody has yet looked at on a phone.
- **A small or short screen:** whether the draw button is within reach
  without scrolling.

| | |
| --- | --- |
| Phone and browser | |
| Date | |
| Look | |
| Feel | |
| Frame rate | |
| Legibility, dark theme | |
| Legibility, light theme | |
| Settings changed, if any | |

The settings are in `src/shuffle/cloud/settings.ts`. They start from the
values tuned in the prototype on 2026-10-07: drift 0.3, pulse 1.75, stir 1,
depth 0.3, settling 1.25, particles 360, tilt 1.8.

One thing differs from the prototype by design: the cloud gathers around the
middle of the space left between the top bar and the text, which on the app's
first screen is smaller than it was in the prototype.

## 2. Phone movement

On each phone: press "Let the cards feel you move", then

- **Accept** the phone's prompt if it shows one. Tilting should shift the
  view; swaying should roll the glyphs; holding still should not.
- **Stop** with "Stop following movement". Tilting should then do nothing.
- **Decline** on a fresh visit. The invitation should go, with no message, and
  tapping and dragging should work as before.

| | iPhone | Android |
| --- | --- | --- |
| Phone and browser | | |
| Date | | |
| Was there a prompt? | | |
| Accept | | |
| Stop | | |
| Decline | | |

Tilt was tried on one phone in the prototype, at strength 1.8. Recent
versions of Chrome ask permission as iPhones do; older ones start at once.

## 3. Once both are recorded

The prototype page, `scripts/publish-prototypes.mjs` and the build step that
runs it can be removed (task 6.1 of `add-ritual-draw`).
