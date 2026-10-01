# NOIRSON 開發進度

## 目前階段

**Phase 1C — Home V2 / Global Visual System**

主要靜態頁面版型已完成。現階段成果為原生 HTML / CSS 前端雛形，暫不提前導入 React、Spring Boot、資料庫或其他後續技術。

## 已完成

### 專案與規劃

- [x] Repository / Git 基礎設定
- [x] HTML / CSS / JavaScript 專案結構
- [x] Figma Wireframe Phase
- [x] 5 個 Desktop Wireframe
- [x] MVP 頁面架構：Home、Music / Explore、Music Detail、About、Login / Register

### Home

- [x] Home V2 Music-first layout
- [x] M001 Signature Mix 完整播放、暫停、時間與可拖曳進度列
- [x] Explore Sound 顯示 M002～M006，支援箭頭與滑鼠拖曳
- [x] Fixed translucent Header 與簡化 Footer
- [x] Home Desktop 主要 Layout 已依 Figma Wireframe 完成
- [x] Header / Navigation
- [x] Hero Carousel、左右箭頭與底部橫條 indicators
- [x] Featured Music 四欄內容排列
- [x] About NOIRSON
- [x] Footer
- [x] Hero 圖片素材加入
- [x] Desktop / Tablet / Mobile 基礎 RWD
- [x] 正式 Visual Design 延續 NOIRSON 深色系，不採用 Figma Wireframe 灰階配色

### Music / Explore

- [x] Music / Explore Desktop 主要 Layout
- [x] Page Header、Search UI 與四大分類 Filter UI
- [x] 四欄 Music Grid 與 8 張 placeholder Music Cards
- [x] 共用 Header、Footer 與 NOIRSON Visual Color System
- [x] Tablet / Mobile 基礎 RWD
- [ ] Search 與 Category Filter 互動功能（後續 JavaScript 階段）

### Music Detail

- [x] Music Detail Desktop Layout
- [x] Cover / Metadata
- [x] External action UI
- [x] Music Player static UI
- [x] Tracklist static UI
- [x] Desktop / Tablet / Mobile 基礎 RWD
- [ ] Music Player functionality（後續 JavaScript 階段）

### About

- [x] About Desktop Layout completed
- [x] About content / image sections completed
- [x] Shared Header / Footer
- [x] Basic RWD

### Login / Register

- [x] Login Desktop Layout
- [x] Login Form UI
- [x] Register UI / entry
- [x] Shared Header / Footer
- [x] Basic RWD
- [ ] Authentication functionality pending

## 下一步

1. Music Detail 改為依 `?id=Mxxx` 動態載入。
2. Explore V2 與 8 組 Mix 的完整呈現。
3. About 加入 `00.png`～`16.png` 自動 Crossfade 背景。
4. Desktop V2 穩定後再處理 Mobile / RWD。
5. Email Subscription 留待後續全端階段實作。

## 後續階段

- JavaScript / React 課程已完成，目前課程進入 Spring / Back End 階段；專案仍依範圍維持原生 HTML、CSS、JavaScript。
- **Phase 2 — Back End：** Java Web、Spring、Spring Boot、JPA、MVC。
- **Phase 4 — Database：** MySQL。
- **Phase 5 — Integration：** REST API、前後端整合、必要的簡易會員與 Mock Purchase 流程。
- **Phase 6 — Deployment：** Production build 與部署。

## 範圍提醒

Music Player 是核心 MVP 功能。會員與購買先保持簡單；Favorites、Playlist、實體周邊、真實 Payment Gateway、AI、RAG 與複雜推薦系統目前不在實作範圍。

目前 Search 與 Login / Register 不再列入 MVP；Login / Register 檔案暫時保留。Email Subscription 尚未實作。
