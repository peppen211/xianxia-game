# 參考遊戲深度檢視 v1

> 日期：2026-10-23
> 本文依目前可取得的公開 README／架構文件整理；不是已下載執行、逐行審查或手機實測。未確認項目保留「待驗證」。

## 1. 已取得較具體證據的專案

### A. Immortality Idle
- Repo：https://github.com/immortalityidle/immortalityidle.github.io
- 試玩：https://immortalityidle.github.io/
- README 說明：以修仙／多世輪迴為主題；主要遊戲邏輯集中在 game-state 相關 services；採 Angular 專案結構。
- 授權提示：README 表示衍生作品也需保持開源。這是明確的相同開源要求；在複用任何程式碼前仍須閱讀倉庫完整授權檔與相關條款。
- 對本專案可借鑑：修仙長期成長、把遊戲狀態／規則邏輯與 UI 分離、將多世成長當作一種可研究的長線循環。
- 不應直接採用：輪迴／重生機制不屬於目前已確認的原著還原需求，先只作玩法觀察。
- 證據來源：https://github.com/immortalityidle/immortalityidle.github.io/blob/main/README.md

### B. Adventurer's Guild
- Repo：https://github.com/GiuffreLab/adventurers-guild
- 試玩：https://giuffrelab.github.io/adventurers-guild/
- README 說明：瀏覽器 idle RPG；任務板、隊伍、商店、百科；戰鬥以事件逐步呈現；有戰鬥結果摘要與可複製戰鬥紀錄。
- 存檔：README 明確描述 localStorage 自動存檔、JSON 匯出／匯入；匯入前會備份現有存檔，匯入失敗可還原。
- 技術：原生 JavaScript ES modules，無框架、無 bundler；戰鬥可用 seeded random 重現結果。
- 對本專案可借鑑：存檔匯出／匯入、匯入失敗復原、可重現的戰鬥測試、戰鬥紀錄與結果摘要、百科／規則說明頁。
- 需留意：本遊戲是單主角修仙體驗，公會編隊、九職業、階級晉升不應直接照搬。
- 證據來源：https://github.com/GiuffreLab/adventurers-guild

### C. Idle Hero
- Repo：https://github.com/alexis-labs/idle-hero
- 架構文件：https://github.com/alexis-labs/idle-hero/blob/main/docs/ARCHITECTURE.md
- README 明確標示：early playable prototype；核心循環可玩，但平衡、內容深度、無障礙、測試與視覺仍在開發。
- 已描述功能：固定 Roguelike 地圖探索、迷霧、計時移動、秘密、謎題、NPC 事件、寶藏、遭遇與 Boss；技能訓練、採集／加工／製作、資源、裝備、商店、成就、本機存檔、匯入／匯出與最多 24 小時離線進度。
- 架構：React + TypeScript + Vite + Three.js；內容放在 data，規則放在 systems，UI 主要呈現狀態並派發 actions；存檔與離線進度各有獨立系統。
- 對本專案可借鑑：資料定義與規則分離、探索事件資料化、存檔 hydration、離線收益獨立模組、公式與存檔的自動測試。
- 需留意：專案 README 說明尚未選定開源授權，故只研究設計，不複製程式碼。
- 證據來源：https://github.com/alexis-labs/idle-hero 與其 docs/ARCHITECTURE.md

## 2. 對本專案最有價值的功能清單

| 功能 | 參考證據 | 建議 | 優先級 |
|---|---|---|---|
| 離線修煉回歸摘要 | Idle Hero 描述離線進度與 offline modal；放置遊戲常見模式 | 顯示離線時長、修為／資源變化與待突破提醒 | P0 |
| 存檔匯出／匯入 | Adventurer's Guild README 明確描述 JSON 匯出／匯入及失敗復原 | 新原型完成基本存檔後加入，先驗證匯入資料 | P1 |
| 存檔版本驗證與遷移 | Idle Hero 架構描述 save hydration；本專案需保護舊檔 | schemaVersion、驗證、遷移與保留原始資料 | P0 |
| 資料驅動事件／物品 | Idle Hero 的 data／systems 分層 | 地點、事件、物品、功法用穩定 ID 與資料定義 | P0 |
| 探索遭遇與事件 | Idle Hero 有地圖、NPC、秘密、謎題、Boss | 第一版先做單一地點、一個條件事件和一個資源點 | P1 |
| 可解釋的戰鬥紀錄 | Adventurer's Guild 的逐事件戰鬥與摘要 | 後續戰鬥顯示行動、效果、傷害、掉落原因 | P2 |
| 可重現的戰鬥測試 | Adventurer's Guild 描述 seeded random | 戰鬥系統成熟後採可注入 RNG／固定種子測試 | P2 |
| 規則百科／圖鑑 | Adventurer's Guild 有即時百科 | 加入境界、功法、物品、人物與已知情報圖鑑 | P2 |
| 輪迴／轉生 | Immortality Idle 的主題 | 暫不加入；需先確認是否符合原著及玩家主角定位 | 暫緩 |
| 完整製作／交易 | Idle Hero 有採集、加工、製作與出售 | 不放入第一個切片；待物品經濟需求清楚再設計 | P2 |

## 3. 第一版建議實作的具體流程

1. 角色進入洞府，看到境界、修為進度、靈石、氣血與修煉狀態。
2. 開啟自動修煉；狀態依時間戳更新，不要求背景計時器持續運作。
3. 重新開啟遊戲時，顯示離線時長與修為變化摘要。
4. 修為達標後顯示「可嘗試突破」，不自動突破。
5. 進入一個可探索地點，採集一項資源或觸發一個條件事件。
6. 存檔／讀檔後，角色狀態、事件旗標與資源數量保持一致。
7. 以測試驗證相同時間區間不重複結算、事件結果不重複套用、錯誤存檔不覆寫有效存檔。

## 4. 尚待完成的研究

- 逐一確認中文修仙候選（雲隱修仙錄、閒人修仙、我的放置仙途）的實際可玩性、功能與 LICENSE。
- 對優先專案下載或檢視核心程式檔，將 README 描述與程式實作互相核對。
- 用手機實際開啟試玩入口，記錄版面、操作、返回遊戲和存檔表現。
- 記錄每個採用想法的來源、改編理由、是否採用與測試結果。
- 所有設計都需服務本專案已確認方向：放置與探索並重、與韓立共存、原著還原優先；不因參考遊戲有某功能就直接加入。
