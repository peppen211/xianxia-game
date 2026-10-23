import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestPanel } from "@/game/QuestPanel";
import {
  ARTIFACTS, CHARACTERS, PETS, PILL_COST, SUMMON_COST, type Rarity, type Save,
  breakthrough, buyPill, canBreak, cultivate, load, maxProgress, newSave, persist,
  pillsNeeded, realmName, successRate, summon, wipe, enterGame, explore, claimReward,
} from "@/game/logic";

export default function App() { return <Game />; }

type Tab = "home" | "chars" | "art" | "pets" | "quests";
const rarityClass: Record<Rarity, string> = { 凡: "text-r-fan border-r-fan/50", 靈: "text-r-ling border-r-ling/60", 仙: "text-r-xian border-r-xian" };

function Game() {
  const [save, setSave] = useState<Save | null>(null);
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [pops, setPops] = useState<{ id: number; text: string }[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const saveRef = useRef<Save | null>(null);
  const startedRef = useRef(false);

  const commitSave = (next: Save) => {
    saveRef.current = next;
    persist(next);
    setSave(next);
  };
  const updateSave = (change: (current: Save) => Save) => {
    const current = saveRef.current;
    if (current) commitSave(change(current));
  };
  useEffect(() => {
    const initial = load();
    saveRef.current = initial;
    setSave(initial);
    const refreshDay = () => {
      const current = saveRef.current;
      if (!current || !startedRef.current) return;
      const next = enterGame(current);
      saveRef.current = next;
      persist(next);
      setSave(next);
    };
    const timer = setInterval(refreshDay, 1000);
    document.addEventListener("visibilitychange", refreshDay);
    window.addEventListener("focus", refreshDay);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", refreshDay); window.removeEventListener("focus", refreshDay); };
  }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);

  if (!save) return <div className="flex min-h-dvh items-center justify-center bg-ink text-gold" role="status">載入遊戲中…</div>;
  const max = maxProgress(save.level);
  const pct = Math.min(100, (save.progress / max) * 100);

  const onCultivate = () => {
    const current = saveRef.current;
    if (!current) return;
    const next = cultivate(current);
    const id = Date.now() + Math.random();
    setPops((p) => [...p.slice(-4), { id, text: `修為 +${next.progress - current.progress}　靈石 +${next.stones - current.stones}` }]);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 900);
    commitSave(next);
  };
  const onBreak = () => {
    const current = saveRef.current;
    if (!current || !canBreak(current)) return;
    const r = breakthrough(current, Math.random());
    commitSave(r.save);
    setToast(r.ok ? { ok: true, text: `不好意思，本座又突破了！\n晉入 ${realmName(r.save.level)}` } : { ok: false, text: "突破失敗……道心微損\n修為倒退三成，丹藥已耗" });
  };
  const onSummon = () => {
    const current = saveRef.current;
    if (!current) return;
    const r = summon(current, Math.random());
    if (!r.got) return;
    commitSave(r.save);
    setToast({ ok: true, text: `【${r.got.rarity}】${r.got.name} 前來投奔！\n「${r.got.title}」` });
  };

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden bg-ink">
      <div aria-hidden="true" className="cultivation-backdrop pointer-events-none fixed inset-0 mx-auto h-full w-full max-w-md" />
      <div className="scene-fade pointer-events-none fixed inset-0 mx-auto max-w-md" />

      <header className="relative z-10 px-5 pt-[max(env(safe-area-inset-top),1rem)] text-center">
        <h1 className="font-brush text-gold-grad text-3xl leading-tight drop-shadow">不好意思，本座又突破了</h1>
        <div className="mt-3 flex justify-center gap-2 text-sm">
          <span className="panel px-3 py-1">💎 靈石 <b className="text-gold">{save.stones}</b></span>
          <span className="panel px-3 py-1">💊 破境丹 <b className="text-jade">{save.pills}</b></span>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {!started && (
          <div className="flex min-h-[60dvh] flex-col items-center justify-end gap-6 pb-8">
            <p className="font-brush text-4xl text-gold">仙途再啟</p>
            <Button variant="gameGold" size="game" className="w-full py-5 text-2xl" onClick={() => { updateSave((current) => enterGame(current)); startedRef.current = true; setStarted(true); }}>開始遊戲</Button>
            <p className="text-xs text-muted-foreground">v0.8.0 · 修行錄</p>
          </div>
        )}
        {started && tab === "home" && (
          <div className="flex min-h-[60dvh] flex-col justify-end gap-4">
            <div className="flex flex-col items-center">
              <div className="pulse-ring flex h-28 w-28 items-center justify-center rounded-full border-2 border-gold bg-ink/70">
                <span className="font-brush text-5xl text-gold">{realmName(save.level).slice(0, 1)}</span>
              </div>
              <p className="mt-3 text-sm tracking-[0.4em] text-muted-foreground">當前境界</p>
              <p className="font-brush text-gold-grad text-4xl">{realmName(save.level)}</p>
            </div>

            <section className="panel p-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-jade">修為</span>
                <span>{save.progress} / {max}</span>
              </div>
              <div role="progressbar" aria-label="修為" aria-valuenow={save.progress} aria-valuemin={0} aria-valuemax={max} className="h-3 overflow-hidden rounded-full bg-ink/80 ring-1 ring-border">
                <div className="bar-jade h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                突破需：修為圓滿 ＋ 破境丹 ×{pillsNeeded(save.level)}　成功率 {Math.round(successRate(save) * 100)}%
              </p>
            </section>

            <div className="relative grid grid-cols-2 gap-3">
              {pops.map((p) => (
                <span key={p.id} className="float-up pointer-events-none absolute -top-6 left-0 right-0 text-center text-sm text-jade">{p.text}</span>
              ))}
              <Button variant="gameGold" size="game" onClick={onCultivate} className="col-span-2 py-5 text-2xl tracking-[0.5em]">修煉</Button>
              <Button variant="gameGold" size="game" onClick={onBreak} disabled={!canBreak(save)} className="py-3 text-lg">⚡ 突破</Button>
              <Button variant="gameGhost" size="game" onClick={() => updateSave(buyPill)} disabled={save.stones < PILL_COST} className="py-3">購丹 {PILL_COST}💎</Button>
            </div>
            <Button variant="gamePlain" size="game" onClick={() => setConfirmReset(true)} className="mx-auto text-xs text-muted-foreground underline underline-offset-4">重置存檔</Button>
          </div>
        )}

        {started && tab === "chars" && (
          <div className="space-y-3">
            <Title>道友名錄</Title>
            <Button variant="gameGold" size="game" onClick={onSummon} disabled={save.stones < SUMMON_COST} className="w-full py-4 text-lg">召喚道友（{SUMMON_COST} 靈石）</Button>
            <p className="text-center text-xs text-muted-foreground">機率：仙 10%・靈 30%・凡 60%</p>
            {CHARACTERS.map((c) => {
              const n = save.chars[c.id] ?? 0;
              return <Card key={c.id} glyph={c.glyph} rarity={c.rarity} name={c.name} sub={c.title} desc={c.desc} owned={n > 0} badge={n > 0 ? `×${n}` : "未得"} />;
            })}
          </div>
        )}

        {started && tab === "art" && (
          <div className="space-y-3">
            <Title>古寶閣</Title>
            {ARTIFACTS.map((a) => <Card key={a.id} glyph={a.glyph} rarity={a.rarity} name={a.name} desc={a.desc} owned={save.artifacts.includes(a.id)} badge={save.artifacts.includes(a.id) ? "已藏" : "未得"} />)}
            <Unlock save={save} updateSave={updateSave} kind="artifacts" />
          </div>
        )}

        {started && tab === "pets" && (
          <div className="space-y-3">
            <Title>靈獸園</Title>
            {PETS.map((a) => <Card key={a.id} glyph={a.glyph} rarity={a.rarity} name={a.name} desc={a.desc} owned={save.pets.includes(a.id)} badge={save.pets.includes(a.id) ? "相伴" : "未遇"} />)}
            <Unlock save={save} updateSave={updateSave} kind="pets" />
          </div>
        )}
        {started && tab === "quests" && <QuestPanel save={save} onClaim={(kind, id) => updateSave((current) => claimReward(current, kind, id))} onExplore={() => {
          const current = saveRef.current;
          if (!current) return;
          const result = explore(current, Math.random());
          commitSave(result.save);
          setToast({ ok: true, text: result.text });
        }} />}
      </main>

      {started && <nav aria-label="遊戲導航" className="fixed bottom-0 left-0 right-0 z-20 mx-auto grid max-w-md grid-cols-5 border-t bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {([["home", "主殿", "殿"], ["chars", "角色", "人"], ["art", "古寶", "寶"], ["pets", "靈寵", "獸"], ["quests", "任務", "錄"]] as const).map(([k, label, g]) => (
          <Button variant="gamePlain" size="game" key={k} aria-current={tab === k ? "page" : undefined} onClick={() => setTab(k)} className={`flex flex-col items-center py-2.5 ${tab === k ? "text-gold" : "text-muted-foreground"}`}>
            <span className={`font-brush text-2xl ${tab === k ? "drop-shadow-[0_0_8px_var(--gold)]" : ""}`}>{g}</span>
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </nav>}

      {toast && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/70 px-8" onClick={() => setToast(null)}>
          <div className={`panel animate-in zoom-in-90 w-full p-6 text-center ${toast.ok ? "" : "border-destructive"}`}>
            <p className={`font-brush whitespace-pre-line text-2xl leading-relaxed ${toast.ok ? "text-gold-grad" : "text-destructive"}`}>{toast.text}</p>
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/80 px-8">
          <div className="panel w-full space-y-4 p-6 text-center">
            <p className="text-lg">確定散功重修？</p>
            <p className="text-sm text-muted-foreground">所有境界、靈石、收藏、任務與成就將永久清除。</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="gamePlain" size="game" className="py-3" onClick={() => setConfirmReset(false)}>取消</Button>
              <Button variant="gameGold" size="game" className="py-3" onClick={() => { wipe(); commitSave(enterGame(newSave())); setConfirmReset(false); setTab("home"); }}>確定重置</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="font-brush text-gold-grad text-center text-3xl">— {children} —</h2>;
}

function Card(p: { glyph: string; rarity: Rarity; name: string; sub?: string; desc: string; owned: boolean; badge: string }) {
  return (
    <div className={`panel flex items-center gap-4 p-4 ${p.owned ? "" : "opacity-50 grayscale"}`}>
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 bg-ink/70 ${rarityClass[p.rarity]}`}>
        <span className="font-brush text-4xl">{p.glyph}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`rounded border px-1.5 text-xs ${rarityClass[p.rarity]}`}>{p.rarity}</span>
          <span className="text-lg font-bold">{p.name}</span>
        </div>
        {p.sub && <p className="text-xs text-jade">{p.sub}</p>}
        <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
      </div>
      <span className="text-sm text-gold">{p.badge}</span>
    </div>
  );
}

function Unlock({ save, updateSave, kind }: { save: Save; updateSave: (change: (current: Save) => Save) => void; kind: "artifacts" | "pets" }) {
  const list = kind === "artifacts" ? ARTIFACTS : PETS;
  const next = list.find((x) => !save[kind].includes(x.id));
  if (!next) return <p className="text-center text-sm text-jade">已全數收集</p>;
  const cost = next.rarity === "仙" ? 300 : next.rarity === "靈" ? 150 : 50;
  return (
    <Button variant="gameGhost" size="game" disabled={save.stones < cost} onClick={() => updateSave((current) => current.stones < cost || current[kind].includes(next.id) ? current : { ...current, stones: current.stones - cost, [kind]: [...current[kind], next.id] })} className="w-full py-3">
      {kind === "artifacts" ? "尋寶" : "結緣"}：{next.name}（{cost} 靈石）
    </Button>
  );
}