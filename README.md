# NOIRSON

NOIRSON 是持續開發中的音樂內容探索平台。你可以依曲風瀏覽 Mix、查看介紹，並在站內試聽公開的短版音訊。

## 目前可使用

- 首頁沉浸式場景、音樂卡片輪播與音訊頻譜。
- Explore 曲風篩選、Mix 詳細頁與圖片展示。
- 全站播放器：切換頁面仍可繼續播放，支援播放／暫停、進度、音量、循環、下一首及播放清單。
- 繁體中文／英文切換，以及桌機、平板與手機介面。
- About、會員註冊／登入與會員中心。會員中心基本資料來自登入 Session；Music Detail 可加入／取消收藏、閱讀及管理自己的評論，會員中心顯示資料庫中的真實收藏、最近 10 首播放紀錄與「我的留言」。暱稱修改仍只在目前頁面暫時生效。

## 開發狀態

主要前端使用 React、JavaScript、CSS、Vite 與 React Router。舊版原生 HTML／CSS／JavaScript 頁面保留作為歷史參考。後端已建立 Java、Spring Boot、Spring Data JPA、MySQL 連線設定，以及初步的 Mix 查詢 API。

Mix 內容仍使用前端本地資料。React 註冊、登入已串接後端 API；登入使用 HttpSession，並透過 `/api/auth/me` 取得基本會員資料、`/api/auth/logout` 登出。Favorites 使用已建立的 MySQL `favorites` 關聯表與 JPA Entity／Repository／Service／Controller，以 Session 驗證會員，提供 `GET /api/favorites`、`POST /api/favorites/{code}`、`DELETE /api/favorites/{code}`；Music Detail 與會員中心已串接。

Play History 已完成並通過 API 與瀏覽器實測。MySQL `play_history` 以 `member_id`、`mix_id` 外鍵連結 `members` 與 `mix`，並以 `UNIQUE(member_id, mix_id)` 保證每位會員對每首 Mix 最多一筆。Spring Boot 的 PlayHistory Entity／Repository／Service／Controller 提供 `GET /api/play-history`（依最近播放時間排序的 10 個 Mix code）及 `POST /api/play-history/{code}`（新增或更新最近播放時間）。React 播放器只在新 Mix 區段實際進入 `playing` 時記錄；暫停恢復、seek 與同首 Loop 不重複寫入。會員中心顯示 API 回傳的最近播放清單；這項功能不統計播放次數。

Comments 使用已人工建立的 MySQL `comments` 與 `comment_likes`。公開的 `GET /api/mixes/{code}/comments` 可分頁閱讀評論與讚數；`likedByMe` 依目前 Session 判斷，訪客為 `false`。Session 會員可透過 `POST /api/mixes/{code}/comments` 發表；所有會員只能以 `PATCH /api/comments/{id}` 修改自己的評論，ADMIN 也不能修改他人評論。`DELETE /api/comments/{id}` 允許 USER 刪除自己的評論、ADMIN 刪除任意會員評論；訪客不可刪除。`GET /api/members/me/comments` 只取得目前會員的評論。會員以 `PUT /api/comments/{id}/like` 按讚、`DELETE /api/comments/{id}/like` 取消讚，評論 DTO 回傳 `likeCount`、`likedByMe`。`comment_likes` 的 `UNIQUE(member_id, comment_id)` 保證一人一讚，刪除評論時由外鍵 `ON DELETE CASCADE` 清除按讚。後端限制評論 500 個 Unicode 字元，拒絕空白、網址與 HTML，且同會員跨 Mix 發表須間隔至少 30 秒；寫入仍受 Origin／Fetch Metadata 檢查。JPA 維持 `ddl-auto=validate`，不自動改動 schema。

Music Detail 已串接真實評論，每批載入 5 則並可載入更多；評論卡片顯示愛心與讚數，登入會員可按讚或取消讚，訪客可看讚數。桌機左側主視覺固定、右側資訊獨立捲動。影像縮圖可展開為主視覺底部的浮動面板，閒置 5 秒後收合。Member「我的留言」已使用真實資料。兩處評論時間統一顯示 `YYYY/MM/DD HH:mm`。評論按讚後端主要 API 整合測試已在隔離的 `noirson_test` 通過，前端按讚互動已完成瀏覽器驗收；多筆評論的實際 SQL 查詢次數尚未量測。評論管理 Phase 4 的五項後端權限測試及瀏覽器驗收均已通過。`role` 由資料庫管理，登入與 `GET /api/auth/me` 回傳實際角色；後端每次刪除評論時重新查詢會員角色。最近的浮動縮圖版型與互動尚未完成各視窗尺寸的瀏覽器實測。會員修改密碼仍待完成。部署前仍需處理登入請求頻率限制、HTTPS 環境的 Cookie Secure 設定，並設定正式環境的允許來源。

## 連結

- [前端展示版（舊版）](https://sakinu7578.github.io/NOIRSON/)
- [GitHub 專案](https://github.com/sakinu7578/NOIRSON)
- [專案架構](docs/project.md) · [設計規範](docs/design.md)
