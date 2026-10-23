# 凡人修仙・自由放置 RPG

**正式遊玩入口：** https://peppen211.github.io/xianxia-game/

## v0.8.0

本專案已開始遷移至獨立的 React/Vite 遊戲版本，目標是讓遊戲原始碼、測試與 GitHub Pages 正式網站共用同一份程式碼，不再依賴 Lovable 的 AI 建置額度。

目前整合的玩法包含：
- 修煉、境界突破、破境丹與靈石
- 角色召喚與收藏
- 古寶、靈寵收集
- 每日任務、永久成就、雲山探索
- 瀏覽器本機存檔與重置

## 開發與自動化

- `npm install`：安裝依賴
- `npm test`：執行遊戲規則與任務測試
- `npm run build`：建置正式網站

GitHub Actions 會在推送到 `main` 後執行測試與建置，通過後發布到 GitHub Pages。公開 GitHub 儲存庫與 Pages 可免費使用，但仍受 GitHub 的服務條款與流量／建置限制約束。

## 版本紀錄

- **v0.8.0**：將完整遊戲介面與每日任務／成就系統遷移到獨立 Vite/React 專案，改用獨立 CI 建置與部署。
