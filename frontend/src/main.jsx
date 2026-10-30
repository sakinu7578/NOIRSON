import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { HashRouter } from 'react-router'
import { LanguageProvider } from './context/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider><HashRouter><App /></HashRouter></LanguageProvider>
  </StrictMode>,
)
