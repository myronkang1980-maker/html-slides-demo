# HTML 簡報製作規範

HTML 互動簡報（html-slides v1，Reveal.js 6.0.2 離線版）。

## 播放
- 直接雙擊 `index.html`（Chrome／Edge 最佳，Firefox 可用）。不需要網路。
- 快捷鍵：`←` `→` 換頁、`↑` `↓` 章節內細節、`Space` 下一步、`Home`／`End`、`O` 總覽、`F` 全螢幕、`S` 講者模式、`T` 深色／淺色投影、`?` 說明、`Esc` 關閉面板。
- 投影機亮度不足時按 `T` 切淺色投影模式。

## 修改
| 要改什麼 | 改哪裡 |
|---|---|
| 內容、加頁 | `index.html` 的「內容從這裡開始」到「內容結束」之間；每個 `<section>` 是一頁，章節第一頁加 `data-chapter="名稱"` |
| 顏色 | `css/deck.css` 的 `:root` tokens（深色）與 `:root[data-theme="light"]`（淺色） |
| 字體 | 固定源樣黑體；改完文字執行 `python ~/.claude/skills/html-slides/scripts/build_fonts.py .` 重新抽字 |
| 圖示 | 編輯 `assets/generated/icon-sheet.svg`，執行 `python ~/.claude/skills/html-slides/scripts/build_icons.py .` |
| 圖表資料 | `index.html` 裡 `<script type="application/json" id="…">` 的 JSON |

## 檔案
```
index.html            簡報本體
css/deck.css          設計系統（字體、色彩、版型、元件）
js/deck.js            導覽、進度、主題、圖表、互動
vendor/               Reveal.js、Chart.js（離線）
assets/generated/     icon-sheet.svg（原稿）、icon-sheet.png（大圖）
assets/icons/         從大圖裁切的 Ixx.png
assets/fonts/         源樣黑體 woff2 子集（SIL OFL 1.1）
01–04_*.md            規劃檔（Content Map、Storyboard、Icon Inventory、Design System）
ICON_MAP.md           圖示對照（自動產生）
```
