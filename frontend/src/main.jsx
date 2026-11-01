import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { HashRouter } from 'react-router'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { MusicPlayerProvider } from './context/MusicPlayerContext.jsx'

// 播放器 Provider 包住整個路由介面，切換頁面時同一個音訊實例仍會保留。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider><HashRouter><MusicPlayerProvider><App /></MusicPlayerProvider></HashRouter></LanguageProvider>
  </StrictMode>,
)
