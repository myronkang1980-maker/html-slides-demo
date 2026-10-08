# Design System · HTML 簡報製作規範

沿用 html-slides v1 預設（`css/deck.css` 的 tokens），只記錄本份簡報的差異。

## Typography（條件 2，不可改）
- 字體：GenYoGothic2 TW（源樣黑體），本地 woff2 子集
- 標題 H1／Hero：900 Heavy　副標 H2／H3、KPI：700 Bold　內文：400 Regular
- 字級：Hero 4.5rem／H1 3.6rem／H2 2.6rem／H3 1.9rem／內文 1.7rem（不低於 1.4rem）／小字 1.15rem（只用於來源、日期、註腳）

## Color
- 預設深色；`T` 鍵或右上按鈕切換淺色投影模式
- 強調色：青綠 `--teal`、天藍 `--sky`；狀態：`--ok` `--warn` `--danger`

## Icons
- 來源：`assets/generated/icon-sheet.svg` → `icon-sheet.png` → `assets/icons/Ixx.png`
- 尺寸：`.icon.sm` 48／`.icon` 72／`.icon.lg` 112／`.icon.xl` 220 px

## 本份簡報的差異
- 無，全部沿用預設。第 05 頁用實際字級 tokens 當圖表資料。
