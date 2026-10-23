# 新原型進度紀錄

最後更新：2026-10-23

## 已完成的規劃文件
- `docs/GAME_DESIGN_OVERVIEW_v1.md`：遊戲方向與系統總覽。
- `docs/NEXT_STEP_ARCHITECTURE_PLAN.md`：架構與第一個可玩版本建議。
- `docs/CORE_DATA_MODEL_DRAFT.md`：核心資料模型草案。
- `docs/REFERENCE_GAMES_RESEARCH.md`：候選參考遊戲與可借鑑設計。
- `docs/REFERENCE_GAMES_DEEP_REVIEW_v1.md`：部分專案的 README／架構證據與改編建議。
- `docs/ARCHITECTURE_DECISION_RECORD_v1.md`：TypeScript + Vite 的架構提案。
- `docs/VERTICAL_SLICE_ACCEPTANCE_v1.md`：第一個可玩切片驗收標準。

## 已建立的新原型檔案
- `prototype/package.json`
- `prototype/tsconfig.json`
- `prototype/vite.config.ts`
- `prototype/index.html`
- `prototype/src/core/types.ts`
- `prototype/src/save/save.ts`
- `prototype/src/systems/cultivation/offline.ts`
- `prototype/src/systems/cultivation/offline.test.ts`
- `prototype/src/main.ts`
- `prototype/src/style.css`
- `prototype/src/vite-env.d.ts`
- `prototype/README.md`

## 原型已具備的程式路徑（未執行驗證）
- 初始角色與基本狀態介面。
- 開始／停止修煉按鈕與時間戳修為結算。
- 12 小時離線收益原型與回歸摘要。
- 修為達到測試門檻後由玩家主動按鈕突破。
- 一個探索地點、取得一株靈草及一次性事件旗標。
- 獨立的 `xianxiaPrototypeSaveV1` 存檔 key。
- 存檔結構初步驗證。
- 離線結算測試案例已寫入。

## 尚未完成／未驗證
- 尚未執行 npm install、npm test、TypeScript 檢查或 Vite build。
- 尚未在瀏覽器執行，也尚未在真實手機／iOS Safari 測試。
- 尚未部署到 GitHub Pages；目前沒有可確認的線上新原型網址。
- 尚未驗證存檔錯誤復原、重複結算、背景／前景切換與實際長時間離線。
- 尚未做原著境界／突破規則考證；目前門檻和倍率皆為原型暫定值。
- 尚未支援舊版存檔匯入、JSON 匯出／匯入、完整事件引擎或完整戰鬥。
- 尚未完成參考遊戲逐一實測與授權檔核查。

## 下一個執行步驟
1. 在可用 Node.js 環境安裝依賴並執行 `npm test`、`npm run build`。
2. 修正編譯或測試問題，再以本機預覽確認核心操作。
3. 為核心時間結算、存檔驗證及事件去重補測試。
4. 設定獨立的 GitHub Pages 預覽部署，不改動既有正式遊戲入口。
5. 通過瀏覽器測試後再安排真實手機測試。
