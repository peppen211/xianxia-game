# 核心遊戲資料模型草案 v1

> 狀態：供架構評估與原型使用的草案。不是已實作程式，也不是已完成原著考證的遊戲規則。

## 設計原則
- 將「遊戲目前狀態」與「原著／遊戲資料定義」分開。
- 以穩定 ID 連結境界、物品、地點、事件與角色，不以畫面顯示名稱作為唯一識別。
- 時間計算集中管理，避免修煉、離線收益與事件各自計時造成重複結算。
- 存檔帶 schema 版本；讀檔時驗證欄位，不假設舊版資料可直接相容。
- 原著尚未查證的數值使用明確的待確認標記，不以猜測填入正式規則。

## 1. 靜態資料定義

### RealmDefinition
- `id`: 穩定識別碼
- `name`: 顯示名稱
- `regionId`: 所屬界域
- `order`: 進度排序
- `sublevels`: 層次／階段定義
- `requirements`: 突破需求的規則參照
- `lifespanRuleId`: 壽元規則參照（可待考證）
- `tribulationRuleId`: 天劫規則參照（可待考證）
- `canonStatus`: `verified`、`draft`、`needs_review`
- `sources`: 原著章節／來源註記

### ItemDefinition
- `id`, `name`, `category`, `description`
- `stackable`, `maxStack`
- `useRequirements`, `effects`
- `obtainSources`
- `canonStatus`, `sources`

### TechniqueDefinition
- `id`, `name`, `description`
- `realmRequirements`, `effects`, `progressionRules`
- `obtainSources`
- `canonStatus`, `sources`

### LocationDefinition
- `id`, `name`, `regionId`, `description`
- `unlockConditions`, `availableActions`, `encounterTableId`
- `canonStatus`, `sources`

### EventDefinition
- `id`, `title`, `narrative`
- `conditions`, `choices`, `effects`, `followUpEventIds`
- `repeatPolicy`, `canonStatus`, `sources`

## 2. 玩家存檔狀態

### SaveEnvelope
- `schemaVersion`: 新原型存檔格式版本
- `gameVersion`: 遊戲版本
- `savedAt`: 最後存檔時間
- `player`: 角色狀態
- `cultivation`: 修煉狀態
- `resources`: 貨幣與資源數量
- `inventory`: 物品堆疊
- `techniques`: 已學功法與進度
- `world`: 地點、事件旗標、世界時間
- `relationships`: 與人物的關係狀態
- `activity`: 當前活動與時間戳
- `settings`: 可選遊戲設定

### PlayerState
- `id`: 存檔內角色識別碼
- `name`
- `origin`: 出身／起始背景
- `spiritualRootId`: 靈根定義 ID
- `realmId`, `realmStage`
- `health`, `maxHealth`
- `createdAt`

### CultivationState
- `currentProgress`
- `targetProgress` 或由境界定義推導
- `isCultivating`
- `lastSettledAt`
- `pendingBreakthrough`: 是否已符合可嘗試突破條件
- `activeTechniqueIds`

### ResourceState
- 以穩定資源 ID 對應非負數量；不要為每種資源新增硬編碼欄位。

### InventoryState
- 每個堆疊包含 `itemId`、`quantity` 及必要的個體狀態。
- 法器等不可堆疊物品可用獨立 instance ID 表示。
- 背包容量、裝備欄與堆疊上限仍待玩法規格確認。

### WorldState
- `worldTime`
- `currentLocationId`
- `unlockedLocationIds`
- `eventFlags`: 已發生、已選擇或已完成的事件紀錄
- `knownCharacterIds`
- `worldStateFlags`: 世界進度狀態

### ActivityState
- `type`: 例如 idle、cultivation、exploration、combat
- `startedAt`
- `lastSettledAt`
- `payload`: 活動專屬狀態
- 具體活動能否同時進行由玩法規則決定，資料模型不先假設互斥或並行。

## 3. 時間與離線收益
- 使用單一時間結算入口，將上次結算時間至現在的有效秒數交給各系統處理。
- 有效時間不得小於零；處理極長離線時間時需依規格封頂或分段結算。
- 每次結算後更新 `lastSettledAt`，確保同一段時間不會重複領取。
- 頁面重新取得焦點、存檔、讀檔與關閉重開都需涵蓋測試。
- 離線上限尚待決定；舊版的 12 小時限制不自動沿用至新原型。

## 4. 存檔安全與遷移
- 新原型使用獨立 storage key，例如 `xianxiaPrototypeSaveV1`；此名稱為提案。
- 讀檔先解析、驗證 schema、檢查數值範圍與 ID 參照。
- 讀檔失敗時不立即覆寫原始資料；提供可理解的復原或重置選項。
- 遷移採逐版本函式，例如 V1 到 V2；每一步都有測試。
- 舊版 `mortalCultivationSaveV2` 不直接共享 key，也不宣稱自動相容。舊存檔匯入是獨立需求。

## 5. 需要測試的規則案例
1. 新存檔可建立、讀回且欄位一致。
2. 無效 JSON 或缺少必要欄位時不造成白畫面，且不破壞原始資料。
3. 修煉離線 1 小時只結算一次。
4. 頁面前景／背景切換不重複計算同一時間區間。
5. 系統時間倒退時不產生負修為或資源。
6. 突破未達條件時不能執行；達標後由玩家主動選擇嘗試。
7. 事件條件未成立時不觸發；成立後選擇結果只套用一次。
8. 未知的物品／境界 ID 可被安全處理，不讓整份存檔失效。

## 6. 待確認
- 境界層次與突破條件需逐段原著考證。
- 修煉速度、資源產出與數值平衡。
- 壽元、天劫、受傷、死亡與恢復規則。
- 探索與修煉的時間並行政策。
- 背包容量、裝備、堆疊、交易與製作。
- 是否匯入舊版存檔，以及匯入版本優先順序。
- 離線收益上限與反作弊／時間倒退處理的玩家體驗。
