# NOIRSON 設計規範

## V2 Visual Direction

- V2 視覺參考：`docs/design/noirson-v2-reference.png`，僅作為 Layout、Vibe 與 Visual Hierarchy 參考。
- 設計方向為 Cinematic / Dark / Minimal / Music-first，以 Black、Charcoal、Deep Brown 建立低調層次，延續 olive 與 muted cream 品牌色。
- Home 採 Desktop-first；Mobile / RWD V2 留待後續處理。
- Home 以 M001「Somewhere far from everyone」作為 Signature Mix 與主要視覺，並提供完整站內播放。
- About 預計在後續版本使用 `images/00.png`～`images/16.png` 自動 Crossfade 背景，目前尚未實作。

## Figma

[NOIRSON Website Figma Wireframe](https://www.figma.com/design/ghOmiLHDDKCUkSW7KjqPsk/NOIRSON-Website)

Figma 是本專案的 **Wireframe／Layout reference**，用於確認 Layout、Page structure、Information hierarchy、Size／proportion、Spacing、Alignment 與 User flow。

HTML／CSS 是實際的 **Visual Design implementation**。Figma Wireframe 中的灰階、黑白與 placeholder 顏色不代表正式網站色彩，也不得用來覆蓋已確立的 NOIRSON 品牌視覺。

## 主要 Desktop Frames

1. 01 Home - Desktop
2. 02 Music - Desktop
3. 03 Music Detail - Desktop
4. 04 About - Desktop
5. 05 Login - Desktop

## Visual Color System

目前 Home CSS 已確立的 NOIRSON 深色系是正式 Visual Color System baseline。Home、Music／Explore、Music Detail、About、Login／Register 與後續新增頁面都必須延續這套品牌色系，維持全站一致。

主要色彩定義集中於 `css/style.css` 的 `:root`：深色頁面底色、冷調區塊底色、暖白主要文字、灰白次要文字與 amber 強調色。

## Reference 使用順序

1. 優先直接讀取 Figma URL 對應的 Frame。
2. 只有 Figma 無法讀取，或需要保存特定畫面參考時，才使用 screenshot／PNG 作為 fallback。
3. 目前不需要將 PNG／Screenshot 加入 repository。

不得為了符合 Wireframe 灰階外觀，而覆蓋已確立的 NOIRSON 品牌視覺規則。
