import './style.css';
import { createInitialPlayer, createSave, readSave, SAVE_KEY, writeSave } from './save/save';
import { settleOfflineCultivation } from './systems/cultivation/offline';
import type { SaveEnvelope } from './core/types';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('找不到遊戲根節點');

let save: SaveEnvelope;
let storageWarning = '';
let offlineSummary = '';
let saveBlocked = false;

try {
  const raw = localStorage.getItem(SAVE_KEY);
  const existing = readSave();
  if (raw && !existing) {
    saveBlocked = true;
    storageWarning = '偵測到無法辨識的原型存檔。為避免覆寫資料，目前已暫停自動存檔。請先匯出或手動備份瀏覽器資料，再重置原型。';
    save = createSave(createInitialPlayer(), Date.now());
  } else if (existing) {
    const result = settleOfflineCultivation(existing.player, existing.lastSettledAt, Date.now());
    save = { ...existing, player: result.player, lastSettledAt: result.lastSettledAt, savedAt: Date.now() };
    const hours = result.summary.elapsedSeconds / 3600;
    offlineSummary = hours > 0
      ? `離線結算：${hours.toFixed(2)} 小時，修為增加 ${result.summary.cultivationGained.toFixed(2)}。${result.summary.capped ? ' 本次收益已套用 12 小時上限。' : ''}`
      : '已載入存檔。';
    writeSave(save);
  } else {
    save = createSave(createInitialPlayer(), Date.now());
    writeSave(save);
  }
} catch {
  saveBlocked = true;
  storageWarning = '瀏覽器目前無法存取本機存檔。你仍可試玩本頁，但重新整理後進度可能無法保留。';
  save = createSave(createInitialPlayer(), Date.now());
}

function persist(): void {
  if (saveBlocked) return;
  save.savedAt = Date.now();
  try {
    writeSave(save);
    storageWarning = '';
  } catch {
    storageWarning = '存檔失敗，請勿關閉頁面；瀏覽器可能限制本機儲存。';
  }
}

function render(): void {
  const p = save.player;
  const canBreakthrough = p.cultivationProgress >= 100;
  const eventSeen = Boolean(save.eventFlags['herb-spring-found']);
  root!.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div><p class="eyebrow">自由放置 RPG · 原型 0.1</p><h1>凡人修仙</h1></div>
        <span class="pill">${p.isCultivating ? '閉關修煉中' : '暫停修煉'}</span>
      </header>
      <section class="notice"><strong>原型測試提醒</strong><p>此版本只驗證核心流程。境界突破門檻與修煉數值為測試用暫定規則，尚未完成原著考證。</p></section>
      ${offlineSummary ? `<section class="offline"><strong>洞府近況</strong><p>${offlineSummary}</p></section>` : ''}
      ${storageWarning ? `<section class="warning" role="alert">${storageWarning}</section>` : ''}
      <section class="panel">
        <div class="section-heading"><h2>角色狀態</h2><span class="muted">人界 · 起始階段</span></div>
        <label class="field">道友稱呼<input id="player-name" maxlength="24" value="${escapeHtml(p.name)}" /></label>
        <div class="stats">
          <div><span>境界</span><strong>${p.realmId === 'mortal' ? '凡人' : `練氣 ${p.realmStage} 層`}</strong></div>
          <div><span>靈根</span><strong>四屬性偽靈根</strong></div>
          <div><span>靈石</span><strong>${p.spiritStones}</strong></div>
          <div><span>靈草</span><strong>${p.herbs}</strong></div>
        </div>
        <div class="progress-label"><span>修為進度</span><strong>${p.cultivationProgress.toFixed(1)} / 100</strong></div>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, p.cultivationProgress)}%"></div></div>
        <div class="actions">
          <button id="cultivate" class="primary">${p.isCultivating ? '停止修煉' : '開始修煉'}</button>
          <button id="breakthrough" ${canBreakthrough && p.realmId === 'mortal' ? '' : 'disabled'}>嘗試突破</button>
        </div>
        <p class="hint">${canBreakthrough ? '已達原型測試門檻，可由你決定是否嘗試突破。' : '修為累積達到測試門檻後，會開放手動突破。'}</p>
      </section>
      <section class="panel">
        <div class="section-heading"><h2>附近探索</h2><span class="muted">試驗地點</span></div>
        <p>洞府外有一處靈草生長的山泉。探索一次可取得少量靈草，並記錄發現事件。</p>
        <button id="explore" ${eventSeen ? 'disabled' : ''}>${eventSeen ? '已探索山泉' : '探索山泉'}</button>
        ${eventSeen ? '<p class="success">事件已記錄：你在山泉旁發現靈草。</p>' : ''}
      </section>
      <footer><span>原型存檔：${saveBlocked ? '保護模式' : '本機儲存'}</span><button id="reset" class="text-button">重置原型</button></footer>
    </main>
  `;

  document.querySelector<HTMLButtonElement>('#cultivate')?.addEventListener('click', () => {
    settleNow();
    save.player.isCultivating = !save.player.isCultivating;
    save.lastSettledAt = Date.now();
    offlineSummary = save.player.isCultivating ? '已開始閉關修煉。' : '已停止修煉。';
    persist();
    render();
  });

  document.querySelector<HTMLButtonElement>('#breakthrough')?.addEventListener('click', () => {
    if (save.player.realmId !== 'mortal' || save.player.cultivationProgress < 100) return;
    // Prototype-only deterministic transition; canon-accurate breakthrough rules are not yet specified.
    save.player.realmId = 'qi_refining';
    save.player.realmStage = 1;
    save.player.cultivationProgress = 0;
    offlineSummary = '原型測試：已完成一次手動突破。正式規則待原著考證。';
    persist();
    render();
  });

  document.querySelector<HTMLButtonElement>('#explore')?.addEventListener('click', () => {
    if (save.eventFlags['herb-spring-found']) return;
    save.player.herbs += 1;
    save.eventFlags['herb-spring-found'] = true;
    offlineSummary = '探索結果：取得靈草 1 株，事件已記錄。';
    persist();
    render();
  });

  document.querySelector<HTMLInputElement>('#player-name')?.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    save.player.name = target.value.trim() || '修仙者';
    persist();
    render();
  });

  document.querySelector<HTMLButtonElement>('#reset')?.addEventListener('click', () => {
    if (!window.confirm('確定要重置新原型的存檔嗎？舊版遊戲存檔不會受到影響。')) return;
    try {
      localStorage.removeItem(SAVE_KEY);
      saveBlocked = false;
      storageWarning = '';
      offlineSummary = '';
      save = createSave(createInitialPlayer(), Date.now());
      writeSave(save);
      render();
    } catch {
      storageWarning = '無法清除本機存檔，請到瀏覽器網站資料設定手動處理。';
      render();
    }
  });
}

function settleNow(): void {
  const result = settleOfflineCultivation(save.player, save.lastSettledAt, Date.now());
  save.player = result.player;
  save.lastSettledAt = result.lastSettledAt;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char] ?? char);
}

render();
