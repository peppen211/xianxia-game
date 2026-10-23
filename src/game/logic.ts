import { ACHIEVEMENT_GOALS, DAILY_GOALS, newQuests, recordActivity, syncQuests, validateQuests, type QuestState } from "./quests";

export const REALMS = ["煉氣", "築基", "金丹", "元嬰", "化神", "煉虛", "合體", "大乘", "渡劫", "真仙"];
export const STAGES = ["初期", "中期", "後期", "圓滿"];

export type Rarity = "凡" | "靈" | "仙";
export interface CharDef { id: string; name: string; title: string; rarity: Rarity; glyph: string; desc: string }
export const CHARACTERS: CharDef[] = [
  { id: "lin", name: "林清霜", title: "寒月劍仙", rarity: "仙", glyph: "霜", desc: "一劍寒霜十九州，冷面心熱。" },
  { id: "su", name: "蘇墨白", title: "丹道奇才", rarity: "靈", glyph: "墨", desc: "煉丹必炸爐，炸完必成丹。" },
  { id: "xiao", name: "小石頭", title: "外門雜役", rarity: "凡", glyph: "石", desc: "掃地三十年，不知自己已無敵。" },
];
export const ARTIFACTS = [
  { id: "jian", name: "青冥劍", rarity: "靈" as Rarity, glyph: "劍", desc: "修煉靈石 +1" },
  { id: "ding", name: "九轉丹爐", rarity: "仙" as Rarity, glyph: "鼎", desc: "突破成功率 +10%" },
  { id: "jing", name: "照妖鏡", rarity: "凡" as Rarity, glyph: "鏡", desc: "傳說能照出師尊的私房錢" },
];
export const PETS = [
  { id: "he", name: "仙鶴", rarity: "靈" as Rarity, glyph: "鶴", desc: "修煉進度 +2" },
  { id: "hu", name: "雪狐", rarity: "仙" as Rarity, glyph: "狐", desc: "九尾未成，先學賣萌" },
  { id: "gui", name: "老龜", rarity: "凡" as Rarity, glyph: "龜", desc: "活得比宗門還久" },
];

export interface Save {
  level: number; // realm*4 + stage
  progress: number;
  stones: number;
  pills: number;
  herbs: number;
  chars: Record<string, number>;
  artifacts: string[];
  pets: string[];
  quests: QuestState;
  lastSeenAt: number;
}
export const SUMMON_COST = 100;
export const PILL_COST = 50;

export const newSave = (now: Date = new Date()): Save => ({ level: 0, progress: 0, stones: 0, pills: 1, herbs: 0, chars: { xiao: 1 }, artifacts: ["jing"], pets: ["gui"], quests: newQuests(now), lastSeenAt: now.getTime() });

export const realmName = (lv: number) => {
  const r = Math.min(Math.floor(lv / 4), REALMS.length - 1);
  return (REALMS[r] ?? "") + (lv >= REALMS.length * 4 ? "圓滿" : (STAGES[lv % 4] ?? ""));
};
export const maxProgress = (lv: number) => Math.round(100 * Math.pow(1.35, lv));
export const pillsNeeded = (lv: number) => Math.floor(lv / 4) + 1;
export const successRate = (s: Save) => Math.min(0.95, Math.max(0.3, 0.8 - Math.floor(s.level / 4) * 0.06) + (s.artifacts.includes("ding") ? 0.1 : 0));

export function cultivate(s: Save, now: Date = new Date()): Save {
  const gain = 10 + s.level * 3 + (s.pets.includes("he") ? 2 : 0);
  const stones = 5 + Math.floor(s.level / 2) + (s.artifacts.includes("jian") ? 1 : 0);
  return { ...s, progress: Math.min(maxProgress(s.level), s.progress + gain), stones: s.stones + stones, quests: recordActivity(s.quests, "cultivate", now) };
}
export const canBreak = (s: Save) => s.progress >= maxProgress(s.level) && s.pills >= pillsNeeded(s.level);

export function breakthrough(s: Save, roll: number, now: Date = new Date()): { save: Save; ok: boolean } {
  if (!canBreak(s)) return { save: s, ok: false };
  const pills = s.pills - pillsNeeded(s.level);
  const quests = recordActivity(s.quests, "breakthrough", now);
  if (roll < successRate(s)) return { ok: true, save: { ...s, pills, level: s.level + 1, progress: 0, quests: recordActivity(quests, "ascend", now) } };
  return { ok: false, save: { ...s, pills, progress: Math.floor(maxProgress(s.level) * 0.7), quests } };
}
export function buyPill(s: Save): Save {
  return s.stones < PILL_COST ? s : { ...s, stones: s.stones - PILL_COST, pills: s.pills + 1 };
}
const pick = <T extends { rarity: Rarity }>(list: T[], roll: number) => {
  const r: Rarity = roll < 0.1 ? "仙" : roll < 0.4 ? "靈" : "凡";
  const result = list.find((c) => c.rarity === r);
  if (!result) throw new Error("找不到此品質的收藏");
  return result;
};
export function summon(s: Save, roll: number, now: Date = new Date()): { save: Save; got?: CharDef } {
  if (s.stones < SUMMON_COST) return { save: s };
  const got = pick(CHARACTERS, roll);
  return { got, save: { ...s, stones: s.stones - SUMMON_COST, chars: { ...s.chars, [got.id]: (s.chars[got.id] ?? 0) + 1 }, quests: recordActivity(s.quests, "summon", now) } };
}

