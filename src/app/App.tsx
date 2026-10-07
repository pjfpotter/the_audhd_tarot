import { useReducer } from 'react'
import { initialState, reducer } from '../reading/state'
import { DrawPending } from './DrawPending'
import { Frame } from './Frame'
import { Landing } from './Landing'

export function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <Frame showName={state.screen !== 'landing'} onOpenOptions={() => {}}>
      {state.screen === 'landing' ? (
        <Landing onEnter={() => dispatch({ type: 'enter' })} />
      ) : (
        <DrawPending />
      )}
    </Frame>
  )
}
