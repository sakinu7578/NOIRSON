# NOIRSON 設計規範

## Visual Direction

NOIRSON 的視覺方向為 **Cinematic Editorial Radio / Minimal Analog Hi-Fi**，以深色、低飽和、沉浸式的 Chill Radio 氛圍為核心。

- 主色使用 Neutral Black、Graphite、Warm Charcoal 與 Warm White / Cream。
- Muted Amber、Olive 與柔和灰金用於 Active、Hover、Label 與播放器細節。
- Mix 封面與全版背景是主要色彩來源；環境光暈保持低透明度，不搶內容焦點。
- UI、Navigation 與 Metadata 使用 Sans Serif；大型標題與 Mix Title 使用 Editorial Serif。
- 色彩變數集中於 `css/style.css` 的 `:root`。

## 共用介面

### Header

- 固定於 Viewport 上方，使用半透明深色背景。
- Logo、主要導覽與語言切換在各頁維持一致。
- Active、Hover 與 Focus 使用低調暖灰金色。

### Footer

- 桌面版以單排呈現版權、社群連結與署名；Mobile 改為兩排。
- YouTube、Spotify、Instagram 使用一致的單色 SVG 圖示。
- Footer 保持在文件或場景布局中，不以固定定位覆蓋內容。

### Player

- Home 與 Music Detail 使用一致的 Play / Pause、Progress、Seek、Volume / Mute 與 Loop 互動語言。
- 控制介面保持低對比、可操作與鍵盤可存取，不使用瀏覽器原生 Controls 外觀。
- Music Detail 另提供 Previous / Next、Playlist 與 Auto Next。

## 主要頁面

- **Home**：固定全版背景與三階段沉浸場景。Mini Player 持續可見；Stage 2 顯示 Explore Carousel；Stage 3 顯示 Listening Atmosphere、真實音訊頻譜與 Footer。
- **Explore**：上方標題與 Genre 導覽保持穩定，下方 Mix 卡片依 Viewport 動態分組並循環切換。Ambient Glow 僅作為底層氣氛。
- **Music Detail**：主視覺、Visual Gallery、Mix 資訊與 Player 組成主要內容；Gallery 保持水平捲動與選取狀態同步。
- **About**：全版背景 Crossfade 搭配品牌內容、人物介紹與 Subscription UI。
- **Login / Register**：Desktop 採 60 / 40 Split Layout，左側為圖片輪播，右側為表單；Mobile 改為上下排列。

## Motion

- 動畫以緩慢 Crossfade、輕微位移、背景呼吸與低調 Hover 為主。
- Carousel、Stage 與 Gallery 動畫不得妨礙連結、表單或播放器操作。
- 非必要動畫尊重 `prefers-reduced-motion`。

## Responsive Principles

- Desktop 保留沉浸式場景、完整資訊層級與三欄內容密度。
- Tablet 調整欄數、間距與播放器寬度，避免標題和控制元件重疊。
- Mobile 優先確保觸控操作、文字完整與無水平溢出；必要時允許自然垂直捲動。
- 圖片維持既定比例，使用 `object-fit` 或背景裁切，避免拉伸變形。
- Fixed、Absolute 與動畫圖層不得擴張文件捲動範圍。
