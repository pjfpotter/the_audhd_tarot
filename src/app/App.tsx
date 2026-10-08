import { useCallback, useEffect, useReducer, useState } from 'react'
import { deck } from '../content/deck'
import { OptionsPanel } from '../preferences/OptionsPanel'
import { CardReveal } from '../reading/CardReveal'
import { FullReading } from '../reading/FullReading'
import { Table } from '../reading/Table'
import { drawReading } from '../reading/draw'
import { threeCardSpread as spread } from '../reading/spread'
import { type DrawnCard, initialState, reducer } from '../reading/state'
import { Shuffle } from '../shuffle/Shuffle'
import { Frame } from './Frame'

const cardFor = (drawn: DrawnCard) => deck.find((card) => card.number === drawn.number)!

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Kept apart from the reading, so opening the options never disturbs it.
  const [optionsOpen, setOptionsOpen] = useState(false)

  const reading = state.screen === 'revealing' || state.screen === 'complete' ? state.reading : null

  // Fetch the drawn cards' images while they are still face down, so a card
  // is never revealed onto a blank or half-loaded image.
  useEffect(() => {
    reading?.forEach((drawn) => {
      new Image().src = cardFor(drawn).image
    })
  }, [reading])

  const showText = useCallback(() => dispatch({ type: 'showText' }), [])
  const startAgain = useCallback(() => dispatch({ type: 'startAgain' }), [])

  const open = state.screen === 'revealing' ? state.open : null

  return (
    <>
      <Frame
        showName={state.screen !== 'draw'}
        onOpenOptions={() => setOptionsOpen(true)}
        onStartAgain={reading ? startAgain : undefined}
        fill={open?.phase === 'art'}
      >
        {state.screen === 'draw' && (
          <Shuffle onDraw={(random) => dispatch({ type: 'draw', reading: drawReading(deck, spread, random) })} />
        )}

        {state.screen === 'revealing' && !open && (
          <Table
            spread={spread}
            cards={state.reading.map(cardFor)}
            revealed={state.revealed}
            onOpenCard={(index) => dispatch({ type: 'openCard', index })}
          />
        )}

        {state.screen === 'revealing' && open && (
          <CardReveal
            key={open.index}
            card={cardFor(state.reading[open.index]!)}
            position={spread.positions[open.index]!}
            unities={state.reading[open.index]!.unities}
            phase={open.phase}
            closeLabel={
              state.revealed === state.reading.length ? 'See the whole reading' : 'Back to the cards'
            }
            onShowText={showText}
            onClose={() => dispatch({ type: 'closeCard' })}
          />
        )}

        {state.screen === 'complete' && (
          <FullReading
            spread={spread}
            cards={state.reading.map((drawn) => ({ card: cardFor(drawn), unities: drawn.unities }))}
            art={state.art}
            onOpenArt={(index) => dispatch({ type: 'openArt', index })}
            onCloseArt={() => dispatch({ type: 'closeArt' })}
            onStartAgain={startAgain}
          />
        )}
      </Frame>
      <OptionsPanel open={optionsOpen} onClose={() => setOptionsOpen(false)} />
    </>
  )
}
