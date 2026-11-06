# NOIRSON 專案說明

## 專案定位

NOIRSON 是個人作品集用途的音樂內容探索平台，展示 React 前端、Spring Boot API 與 MySQL 資料關係如何組成可互動的網站。主要前端位於 `frontend/`；根目錄的原生 HTML／CSS／JavaScript 是舊版參考。

## 目前功能

- 瀏覽 8 首本地 Mix，在 Explore 依曲風分類篩選，進入詳細頁查看介紹與影像。現行 React 介面沒有文字搜尋。
- 使用跨路由的全站播放器試聽短版音訊，調整進度與音量，切換循環、播放清單與下一首。
- 切換繁體中文／英文；使用桌機、平板與手機版面。
- 註冊、登入、登出及會員中心；會員可修改暱稱與密碼。
- 登入會員可收藏 Mix、查看最近播放紀錄、發表及管理自己的評論、按讚；訪客可閱讀公開評論與讚數。ADMIN 可刪除評論，但不能修改他人評論。

## 技術與資料流

前端使用 React、React Router（HashRouter）、Vite、JavaScript 與 CSS。Mix 展示內容來自 `frontend/src/data/mixData.js`，圖片與短版音訊來自 `frontend/public/`；**React 音樂列表與詳細頁目前沒有呼叫後端 Mix 查詢 API**。Spring Boot 另有 Mix 查詢 API，供後端查詢資料庫的 `mix` 表。

會員、收藏、評論及播放紀錄由前端以 `/api` REST 請求呼叫 Spring Boot。後端依 Controller → Service → Spring Data JPA Repository → MySQL 處理資料；本機開發時 Vite 將 `/api` 代理至 Spring Boot。登入沿用 HttpSession，受保護操作以 Session 驗證會員；密碼修改成功後須重新登入。前端 AuthContext 管理會員狀態，MusicPlayerContext 管理單一音訊與播放紀錄寫入。

## 主要資料表

| 資料表 | 用途與關係 |
| --- | --- |
| `members`、`mix` | 會員與 Mix 基本資料。 |
| `favorites` | 連結會員與收藏的 Mix。 |
| `play_history` | 連結會員與 Mix，保存最近播放時間；同組合重播更新紀錄。 |
| `comments` | 連結發表會員與所評論的 Mix。 |
| `comment_likes` | 連結按讚會員與評論。 |

目前 JPA 使用 `ddl-auto=validate` 驗證既有資料表，不由應用程式自動建立 Schema。網站入口與操作方式請見 `README.md`。
