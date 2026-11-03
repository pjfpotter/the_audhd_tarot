# Design

## Context

`add-ritual-draw` built a shuffle whose every input was folded into a hidden number that picked the cards, shown as glyphs, over a cloud of identical card backs. Test users did not understand it, wanted the card they touched to be the card they got, and found a tap on a phone threw all the cards out of view.

## Decisions

### Identity: every card is a particular card

The cloud is given the 22 card numbers in a shuffled order (Fisher–Yates over `crypto.getRandomValues`). Position `i` in that order is where a card's home is in the spiral, so the shuffle of identity to place happens once, at the start, and the cloud's motion is then only motion. Cards are face down, so nothing about the identity is visible; it is what makes "the card I touch is the card I get" true. Faces are not loaded into the scene.

The whole spiral is also turned by a random angle and each card starts a little off its home, so two clouds do not start alike even if the permutation happened to repeat.

### Two parts, one set of three spaces

The first part mixes; the second chooses. The three spaces are DOM, below the cloud and over the canvas, with nothing behind them but the canvas, so that a card placed in one is seen through it. The scene is told where the spaces are on the screen (`slots()` in pixels, asked again on resize, scroll and whenever the hand changes), turns each into a point and a size at a fixed depth, and moves the card there. The spaces are shown in both parts (dimmed while mixing) so the layout does not move between them and the goal is visible.

React owns the hand (an array of three card numbers or null). The scene only knows where each card should be. A card dropped over a space goes into the nearest empty one; dropped anywhere else it drifts back into the cloud. Tapping a card in a space puts it back; "Mix again" empties the spaces.

### A touch is local and bounded

The first cloud used a Gaussian reach of about three scene units, wider than the cloud, and impulses that the spring home could not catch. Now:

- reach is about one card (`FEEL`), so only the cards under the finger move;
- ripple and stir are about a third as strong, and one pointer move is capped at 60 px;
- a card's speed is capped (`MAX_SPEED`), and `keepInRoom` stops a card at the edge of the clear part of the screen, a whole card from the sides, removing the speed it carries outward.

The containment is pure (`motion.ts`) and unit tested with a hard shove every frame. The strengths are a first guess to be tuned on a phone.

### Taking hold

In the second part a press raycasts the cards that are still in the cloud and takes the frontmost hit, which is the card on top of the pile as the person sees it. Anything else is still a stir. The card is held at a fixed depth, in front of the cloud and slightly larger than a space, 44 px above the fingertip so the finger does not cover it. The pointer is captured on the deck button so the drag continues beyond it.

### Where there is no cloud

A second presentation of the same choice: the deck is a stack to tap that reshuffles the order of 22 face-down cards, and choosing shows those cards in a grid above the spaces' sticky buttons. Buttons are named by place in the layout ("Card 5 of 22"), never by identity. A chosen card leaves a gap, so nothing moves under a finger, and keeps its place in the focus order.

### Focus and announcements

"Choose your cards" and "Mix again" move focus to the first control in the stage. The third card chosen moves focus to "Lay out my cards" so a keyboard does not Tab past 19 cards. A status region says which space was filled and how many are left, never which card.

### No hidden number

Nothing is derived from a person's timing or position any more. Randomness is the device's, and used for the arrangement and for the unities shown on each card. This is simpler and is what people understood.

## Risks / Trade-offs

- [Touch strengths and the lift above the finger are untuned] → They are constants, and `docs/ritual-draw.md` lists what to check on a phone.
- [A dense cloud makes it hard to take the card you meant] → The frontmost card is taken, which is what is seen; the cloud is gentle and slows nothing down, so a person can mix until the card they want is on top.
- [The scene's spaces depend on page layout] → They are re-read on resize, scroll and every hand change, and the spaces sit in the page flow so a screen that scrolls keeps them aligned.
- [The cut from the spaces to the face-down cards on the table is abrupt] → Accepted for now; a shared transition is a possible follow-up.

## Open Questions

- Wording of the instruction lines and buttons, as drafts in `src/app/copy.ts`.
- Whether "Mix again" should shuffle the cloud's identities again, or only the positions as now.
