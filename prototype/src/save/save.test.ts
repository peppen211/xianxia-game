import { describe, expect, it } from 'vitest';
import { createInitialPlayer, createSave, validateSave, writeSave, readSave, SAVE_KEY } from './save';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

describe('versioned prototype save', () => {
  it('creates and round-trips a valid save', () => {
    const storage = memoryStorage();
    const save = createSave(createInitialPlayer('測試道友'), 1234);
    writeSave(save, storage);
    expect(storage.getItem(SAVE_KEY)).not.toBeNull();
    expect(readSave(storage)).toEqual(save);
  });

  it('rejects an unsupported schema version', () => {
    const save = createSave(createInitialPlayer(), 1234);
    expect(validateSave({ ...save, schemaVersion: 99 })).toBe(false);
  });

  it('rejects negative resources and progress', () => {
    const save = createSave(createInitialPlayer(), 1234);
    expect(validateSave({ ...save, player: { ...save.player, herbs: -1 } })).toBe(false);
    expect(validateSave({ ...save, player: { ...save.player, cultivationProgress: -1 } })).toBe(false);
  });

  it('does not treat malformed JSON as a valid save', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, '{bad json');
    expect(readSave(storage)).toBeNull();
  });
});
