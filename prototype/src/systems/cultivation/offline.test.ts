import { describe, expect, it } from 'vitest';
import { createInitialPlayer } from '../../save/save';
import { MAX_OFFLINE_SECONDS, settleOfflineCultivation } from './offline';

describe('settleOfflineCultivation', () => {
  it('settles an hour once when cultivating', () => {
    const player = { ...createInitialPlayer(), isCultivating: true };
    const result = settleOfflineCultivation(player, 1_000, 3_601_000);
    expect(result.summary.elapsedSeconds).toBe(3600);
    expect(result.summary.cultivationGained).toBeCloseTo(7.8);
    expect(result.player.cultivationProgress).toBeCloseTo(7.8);
  });

  it('does not create negative progress if the clock moves backwards', () => {
    const player = { ...createInitialPlayer(), isCultivating: true, cultivationProgress: 4 };
    const result = settleOfflineCultivation(player, 5_000, 2_000);
    expect(result.summary.elapsedSeconds).toBe(0);
    expect(result.player.cultivationProgress).toBe(4);
    expect(result.lastSettledAt).toBe(5_000);
  });

  it('caps long offline periods', () => {
    const player = { ...createInitialPlayer(), isCultivating: true };
    const result = settleOfflineCultivation(player, 0, MAX_OFFLINE_SECONDS * 1000 * 2);
    expect(result.summary.capped).toBe(true);
    expect(result.summary.elapsedSeconds).toBe(MAX_OFFLINE_SECONDS);
  });

  it('does not cultivate while paused', () => {
    const result = settleOfflineCultivation(createInitialPlayer(), 0, 3_600_000);
    expect(result.summary.cultivationGained).toBe(0);
  });

  it('does not pay the same interval twice when the settlement timestamp is reused', () => {
    const player = { ...createInitialPlayer(), isCultivating: true };
    const first = settleOfflineCultivation(player, 1_000, 3_601_000);
    const second = settleOfflineCultivation(first.player, first.lastSettledAt, 3_601_000);
    expect(second.summary.elapsedSeconds).toBe(0);
    expect(second.summary.cultivationGained).toBe(0);
    expect(second.player.cultivationProgress).toBeCloseTo(first.player.cultivationProgress);
  });

  it('does not mark the offline cap as exceeded at the exact boundary', () => {
    const player = { ...createInitialPlayer(), isCultivating: true };
    const result = settleOfflineCultivation(player, 0, MAX_OFFLINE_SECONDS * 1000);
    expect(result.summary.elapsedSeconds).toBe(MAX_OFFLINE_SECONDS);
    expect(result.summary.capped).toBe(false);
  });
});
