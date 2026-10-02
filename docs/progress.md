# NOIRSON 開發進度

## 目前階段

**Phase 1 — Vanilla Front-End Prototype / V2.1 Integration**

目前已建立 React 轉換前的 HTML / CSS / JavaScript 穩定基準：六個頁面具備一致的品牌視覺、共用導覽與 Footer，並完成 Desktop、Tablet、Mobile 基礎 RWD。

## 已完成

### 全站

- [x] Home、Explore、Music Detail、About、Login、Register 六頁版型。
- [x] 共用 Logo、Fixed translucent Header、正式社群連結與統一 Footer。
- [x] Neutral Black / Graphite / Warm White + 少量 Olive / Amber 的 V2.1 Visual System。
- [x] Desktop / Tablet / Mobile 基礎響應式布局。

### Home

- [x] M001 滿版 Signature Hero 與完整 Play / Pause、Progress、時間、Seek。
- [x] M001～M008 無限循環 Explore Sound Carousel。
- [x] 左右箭頭、Mouse Drag、Hover 與 Detail 連結。

### Explore

- [x] 由 `mix-data.js` 動態載入 M001～M008。
- [x] Desktop 三欄、Tablet 兩欄、Mobile 單欄 Gallery。

### Music Detail

- [x] 依 `?id=Mxxx` 動態載入 Cover、Title、Series、Audio、Description、Gallery 與 YouTube。
- [x] Play / Pause、Progress、時間與 Seek。
- [x] Previous / Next 循環切換與浮動 Playlist。
- [x] 16:9 Main Visual、包含原始 Cover 的水平 Gallery、縮圖切換與左右捲動按鈕。
- [x] Favorite 與 Comments 預留 UI（未實作功能）。

### About

- [x] `images/00.png`～`images/16.png` 自動 Crossfade 背景。
- [x] 品牌介紹、Behind the Sound、人物內容與 Social Footer。
- [x] Email Subscription UI（未串接後端）。

### Login / Register

- [x] 一致雙欄表單 UI 與響應式上下排列。
- [ ] Authentication 與會員資料功能。

## 尚未完成

- [ ] SEO。
- [ ] Spring MVC / Spring Boot。
- [ ] React 與 Spring Boot 系統整合。
- [ ] MySQL 實際資料串接。
- [ ] Authentication、Favorite、Comments、Subscription 等後端功能。
- [ ] 測試、Production build 與雲端部署。

## 課程進度

已完成：HTML、CSS、JavaScript、React、Java、MySQL、Java Web、Maven、Spring IoC、Spring Data JPA。

尚未完成：SEO、Spring MVC / Spring Boot、系統整合與雲端部署。

## 後續方向

1. 補強 JavaScript 基礎與現有程式碼理解。
2. 以目前 Vanilla V2.1 為基準逐步轉換 React 元件。
3. 建立 Spring Boot 後端與 REST API。
4. 使用 Spring Data JPA 串接 MySQL。
5. 完成前後端整合、SEO、測試與部署。

## 範圍提醒

Music Player 與內容探索仍是核心 MVP。現階段不加入新框架或擴充額外功能；Favorite、Comments、會員、訂閱與購買流程必須等後端階段明確規劃後再實作。
