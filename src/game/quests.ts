export type Activity = "login" | "cultivate" | "breakthrough" | "explore" | "ascend" | "summon";
export interface Goal {
  id: string; name: string; detail: string; activity: Activity; target: number; stones: number; pills: number;
}
export const DAILY_GOALS: Goal[] = [
  { id: "daily-login", name: "仙途問安", detail: "今日進入遊戲", activity: "login", target: 1, stones: 20, pills: 0 },
  { id: "daily-cultivate", name: "勤修不輟", detail: "修煉 10 次", activity: "cultivate", target: 10, stones: 50, pills: 1 },
  { id: "daily-break", name: "叩問天關", detail: "嘗試突破 1 次（成功或失敗皆計入）", activity: "breakthrough", target: 1, stones: 30, pills: 1 },
  { id: "daily-explore", name: "雲山尋蹤", detail: "探索 3 次", activity: "explore", target: 3, stones: 40, pills: 0 },
];
export const ACHIEVEMENT_GOALS: Goal[] = [
  { id: "ach-cultivate", name: "百煉道心", detail: "累計修煉 100 次", activity: "cultivate", target: 100, stones: 200, pills: 2 },
  { id: "ach-ascend", name: "破境之志", detail: "累計成功突破 3 次", activity: "ascend", target: 3, stones: 150, pills: 3 },
  { id: "ach-explore", name: "踏遍仙山", detail: "累計探索 20 次", activity: "explore", target: 20, stones: 150, pills: 1 },
  { id: "ach-summon", name: "仙緣廣結", detail: "累計召喚 5 次", activity: "summon", target: 5, stones: 100, pills: 1 },
];
export interface QuestState {
  day: string;
  daily: Record<string, number>;
  dailyClaimed: string[];
  lifetime: Record<string, number>;
  achievementClaimed: string[];
}
// Taiwan calendar is fixed across devices; callers inject a date in tests.
export function taiwanDay(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function newQuests(now: Date = new Date()): QuestState {
  return { day: taiwanDay(now), daily: {}, dailyClaimed: [], lifetime: {}, achievementClaimed: [] };
}
export function syncQuests(q: QuestState, now: Date = new Date()): QuestState {
  const day = taiwanDay(now);
  return q.day === day ? q : { ...q, day, daily: {}, dailyClaimed: [] };
}
export function recordActivity(q: QuestState, activity: Activity, now: Date = new Date()): QuestState {
  const current = syncQuests(q, now);
  const dailyTarget = Math.max(0, ...DAILY_GOALS.filter((g) => g.activity === activity).map((g) => g.target));
  const lifetimeTarget = Math.max(0, ...ACHIEVEMENT_GOALS.filter((g) => g.activity === activity).map((g) => g.target));
  return { ...current,
    daily: dailyTarget ? { ...current.daily, [activity]: Math.min(dailyTarget, (current.daily[activity] ?? 0) + 1) } : current.daily,
    lifetime: lifetimeTarget ? { ...current.lifetime, [activity]: Math.min(lifetimeTarget, (current.lifetime[activity] ?? 0) + 1) } : current.lifetime,
  };
}
export function validateQuests(raw: unknown, now: Date = new Date()): QuestState {
  const fresh = newQuests(now);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fresh;
  const data = raw as Record<string, unknown>;
  const counts = (rawCounts: unknown, goals: Goal[]) => {
    const result: Record<string, number> = {};
    if (!rawCounts || typeof rawCounts !== "object" || Array.isArray(rawCounts)) return result;
    const values = rawCounts as Record<string, unknown>;
    for (const g of goals) {
      const n = values[g.activity];
      if (typeof n === "number" && Number.isSafeInteger(n) && n >= 0) result[g.activity] = Math.min(n, g.target);
    }
    return result;
  };
  const daily = counts(data['daily'], DAILY_GOALS);
  const lifetime = counts(data['lifetime'], ACHIEVEMENT_GOALS);
  const claimed = (rawIds: unknown, goals: Goal[], progress: Record<string, number>) => Array.isArray(rawIds)
    ? [...new Set(rawIds.filter((id): id is string => typeof id === "string" && goals.some((g) => g.id === id && (progress[g.activity] ?? 0) >= g.target)))] : [];
  return syncQuests({ day: typeof data['day'] === "string" ? data['day'] : fresh.day, daily, lifetime,
    dailyClaimed: claimed(data['dailyClaimed'], DAILY_GOALS, daily),
    achievementClaimed: claimed(data['achievementClaimed'], ACHIEVEMENT_GOALS, lifetime),
  }, now);
}