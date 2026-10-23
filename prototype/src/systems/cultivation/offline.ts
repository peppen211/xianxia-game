import type { OfflineSettlement, PlayerState } from '../../core/types';

export const MAX_OFFLINE_SECONDS = 12 * 60 * 60;
export const PSEUDO_ROOT_CULTIVATION_PER_HOUR = 10 * 0.78;

export function settleOfflineCultivation(
  player: PlayerState,
  lastSettledAt: number,
  now: number,
): { player: PlayerState; lastSettledAt: number; summary: OfflineSettlement } {
  const rawSeconds = Math.max(0, Math.floor((now - lastSettledAt) / 1000));
  const elapsedSeconds = Math.min(rawSeconds, MAX_OFFLINE_SECONDS);
  const capped = rawSeconds > MAX_OFFLINE_SECONDS;
  const cultivationGained = player.isCultivating
    ? (elapsedSeconds / 3600) * PSEUDO_ROOT_CULTIVATION_PER_HOUR
    : 0;

  return {
    player: {
      ...player,
      cultivationProgress: Math.max(0, player.cultivationProgress + cultivationGained),
    },
    // Always advance the settlement marker to prevent the same interval being paid twice.
    lastSettledAt: Math.max(lastSettledAt, now),
    summary: { elapsedSeconds, cultivationGained, capped },
  };
}
