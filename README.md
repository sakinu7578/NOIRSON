# NOIRSON

**音樂內容探索平台｜Music Discovery & Listening**

NOIRSON 是一個以音樂探索與聆聽體驗為核心的平台，融合慵懶放鬆的 Lo-fi Chill Vibes、充滿律動的 Jazz Hip-Hop，以及帶有空靈感的 Trap 等音樂風格。

從清晨的悠閒時光到深夜的獨處片刻，隨著不同的心情與生活節奏，找到適合當下的聲音。

網站提供精選 Mix 的線上試聽與內容探索，也可以前往 [NOIRSON YouTube 頻道](https://www.youtube.com/@NOIRSON) ，聆聽完整作品。

**網站連結：** https://noirson-one.vercel.app/

## 功能

- **音樂播放器**：支援跨頁播放、播放進度、音量調整、循環播放及播放清單。
- **音樂探索**：瀏覽精選 Mix、依曲風篩選、搜尋音樂內容及查看詳細介紹。
- **會員系統**：註冊、登入、登出及個人資料管理。
- **留言互動**：發表、管理留言及按讚。
- **收藏與紀錄**：收藏喜歡的 Mix，查看最近播放紀錄。
- **多語系與 RWD**：支援繁體中文、英文，以及桌面與行動裝置瀏覽。

## 技術架構

| 項目 | 使用技術 |
| --- | --- |
| 前端 | React、Vite、JavaScript、CSS |
| 後端 | Java、Spring Boot、Spring Data JPA |
| 資料庫 | MySQL / TiDB Cloud |
| API | REST API、HttpSession |
| 部署 | Vercel、Render、Docker |

網站採用前後端分離架構，由 React 負責頁面與播放器互動，Spring Boot 提供會員、收藏、留言及播放紀錄等 API，並透過 JPA 存取關聯式資料庫。

音樂展示內容與試聽素材由前端提供，會員互動資料則由後端管理。

## 專案結構

```text
NOIRSON/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── pages/     # 網站頁面
│   │   ├── components/# 共用元件
│   │   ├── context/   # 會員、語言、播放器狀態
│   │   └── api/       # API 請求
│   └── public/        # 圖片與音訊素材
│
├── backend/           # Spring Boot 後端
│   └── src/main/java/com/noirson/
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── entity/
│       └── dto/
│
└── README.md
```

## 本機啟動

需安裝 Node.js、Java 25、Maven，並準備已建立資料表的 MySQL 相容資料庫。

後端：

```bash
cd backend
mvn spring-boot:run
```

前端：

```bash
cd frontend
npm install
npm run dev
```

開發環境透過 Vite Proxy 將 `/api` 請求轉送至本機 Spring Boot 服務。資料庫連線資訊請使用本機設定檔或環境變數管理，不應提交至 GitHub。
