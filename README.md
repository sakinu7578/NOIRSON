# NOIRSON

NOIRSON 是持續開發中的音樂內容探索平台。你可以依曲風瀏覽 Mix、查看介紹，並在站內試聽公開的短版音訊。

## 目前可使用

- 首頁沉浸式場景、音樂卡片輪播與音訊頻譜。
- Explore 曲風篩選、Mix 詳細頁與圖片展示。
- 全站播放器：切換頁面仍可繼續播放，支援播放／暫停、進度、音量、循環、下一首及播放清單。
- 繁體中文／英文切換，以及桌機、平板與手機介面。
- About、會員註冊／登入與會員中心。會員中心基本資料來自登入 Session；Music Detail 可加入／取消收藏，會員中心顯示資料庫中的真實收藏與最近 10 首播放紀錄。暱稱修改仍只在目前頁面暫時生效。

## 開發狀態

主要前端使用 React、JavaScript、CSS、Vite 與 React Router。舊版原生 HTML／CSS／JavaScript 頁面保留作為歷史參考。後端已建立 Java、Spring Boot、Spring Data JPA、MySQL 連線設定，以及初步的 Mix 查詢 API。

Mix 內容仍使用前端本地資料。React 註冊、登入已串接後端 API；登入使用 HttpSession，並透過 `/api/auth/me` 取得基本會員資料、`/api/auth/logout` 登出。Favorites 使用已建立的 MySQL `favorites` 關聯表與 JPA Entity／Repository／Service／Controller，以 Session 驗證會員，提供 `GET /api/favorites`、`POST /api/favorites/{code}`、`DELETE /api/favorites/{code}`；Music Detail 與會員中心已串接。

Play History 已完成並通過 API 與瀏覽器實測。MySQL `play_history` 以 `member_id`、`mix_id` 外鍵連結 `members` 與 `mix`，並以 `UNIQUE(member_id, mix_id)` 保證每位會員對每首 Mix 最多一筆。Spring Boot 的 PlayHistory Entity／Repository／Service／Controller 提供 `GET /api/play-history`（依最近播放時間排序的 10 個 Mix code）及 `POST /api/play-history/{code}`（新增或更新最近播放時間）。React 播放器只在新 Mix 區段實際進入 `playing` 時記錄；暫停恢復、seek 與同首 Loop 不重複寫入。會員中心顯示 API 回傳的最近播放清單；這項功能不統計播放次數。寫入 API 使用允許來源的 Origin 與 Fetch Metadata 檢查，JPA 維持 `ddl-auto=validate`。評論仍為展示資料，修改密碼尚未實作。部署前仍需處理登入請求頻率限制、HTTPS 環境的 Cookie Secure 設定，並設定正式環境的允許來源。

## 連結

- [前端展示版（舊版）](https://sakinu7578.github.io/NOIRSON/)
- [GitHub 專案](https://github.com/sakinu7578/NOIRSON)
- [專案架構](docs/project.md) · [設計規範](docs/design.md)
