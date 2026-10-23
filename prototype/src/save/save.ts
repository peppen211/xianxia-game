import type { PlayerState, SaveEnvelope } from '../core/types';

export const SAVE_KEY = 'xianxiaPrototypeSaveV1';
export const GAME_VERSION = '0.1.0';

export function createInitialPlayer(name = '修仙者'): PlayerState {
  return {
    name: name.trim() || '修仙者',
    spiritualRootId: 'four_attribute_pseudo',
    realmId: 'mortal',
    realmStage: 0,
    cultivationProgress: 0,
    spiritStones: 0,
    herbs: 0,
    isCultivating: false,
  };
}

export function createSave(player: PlayerState, now = Date.now()): SaveEnvelope {
  return {
    schemaVersion: 1,
    gameVersion: GAME_VERSION,
    savedAt: now,
    lastSettledAt: now,
    player: { ...player },
    eventFlags: {},
  };
}

export function validateSave(value: unknown): value is SaveEnvelope {
  if (!value || typeof value !== 'object') return false;
  const save = value as Partial<SaveEnvelope>;
  if (save.schemaVersion !== 1 || typeof save.savedAt !== 'number') return false;
  if (typeof save.lastSettledAt !== 'number' || !save.player || typeof save.player !== 'object') return false;
  const player = save.player as Partial<PlayerState>;
  return typeof player.name === 'string'
    && player.spiritualRootId === 'four_attribute_pseudo'
    && (player.realmId === 'mortal' || player.realmId === 'qi_refining')
    && typeof player.realmStage === 'number'
    && Number.isFinite(player.cultivationProgress)
    && player.cultivationProgress >= 0
    && Number.isFinite(player.spiritStones)
    && player.spiritStones >= 0
    && Number.isFinite(player.herbs)
    && player.herbs >= 0
    && typeof player.isCultivating === 'boolean'
    && !!save.eventFlags
    && typeof save.eventFlags === 'object';
}

export function readSave(storage: Pick<Storage, 'getItem'> = localStorage): SaveEnvelope | null {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return validateSave(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSave(
  save: SaveEnvelope,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  if (!validateSave(save)) throw new Error('拒絕寫入格式不正確的存檔。');
  storage.setItem(SAVE_KEY, JSON.stringify(save));
}
