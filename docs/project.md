# NOIRSON 專案說明

## 定位與現況

NOIRSON 是音樂內容探索平台。目前主要前端為 `frontend/` 的 React SPA；根目錄的原生 HTML、`css/`、`js/` 為舊版 Frontend V1，保留供視覺與功能對照。React 介面已可瀏覽、篩選及播放本地 Mix；會員註冊、登入與基本會員資料已串接後端，會員中心其餘內容仍含展示資料。

## 主要檔案與關係

- `frontend/src/main.jsx`：以 LanguageProvider、HashRouter、AuthProvider、MusicPlayerProvider 包住 App。
- `frontend/src/App.jsx`：配置 Header、Footer、全站 MiniPlayer 與 Home、Explore、Music Detail、About、Login、Register、Member 路由。
- `frontend/src/pages/`：各頁及首頁場景、背景、音訊頻譜 hooks。Explore 依曲風與視窗寬度分組；Music Detail 依 `/music/:id` 取本地資料。
- `frontend/src/components/`：共用介面。ExploreSound 是首頁輪播；DetailGallery、DetailPlayer 是詳細頁視覺與播放入口；MiniPlayer 是全站播放器介面。`MusicPlayer.jsx` 仍存在，但目前未由路由頁面引用。
- `frontend/src/context/MusicPlayerContext.jsx`、`hooks/useMusicPlayer.js`：管理單一 Audio、播放狀態、事件與清理；Provider 位於路由頁面外，切頁不會重建音訊。循環與自動下一首互斥。
- `frontend/src/context/AuthContext.jsx`、`hooks/useAuth.js`：以 Session API 管理登入狀態；`LanguageContext.jsx`、`hooks/useLanguage.js`、`data/translations.js` 管理中英文介面文字。`data/mixData.js` 與 `data/memberMock.js` 仍提供 Mix 與會員中心部分展示資料；`utils/assetUrl.js` 處理部署路徑；`styles/style.css` 包含共用與各頁 RWD 樣式。靜態圖片、短版音訊位於 `frontend/public/`。
- `backend/src/main/java/com/noirson/`：Main 啟動應用；MixController／Service／Repository 提供初步 `GET /api/mixes`；MemberController／Service／Repository／Entity 與 DTO 提供註冊、登入及 Session API。`backend/pom.xml` 與 `src/main/resources/application.properties` 定義依賴及設定；敏感的 `application-local.properties` 不應納入版本控制。

## 資料流與下一步

目前瀏覽與播放：`mixData.js` → React 頁面／播放器 Context → `frontend/public/` 的圖片與短版音訊。會員註冊：React → `POST /api/auth/register` → MySQL。登入：React → `POST /api/auth/login` → HttpSession；重新整理時以 `GET /api/auth/me` 取得基本會員資料，登出呼叫 `POST /api/auth/logout`。會員中心收藏等展示內容仍來自 `memberMock.js` 與本地狀態，變更不會儲存。

後端 Mix 範例流程：`GET /api/mixes` → MixController → MixService → `MixRepository.findById(1L)` → Mix；這是固定查詢單筆資料的初步 API，尚未串接前端 Mix 清單。React 註冊、登入、HttpSession、`/me`、logout 與基本會員資料已完成；收藏、評論、播放紀錄的會員資料庫串接及修改密碼尚未完成。部署前需處理登入請求頻率限制、HTTPS Cookie Secure 與 CSRF 防護策略。

開發優先順序：MVP → 核心功能 → 前後端串接 → 部署 → 額外功能。
