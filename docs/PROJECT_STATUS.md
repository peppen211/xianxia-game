# 專案進度紀錄（2026-10-23）

## 專案方向（已確認，後續沿用）
- 放置修煉與探索並重；世界觀以《凡人修仙傳》及《凡人修仙之仙界篇》原著可核實內容優先。
- 舊版 HTML 保留，新原型在 `prototype/` 獨立發展。
- 手機優先，保留原本主要色系與底部五個導航入口的設計目標。
- 韓立沿原著人生路線發展，玩家只在合理條件下與其相遇。
- 修煉預設自動進行並支援離線結算；突破通知後由玩家自行決定。
- 未經原著確認的數值、機制必須標示為原型假設，不得當成正式設定。

## 本次實際檢查
- 已讀取 GitHub `main` 上的 `README.md`、`prototype/README.md`、`prototype/package.json`、`.github/workflows/prototype-ci.yml`、存檔模組、離線修煉模組及其測試、Vite 與 TypeScript 設定。
- CI 工作流程檔存在，工作內容為 Node.js 22、`npm install`、`npm test`、`npm run build`；觸發條件涵蓋 `prototype/**` 變更、工作流程檔變更、PR 與手動觸發。
- 原型單元測試原始碼涵蓋版本化存檔往返、拒絕不支援版本／負資源／無效境界階段／非布林事件旗標／非有限時間戳／錯誤 JSON，以及離線修煉、時鐘倒退、12 小時上限與暫停狀態。
- 目前未能取得 GitHub Actions 執行記錄或工作結果，因此**不能確認 CI 已執行或通過**。本次可用 GitHub 工具未提供列出整個 repository workflow runs 的操作；提交關聯 workflow runs 的工具只涵蓋特定 PR 觸發情況，不能拿來推斷一般 push 執行結果。
- 嘗試從執行環境 clone 公開 repository 以執行測試，但環境 DNS／網路無法解析 github.com，clone 失敗。因此本次沒有實際執行 npm 測試或建置，不能標記通過。
- 尚未發現足以判定程式有錯的實測結果；因此本次不做猜測性程式修補。
- 尚未部署新原型，未修改舊版網站部署設定，也未宣稱任何預覽網址可用。

## 原型目前已知功能（依原始碼）
- TypeScript + Vite，獨立於舊版 HTML。
- 自動修煉與時間戳結算；離線收益最多計算 12 小時。
- 達到原型測試門檻後由玩家手動嘗試突破。
- 探索一次性山泉事件與靈草資源。
- 本機版本化存檔 key：`xianxiaPrototypeSaveV1`；不覆寫無法辨識的既有存檔。
- 修煉速率、突破門檻與離線上限均是原型暫定值，並非原著正式規則。
- 原型尚未達到完整遊戲範圍；舊版網站與原型存檔分離。

## 尚待完成（依優先順序）
1. 從 GitHub Actions 頁面確認最新 `Prototype CI` 執行結果；若失敗，先讀 job log，再修復並驗證。
2. 在可連網 Node.js 環境執行 `cd prototype && npm ci`（若沒有 lockfile，先決定並提交 lockfile，再使用 `npm ci`），`npm test`、`npm run build`。
3. 對存檔往返、錯誤存檔保護、離線結算邊界與重複結算進行實際測試。
4. 更新此進度文件，記錄具體 commit SHA、CI run URL／結論及測試輸出。
5. 測試與建置確認通過後，再設定獨立預覽部署，使用獨立 project／preview URL，避免覆蓋舊版網站。
6. 手機瀏覽器實測，並逐步補齊手機優先 UI、底部五個導航入口與後續遊戲系統。

## 本次結論
- **已完成：** 最新原始碼與 CI workflow 設定檢視；新增此進度紀錄。
- **已驗證：** 原始碼及測試案例確實存在；workflow 定義了測試與建置步驟。
- **未驗證：** Actions 實際結果、npm 測試、TypeScript／Vite 建置、手機實測、部署與可開啟的原型網址。
- **部署網址：** 尚無已驗證的新原型網址。舊版網站網址亦未在本次確認。


