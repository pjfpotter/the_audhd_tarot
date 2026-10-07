import { describe, expect, test } from 'vitest'
import { deck } from '../content/deck'
import { type Action, type Reading, type State, initialState, reducer } from './state'

const reading: Reading = [3, 12, 19].map((number) => ({
  number,
  unities: deck[number]!.unities.slice(0, 2),
}))

const run = (actions: Action[], from: State = initialState) => actions.reduce(reducer, from)

const drawn = run([{ type: 'enter' }, { type: 'draw', reading }])
const revealCard = (index: number): Action[] => [
  { type: 'openCard', index },
  { type: 'showText' },
  { type: 'closeCard' },
]

describe('reading state', () => {
  test('starts on the landing screen', () => {
    expect(initialState).toEqual({ screen: 'landing' })
  })

  test('entering leads to the draw', () => {
    expect(run([{ type: 'enter' }])).toEqual({ screen: 'draw' })
  })

  test('nothing can be drawn before entering', () => {
    expect(run([{ type: 'draw', reading }])).toEqual({ screen: 'landing' })
  })

  test('a draw deals the cards face down', () => {
    expect(drawn).toEqual({ screen: 'revealing', reading, revealed: 0, open: null })
  })

  test('revealing a card shows its art first', () => {
    expect(run([{ type: 'openCard', index: 0 }], drawn)).toMatchObject({
      revealed: 1,
      open: { index: 0, phase: 'art' },
    })
  })

  test('the art gives way to the text', () => {
    expect(run([{ type: 'openCard', index: 0 }, { type: 'showText' }], drawn)).toMatchObject({
      open: { index: 0, phase: 'text' },
    })
  })

  test('cards are revealed in position order', () => {
    expect(run([{ type: 'openCard', index: 1 }], drawn)).toBe(drawn)
    expect(run([{ type: 'openCard', index: 2 }], drawn)).toBe(drawn)
  })

  test('a card outside the spread cannot be opened', () => {
    expect(run([{ type: 'openCard', index: 3 }], drawn)).toBe(drawn)
    expect(run([{ type: 'openCard', index: -1 }], drawn)).toBe(drawn)
  })

  test('closing a card returns to the table with the others still face down', () => {
    expect(run(revealCard(0), drawn)).toEqual({ screen: 'revealing', reading, revealed: 1, open: null })
  })

  test('a card cannot be closed while its art moment is showing', () => {
    const art = run([{ type: 'openCard', index: 0 }], drawn)
    expect(reducer(art, { type: 'closeCard' })).toBe(art)
  })

  test('returning to a revealed card shows its text with the same unities', () => {
    const back = run([...revealCard(0), { type: 'openCard', index: 0 }], drawn)
    expect(back).toMatchObject({ revealed: 1, open: { index: 0, phase: 'text' } })
    expect(back.screen === 'revealing' && back.reading[0]!.unities).toBe(reading[0]!.unities)
  })

  test('closing the third card completes the reading', () => {
    expect(run([...revealCard(0), ...revealCard(1), ...revealCard(2)], drawn)).toEqual({
      screen: 'complete',
      reading,
      art: null,
    })
  })

  test('a card image can be reopened from the full reading and dismissed', () => {
    const complete = run([...revealCard(0), ...revealCard(1), ...revealCard(2)], drawn)
    const art = reducer(complete, { type: 'openArt', index: 1 })
    expect(art).toEqual({ screen: 'complete', reading, art: 1 })
    expect(reducer(art, { type: 'closeArt' })).toEqual(complete)
  })

  test.each([
    ['the draw', run([{ type: 'enter' }])],
    ['the table', drawn],
    ['an art moment', run([{ type: 'openCard', index: 0 }], drawn)],
    ['a card text', run([{ type: 'openCard', index: 0 }, { type: 'showText' }], drawn)],
    ['the full reading', run([...revealCard(0), ...revealCard(1), ...revealCard(2)], drawn)],
  ])('starting again from %s clears the reading', (_name, state) => {
    expect(reducer(state, { type: 'startAgain' })).toEqual({ screen: 'draw' })
  })

  test('actions that do not apply leave the state unchanged', () => {
    expect(reducer(initialState, { type: 'startAgain' })).toBe(initialState)
    expect(reducer(drawn, { type: 'showText' })).toBe(drawn)
    expect(reducer(drawn, { type: 'openArt', index: 0 })).toBe(drawn)
    expect(reducer(drawn, { type: 'enter' })).toBe(drawn)
  })
})
