# Mixing and choosing: checks on a real phone

How the cloud feels under a thumb cannot be judged by automated tests. These
are the checks that need a person and a phone, and the place to record them.
Nothing below has been done yet.

The cloud was first tuned on a phone on 2026-10-07. Test users then found that
a touch threw every card off the screen, and on 2026-11-03 touches were
redesigned: a touch now disturbs only the cards near the finger, cards can
never leave the clear part of the screen, and the second part of the shuffle
has the person drag three cards into three spaces. The new strengths are
untested on a phone.

## 1. Mixing

On a phone, in the app's own page:

- **Gentleness:** a tap should nudge the cards beside the finger and leave the
  rest. A hard scrub across the whole screen should swirl the cards and never
  leave an empty screen.
- **Stirring:** whether dragging feels like moving cards, not like a wind.
- **The start:** reload several times. The cloud should start differently each
  time.
- **Frame rate:** whether it stays smooth while stirring.
- **Legibility:** whether the introduction, the names of the spaces, the
  instruction line and the buttons stay easy to read, in the dark theme and in
  the light theme. Automated contrast checks cannot see through a canvas.
- **The light theme:** the particles are drawn as dark motes on the pale page,
  which nobody has yet looked at on a phone.
- **A small or short screen:** whether the cloud, the spaces and the buttons
  all fit without scrolling, and what happens when they do not.

The settings are in `src/shuffle/cloud/settings.ts`: drift 0.3, ripple 0.6,
stir 0.8, depth 0.3, calm 1.25, particles 360. Ripple and stir are the ones to
adjust. How far a touch reaches, the fastest a card may travel and how far
above the finger a carried card is held are constants at the top of
`src/shuffle/cloud/scene.ts`.

| | |
| --- | --- |
| Phone and browser | |
| Date | |
| Gentleness of a tap | |
| Stirring | |
| Frame rate | |
| Legibility, dark theme | |
| Legibility, light theme | |
| Small screen | |
| Settings changed, if any | |

## 2. Choosing

- **Taking hold:** does a card come up under the finger you meant it to, in a
  crowd? Is the one lifted the one that was on top?
- **Carrying:** the card is held a little above the fingertip so that it is not
  hidden. Does that feel right, or does it feel as if the wrong card is held?
- **Dropping:** whether it is easy to land a card in the space you wanted, and
  whether a card let go elsewhere goes back among the others as expected.
- **The spaces:** whether the three spaces are big enough to aim at, and
  whether tapping a card in one to put it back is discoverable.
- **The finish:** whether "Lay out my cards" is where a thumb expects it, and
  whether the cut from the spaces to the face-down cards on the table feels
  abrupt.
- **Reduced motion and "Hold still":** the face-down cards should be easy to
  tap three of, with the buttons staying in reach as the page scrolls.

| | |
| --- | --- |
| Taking hold | |
| Carrying | |
| Dropping | |
| The spaces | |
| The finish | |
| Face-down cards | |

## 3. Afterwards

The prototype page, `scripts/publish-prototypes.mjs` and the build step that
runs it can be removed. They are no longer the reference for how the cloud
should feel.
