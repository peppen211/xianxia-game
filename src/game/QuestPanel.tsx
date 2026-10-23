import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ACHIEVEMENT_GOALS, DAILY_GOALS } from "./quests";
import { EXPLORE_COST, HERB_CRAFT_COST, HERBS_PER_PILL, type Save } from "./logic";

export function QuestPanel({ save, onExplore, onCraft, onClaim }: {
  save: Save; onExplore: () => void; onCraft: () => void; onClaim: (kind: "daily" | "achievement", id: string) => void;
}) {
  const [view, setView] = useState<"daily" | "achievement">("daily");
  const goals = view === "daily" ? DAILY_GOALS : ACHIEVEMENT_GOALS;
  const counts = view === "daily" ? save.quests.daily : save.quests.lifetime;
  const claimed = view === "daily" ? save.quests.dailyClaimed : save.quests.achievementClaimed;
  return <div className="space-y-4">
    <h2 className="font-brush text-gold-grad text-center text-3xl">— 修行錄 —</h2>
    <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="修行紀錄">
      <Button role="tab" aria-selected={view === "daily"} variant={view === "daily" ? "gameGold" : "gameGhost"} size="game" className="py-3" onClick={() => setView("daily")}>每日任務</Button>
      <Button role="tab" aria-selected={view === "achievement"} variant={view === "achievement" ? "gameGold" : "gameGhost"} size="game" className="py-3" onClick={() => setView("achievement")}>永久成就</Button>
    </div>
    <p className="text-center text-xs text-muted-foreground">{view === "daily" ? `${save.quests.day} · 台灣時間每日 00:00 更新` : "修行累積永存 · 獎勵限領一次"}</p>
    <div className="space-y-3" role="tabpanel" aria-label={view === "daily" ? "每日任務" : "永久成就"}>
      {goals.map((goal) => {
        const progress = Math.min(goal.target, counts[goal.activity] ?? 0);
        const done = claimed.includes(goal.id);
        const complete = progress >= goal.target;
        return <article key={goal.id} aria-label={goal.name} className="panel space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-lg text-gold">{goal.name}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{goal.detail}</p>
            </div>
            <span className="shrink-0 text-sm text-jade">{progress} / {goal.target}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink" role="progressbar" aria-label={goal.name} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={goal.target}>
            <div className="bar-jade h-full transition-all" style={{ width: `${100 * progress / goal.target}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-jade">靈石 +{goal.stones}{goal.pills > 0 ? ` · 破境丹 +${goal.pills}` : ""}</p>
            <Button variant={complete && !done ? "gameGold" : "gameGhost"} size="game" className="min-h-11 px-3 py-2" disabled={!complete || done} aria-label={`${goal.name}：${done ? "已領取" : complete ? "領取獎勵" : "尚未完成"}`} onClick={() => onClaim(view, goal.id)}>{done ? "已領取" : complete ? "領取獎勵" : "尚未完成"}</Button>
          </div>
        </article>;
      })}
    </div>
    <section className="space-y-2 border-t pt-4">
      <h3 className="font-brush text-2xl text-gold">雲山探索</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">啟程耗費 {EXPLORE_COST} 靈石 · 採靈得 15 靈石，或奇遇得 5 靈石與破境丹 ×1。</p>
      <Button variant="gameGold" size="game" className="min-h-12 w-full py-3" disabled={save.stones < EXPLORE_COST} onClick={onExplore}>探索雲山（{EXPLORE_COST} 靈石）</Button>
    </section>
    <section className="panel space-y-3 p-4">
      <h3 className="font-brush text-2xl text-gold">靈草丹房</h3>
      <div className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">凝露草庫存</span><span className="text-jade">🌿 {save.herbs} 株</span></div>
      <p className="text-xs leading-relaxed text-muted-foreground">以 {HERBS_PER_PILL} 株凝露草與 {HERB_CRAFT_COST} 靈石煉製一枚破境丹。探索雲山有機會採得靈草。</p>
      <Button variant="gameGold" size="game" className="min-h-12 w-full py-3" disabled={save.herbs < HERBS_PER_PILL || save.stones < HERB_CRAFT_COST} onClick={onCraft}>煉製破境丹（{HERBS_PER_PILL} 草 · {HERB_CRAFT_COST} 靈石）</Button>
    </section>
  </div>;
}