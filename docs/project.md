# NOIRSON 專案說明

## 定位與現況

NOIRSON 是音樂內容探索平台。目前主要前端為 `frontend/` 的 React SPA；根目錄的原生 HTML、`css/`、`js/` 為舊版 Frontend V1，保留供視覺與功能對照。React 介面已可瀏覽、篩選及播放本地 Mix；會員註冊、登入、基本會員資料、收藏、最近播放紀錄與評論已串接後端。暱稱修改已儲存至會員資料。

## 主要檔案與關係

- `frontend/src/main.jsx`：以 LanguageProvider、HashRouter、AuthProvider、MusicPlayerProvider 包住 App。
- `frontend/src/App.jsx`：配置 Header、Footer、全站 MiniPlayer 與 Home、Explore、Music Detail、About、Login、Register、Member 路由。
- `frontend/src/pages/`：各頁及首頁場景、背景、音訊頻譜 hooks。Explore 依曲風與視窗寬度分組；Music Detail 依 `/music/:id` 取本地資料。
- `frontend/src/components/`：共用介面。ExploreSound 是首頁輪播；DetailGallery、DetailPlayer、CommentSection 是詳細頁影像、播放入口與真實評論；MiniPlayer 是全站播放器介面。`MusicPlayer.jsx` 仍存在，但目前未由路由頁面引用。
- `frontend/src/context/MusicPlayerContext.jsx`、`hooks/useMusicPlayer.js`：管理單一 Audio、播放狀態、事件與清理；Provider 位於路由頁面外，切頁不會重建音訊。循環與自動下一首互斥；新 Mix 區段的 `playing` 事件會依序送出播放紀錄，暫停恢復、seek 與同首 Loop 不重複記錄。
- `frontend/src/context/AuthContext.jsx`、`hooks/useAuth.js`：以 Session API 管理登入狀態；`LanguageContext.jsx`、`hooks/useLanguage.js`、`data/translations.js` 管理中英文介面文字。`data/mixData.js` 提供本地 Mix 內容；`api/favorites.js`、`api/playHistory.js`、`api/comments.js` 分別處理收藏、播放紀錄與評論。`utils/formatCommentDate.js` 統一 Music Detail 與 Member 評論時間為 `YYYY/MM/DD HH:mm`，直接解讀 API 日期字串，不換算時區；`utils/assetUrl.js` 處理部署路徑；`styles/style.css` 包含共用與各頁 RWD 樣式。靜態圖片、短版音訊位於 `frontend/public/`。
- `backend/src/main/java/com/noirson/`：Main 啟動應用；MixController／Service／Repository 提供 Mix 查詢 API；MemberController／Service／Repository／Entity 與 DTO 提供註冊、登入及 Session API。Favorite 與 PlayHistory 各自的 Entity／Repository／Service／Controller 對應 MySQL 資料表與 API。Comment 與 CommentLike 的 Entity／Repository、CommentService／Controller 及 DTO 對應 `comments`、`comment_likes` 與評論／按讚 API。CsrfOriginFilter 檢查寫入 API 的來源。`backend/pom.xml` 與 `src/main/resources/application.properties` 定義依賴及非敏感設定；敏感的 `application-local.properties` 不應納入版本控制。

## 資料流與下一步

目前瀏覽與播放：`mixData.js` → React 頁面／播放器 Context → `frontend/public/` 的圖片與短版音訊。會員註冊：React → `POST /api/auth/register` → MySQL，`role` 使用資料庫預設值，不由註冊請求指定。登入：React → `POST /api/auth/login` → HttpSession；重新整理時以 `GET /api/auth/me` 取得會員資料，兩個回應均包含資料庫中的實際 `role`；登出呼叫 `POST /api/auth/logout`。收藏：Music Detail／Member → `api/favorites.js` → `GET /api/favorites`、`POST /api/favorites/{code}`、`DELETE /api/favorites/{code}` → Session 會員 ID → FavoriteService → MySQL `favorites`；API 回傳依建立時間排序的 Mix code 陣列。

