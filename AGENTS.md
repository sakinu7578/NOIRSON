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

專案採分階段開發。目前已有：

- HTML、CSS、JavaScript
- Responsive Web Design
- Multi-page frontend
- Home、Explore、Music Detail 的主要播放與互動功能
- 繁體中文／英文介面切換
- Java、Maven
- Spring Boot initial structure
- Spring Data JPA initial structure
- MySQL connection structure

目前 Vanilla HTML／CSS／JavaScript 版本視為穩定的 Frontend V1。沒有明確要求時，不要大規模重構現有 frontend、自動轉成 React，或自行改變網站架構。

React 是下一階段 Frontend V2 的方向。重要目標之一是將目前 Multi-Page 架構轉成 SPA，並讓 Global Music Player 在頁面或 Route 切換時維持播放狀態。

Backend 依序逐步使用：Java → Maven → Spring Boot → Spring Data JPA → MySQL → REST API。不要一次實作全部功能。

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

目前 frontend 主要檔案與目錄：

- `index.html`
- `music.html`
- `music-detail.html`
- `about.html`
- `login.html`
- `register.html`
- `css/`
- `js/main.js`：共用互動與各頁功能初始化
- `js/mix-data.js`：M001～M008 共用 Mix 資料
- `js/i18n.js`：繁體中文／英文介面切換
- `images/`
- `musicDemo/`：可公開的壓縮 Demo 音訊

修改 frontend 時：

- 先理解現有程式碼，再進行修改。
- 優先保留現有視覺設計、網站結構與資料結構。
- 優先修正實際問題，不因「最佳實務」自行大規模重構。
- 保持 RWD，以及共用 Header／Footer 的一致性。
- 不任意刪除目前可運作的功能。
- 有多種解法時，選擇符合目前專案程度、容易理解與維護的方式。

## 5. Backend Rules

`backend/` 是 Java／Spring Boot 後端，目前仍在逐步學習與建立階段。

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

公開作品文件主要為：

- `README.md`：讓第一次進入 repository 的人快速理解專案。
- `docs/project.md`：說明專案定位、功能範圍、架構與技術規劃。
- `docs/design.md`：說明 UI、RWD、視覺與設計規則。

`AGENTS.md` 是開發協作規範，不應用來記錄每日進度。不要重新建立 `docs/progress.md`。

## 10. General Principle

所有決策依序優先考慮：

1. 專題能否完成
2. 開發者是否能理解
3. 是否具有作品集價值
4. 開發時間與難度
5. 最後才考慮額外技術與功能

Simple and working is preferred over complex and unfinished.