export const OFFLINE_CAP_MINUTES = 8 * 60;
export const OFFLINE_PROGRESS_PER_MINUTE = 2;
export const OFFLINE_STONES_PER_MINUTE = 1;

export function enterGame(s: Save, now: Date = new Date()): Save {
  const nowMs = now.getTime();
  const previous = Number.isSafeInteger(s.lastSeenAt) && s.lastSeenAt > 0 ? s.lastSeenAt : nowMs;
  const elapsedMinutes = Math.min(OFFLINE_CAP_MINUTES, Math.max(0, Math.floor((nowMs - previous) / 60_000)));
  const progressGain = Math.min(maxProgress(s.level) - s.progress, elapsedMinutes * OFFLINE_PROGRESS_PER_MINUTE);
  const stoneGain = elapsedMinutes * OFFLINE_STONES_PER_MINUTE;
  const alreadyLoggedInToday = s.quests.day === (recordActivity(s.quests, "login", now).day) && (s.quests.daily.login ?? 0) > 0;
  const quests = alreadyLoggedInToday ? syncQuests(s.quests, now) : recordActivity(s.quests, "login", now);
  return { ...s, progress: s.progress + Math.max(0, progressGain), stones: s.stones + stoneGain, quests, lastSeenAt: nowMs };
}
export const EXPLORE_COST = 10;
export function explore(s: Save, roll: number, now: Date = new Date()): { save: Save; text: string } {
  const current = { ...s, quests: syncQuests(s.quests, now) };
  if (s.stones < EXPLORE_COST) return { save: current, text: "靈石不足，無法啟程。" };
  const rare = roll < 0.2;
  const herbFound = !rare && roll < 0.5;
  const stones = rare || herbFound ? 5 : 15;
  return {
    save: {
      ...current,
      stones: s.stones - EXPLORE_COST + stones,
      pills: s.pills + (rare ? 1 : 0),
      herbs: s.herbs + (herbFound ? 1 : 0),
      quests: recordActivity(current.quests, "explore", now),
    },
    text: rare ? "雲山奇遇：尋得破境丹 ×1、靈石 +5" : herbFound ? "靈脈旁採得凝露草 ×1、靈石 +5" : "山間採靈：尋得靈石 +15",
  };
}
export const HERB_CRAFT_COST = 20;
export const HERBS_PER_PILL = 3;
export function craftPill(s: Save): Save {
  if (s.stones < HERB_CRAFT_COST || s.herbs < HERBS_PER_PILL) return s;
  return { ...s, stones: s.stones - HERB_CRAFT_COST, herbs: s.herbs - HERBS_PER_PILL, pills: s.pills + 1 };
}

export function claimReward(s: Save, kind: "daily" | "achievement", id: string, now: Date = new Date()): Save {
  const quests = syncQuests(s.quests, now);
  const goals = kind === "daily" ? DAILY_GOALS : ACHIEVEMENT_GOALS;
  const key = kind === "daily" ? "dailyClaimed" : "achievementClaimed";
  const progress = kind === "daily" ? quests.daily : quests.lifetime;
  const goal = goals.find((g) => g.id === id);
  if (!goal || quests[key].includes(id) || (progress[goal.activity] ?? 0) < goal.target) return { ...s, quests };
  return { ...s, stones: s.stones + goal.stones, pills: s.pills + goal.pills, quests: { ...quests, [key]: [...quests[key], id] } };
}

const KEY = "buhaoyisi-save-v1";
export function load(now: Date = new Date()): Save {
  try { const raw = localStorage.getItem(KEY); if (raw) return validateSave(JSON.parse(raw), now); } catch {}
  return newSave(now);
}
export function validateSave(raw: unknown, now: Date = new Date()): Save {
  const fresh = newSave(now);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fresh;
  const data = raw as Record<string, unknown>;
  const number = (key: string, fallback: number) => typeof data[key] === "number" && Number.isSafeInteger(data[key]) && (data[key] as number) >= 0 ? data[key] as number : fallback;
  const level = Math.min(REALMS.length * 4, number("level", fresh.level));
  const chars: Record<string, number> = { ...fresh.chars };
  if (data['chars'] && typeof data['chars'] === "object" && !Array.isArray(data['chars'])) {
    const stored = data['chars'] as Record<string, unknown>;
    for (const c of CHARACTERS) {
      const count = stored[c.id];
      if (typeof count === "number" && Number.isSafeInteger(count) && count >= 0) chars[c.id] = count;
    }
  }
  const ids = (key: string, known: { id: string }[], fallback: string[]) => Array.isArray(data[key]) ? [...new Set((data[key] as unknown[]).filter((id): id is string => typeof id === "string" && known.some((item) => item.id === id)))] : fallback;
  return { level, progress: Math.min(number("progress", fresh.progress), maxProgress(level)), stones: number("stones", fresh.stones), pills: number("pills", fresh.pills), herbs: number("herbs", fresh.herbs), chars, artifacts: ids("artifacts", ARTIFACTS, fresh.artifacts), pets: ids("pets", PETS, fresh.pets), quests: validateQuests(data['quests'], now), lastSeenAt: number("lastSeenAt", now.getTime()) };
}
export const persist = (s: Save) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
export const wipe = () => { try { localStorage.removeItem(KEY); } catch {} };