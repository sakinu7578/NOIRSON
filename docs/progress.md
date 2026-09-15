# NOIRSON 開發進度

## 目前階段

**Phase 1B — Multi-page HTML Prototype**

目前目標是依 Wireframe 逐頁完成原生 HTML / CSS 前端雛形，暫不提前導入 React、Spring Boot、資料庫或其他後續技術。

## 已完成

### 專案與規劃

- [x] Repository / Git 基礎設定
- [x] HTML / CSS / JavaScript 專案結構
- [x] Figma Wireframe Phase
- [x] 5 個 Desktop Wireframe
- [x] MVP 頁面架構：Home、Music / Explore、Music Detail、About、Login / Register

### Home

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

## 下一步

1. 將 Featured Music 逐步替換為真實 NOIRSON 作品。
2. 整理 Logo、圖片與音樂素材。
3. 建立 Music Detail 頁面。
4. 建立站內 Music Player。
5. 建立 About 頁面。
6. 建立 Login / Register UI。

## 後續階段

- **Phase 2 — Modern Front End：** 依課程進度導入 React。
- **Phase 3 — Back End：** Java Web、Spring、Spring Boot、JPA、MVC。
- **Phase 4 — Database：** MySQL。
- **Phase 5 — Integration：** REST API、前後端整合、必要的簡易會員與 Mock Purchase 流程。
- **Phase 6 — Deployment：** Production build 與部署。

## 範圍提醒

Music Player 是核心 MVP 功能。會員與購買先保持簡單；Favorites、Playlist、實體周邊、真實 Payment Gateway、AI、RAG 與複雜推薦系統目前不在實作範圍。
