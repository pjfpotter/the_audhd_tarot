import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { watchPreferences } from './preferences/usePreferences'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'

watchPreferences()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
