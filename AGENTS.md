# NOIRSON 開發協作規範

## 1. Project Overview

NOIRSON 是音樂內容探索平台（Music Content Discovery Platform）。音樂是網站的產品內容，不是專題技術本身的核心；請勿將本專案描述為個人音樂作品網站或個人音樂頻道網站。

專案最終目標是完成具備以下能力的完整 Web Application：

- Frontend
- Backend
- Database
- REST API
- User authentication
- CRUD
- Data relationships
- Deployment

## 2. Current Development Strategy

目前以 `frontend/` 的 React SPA 為主要前端開發架構，具備 RWD、中英文切換、Home／Explore／Music Detail 互動與跨路由持續播放的 Global Player。根目錄的 Vanilla HTML／CSS／JavaScript 多頁版本仍保留作為 Frontend V1 歷史參考；沒有明確要求時不要大規模重構或改變架構。

`backend/` 已有 Java／Maven／Spring Boot、Spring Data JPA、MySQL 連線設定與初步 Mix 查詢 API。前端仍讀本地資料，資料庫內容、會員功能與前後端串接尚未完成；後端應逐步擴充。

## 3. MVP Priority

開發優先順序：MVP → 核心功能 → 前後端串接 → Deployment → 額外功能。

核心方向包括：

- Home
- Music Explore
- Music Detail
- Music Player
- Search / Category
- Register / Login
- Favorites
- Play History
- Comments
- User Center

AI、第三方 API、複雜推薦系統、聊天室與支付不是目前核心功能。除非使用者明確要求，不要自行加入。

## 4. Frontend Rules

目前主要前端檔案與責任：

- `frontend/src/main.jsx`、`App.jsx`：Provider、HashRouter、共用布局與路由。
- `frontend/src/pages/`、`components/`：頁面與共用 UI；`MiniPlayer.jsx` 是全站播放器介面。
- `frontend/src/context/MusicPlayerContext.jsx`、`hooks/useMusicPlayer.js`：單一音訊與跨路由播放狀態。
- `frontend/src/context/LanguageContext.jsx`、`data/translations.js`：語言切換。
- `frontend/src/data/mixData.js`、`memberMock.js`：目前使用的本地資料。
- `frontend/src/styles/style.css`、`frontend/public/`：樣式、圖片及公開 Demo 音訊。
- 根目錄的 HTML、`css/`、`js/`：舊版前端參考，不是目前 React 入口。

修改 frontend 時：

- 先理解現有程式碼，再進行修改。
- 優先保留現有視覺設計、網站結構與資料結構。
- 優先修正實際問題，不因「最佳實務」自行大規模重構。
- 保持 RWD，以及共用 Header／Footer 的一致性。
- 不任意刪除目前可運作的功能。
- 有多種解法時，選擇符合目前專案程度、容易理解與維護的方式。

主要開發工具為 VS Code，不強制使用其他 IDE。重要函式、複雜狀態、資料流及特殊設計應在相應程式碼附近保留精簡的繁體中文註解；修改功能時同步更新註解，避免逐行翻譯語法。

## 5. Backend Rules

`backend/` 已有 `Main`、`Mix` Entity、`MixRepository`、`MixService`、`MixController` 與 `HomeController`。`GET /api/mixes` 目前只固定查詢主鍵 1 的單筆 Mix。資料庫資料、正式 API 範圍、會員驗證與前端串接仍待完成。

沒有明確要求時，不要：

- 大規模建立完整 backend。
- 自動建立 Authentication 系統或複雜 Security 設定。
- 自動建立大量 Entity、Repository、Service 或 Controller。
- 自動修改 database schema。

後端應逐步建立，並讓開發者理解以下資料流：

Database → Entity → Repository → Service → Controller → REST API → Frontend

## 6. Security Rules

永遠不要 commit 或 push：

- Password
- API Key
- Access Token
- Refresh Token
- Client Secret
- Private Key
- `.env` credentials
- Database credentials
- `application-local.properties`

`backend/src/main/resources/application-local.properties` 是本機敏感設定檔，必須保持 untracked／ignored。不要讀取、顯示或回報其中的完整 password。

完整音訊檔原則上不進 Git；公開 Demo 音訊除外。

## 7. Git Rules

除非使用者明確要求，Codex 不得自行執行：

- `git commit`
- `git push`
- `git pull`
- `git rebase`
- `git reset`
- force push
- Git history rewrite

需要時可以執行唯讀檢查，例如：

- `git status`
- `git diff`
- `git log`
- `git diff --check`

修改完成後應回報修改檔案、修改原因、驗證結果與 `git status`，由使用者自行決定是否 commit／push。

## 8. Codex Collaboration Rules

Codex 的主要角色：

- Repository inspection
- 找出檔案之間的關係
- Debugging assistance
- 重複性修改
- 明確授權的程式碼修改
- 基本驗證

不要預設 Codex 要完成整個功能。使用者正在學習全端開發，因此：

- 優先讓程式碼容易理解。
- 不為展示技術而增加複雜度。
- 不使用不必要的新套件、框架或課程之外的複雜架構。
- 修改時盡可能說明改了什麼，以及為什麼。
- 使用者要求唯讀時，必須保持唯讀。
- 需求範圍明確時，不要擴大修改範圍。

## 9. Documentation

本專案維護的 Markdown 文件為：

- `README.md`：讓第一次進入 repository 的人快速理解專案。
- `docs/project.md`：說明專案定位、功能範圍、架構與技術規劃。
- `docs/design.md`：說明 UI、RWD、視覺與設計規則。
- `AGENTS.md`：Agent 協作、安全與修改規範。

`AGENTS.md` 是開發協作規範，不應用來記錄每日進度。不要重新建立 `docs/progress.md`。

## 10. General Principle

所有決策依序優先考慮：

1. 專題能否完成
2. 開發者是否能理解
3. 是否具有作品集價值
4. 開發時間與難度
5. 最後才考慮額外技術與功能

Simple and working is preferred over complex and unfinished.
