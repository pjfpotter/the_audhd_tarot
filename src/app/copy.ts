// DRAFT FOR THE AUTHOR'S REVIEW. This is placeholder wording written during
// the build, not the author's text. v1's landing copy addressed "autistic ·
// ADHD · AuDHD"; the audience is now high-masking, late-diagnosed AuDHD adults.
export const shuffleCopy = {
  intro: 'The major arcana, reread by a late-diagnosed AuDHD adult for the rest of us.',
  hint: {
    mix: {
      cloud: 'Drag across the cards to mix them. Take as long as you like, then choose.',
      still: 'Tap the deck to shuffle it. Take as long as you like, then choose.',
    },
    choose: {
      cloud: 'Drag three cards into the spaces. The card you touch is the card you get.',
      still: 'Tap three cards. The card you touch is the card you get.',
    },
    full: 'Three cards chosen. Lay them out when you are ready, or tap one to put it back.',
  },
  deck: {
    mix: {
      cloud: 'The deck. Drag to mix the cards, or press any key.',
      still: 'The deck. Tap, or press any key, to shuffle.',
    },
    choose: {
      cloud: 'The deck, mixed. Drag a card into a space below, or press Enter to take the card nearest the middle.',
      still: 'The deck, mixed. Tap, or press any key, to shuffle.',
    },
  },
  hold: 'Hold still',
  move: 'Let it move',
  choose: 'Choose your cards',
  mixAgain: 'Mix again',
  lay: 'Lay out my cards',
  privacy: 'Nothing you do here leaves your device.',
  status: {
    choosing: 'Now choose three cards, one for each space.',
    mixing: 'Mixing again. Your spaces are empty.',
    left: (n: number) => (n === 1 ? 'One more to choose.' : `${n === 2 ? 'Two' : 'Three'} more to choose.`),
    all: 'Three cards chosen. Lay them out when you are ready.',
    full: 'Your three spaces are full. Tap a card in one to put it back.',
    taken: (position: string) => `${position}: a card is chosen.`,
    back: (position: string) => `${position}: card put back.`,
  },
}
