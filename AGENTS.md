# NOIRSON 開發協作指引

## 溝通方式

- 除非另行指定，一律以繁體中文（台灣用語）回覆。
- 回覆保持務實、聚焦重點；重要變更需簡短說明原因。
- 程式碼與說明應容易讓正在學習全端開發的創作者理解。

## 專案定位

NOIRSON 是一個音樂內容探索平台（music content discovery platform），也是全端工程課程的作品集專案。平台以既有的 NOIRSON 音樂內容與品牌為基礎，提供內容探索、站內播放、品牌介紹，並在後續發展會員功能。

目前的音樂方向：

1. Lofi / Jazz / Chillhop
2. Ethereal Trap / Cloud Trap / Midnight Jersey
3. City Pop

視覺應呈現深色、冷調、Late Night、LOFI／Chill／Neo Soul 的音樂品牌氛圍；保持現代、簡潔、具層次，但避免企業網站感、過度漸層、過度動畫與不必要的卡片或介面元素。

## 目前階段與工作順序

目前階段為 **Phase 1 — Front-End Prototype / Home Implementation**。現階段優先完成 HTML、CSS、JavaScript 的前端雛形，不提前導入 React、Java Web、Spring、Spring Boot、JPA、MVC、正式金流、第三方 API、AI 或 RAG。

功能優先順序：**MVP → 核心功能 → 全端串接 → 部署 → 額外功能**。

- 核心 MVP：內容瀏覽與站內 Music Player。
- Music Player 是核心功能，不得標示為 Optional；最基本需要 Play、Pause、進度、目前時間、總長度，以及從 Tracklist 選擇歌曲。
- 時間不足時，刪除額外功能，不犧牲核心播放、內容瀏覽與可擴充的全端能力。

## 設計與實作原則

- 開始修改前，先閱讀所有相關現有檔案與既有命名／架構。
- 不要無理由重寫既有架構；每次只實作目前功能所需的範圍。
- 優先直接讀取 [Figma Wireframe](https://www.figma.com/design/ghOmiLHDDKCUkSW7KjqPsk/NOIRSON-Website) URL 對應的 Frame；只有 Figma 無法讀取或需要特定畫面參考時，才使用 screenshot／PNG 作為 fallback reference。
- Figma 是 NOIRSON 的 Wireframe／Layout reference，用於確認 Layout、Page structure、Information hierarchy、Size／proportion、Spacing、Alignment 與 User flow，而非 pixel-perfect 視覺規範。
- Figma Wireframe 中的灰階、黑白與 placeholder 顏色不代表正式 Visual Design，不得依照 Wireframe 顏色修改或覆蓋 NOIRSON 已確立的品牌配色。
- NOIRSON 正式配色以目前 Home CSS 已確立的深色 Visual Color System 為準；Home、Music／Explore、Music Detail、About、Login／Register 與後續頁面都必須維持一致的品牌色系。
- 不必等待 High-fidelity Figma Visual Design；視覺可透過 HTML、CSS 與 browser preview 逐步調整。
- 優先使用語意化 HTML（如 `header`、`nav`、`main`、`section`、`article`、`footer`）、可重用 CSS 與必要的原生 JavaScript。
- 維持簡單、清晰、可讀、可維護且具基本 RWD 的程式碼；不要為展示技術加入不必要的 package、framework 或複雜抽象。

## MVP 範圍

已確認的主要 Desktop 畫面：Home、Music / Explore、Music Detail、About、Login / Register。會員功能階段再加入 My Library。

Home 的既定內容為 Header / Navigation、Hero Carousel、Featured Music、About NOIRSON、Footer。Hero Carousel 後續使用左右切換箭頭與底部橫條 indicators，不使用圓點 indicators。

會員與購買 MVP 保持簡單：Register、Login、數位音樂購買、My Library 與已購內容下載。商品以數位音樂為主；購買可先採 Mock Purchase。YouTube 與 Spotify 僅作外部連結，不能取代站內播放功能。

目前不做：實體周邊、複雜購物車、複雜會員社群、Favorites、Playlist、真實 Payment Gateway、AI、RAG 與複雜推薦系統。

## 技術路線

目前以 HTML、CSS、JavaScript 完成前端雛形為優先。React、Java Web、Spring、Spring Boot、JPA、MVC、MySQL、REST API 整合與部署，依課程進度逐步導入；不得提前轉換專案技術架構。

## Git 與交付

- Repository 名稱為 `NOIRSON`，GitHub 帳號為 `sakinu7578`。
- 未經明確要求，不修改 Git 設定、不自行 commit 或 push。
- 不執行 `git reset --hard`、force push、刪除分支或改寫歷史等破壞性 Git 操作。
- 完成工作時，簡列完成事項、修改檔案與驗證方式。

## 後續 AI 協作原則

- AI 以教學、說明與協助理解為主要角色，重要決策需解釋原因。
- 使用者優先手動操作與練習，AI 不取代應由使用者建立的基礎能力。
- Codex 主要負責大量重複作業、唯讀程式碼檢查，以及使用者明確授權的修改。
- 未經要求，不主動進行大規模重構、加入框架或擴張功能範圍。
- 優先使用目前課程已學習的技術，再依課程進度導入後續工具。
- 程式碼以容易理解、容易維護與方便後續學習為原則。
- 未經要求，不自動 Commit 或 Push。
