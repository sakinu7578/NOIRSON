# NOIRSON 設計說明

## 視覺定位

NOIRSON 以 **Cinematic Editorial Radio / Minimal Analog Hi-Fi** 為方向：深色、低飽和的沉浸式音樂探索介面。Neutral Black、Graphite、Warm Charcoal 與 Warm White / Cream 構成底色；Muted Amber、Olive 和柔和灰金標示選取、Hover、Focus 與播放器細節。Mix 封面及全版圖片提供主要色彩。介面文字以 Sans Serif 為主，大型標題與 Mix 標題使用 Editorial Serif；React 的色彩變數集中於 `frontend/src/styles/style.css`。

## 頁面與共用介面

- **Header／Footer**：Header 固定於畫面上方，提供導覽與中英文切換；Footer 在頁面布局中顯示社群連結與署名，不固定覆蓋內容。
- **Home**：以全版背景、分階段場景、Mix 輪播與音訊頻譜營造聆聽氛圍。
- **Explore**：依 8 首本地 Mix 的曲風分類篩選；卡片按視窗寬度分組並可切換。此頁沒有文字搜尋。
- **Music Detail**：結合主視覺、可展開的影像縮圖、Mix 介紹、播放、收藏與評論。桌機採左側主視覺、右側資訊獨立捲動。
- **About**：背景交錯淡入淡出，呈現品牌、人物內容與可前往詳細頁的 Mix 卡片列。
- **Login／Register**：桌機採左圖右表單的分欄版型，窄螢幕改為上下排列。
- **Member**：顯示會員資料、收藏、最近播放紀錄與我的評論，並提供暱稱及密碼修改。
- **全站 Mini Player**：與詳細頁共用播放狀態；切頁仍能播放，提供進度、音量、循環、前後首、播放清單與自動下一首。

## RWD 與互動

桌機保留場景層次與較完整的資訊密度；平板調整卡片欄數、間距和播放器寬度；手機以可觸控、文字完整及自然垂直捲動為主。圖片維持比例，不讓固定或動畫圖層造成水平溢出。全站播放器在窄螢幕可收合或貼附側邊；適用的桌機指標可拖曳播放器。

動畫使用緩慢 Crossfade、輕微位移、背景呼吸與低調 Hover，並尊重 `prefers-reduced-motion`。詳細頁縮圖展開後位於主視覺底部，閒置約 5 秒收合；滑鼠停留或鍵盤焦點在面板內時暫停收合。播放控制、表單、分類按鈕與評論操作保留鍵盤可操作的狀態提示。