## 追加追蹤（2026-10-23，後續操作）
- 已更新 `prototype/README.md`，加入 Actions 工作流程直達連結，並明確記錄測試結果必須以實際 run 為準。提交：`871d57cf1bc6b9d503306c814431749f55654f4a`。
- 已查詢該提交的 GitHub commit combined status，回傳 statuses 為空陣列；這不等同 CI 通過，也不能證明 workflow 未執行。現有 GitHub connector 沒有列出 repository 全部 workflow runs 的可用操作，無法由此確認 run 結果。
- 已確認 `prototype/package-lock.json` 不存在。workflow 目前使用 `npm install`，所以並非因缺 lockfile 而無法執行；但建議後續在可連網環境產生並提交 lockfile，提升依賴可重現性。
- 已檢查本次工作容器：Node.js v22.16.0、npm 10.9.2、全域 TypeScript 5.8.3 可用；Vite 與 Vitest 未安裝。因 DNS 無法解析 github.com，無法 clone repository 或下載依賴，故不能在此環境執行完整測試與建置。僅確認工具版本，不代表專案通過型別檢查。
- 已查詢目前可用的 Vercel 連線上下文，回傳沒有可見的 team，且可見專案清單為空。由於 Vercel Git 專案建立操作要求 team ID，現在不能建立與 GitHub 連結的獨立預覽專案；不以未驗證的假網址代替。
- 舊版網站及部署設定未修改。


## 後續階段：核心邏輯防護與測試擴充（2026-10-23）
- 已擴充離線修煉測試：加入同一結算時間不得重複領取收益，以及剛好達到 12 小時上限時不應誤標為超時的案例。提交：`fc909f402a11b7f1504fa95f0259d5dc876968a2`。
- 強化存檔 metadata 驗證：`gameVersion` 必須是非空字串，`savedAt` 與 `lastSettledAt` 必須是非負有限數值。提交：`82add464fdfbb88d06bdeee91d95b677f5306fde`。
- 加入相應存檔測試，涵蓋缺少／空白版本字串及負時間戳。提交：`67e99b088a4175b5e163b6f72aced94d6e53373e`。
- 已對上述提交查詢 commit combined status，回傳均為空 statuses。此資訊不足以證明 CI 已啟動或通過，測試結果仍待 Actions 頁面確認。
- 以上為程式與測試原始碼變更，**尚未在本機或 CI 實際執行測試**；不應把新增測試案例當作通過證據。
- 下一個可在不改變已決定玩法方向下推進的階段：完成手機底部五入口的實際導航結構與對應頁面，再補足存檔匯出／匯入、離線結算狀態提示及瀏覽器端互動測試。部署仍需先解決 CI 結果可見性與 Vercel 團隊／專案存取。


## 手機導覽階段（2026-10-23）
- 已在原型加入五入口固定底部導覽：洞府、修煉、探索、行囊、設定；每個入口連到既有對應內容位置，並提供選取狀態。提交：`585342ecd25d1d950b3ce4d12513fcef286e9421`。
- 已加入手機底部安全區間距、固定導覽列、平滑定位捲動與桌面寬度樣式。提交：`99dfae0ada7df1ec2c3391a840ad209b93af3e63`。
- 已從 GitHub 重新讀取 main.ts 與 style.css，確認五個目標 ID、五個 data-target、點擊捲動處理及導覽 CSS 均存在。這是靜態原始碼檢查，並非瀏覽器實測。
- README 已補記五入口導覽功能。提交：`142915ecd24debdef12c7722742d0c2779b51978`。
- 對導覽提交查詢 commit status 仍回傳空 statuses；CI 結果與手機實測尚未確認。
