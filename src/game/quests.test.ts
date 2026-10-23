import { describe, expect, it } from "vitest";
import { breakthrough, claimReward, cultivate, enterGame, explore, load, newSave, persist, summon, validateSave } from "./logic";
import { taiwanDay } from "./quests";

const today = new Date("2026-10-23T15:59:59Z");
const tomorrow = new Date("2026-10-23T16:00:00Z");
describe("v0.7 daily tasks and achievements", () => {
  it("Taiwan date rolls over at local midnight", () => {
    expect(taiwanDay(today)).toBe("2026-10-23");
    expect(taiwanDay(tomorrow)).toBe("2026-10-24");
  });
  it("login completes once and rewards cannot be claimed twice", () => {
    const s = enterGame(enterGame(newSave(today), today), today);
    expect(s.quests.daily['login']).toBe(1);
    const paid = claimReward(s, "daily", "daily-login", today);
    expect(paid.stones).toBe(20);
    expect(claimReward(paid, "daily", "daily-login", today)).toEqual(paid);
  });
  it("incomplete and unknown rewards award nothing", () => {
    const s = newSave(today);
    expect(claimReward(s, "daily", "daily-cultivate", today).stones).toBe(0);
    expect(claimReward(s, "daily", "unknown", today).stones).toBe(0);
  });
  it("10 actual cultivation actions complete daily cultivation", () => {
    let s = newSave(today);
    for (let i = 0; i < 9; i++) s = cultivate(s, today);
    expect(claimReward(s, "daily", "daily-cultivate", today).stones).toBe(45);
    s = cultivate(s, today);
    const paid = claimReward(s, "daily", "daily-cultivate", today);
    expect(paid.stones).toBe(100);
    expect(paid.pills).toBe(2);
  });
  it("blocked breakthroughs do not count, actual failure and success count", () => {
    expect(breakthrough(newSave(today), 0, today).save.quests.daily['breakthrough']).toBeUndefined();
    const ready = { ...newSave(today), progress: 100 };
    const failed = breakthrough(ready, 0.99, today).save;
    expect(failed.quests.daily['breakthrough']).toBe(1);
    expect(failed.quests.lifetime['ascend']).toBeUndefined();
    expect(breakthrough(ready, 0, today).save.quests.lifetime['ascend']).toBe(1);
  });
  it("paid exploration counts and gives the actual encounter reward", () => {
    expect(explore(newSave(today), 0, today).save.quests.daily['explore']).toBeUndefined();
    let s = { ...newSave(today), stones: 100 };
    for (let i = 0; i < 3; i++) s = explore(s, 0.9, today).save;
    expect(s.stones).toBe(115);
    expect(s.quests.daily['explore']).toBe(3);
    expect(claimReward(s, "daily", "daily-explore", today).stones).toBe(155);
    expect(explore(s, 0, today).save.pills).toBe(2);
  });
  it("daily rollover clears claims and counts but retains permanent rewards", () => {
    let s = newSave(today);
    for (let i = 0; i < 100; i++) s = cultivate(s, today);
    s = claimReward(enterGame(s, today), "daily", "daily-login", today);
    s = claimReward(s, "achievement", "ach-cultivate", today);
    expect(s.quests.lifetime['cultivate']).toBe(100);
    const next = enterGame(s, tomorrow);
    expect(next.quests.daily['cultivate']).toBeUndefined();
    expect(next.quests.dailyClaimed).toEqual([]);
    expect(next.quests.achievementClaimed).toEqual(["ach-cultivate"]);
    expect(claimReward(next, "achievement", "ach-cultivate", tomorrow).stones).toBe(s.stones);
    expect(claimReward(next, "daily", "daily-login", tomorrow).stones).toBe(s.stones + 20);
  });
  it("refresh preserves counters and reward claims", () => {
    const s = claimReward(cultivate(enterGame(newSave(today), today), today), "daily", "daily-login", today);
    persist(s);
    expect(load(today)).toEqual(s);
    expect(claimReward(load(today), "daily", "daily-login", today).stones).toBe(25);
  });
  it("old and corrupt saves recover without losing valid gameplay", () => {
    const s = validateSave({ level: 2, stones: 123, quests: { day: "bad", daily: null, lifetime: { cultivate: -5 }, dailyClaimed: ["unknown"], achievementClaimed: null } }, today);
    expect(s.level).toBe(2);
    expect(s.stones).toBe(123);
    expect(s.quests.dailyClaimed).toEqual([]);
    expect(cultivate(s, today).quests.lifetime['cultivate']).toBe(1);
    expect(validateSave({ stones: 88 }, today).stones).toBe(88);
  });
  it("successful summons progress achievements, unaffordable ones do not", () => {
    expect(summon(newSave(today), 0, today).save.quests.lifetime['summon']).toBeUndefined();
    expect(summon({ ...newSave(today), stones: 100 }, 0, today).save.quests.lifetime['summon']).toBe(1);
  });
});