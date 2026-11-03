# NOIRSON 專案說明

## 定位與現況

NOIRSON 是音樂內容探索平台。目前主要前端為 `frontend/` 的 React SPA；根目錄的原生 HTML、`css/`、`js/` 為舊版 Frontend V1，保留供視覺與功能對照。React 介面已可瀏覽、篩選及播放本地 Mix；會員註冊、登入、基本會員資料、收藏與最近播放紀錄已串接後端。評論與暱稱修改仍為展示或頁面暫存內容。

## 主要檔案與關係

- `frontend/src/main.jsx`：以 LanguageProvider、HashRouter、AuthProvider、MusicPlayerProvider 包住 App。
- `frontend/src/App.jsx`：配置 Header、Footer、全站 MiniPlayer 與 Home、Explore、Music Detail、About、Login、Register、Member 路由。
- `frontend/src/pages/`：各頁及首頁場景、背景、音訊頻譜 hooks。Explore 依曲風與視窗寬度分組；Music Detail 依 `/music/:id` 取本地資料。
- `frontend/src/components/`：共用介面。ExploreSound 是首頁輪播；DetailGallery、DetailPlayer 是詳細頁視覺與播放入口；MiniPlayer 是全站播放器介面。`MusicPlayer.jsx` 仍存在，但目前未由路由頁面引用。
- `frontend/src/context/MusicPlayerContext.jsx`、`hooks/useMusicPlayer.js`：管理單一 Audio、播放狀態、事件與清理；Provider 位於路由頁面外，切頁不會重建音訊。循環與自動下一首互斥；新 Mix 區段的 `playing` 事件會依序送出播放紀錄，暫停恢復、seek 與同首 Loop 不重複記錄。
- `frontend/src/context/AuthContext.jsx`、`hooks/useAuth.js`：以 Session API 管理登入狀態；`LanguageContext.jsx`、`hooks/useLanguage.js`、`data/translations.js` 管理中英文介面文字。`data/mixData.js` 提供本地 Mix 內容；`data/memberMock.js` 保留留言展示資料。`api/favorites.js` 供 Music Detail 與 Member 頁讀寫真實收藏；`api/playHistory.js` 供播放器寫入、Member 頁讀取最近播放；`utils/assetUrl.js` 處理部署路徑；`styles/style.css` 包含共用與各頁 RWD 樣式。靜態圖片、短版音訊位於 `frontend/public/`。
- `backend/src/main/java/com/noirson/`：Main 啟動應用；MixController／Service／Repository 提供 Mix 查詢 API；MemberController／Service／Repository／Entity 與 DTO 提供註冊、登入及 Session API。Favorite Entity／Repository／Service／Controller 對應 MySQL `favorites` 與收藏 API；PlayHistory Entity／Repository／Service／Controller 對應 MySQL `play_history` 與播放紀錄 API。CsrfOriginFilter 檢查寫入 API 的來源。`backend/pom.xml` 與 `src/main/resources/application.properties` 定義依賴及非敏感設定；敏感的 `application-local.properties` 不應納入版本控制。

## 資料流與下一步

目前瀏覽與播放：`mixData.js` → React 頁面／播放器 Context → `frontend/public/` 的圖片與短版音訊。會員註冊：React → `POST /api/auth/register` → MySQL。登入：React → `POST /api/auth/login` → HttpSession；重新整理時以 `GET /api/auth/me` 取得基本會員資料，登出呼叫 `POST /api/auth/logout`。收藏：Music Detail／Member → `api/favorites.js` → `GET /api/favorites`、`POST /api/favorites/{code}`、`DELETE /api/favorites/{code}` → Session 會員 ID → FavoriteService → MySQL `favorites`；API 回傳依建立時間排序的 Mix code 陣列。

播放紀錄：單一 Audio 的 `playing` 事件 → 播放區段去重與依序 POST → `POST /api/play-history/{code}` → Session 會員 ID → PlayHistoryService 查詢 Mix code 對應的 `mix.id` → MySQL `play_history`。資料表以外鍵連結 `members.id`、`mix.id`，以 `UNIQUE(member_id, mix_id)` 保證每位會員對每首 Mix 最多一筆；再次播放更新 `last_played_at`，不累計播放次數。暫停恢復、seek 與同首 Loop 不重複寫入。Member 透過 `GET /api/play-history` 取得按最近播放時間排序的 10 個 Mix code，再由 `mixData.js` 顯示標題、封面與詳細頁連結。此流程已通過後端 API、瀏覽器 Network 與 MySQL 排序、去重實測。評論仍為展示資料。

後端 Mix 查詢：`GET /api/mixes` 回傳依 code 排序的清單；`GET /api/mixes/{code}` 以 code 查詢單筆 Mix。前端瀏覽清單仍使用 `mixData.js`。React 註冊、登入、HttpSession、`/me`、logout、Favorites 與 Play History 已完成；寫入由 Origin 允許清單與 Fetch Metadata 檢查保護，Hibernate 以 `ddl-auto=validate` 驗證既有 schema。評論的會員資料庫串接及修改密碼尚未完成。部署前需處理登入請求頻率限制、HTTPS Cookie Secure，並將 CSRF 允許來源改成正式 HTTPS 網址。

開發優先順序：MVP → 核心功能 → 前後端串接 → 部署 → 額外功能。
