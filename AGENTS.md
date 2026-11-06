# NOIRSON 開發指南

## 專案定位與技術

NOIRSON 是個人作品集用途的音樂內容探索平台，不是個人音樂作品或頻道網站。主要架構為 React SPA、Spring Boot REST API、Spring Data JPA 與 MySQL；前端使用 Vite，後端使用 Maven。現有功能包含 8 首 Mix 的瀏覽與分類篩選、跨路由播放，以及會員註冊／登入、收藏、評論與按讚、播放紀錄、暱稱與密碼修改；目前沒有文字搜尋。

## 目錄與資料流

- `frontend/src/main.jsx`、`App.jsx`：Provider、HashRouter、共用布局與路由。
- `frontend/src/pages/`、`components/`：頁面與共用介面；`MiniPlayer.jsx` 顯示全站播放器。
- `frontend/src/context/`、`hooks/`：會員狀態、語言、單一音訊播放器及其 Hook。
- `frontend/src/api/`：收藏、播放紀錄、評論的 fetch 函式；會員登入與資料修改的請求目前在 AuthContext 或頁面內。
- `frontend/src/data/`、`styles/`、`frontend/public/`：本地 Mix 內容與翻譯、樣式、公開素材。根目錄的 Vanilla HTML／CSS／JavaScript 是舊版參考，不是 React 入口。
- `backend/src/main/java/com/noirson/`：`controller/` 處理 HTTP、`service/` 處理業務邏輯、`repository/` 存取資料、`entity/` 對應資料表、`dto/` 定義請求與回應；`Main.java` 啟動應用。
- `backend/src/test/`：目前的後端單元測試；`backend/pom.xml` 與 `backend/src/main/resources/application.properties` 定義依賴與一般設定。

前端以相對路徑 `/api/...` 呼叫後端，會員請求帶上 Session Cookie（`credentials: 'include'`）。Vite 開發伺服器依 `frontend/vite.config.js` 將 `/api` 代理至 `localhost:8080`。音樂內容仍主要來自前端本地 Mix 資料；會員、收藏、評論及播放紀錄使用後端 API，資料經 Controller → Service → Repository → MySQL。

## 會員與資料庫

後端沿用 HttpSession：登入成功後保存會員識別與密碼指紋；受保護 API 透過 `SessionMemberService` 驗證。前端 `AuthContext` 保存 `currentUser`，Session 失效的 401 會清除對應登入狀態；登入表單的帳密錯誤 401 不作此處理。修改密碼成功後須重新登入。

正式資料庫為 `noirson`，隔離測試資料庫為 `noirson_test`。`application.properties` 的預設 JDBC URL 指向 `noirson`；不得以預設連線執行寫入測試。需要資料庫寫入驗收時，先確認實際連線為 `noirson_test`、使用僅有測試庫權限的帳號，並確認測試程序與 Port；無法確認就停止寫入。不得對正式 `noirson` 執行測試寫入或清理。

`backend/src/main/resources/application-local.properties` 是本機敏感設定，須維持 Git 忽略狀態。不要讀取、輸出或寫入文件中的密碼、環境變數值、金鑰、Token 等秘密；不要提交這些資料。完整音訊檔原則上不進 Git，公開 Demo 音訊除外。

## 常用指令

- `cd frontend` 後執行 `npm install`、`npm run dev`、`npm run lint`、`npm run build`。安裝依賴或建置會產生檔案，唯讀任務不要執行。
- `cd backend` 後執行 `mvn spring-boot:run`、`mvn test`、`mvn compile`。啟動後端前先確認使用的資料庫設定；需要資料庫的測試不得連正式庫。
- 在專案根目錄用 `git status`、`git diff`、`git diff --check` 檢查修改。

## 修改與協作原則

先閱讀相關檔案，以現有程式碼為準；優先完成、穩定、簡單、可維護。沿用既有 React Context／Hook、Java Controller／Service／Repository／Entity／DTO 的組織與命名；保留 RWD、Header／Footer、雙語介面和既有功能。重要函式與複雜資料流可在程式碼附近保留精簡繁體中文註解，修改功能時同步更新相關註解。

不要因理論上的最佳實務新增抽象層、套件、框架或非必要安全機制，也不要隨意重構正常運作的功能。嚴守使用者指定的範圍；唯讀任務不得修改檔案或資料庫。未明確授權時，不自行 Commit、Push、Pull、Rebase、Reset、改寫 Git 歷史或部署。完成修改後回報修改檔案、原因、驗證結果與 Git 狀態，並區分靜態檢查、建置與實際瀏覽器／資料庫驗收。

Git Commit Message 統一使用 `英文類型: 中文描述`，不使用全英文訊息。類型採小寫 Conventional Commits，例如 `feat`、`fix`、`docs`、`refactor`、`style`、`test`、`chore`；冒號須為半形 `:`，後方保留一個空格。中文描述應簡短、明確，說明實際修改內容。未經使用者明確同意，不得自行 Commit、Push 或部署。
