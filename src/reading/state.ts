import type { Unity } from '../content/types'

/** One drawn card: which card, and the unities chosen for it at draw time. */
export interface DrawnCard {
  number: number
  unities: readonly Unity[]
}

/** A reading: one drawn card for each position of the spread, in order. */
export type Reading = readonly DrawnCard[]

/**
 * Where the person is. A reading in progress shows either the table of cards
 * or one card, whose art is held for a moment before its text.
 */
export type State =
  | { screen: 'landing' }
  | { screen: 'draw' }
  | {
      screen: 'revealing'
      reading: Reading
      /** How many cards have been turned over; cards are revealed in order. */
      revealed: number
      open: { index: number; phase: 'art' | 'text' } | null
    }
  | {
      screen: 'complete'
      reading: Reading
      /** A card whose image is being shown large again, if any. */
      art: number | null
    }

export type Action =
  | { type: 'enter' }
  | { type: 'draw'; reading: Reading }
  | { type: 'openCard'; index: number }
  | { type: 'showText' }
  | { type: 'closeCard' }
  | { type: 'openArt'; index: number }
  | { type: 'closeArt' }
  | { type: 'startAgain' }

export const initialState: State = { screen: 'landing' }

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'enter':
      return state.screen === 'landing' ? { screen: 'draw' } : state

    case 'draw':
      if (state.screen !== 'draw') return state
      return { screen: 'revealing', reading: action.reading, revealed: 0, open: null }

    case 'openCard': {
      if (state.screen !== 'revealing' || state.open) return state
      const { index } = action
      if (index < 0 || index >= state.reading.length) return state
      // The next face-down card is revealed, starting with its art.
      if (index === state.revealed) {
        return { ...state, revealed: state.revealed + 1, open: { index, phase: 'art' } }
      }
      // A card already turned over goes straight to its text.
      if (index < state.revealed) return { ...state, open: { index, phase: 'text' } }
      return state
    }

    case 'showText':
      if (state.screen !== 'revealing' || state.open?.phase !== 'art') return state
      return { ...state, open: { index: state.open.index, phase: 'text' } }

    case 'closeCard':
      if (state.screen !== 'revealing' || state.open?.phase !== 'text') return state
      return state.revealed === state.reading.length
        ? { screen: 'complete', reading: state.reading, art: null }
        : { ...state, open: null }

    case 'openArt':
      if (state.screen !== 'complete') return state
      if (action.index < 0 || action.index >= state.reading.length) return state
      return { ...state, art: action.index }

    case 'closeArt':
      return state.screen === 'complete' ? { ...state, art: null } : state

    case 'startAgain':
      return state.screen === 'landing' ? state : { screen: 'draw' }
  }
}
