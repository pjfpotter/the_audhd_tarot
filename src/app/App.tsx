import { useReducer, useState } from 'react'
import { OptionsPanel } from '../preferences/OptionsPanel'
import { initialState, reducer } from '../reading/state'
import { DrawPending } from './DrawPending'
import { Frame } from './Frame'
import { Landing } from './Landing'

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Kept apart from the reading, so opening the options never disturbs it.
  const [optionsOpen, setOptionsOpen] = useState(false)

  return (
    <>
      <Frame showName={state.screen !== 'landing'} onOpenOptions={() => setOptionsOpen(true)}>
        {state.screen === 'landing' ? (
          <Landing onEnter={() => dispatch({ type: 'enter' })} />
        ) : (
          <DrawPending />
        )}
      </Frame>
      <OptionsPanel open={optionsOpen} onClose={() => setOptionsOpen(false)} />
    </>
  )
}
