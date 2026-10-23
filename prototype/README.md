# 新原型 0.1

這是與舊版 HTML 分離的 TypeScript + Vite 原型，尚未部署，也尚未完成瀏覽器或手機實測。

## 本機執行

需要 Node.js 版本相容的 npm 環境：

```bash
npm install
npm run dev
```

## 驗證

GitHub Actions 工作流程位於 `.github/workflows/prototype-ci.yml`，原型相關檔案變更時會執行單元測試與建置。工作流程存在不代表檢查已通過；請以 [Actions 執行記錄](https://github.com/peppen211/xianxia-game/actions/workflows/prototype-ci.yml) 的實際結果為準。

截至 2026-10-23，本次維護已確認 workflow 設定與測試原始碼存在，但目前連線工具未能提供完整 workflow run 清單，且本地執行環境無法連線下載 GitHub 原始碼。因此測試／建置仍標記為未驗證，不可視為通過。任何新提交觸發的 CI，均須在 Actions 頁面確認最終狀態。

```bash
npm test
npm run build
npm run preview
```

## 目前包含
- 新角色初始狀態與手機優先介面，加入五入口底部導覽（洞府、修煉、探索、行囊、設定），支援安全區與定位捲動。
- 自動修煉與時間戳進度結算。
- 最多 12 小時離線收益原型。
- 達標後手動突破的原型流程。
- 一個探索點、一項靈草資源及一次性事件旗標。
- 獨立的版本化本機存檔 key：`xianxiaPrototypeSaveV1`。
- 離線結算與存檔驗證的單元測試案例。

## 明確限制
- 突破門檻、修煉倍率與離線上限都是原型暫定值，並非已考證的原著規則。
- 尚未完成完整境界、功法、戰鬥、宗門、秘境、主線與圖鑑。
- 尚未加入存檔匯出／匯入及舊版存檔遷移。
- 本次工作環境無法連外下載 npm 套件，因此未能在此環境執行 `npm install`、`npm test`、`npm run build`；GitHub Actions 的實際執行結果仍需確認，不能標記為測試通過。真實手機瀏覽器測試也尚未完成。
- 本原型的存檔與舊版遊戲分離，重置本原型不應影響舊版存檔。
