import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { CssBaseline } from '@mui/material'
import './index.css'
import App from './App.tsx'
import { makeStore } from './store/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={makeStore()}>
      <CssBaseline />
      <App />
    </Provider>
  </StrictMode>,
)
