# 不好意思，本座又突破了

**目前遊戲版本：** v6.35  
**正式遊玩入口：** https://peppen211.github.io/xianxia-game/?v=6.35  
**最新版本頁：** https://peppen211.github.io/xianxia-game/latest.html

v6.35 將分類圖鑑改為頂部分類按鈕切換，單次只顯示一個分類，保留各分類原有條目與存檔。

根目錄的 `index.html` 是正式遊戲入口，`latest.html` 顯示目前遊戲版本並連到相同版本。遊戲畫面版號、最新版本頁、GitHub Actions 瀏覽器驗收與部署檢查必須保持一致。

## 目前自動驗收範圍

- 手機版進入流程、主要導覽、裝備背包、古寶收藏與戰鬥掉落。
- 法寶一般攻擊／偷襲觸發，以及元嬰期解鎖第二法寶欄。
- 七種靈寵圖鑑、靈石召靈、重複培育與持有被動。
- 仙市單買／批次購買、精確扣款、靈石不足保護。
- 經濟關鍵數值、存檔重載與舊入口轉址。

## 版本、歷史檔案與存檔

- `package.json` 的 `0.9.0` 是 React/Vite 套件版本，不是正式遊戲畫面版號。
- 正式遊戲存檔鍵固定為 `nine_heavens_idle_v2`。不得以版本更新為理由清除或重設玩家存檔。
- 舊入口 `classic.html`、`mortal-cultivation-rpg.html`、`mortal-cultivation-rpg-3.3.html` 與 `prototype/index.html` 會轉往正式遊戲入口。原始內容保存在 `_legacy_archive/*.html.txt`，不再執行舊存檔邏輯，避免舊版程式碰觸正式存檔。
- 歷史版號與過往測試狀態保留於 Git 提交紀錄，不代表目前正式版號。

## 自動化測試與部署

GitHub Actions 會執行 `npm test`、`npm run build`、手機尺寸瀏覽器流程、正式遊戲版號／最新版本頁核對、法寶／靈寵／商店／經濟及存檔回歸，並確認舊入口轉址至正式版。請以最新的 [GitHub Actions 執行紀錄](https://github.com/peppen211/xianxia-game/actions) 作為驗收依據。歷史版本 v3.9 曾修正偷襲失敗後的反擊傷害計算，納入防具與靈靴的裝備減傷效果，讓偷襲反擊與一般戰鬥套用一致的減傷規則。
