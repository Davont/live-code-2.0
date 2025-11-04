import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root2')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
