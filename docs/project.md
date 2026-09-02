# NOIRSON 專案定義

## 專案定位

NOIRSON 是一個音樂內容探索平台（music content discovery platform），以既有的 NOIRSON 音樂內容與品牌為基礎。網站將逐步提供音樂內容探索、站內播放、品牌介紹，以及後續的會員與數位音樂購買功能。

本專案是全端工程課程的作品集，目標是完成一個功能核心明確、視覺一致、可逐步擴充的 Web Application。

## 音樂內容方向

1. Lofi / Jazz / Chillhop
2. Ethereal Trap / Cloud Trap / Midnight Jersey
3. City Pop

## 使用者體驗

使用者進入 NOIRSON 時，應能立即理解這是一個以音樂內容與探索為核心的平台。體驗應呈現 Chill、Atmospheric、Stylish、Immersive、Modern 且容易導覽的風格。

## Wireframe 與 MVP 頁面

[Figma Wireframe](https://www.figma.com/design/ghOmiLHDDKCUkSW7KjqPsk/NOIRSON-Website) 已完成，用於確認 layout、資訊層級與 user flow；它不是 pixel-perfect 的視覺規範。實際圖片、Logo、文案、色彩、字體、spacing、hover 與 RWD 將直接在 HTML / CSS 中迭代。

已確認的 MVP Desktop 頁面：

1. Home
2. Music / Explore
3. Music Detail
4. About
5. Login / Register

會員功能階段再新增 My Library。

## Home 範圍

Home 由 Header / Navigation、Hero Carousel、Featured Music、About NOIRSON 與 Footer 組成。Hero Carousel 的後續方向為左右切換箭頭與底部橫條 indicators，不使用圓點 indicators。

## 核心播放功能

Music Player 是 MVP 的核心功能，不是 Optional。基礎播放器需支援：

- Play / Pause
- Progress
- Current time / Duration
- 從 Tracklist 選擇歌曲

Previous / Next、Volume、Shuffle 與其他進階控制，可在核心版本穩定後再加入。YouTube 與 Spotify 僅作外部連結，不能取代 NOIRSON 本身的播放功能。

## 會員與購買 MVP

初期會員功能包含 Register、Login、數位音樂購買、My Library 與已購內容下載。商品以包含約 10–20 首歌曲的數位 Mix 為主。購買流程可先使用 Mock Purchase，再視專題進度決定是否串接正式金流。

目前延後：實體周邊、複雜購物車、複雜會員社群、Favorites、Playlist、真實 Payment Gateway、AI、RAG 與複雜推薦系統。

## 技術路線與範圍控制

目前優先完成 HTML、CSS、JavaScript 前端雛形。React、Java Web、Spring、Spring Boot、JPA、MVC、MySQL、REST API 整合與部署，依課程進度逐步導入；不提前導入後續技術。

功能優先順序為：**MVP → 核心功能 → 全端串接 → 部署 → 額外功能**。若時間不足，優先刪除額外功能，保留核心播放、內容瀏覽與全端能力。

## Repository

- GitHub 帳號：`sakinu7578`
- Repository：`NOIRSON`
