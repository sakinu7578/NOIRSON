# NOIRSON 專案定義

## 專案定位

NOIRSON 是一個音樂內容探索與互動平台，以既有的 NOIRSON 音樂內容與品牌為基礎，提供 Mix 探索、站內播放與品牌內容。這也是全端工程課程的作品集專案，目標是建立功能核心明確、視覺一致且能逐步串接後端的 Web Application。

音樂內容方向包含 Lofi / Jazz / Chillhop、Ethereal Trap / Cloud Trap / Midnight Jersey，以及 City Pop。

## 目前版本

目前為 Vanilla HTML / CSS / JavaScript 的 V2.1 前端穩定版，包含六個響應式頁面：

1. Home：M001 Signature Mix 完整播放器與 8 Mix 無限循環 Carousel。
2. Explore：由 `js/mix-data.js` 動態產生 M001～M008 Gallery。
3. Music Detail：依 `?id=Mxxx` 動態載入內容，包含播放器、Previous / Next、Playlist 與 Gallery。
4. About：品牌介紹、人物內容、背景 Crossfade 與訂閱介面。
5. Login / Register：會員表單 UI，目前沒有 Authentication。

全站共用 Header、Footer、Logo 與 V2.1 Visual System，並支援 Desktop、Tablet 與 Mobile 基礎布局。

## MVP 與目前功能

Music Player 是核心 MVP 功能。Home 與 Music Detail 已支援 Play / Pause、Progress、Current time / Duration 與 Seek；Music Detail 另有依 Mix 順序循環的 Previous / Next 和浮動 Playlist。YouTube、Spotify 與 Instagram 為外部連結，不能取代站內播放。

目前 Favorite、Comments 與 Email Subscription 只有介面預留，沒有資料儲存、寄信或後端功能。Login / Register 也僅為 UI。

## 尚未完成功能

- Authentication、會員資料與 My Library。
- Favorite、Comments、Email Subscription 的真實功能。
- Search、Genre Filter、購買與下載流程。
- SEO、後端 API、前後端整合、測試與雲端部署。

實體周邊、複雜購物車、複雜會員社群、真實 Payment Gateway、AI、RAG 與複雜推薦系統目前不在實作範圍。

## 後續技術方向

現有 Vanilla 版本將作為 React 轉換前的功能與視覺基準。後續規劃為：

- Front End：React，拆分頁面與 Header、Footer、Player、Mix Card 等共用元件。
- Back End：Spring Boot 建立 REST API，負責 Mix、會員與互動資料。
- Persistence：Spring Data JPA 搭配 MySQL。
- Integration：React 呼叫 REST API，完成 Authentication 與必要 MVP 資料流程。
- Delivery：加入 SEO、測試、Production build 與雲端部署。

功能順序維持：**MVP → 核心功能 → 全端串接 → 部署 → 額外功能**。

## 設計參考與 Repository

- [Figma Wireframe](https://www.figma.com/design/ghOmiLHDDKCUkSW7KjqPsk/NOIRSON-Website) 用於 Layout、資訊層級與 User flow，不是正式配色規範。
- V2 Reference：`docs/design/noirson-v2-reference.png`。
- GitHub 帳號：`sakinu7578`
- Repository：`NOIRSON`
