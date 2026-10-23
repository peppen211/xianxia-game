# 新原型 0.1

這是與舊版 HTML 分離的 TypeScript + Vite 原型，定位為個人單機遊戲，不需要多人連線、App Store 上架或遊戲帳號。免費網頁入口：https://peppen211.github.io/xianxia-game/ 。GitHub Pages 部署已成功，建置與單元測試通過；真實 iPhone 與離線模式仍待實測。此網址是公開可訪問的，請勿當成有密碼保護的私人網站。

## 個人離線遊玩

正式建置版加入了 Service Worker 與 Web App Manifest。第一次用 Safari 開啟上方 HTTPS 網址並保持網路連線，讓瀏覽器載入遊戲並完成快取；之後可在同一瀏覽器離線開啟已快取的遊戲。這不會把遊戲公開發布，也不會自動同步存檔到網路。存檔仍位於目前瀏覽器的本機儲存空間，清除網站資料或更換瀏覽器／裝置可能導致進度遺失，請使用匯出存檔備份。

注意：直接雙擊 `index.html`（`file://`）通常無法使用 Service Worker，因此目前應透過本機伺服器開啟。尚未提供一鍵安裝包，也尚未在真實手機／離線環境實測。

## 本機執行（開發者選用）

需要 Node.js 版本相容的 npm 環境：

```bash
npm install
npm run dev
```

## 驗證

GitHub Actions 工作流程位於 `.github/workflows/prototype-ci.yml`，原型相關檔案變更時會執行單元測試與建置。工作流程存在不代表檢查已通過；請以 [Actions 執行記錄](https://github.com/peppen211/xianxia-game/actions/workflows/prototype-ci.yml) 的實際結果為準。

截至 2026-10-23，GitHub Actions 的 Prototype CI 與 Pages 部署均已成功。最新部署提交 `d0fd4b3e59bd9522984b150d8781e987498853a0` 的單元測試、Vite 建置及 GitHub Pages 部署全部通過。

```bash
npm test
npm run build
npm run preview
```

## 目前包含
- 新角色初始狀態與手機優先介面，加入五入口底部導覽（洞府、修煉、探索、行囊、設定），支援安全區與定位捲動。
- 自動修煉與時間戳進度結算。
- 正式建置版提供 Service Worker 離線快取與 Web App Manifest，支援首次載入後的離線啟動（仍待實測）。
- 最多 12 小時離線收益原型。
- 達標後手動突破的原型流程。
- 一個探索點、一項靈草資源及一次性事件旗標。
- 獨立的版本化本機存檔 key：`xianxiaPrototypeSaveV1`。
- 離線結算與存檔驗證的單元測試案例。

## 明確限制
- 突破門檻、修煉倍率與離線上限都是原型暫定值，並非已考證的原著規則。
- 尚未完成完整境界、功法、戰鬥、宗門、秘境、主線與圖鑑。
- 已加入原型存檔 JSON 匯出／匯入入口；匯入會先驗證格式並要求確認，舊版存檔遷移仍未加入。
- 最新提交已由 GitHub Actions 成功執行 `npm install`、`npm test`、`npm run build` 並部署至 GitHub Pages；真實手機瀏覽器與飛航模式測試尚未完成。
- 本原型的存檔與舊版遊戲分離，重置本原型不應影響舊版存檔。

## iPhone 16 Pro Max 使用方式

本專案目前是手機優先的 Web App 原型，尚不是可直接從「檔案」App 安裝的原生 iOS App。iPhone 的 Safari 需要先從 HTTPS 網址載入一次，才能透過「加入主畫面」安裝；安裝後首次啟動時要保持網路連線，等待 Service Worker 完成快取，再以飛航模式測試離線使用。

### 在 iPhone 上遊玩

1. 用 iPhone 的 Safari 開啟遊戲的 HTTPS 網址（不要用其他瀏覽器的內建網頁視窗）。
2. 點「分享」按鈕，選擇「加入主畫面」。若有「以網頁 App 開啟」選項，將它開啟後加入。
3. 從主畫面圖示啟動遊戲，先保持網路連線並等待頁面完全載入與離線快取完成。
4. 開啟飛航模式，再從主畫面圖示重新啟動，確認遊戲能離線載入、操作及保留本機存檔。
5. 在設定中定期使用「匯出存檔」備份。iOS 清除網站資料、刪除網頁 App 或更換裝置時，可能失去本機存檔。

**公開存取提醒：** 本次採用免費 GitHub Pages，因此任何取得網址的人都能嘗試開啟遊戲；這不是密碼保護或私人部署。使用者目前選擇不分享網址。存檔只存在目前瀏覽器的本機儲存空間，不會因為網址公開就自動上傳。

**驗證狀態：** GitHub Actions 的單元測試與 TypeScript／Vite 建置已在提交 `e9827cedd7d02b35263f3f0ddd01a2e36232ab51` 通過；iPhone Safari、加入主畫面及真正飛航模式測試尚未執行。
