# NOIRSON V2.1 設計規範

## Visual Direction

- 方向：Cinematic / Editorial / Dark / Minimal / Music-first。
- V2 參考：`docs/design/noirson-v2-reference.png`，用於 Layout、Vibe 與 Visual Hierarchy，不要求 pixel-perfect。
- 色彩以 Neutral Black、Graphite、Warm Charcoal 與 Warm White / Cream 為主；Muted Olive / Amber 僅用於 Active、Hover、Label 與小型細節。
- Mix 圖片與 About 背景是主要色彩來源，避免大面積棕色、橘色或高彩度漸層。
- UI / Navigation / Label 與 Metadata 使用 Sans Serif；Mix Title 與大型品牌標題使用 Editorial Serif。

色彩變數集中於 `css/style.css` 的 `:root`，所有頁面沿用同一套 Visual Color System。

## 共用元件

### Header

- Fixed、約 64px 高、半透明深色背景與 Blur。
- Logo 使用 `images/Logo.png`，導覽統一為 HOME / EXPLORE / ABOUT / LOGIN。
- 目前頁面以低調 Olive / Amber 呈現 Active 狀態。

### Footer

- 六頁使用相同結構與深色背景。
- YouTube、Spotify、Instagram 為主要連結；Produced by NOIRSON 與版權為次要小字。
- Footer 不使用 fixed 定位，避免覆蓋內容。

### Player

- Home 與 Music Detail 共用 Play / Pause、Progress、時間與 Seek 的互動模式。
- Music Detail 另有 Previous / Next、浮動 Playlist；面板不能推擠頁面或超出 Mobile Viewport。
- 不使用瀏覽器原生 Controls 外觀，也不 Autoplay。

## 六個頁面布局

- Home：滿版 M001 Signature Hero，文字與 Player 疊放於圖片底部；下方為 8 Mix 無限循環 Carousel。
- Explore：Intro 加三欄 Editorial Gallery，資料由 `mix-data.js` 動態產生。
- Music Detail：Desktop 為左側 16:9 Main Visual / 單排 Gallery、右側資訊與 Player；窄螢幕改為上下排列。
- About：大型 Crossfade 背景、品牌介紹、Behind the Sound 與 Subscription UI。
- Login / Register：Desktop 使用一致雙欄版型，圖片與表單各自控制高度；Mobile 改為上下排列。

## RWD 原則

- Desktop：維持目前 V2.1 比例、視覺密度與圖片主導布局。
- Tablet（約 900px 以下）：Explore 改兩欄；Music Detail 改上下排列；About 人物與訂閱區簡化為單欄。
- Mobile（約 600px 以下）：Header 縮小字級與間距但保留全部導覽；Explore 改單欄；Player 控制維持可操作；Gallery 保持水平捲動；Playlist 限制於 Viewport；Login / Register 改上下排列。
- 圖片保持原始比例並使用合適的 `object-fit`；內容高度可自然延伸，不以固定高度造成重疊。
- Footer 維持文件流，所有頁面皆不得被背景、浮動面板或內容層覆蓋。

## Reference 使用原則

[NOIRSON Website Figma Wireframe](https://www.figma.com/design/ghOmiLHDDKCUkSW7KjqPsk/NOIRSON-Website) 是 Wireframe / Layout reference，用於確認頁面結構、比例、Spacing、Alignment 與 User flow。Figma 灰階與 Placeholder 不代表正式 Visual Design，不得覆蓋目前 Home CSS 建立的品牌配色。
