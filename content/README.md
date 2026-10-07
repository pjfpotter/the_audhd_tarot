# Card content

## Where the text comes from

The card text is the author's writing, carried over word for word from the v1
prototype at <https://drop-a964c8a2-030.pjpotter.workers.dev/>.

- `content/v1-snapshot.json` is the card array exactly as it appears in the
  prototype, written by `node scripts/extract-v1.mjs`.
- `src/content/cards.ts` is the text the app uses. It was generated once from
  the snapshot and is now edited by hand. v1's `superpower` is called `gift`
  here and v1's `trap` is called `shadow`, matching the labels readers see.

Each card has a number (0–21, Marseille order: 8 is Justice, 11 is Force), a
name, aliases, an essence line, a question, and at least three unities. A unity
is an anchor (a detail of the card image) with a gift and a shadow.

## Editing the text

Edit `src/content/cards.ts`, then run `npm test`.

- `src/content/validate.test.ts` fails if a card is missing or duplicated, a
  field is empty, or a card has fewer than three unities, and names the card.
- `src/content/v1.test.ts` fails on any difference from the snapshot, so that
  wording never changes by accident. When a change is intended, make the same
  edit in `content/v1-snapshot.json`.

## Replacing card art

Card images are `public/cards/00.webp` to `public/cards/21.webp`, named by
card number. To change a card's art, replace its file with another WebP of the
same name; nothing else needs to change. Images are shown uncropped in a box
of roughly 720:1354, so keep new art close to that shape.

After replacing an image, rewrite its entry in
`src/content/imageDescriptions.ts`. A description says what is visibly in the
image, in plain language, without interpreting the card.

The full-size originals of the current art are in `art/source/`. They are not
part of the app.

## Open items for the author

- **Death, "The scythe".** The shadow still reads "Reversed, this becomes
  refusing to simplify…". The app has no reversed cards: every unity holds its
  gift and shadow together. The wording is left as written.
- **Cards 2 and 5 show different figures from the text.** The current art is a
  Besançon-pattern deck (printed by Lequart, Paris), which replaces the Popess
  and the Pope: card II is titled *Junon* and shows a woman with two peacocks,
  and card V is titled *Jupiter* and shows a man with thunderbolts standing on
  an eagle. The text for those cards is La Papesse and Le Pape, with anchors
  such as "the books, the robed and covered figure". The image descriptions
  describe what is actually pictured.
- **Anchors have not been checked against this art.** Many were written from a
  different deck and may point at details these images do not show.