播放紀錄：單一 Audio 的 `playing` 事件 → 播放區段去重與依序 POST → `POST /api/play-history/{code}` → Session 會員 ID → PlayHistoryService 查詢 Mix code 對應的 `mix.id` → MySQL `play_history`。資料表以外鍵連結 `members.id`、`mix.id`，以 `UNIQUE(member_id, mix_id)` 保證每位會員對每首 Mix 最多一筆；再次播放更新 `last_played_at`，不累計播放次數。暫停恢復、seek 與同首 Loop 不重複寫入。Member 透過 `GET /api/play-history` 取得按最近播放時間排序的 10 個 Mix code，再由 `mixData.js` 顯示標題、封面與詳細頁連結。此流程已通過後端 API、瀏覽器 Network 與 MySQL 排序、去重實測。

評論：MySQL `comments` 以 `member_id`、`mix_id` 連結會員與 Mix；`members.role` 由資料庫管理。`comment_likes` 以 `UNIQUE(member_id, comment_id)` 保證一人一讚，評論刪除時由 `ON DELETE CASCADE` 清除讚。公開查詢 `GET /api/mixes/{code}/comments?page=0&size=10` 依 `createdAt DESC, id DESC` 排序，回傳 `items`、`hasMore`；每則評論包含 `likeCount` 與依 Session 判定的 `likedByMe`，訪客可見讚數且 `likedByMe=false`。登入會員以 `POST /api/mixes/{code}/comments` 發表；`PATCH /api/comments/{id}` 只允許作者修改，ADMIN 也不能修改他人評論。`DELETE /api/comments/{id}` 允許 USER 刪除自己的評論、ADMIN 刪除任意會員評論，訪客不可刪除。刪除時後端以 HttpSession 的 `memberId` 重新查詢資料庫會員與角色，不信任前端的 `role`。會員以 `PUT /api/comments/{id}/like` 按讚、`DELETE /api/comments/{id}/like` 取消讚，並以 `GET /api/members/me/comments` 查看自己的評論與按讚狀態。後端拒絕空白、網址與 HTML，限制 500 個 Unicode 字元，發表需跨 Mix 間隔 30 秒，並以會員列鎖避免簡單並發繞過。按讚不受發表冷卻限制，當頁讚數與會員按讚 ID 以批次查詢取得。Music Detail 每次讀 5 則並以 `hasMore` 載入後續評論；Member「我的留言」讀取真實資料。評論以純文字呈現，時間統一 `YYYY/MM/DD HH:mm`。Phase 4 五項後端權限測試及瀏覽器驗收均已通過。

Music Detail 桌機版左側主視覺保持固定、右側資訊獨立垂直捲動；窄於 901px 時恢復單欄頁面捲動。縮圖面板預設隱藏，展開後浮於主視覺底部，閒置 5 秒後收合；滑鼠停留或鍵盤焦點位於面板內時暫停收合，面板計時器與原有自動輪播分開。評論文字左側、愛心與讚數右側同列顯示；訪客只看讚數，會員在 API 回傳 204 後更新單則狀態。後端按讚主要 API 整合測試已於 `noirson_test` 驗證重複與並發 PUT／DELETE、權限、讚數及刪除評論的 CASCADE；前端按讚功能已完成瀏覽器驗收。多筆評論的實際 SQL 查詢次數尚未量測；最近的浮動面板亦尚未完成 1440×900、1024×768、820px、390px 的瀏覽器實測。

後端 Mix 查詢：`GET /api/mixes` 回傳依 code 排序的清單；`GET /api/mixes/{code}` 以 code 查詢單筆 Mix。前端瀏覽清單仍使用 `mixData.js`。React 註冊、登入、HttpSession、`/me`、logout、Favorites、Play History、Comments CRUD、ADMIN 跨會員刪除與按讚已完成；寫入由 Origin 允許清單與 Fetch Metadata 檢查保護，Hibernate 以 `ddl-auto=validate` 驗證既有 schema。會員可修改密碼；成功後當前 Session 失效，需重新登入。部署前需處理登入請求頻率限制、HTTPS Cookie Secure，並將 CSRF 允許來源改成正式 HTTPS 網址。

開發優先順序：MVP → 核心功能 → 前後端串接 → 部署 → 額外功能。
