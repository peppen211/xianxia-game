import { describe, it, expect } from "vitest";
import { newSave, cultivate, breakthrough, summon, maxProgress, SUMMON_COST, buyPill, PILL_COST, validateSave, load, persist, wipe, enterGame, OFFLINE_CAP_MINUTES } from "./logic";

describe("game rules", () => {
  it("invalid local collections cannot block play", () => {
    const s = validateSave({ chars: null, pets: null, artifacts: null, stones: -1 });
    expect(cultivate(s).progress).toBe(10);
    expect(s.pets).toEqual(["gui"]);
    expect(s.artifacts).toEqual(["jing"]);
    expect(s.chars['xiao']).toBe(1);
    expect(s.stones).toBe(0);
  });
  it("buys a pill only with enough stones", () => {
    expect(buyPill(newSave()).pills).toBe(1);
    expect(buyPill({ ...newSave(), stones: PILL_COST })).toMatchObject({ stones: 0, pills: 2 });
  });
  it("artifact and pet bonuses apply to cultivation", () => {
    const s = cultivate({ ...newSave(), pets: ["he"], artifacts: ["jian"] });
    expect(s.progress).toBe(12);
    expect(s.stones).toBe(6);
  });
  it("local save reloads cultivation and all collections", () => {
    const s = { ...cultivate(newSave()), chars: { xiao: 1, lin: 2 }, artifacts: ["jian"], pets: ["he"] };
    persist(s);
    expect(load()).toEqual(s);
    wipe();
    const resetAt = new Date("2026-10-23T00:00:00Z");
    expect(load(resetAt)).toEqual(newSave(resetAt));
  });
  it("offline gains are capped at eight hours and update the last-seen timestamp", () => {
    const start = new Date("2026-10-20T00:00:00Z");
    const s = { ...newSave(start), level: 20 };
    const resumed = enterGame(s, new Date(start.getTime() + 10 * 60 * 60 * 1000));
    expect(resumed.progress).toBe(OFFLINE_CAP_MINUTES * 2);
    expect(resumed.stones).toBe(OFFLINE_CAP_MINUTES);
    expect(resumed.lastSeenAt).toBe(start.getTime() + 10 * 60 * 60 * 1000);
  });
  it("offline progress never exceeds the current realm cap", () => {
    const start = new Date("2026-10-20T00:00:00Z");
    const s = { ...newSave(start), progress: maxProgress(0) - 1 };
    const resumed = enterGame(s, new Date(start.getTime() + 60 * 60 * 1000));
    expect(resumed.progress).toBe(maxProgress(0));
  });
  it("cultivate gains progress and stones", () => {
    const s = cultivate(newSave());
    expect(s.progress).toBe(10);
    expect(s.stones).toBe(5);
  });
  it("breakthrough locked until full progress", () => {
    expect(breakthrough(newSave(), 0).save.level).toBe(0);
  });
  it("successful breakthrough advances realm", () => {
    const s = { ...newSave(), progress: maxProgress(0) };
    const r = breakthrough(s, 0);
    expect(r.ok).toBe(true);
    expect(r.save.level).toBe(1);
  });
  it("failed breakthrough keeps realm", () => {
    const s = { ...newSave(), progress: maxProgress(0) };
    const r = breakthrough(s, 0.99);
    expect(r.ok).toBe(false);
    expect(r.save.level).toBe(0);
  });
  it("summon spends stones", () => {
    const r = summon({ ...newSave(), stones: SUMMON_COST }, 0.05);
    expect(r.save.stones).toBe(0);
    expect(r.got?.id).toBe("lin");
    expect(summon(newSave(), 0).got).toBeUndefined();
  });
});