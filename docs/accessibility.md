# Accessibility

What the app does for accessibility, how it is checked, and what still needs a
person to check it.

## What is checked automatically

`npm run test:e2e` runs these in a real browser on every screen, including the
options panel and the full-size card image, in both themes:

- A whole reading using only Tab, Shift+Tab, Enter, Space and Escape, with a
  visible focus ring at each step.
- An axe-core audit against WCAG 2.2 AA, failing on any violation.
- Every control is at least 44 by 44 CSS pixels at a 320px-wide screen.
- Reading text is at least 16px and no text is under 14px.
- Every control has a name and every image has alt text.
- With reduced motion, no animation runs at all, apart from a brief fade of
  the glyph row when the deck is shuffled.
- The shuffle works by tap, by any key, and by a press that arrives with no
  pointer or key behind it, as assistive technology sends.
- The cloud of cards: the keyboard run and the axe audit are repeated with
  it showing, it gives way to the still deck when it cannot run, it draws
  no frames while the page is hidden, and "Hold still" stops it at once.
- Nothing is lost when a screen is left untouched for ten minutes.

`npm test` checks that every text and background colour pairing in both themes
meets 4.5:1, and that the focus ring and control edges meet 3:1.

## What a screen reader is given

Recorded from the browser's accessibility tree. This is what is exposed, not a
recording of a screen reader speaking it.

| Step | Focus moves to | What is exposed |
| --- | --- | --- |
| The shuffle (first screen) | Top of the page on arrival; the heading after "Start again" | Heading "The AuDHD Tarot", button "Let the cards feel you move" on a phone showing the cloud, button "Hold still" when the cloud is available, button "The deck. Tap, or press any key, to shuffle." (with the cloud: "The deck. Tap, press any key, or drag to shuffle."), the introduction, the instruction line, button "Draw three cards", the privacy line, and a status region |
| Shuffling | Stays on the deck | Status region reads the count, such as "5 beats", at most once every two seconds. The row of glyphs is hidden |
| Options | First choice in the panel | Dialog "Options" with groups "Theme", "Motion" and "Text size", each a set of radio buttons, then "Close options" |
| Cards dealt | The first card | Heading "Your cards", then three list items: button "Where I am Turn over"; the other two read as their position and "Face down" |
| Card turned over | The card's heading | Heading such as "Where I am XXI The World", described by the image description; then the aliases and button "Continue" |
| Text emerges | Stays on the heading | Essence, question, then each unity as a heading with "Gift" and "Shadow" paragraphs, then "Back to the cards" |
| Back at the cards | The next card to turn over | Turned-over cards read as, for example, "Where I am The World. Read again" |
| Full reading | Heading "Your reading" | Three list items, each with "View … full size", a heading of position, number and name, and its text |
| Card image, full size | "Close" | Dialog named after the card, containing the image with its description |

Nothing about a card is exposed before it is turned over. Card thumbnails carry
empty alt text because the card's name is in text beside them. The card back
carries empty alt text too: it is the same on every card and says nothing.

On the deck, every key except Tab is a beat, including Enter and Space, so
those two shuffle and do not draw. Drawing is the separate button after it.
With the cloud showing, the arrow keys also stir it.

The cloud is a canvas hidden from screen readers. It is decoration: the
deck button, the count and the draw are the same with or without it.

## Still to do by hand

- **A pass with a real screen reader** (Orca, NVDA or VoiceOver) has not been
  done. The table above shows what is exposed; it does not show how it sounds,
  whether the order feels right, or whether the image description is read
  with the heading on each screen reader. Go through the shuffle, all three
  reveals, the full reading and the options panel, and note anything
  unnamed, out of order or silent. On the shuffle, check in particular that
  pressing the deck from the screen reader rolls the count, that the count
  is spoken without interrupting, and that a screen reader's own keys still
  work while the deck has focus.
- The 22 image descriptions in `src/content/imageDescriptions.ts` describe the
  placeholder art and need the author's review.

## Choices worth knowing

- The art moment moves on to the text by itself after 1.8 seconds. It is not a
  time limit: nothing is lost, the image stays on the next view, and
  "Continue" skips the wait.
- The art moment sits below the top bar and does not cover it, so "Options"
  and "Start again" stay within reach.
- Reduced motion follows the device and can also be chosen in the options. The
  app never turns motion on against the device setting.
- Moving the phone is never needed and never read unasked. "Let the cards
  feel you move" is an invitation over the cloud on a device held in the
  hand; nothing listens to the phone until it is pressed, "Stop following
  movement" ends it, and it is not remembered between visits. If the person
  or the device says no, the invitation goes without a message.
- The cloud of cards is the one thing that moves without being touched. It is
  never shown with reduced motion, "Hold still" on the same screen replaces
  it with the still deck and is remembered, and it stops when the page is
  hidden. The automated audit cannot judge text contrast against a moving
  canvas, so the text sits on the solid page colour below the cloud; that
  still needs checking by eye on a phone in both themes.
