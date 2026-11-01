# NOIRSON

NOIRSON 是持續開發中的音樂內容探索平台。你可以依曲風瀏覽 Mix、查看介紹，並在站內試聽公開的短版音訊。

## 目前可使用

- 首頁沉浸式場景、音樂卡片輪播與音訊頻譜。
- Explore 曲風篩選、Mix 詳細頁與圖片展示。
- 全站播放器：切換頁面仍可繼續播放，支援播放／暫停、進度、音量、循環、下一首及播放清單。
- 繁體中文／英文切換，以及桌機、平板與手機介面。
- About、登入、註冊與會員中心的展示介面。會員中心的暱稱及收藏操作只在目前頁面暫時生效。

## 開發狀態

主要前端使用 React、JavaScript、CSS、Vite 與 React Router。舊版原生 HTML／CSS／JavaScript 頁面保留作為歷史參考。後端已建立 Java、Spring Boot、Spring Data JPA、MySQL 連線設定，以及初步的 Mix 查詢 API。

目前前端仍使用本地 Mix 與會員展示資料，**尚未串接後端 API**。登入、註冊、收藏、留言、播放紀錄與訂閱尚無正式帳號或資料儲存功能；完整前後端整合與測試仍在規劃中。

## 連結

- [前端展示版（舊版）](https://sakinu7578.github.io/NOIRSON/)
- [GitHub 專案](https://github.com/sakinu7578/NOIRSON)
- [專案架構](docs/project.md) · [設計規範](docs/design.md)
