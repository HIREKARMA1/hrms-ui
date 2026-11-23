import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { store } from './app/store'
import { SessionBootstrap } from './features/auth/components/SessionBootstrap'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <SessionBootstrap>
        <App />
      </SessionBootstrap>
    </Provider>
  </StrictMode>,
)
