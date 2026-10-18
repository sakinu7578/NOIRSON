# NOIRSON 專案說明

## 專案定位

NOIRSON 是持續開發中的音樂內容探索平台，聚焦於 Mix 瀏覽、分類探索、站內播放與沉浸式聆聽體驗。現有 Vanilla 前端是後續 React 轉換與全端整合的功能、視覺基準。

## 目前版本

目前為 Multi-page HTML / CSS / JavaScript 前端，包含：

- **Home**：三階段沉浸式場景、固定背景幻燈片、Mini Player、真實音訊頻譜與 Explore Carousel。
- **Explore**：由 `js/mix-data.js` 動態建立 Mix 卡片，支援 Genre Filter、依 Viewport 分組及循環切換。
- **Music Detail**：依 `?id=Mxxx` 載入 Mix，包含播放器、Playlist、上一首／下一首、Loop、Auto Next 與 Visual Gallery。
- **About**：品牌內容、人物介紹、背景 Crossfade 與 Subscription UI。
- **Login / Register**：響應式會員表單與背景幻燈片，目前尚未串接 Authentication。
- **Internationalization**：透過 `js/i18n.js` 提供繁體中文與英文介面切換。

全站沿用共用 Header、Footer、色彩與排版系統，並支援 Desktop、Tablet 與 Mobile。

## 已完成的核心互動

- Mix 資料集中於 `js/mix-data.js`，供 Home、Explore 與 Music Detail 共用。
- 音訊支援 Play / Pause、Seek、時間同步、Volume / Mute 與 Loop。
- Music Detail 支援上一首／下一首、Playlist、Auto Next 與自動 Visual Gallery。
- Home Explore Carousel 支援 Pointer Drag、Snap、Arrow 與 Infinite Loop。
- Explore 支援 Genre Filter、響應式 Stage 分組及滑鼠／觸控切換。
- 主要頁面具備 Responsive Web Design 與 Reduced Motion 處理。

## 尚未完成

- Authentication、會員資料與 User Center。
- Favorite、Comments、Subscription 與 Play History 的資料儲存。
- 後端 REST API 與前後端資料串接。
- MySQL 資料庫、完整測試、正式部署與 SEO 強化。

## 後續方向

1. 以 React 拆分 Header、Footer、Player、Mix Card 等共用元件。
2. 以 Spring Boot 建立 REST API。
3. 使用 Spring Data JPA 與 MySQL 管理 Mix、會員及互動資料。
4. 完成 Authentication、核心 CRUD 與前後端測試。
5. 部署並整理為完整全端作品集。

開發優先順序維持：**MVP → 核心功能 → 前後端串接 → Deployment → 額外功能**。
