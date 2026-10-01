# NOIRSON 專案定義

## 專案定位

NOIRSON 是一個 Curated Music Experience／Music-first platform，以既有的 NOIRSON 音樂內容與品牌為基礎。網站將逐步提供音樂內容探索、站內播放與品牌介紹。

本專案是全端工程課程的作品集，目標是完成一個功能核心明確、視覺一致、可逐步擴充的 Web Application。

## 音樂內容方向

1. Lofi / Jazz / Chillhop
2. Ethereal Trap / Cloud Trap / Midnight Jersey
3. City Pop

## 使用者體驗

使用者進入 NOIRSON 時，應能立即理解這是一個以音樂內容與探索為核心的平台。體驗應呈現 Chill、Atmospheric、Stylish、Immersive、Modern 且容易導覽的風格。

## Wireframe 與 MVP 頁面

[Figma Wireframe](https://www.figma.com/design/ghOmiLHDDKCUkSW7KjqPsk/NOIRSON-Website) 已完成，用於確認 layout、資訊層級與 user flow；它不是 pixel-perfect 的視覺規範。實際圖片、Logo、文案、色彩、字體、spacing、hover 與 RWD 將直接在 HTML / CSS 中迭代。

目前規劃的 Desktop 頁面：

1. Home
2. Music / Explore
3. Music Detail
4. About
5. Login / Register（不列入目前 MVP，檔案暫時保留）

會員功能階段再新增 My Library。

## Home 範圍

Home V2 為 Music-first Experience，以 M001「Somewhere far from everyone」作為 Signature Mix，提供完整播放；Explore Sound 呈現其餘精選 Mix。全站目前共有 M001～M008 共 8 組 Mix。

## 核心播放功能

Music Player 是 MVP 的核心功能，不是 Optional。基礎播放器需支援：

- Play / Pause
- Progress
- Current time / Duration
- 從 Tracklist 選擇歌曲

Previous / Next、Volume、Shuffle 與其他進階控制，可在核心版本穩定後再加入。YouTube 與 Spotify 僅作外部連結，不能取代 NOIRSON 本身的播放功能。

## 後續功能

Search 與 Login / Register 不列入目前 MVP，既有 Login / Register 檔案暫時保留。Email Subscription 為後續全端功能，目前尚未實作。Music Detail 未來將依網址 `?id=Mxxx` 動態載入；About 未來將使用 `images/00.png`～`images/16.png` 自動 Crossfade 背景。

目前延後：實體周邊、複雜購物車、複雜會員社群、Favorites、Playlist、真實 Payment Gateway、AI、RAG 與複雜推薦系統。

## 技術路線與範圍控制

目前優先完成 Desktop-first 的 HTML、CSS、JavaScript 前端雛形，Mobile / RWD 後續處理。JavaScript / React 課程已完成，目前課程進入 Spring / Back End 階段；專案仍依課程與 MVP 範圍逐步導入，不提前轉換技術架構。

功能優先順序為：**MVP → 核心功能 → 全端串接 → 部署 → 額外功能**。若時間不足，優先刪除額外功能，保留核心播放、內容瀏覽與全端能力。

## Repository

- GitHub 帳號：`sakinu7578`
- Repository：`NOIRSON`
