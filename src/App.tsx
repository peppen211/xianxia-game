import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestPanel } from "@/game/QuestPanel";
import {
  ARTIFACTS, CHARACTERS, PETS, PILL_COST, SUMMON_COST, type Rarity, type Save,
  breakthrough, buyPill, canBreak, cultivate, load, maxProgress, newSave, persist,
  pillsNeeded, realmName, successRate, summon, wipe, enterGame, explore, claimReward, craftPill,
} from "@/game/logic";

export default function App() { return <Game />; }

type Tab = "home" | "battle" | "chars" | "art" | "pets" | "quests";
const rarityClass: Record<Rarity, string> = { 凡: "text-r-fan border-r-fan/50", 靈: "text-r-ling border-r-ling/60", 仙: "text-r-xian border-r-xian" };

function Game() {
  const [save, setSave] = useState<Save | null>(null);
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const [pops, setPops] = useState<{ id: number; text: string }[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [enemyIndex, setEnemyIndex] = useState(0);
  const [enemyHp, setEnemyHp] = useState(45);
  const [playerHp, setPlayerHp] = useState(100);
  const [skillCooldown, setSkillCooldown] = useState(0);
  const [battleLog, setBattleLog] = useState("妖獸現身，請道友出招！");
  const enemies = [{ name: "山野妖狼", hp: 45, reward: 18 }, { name: "迷霧蛇妖", hp: 75, reward: 32 }, { name: "守山石魈", hp: 120, reward: 55 }];
  const battleCycle = Math.floor(enemyIndex / enemies.length);
  const enemyBase = enemies[enemyIndex % enemies.length];
  const enemy = { ...enemyBase, hp: Math.round(enemyBase.hp * (1 + battleCycle * 0.35)), reward: enemyBase.reward + battleCycle * 12 };
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
    const timer = setInterval(refreshDay, 60_000);
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
  const onBattleAttack = (multiplier = 1) => {
    const current = saveRef.current;
    if (!current) return;
    if (playerHp <= 0) { setBattleLog("氣血已盡，請先服用破境丹恢復。"); return; }
    const power = Math.round((12 + current.level * 2 + (current.chars.lin ? 8 : 0) + (current.artifacts.includes("jian") ? 5 : 0)) * multiplier);
    const remaining = Math.max(0, enemyHp - power);
    if (remaining === 0) {
      const reward = enemy.reward;
      updateSave(s => ({ ...s, stones: s.stones + reward, progress: Math.min(maxProgress(s.level), s.progress + reward) }));
      setBattleLog(`擊敗${enemy.name}！獲得靈石 +${reward}、修為 +${reward}。`);
      setEnemyIndex(i => i + 1);
      setEnemyHp(Math.round(enemies[(enemyIndex + 1) % enemies.length].hp * (1 + Math.floor((enemyIndex + 1) / enemies.length) * 0.35)));
      setPlayerHp(hp => Math.min(100, hp + 12));
    } else {
      const counter = 5 + (enemyIndex % enemies.length) * 3 + battleCycle * 2 + Math.floor(current.level / 4);
      const hp = Math.max(0, playerHp - counter);
      setEnemyHp(remaining);
      setPlayerHp(hp);
      setBattleLog(`造成 ${power} 點傷害。妖獸反擊 ${counter} 點，你剩餘氣血 ${hp}。`);
    }
    if (skillCooldown > 0) setSkillCooldown(v => Math.max(0, v - 1));
  };
  const onBattleSkill = () => {
    if (skillCooldown > 0) { setBattleLog(`神通尚需等待 ${skillCooldown} 回合。`); return; }
    setSkillCooldown(3);
    onBattleAttack(2);
  };
  const onBattleRecover = () => {
    setPlayerHp(100);
    setEnemyHp(enemy.hp);
    setBattleLog("調息完畢，氣血恢復，重新挑戰當前妖獸。");
  };
  const onBattleHeal = () => {
    const current = saveRef.current;
    if (!current || current.pills < 1) { setBattleLog("丹藥不足，無法療傷。"); return; }
    if (playerHp >= 100) { setBattleLog("氣血充盈，暫時不需要療傷。"); return; }
    commitSave({ ...current, pills: current.pills - 1 });
    const healed = Math.min(100, playerHp + 35);
    const counter = 5 + enemyIndex * 3;
    setPlayerHp(Math.max(0, healed - counter));
    setBattleLog(`服丹恢復氣血，妖獸趁隙反擊 ${counter} 點。`);
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
        {started && <div className="mt-3 flex justify-center gap-2 text-sm">
          <span className="panel px-3 py-1">💎 靈石 <b className="text-gold">{save.stones}</b></span>
          <span className="panel px-3 py-1">💊 破境丹 <b className="text-jade">{save.pills}</b></span>
        </div>}
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {!started && (
          <div className="flex min-h-[calc(100dvh-12rem)] flex-col items-center justify-center gap-5 pb-8 pt-6 text-center">
            <div className="relative flex w-full flex-col items-center gap-3 py-8">
              <div className="absolute inset-x-6 top-0 h-44 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(210,171,91,0.12),transparent_68%)]" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gold/50 bg-ink/55 shadow-[0_0_48px_rgba(210,171,91,0.16)]">
                <span className="font-brush text-5xl text-gold">道</span>
              </div>
              <p className="relative font-brush text-4xl text-gold-grad">仙途再啟</p>
              <p className="relative max-w-xs text-sm leading-7 tracking-widest text-muted-foreground">凡骨亦可問長生<br />一念入道，踏上無盡仙途</p>
              <div className="relative mt-2 flex items-center gap-3 text-xs text-gold/75">
                <span>修煉問道</span><span>✦</span><span>尋寶結緣</span><span>✦</span><span>逆天破境</span>
              </div>
            </div>
            <Button variant="gameGold" size="game" className="w-full py-5 text-2xl" onClick={() => { updateSave((current) => enterGame(current)); startedRef.current = true; setStarted(true); }}>開始修仙</Button>
            <p className="text-xs tracking-wider text-muted-foreground">v0.9.0 · 戰鬥篇</p>
          </div>
        )}
        {started && tab === "home" && (
          <div className="flex min-h-[60dvh] flex-col justify-end gap-4">
            <section className="realm-banner relative isolate overflow-hidden rounded-2xl px-5 py-5">
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.32em] text-jade/90">IMMORTAL JOURNEY · 仙途</p>
                  <p className="mt-2 font-brush text-2xl text-gold-grad">雲海問道</p>
                  <p className="mt-1 text-xs tracking-widest text-slate-300/80">靈脈流轉，仙路長明</p>
                </div>
                <div className="realm-seal flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-brush text-2xl text-gold">道</div>
              </div>
              <div className="realm-landscape" aria-hidden="true"><span /><span /><span /></div>
              <div className="relative z-10 mt-7 flex items-center justify-between border-t border-gold/20 pt-3 text-xs">
                <span className="text-slate-300/75">修行紀錄</span>
                <span className="text-gold">第 {Math.max(1, save.level + 1)} 重天 · 靈氣充盈</span>
              </div>
            </section>
            <div className="flex flex-col items-center">
              <div className="pulse-ring flex h-28 w-28 items-center justify-center rounded-full border-2 border-gold bg-ink/70">
                <span className="font-brush text-5xl text-gold">{realmName(save.level).slice(0, 1)}</span>
              </div>
              <p className="mt-3 text-sm tracking-[0.4em] text-muted-foreground">當前境界</p>
              <p className="font-brush text-gold-grad text-4xl">{realmName(save.level)}</p>
            </div>

            <section className="panel p-4">
              <div className="mb-3 flex items-center justify-between border-b border-gold/15 pb-3">
                <div><p className="text-[10px] tracking-[0.24em] text-muted-foreground">CULTIVATION</p><p className="mt-1 text-sm text-gold">靈脈運轉</p></div>
                <div className="text-right"><p className="text-[10px] text-muted-foreground">突破機緣</p><p className="mt-1 text-sm text-jade">{Math.round(successRate(save) * 100)}% 成功率</p></div>
              </div>
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
              <p className="mt-2 text-xs text-muted-foreground">靜心自動修行：每分鐘修為 +2、靈石 +1，離線最多累積 8 小時。</p>
            </section>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setTab("battle")} className="realm-shortcut panel flex flex-col items-center gap-1 px-2 py-3 text-center"><span className="text-2xl">⚔</span><span className="text-sm text-gold">斬妖台</span><span className="text-[10px] text-muted-foreground">歷練戰力</span></button>
              <button onClick={() => setTab("chars")} className="realm-shortcut panel flex flex-col items-center gap-1 px-2 py-3 text-center"><span className="text-2xl">✧</span><span className="text-sm text-gold">結交道友</span><span className="text-[10px] text-muted-foreground">招募同伴</span></button>
              <button onClick={() => setTab("quests")} className="realm-shortcut panel flex flex-col items-center gap-1 px-2 py-3 text-center"><span className="text-2xl">☯</span><span className="text-sm text-gold">雲山秘境</span><span className="text-[10px] text-muted-foreground">奇遇尋寶</span></button>
            </div>
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

        {started && tab === "battle" && (
          <div className="space-y-4">
            <Title>斬妖除魔</Title>
            <section className="battle-scene panel relative isolate overflow-hidden space-y-4 p-5 text-center">
              <div className="battle-moon" aria-hidden="true" />
              <div className="relative z-10 flex items-center justify-between text-[10px] tracking-[0.22em] text-slate-300/70"><span>妖域 · 第 {battleCycle + 1} 輪</span><span className="text-red-200">妖獸序列 {enemyIndex + 1}</span></div>
              <div className="monster-stage relative z-10 mx-auto flex h-40 w-full items-center justify-center">
                <div className="monster-aura" aria-hidden="true" />
                <div className="monster-glyph flex h-28 w-28 items-center justify-center rounded-full text-7xl">{enemyIndex % 3 === 0 ? "🐺" : enemyIndex % 3 === 1 ? "🐍" : "🪨"}</div>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.32em] text-red-100/65">✦ 妖氣凝結 ✦</span>
              </div>
              <p className="relative z-10 text-2xl font-bold tracking-widest text-gold-grad">{enemy.name}</p>
              <p className="text-sm text-muted-foreground">妖獸階序 {enemyIndex + 1} · 第 {battleCycle + 1} 輪 · 勝利獎勵 {enemy.reward} 靈石</p>
              <div className="h-3 overflow-hidden rounded-full bg-ink ring-1 ring-border"><div className="h-full rounded-full bg-destructive transition-all" style={{ width: `${Math.max(0, enemyHp / enemy.hp * 100)}%` }} /></div>
              <p className="text-sm">妖獸氣血 {enemyHp} / {enemy.hp}</p>
              <div className="space-y-1 text-left"><div className="flex justify-between text-xs"><span>道友氣血</span><span>{playerHp} / 100</span></div><div className="h-2 overflow-hidden rounded-full bg-ink"><div className="h-full bg-jade transition-all" style={{ width: `${playerHp}%` }} /></div></div>
              {playerHp <= 0 ? <Button variant="gameGold" size="game" className="w-full py-4 text-xl" onClick={onBattleRecover}>🧘 調息重整，再戰一次</Button> : <Button variant="gameGold" size="game" className="w-full py-4 text-xl" onClick={() => onBattleAttack()}>⚔️ 普通攻擊</Button>}
              <div className="grid grid-cols-2 gap-2"><Button variant="gameGhost" size="game" className="py-3" disabled={skillCooldown > 0 || playerHp <= 0} onClick={onBattleSkill}>✦ 裂山斬 {skillCooldown > 0 ? `(${skillCooldown})` : ""}</Button><Button variant="gameGhost" size="game" className="py-3" disabled={save.pills < 1 || playerHp >= 100} onClick={onBattleHeal}>💊 服丹療傷 ({save.pills})</Button></div>
              <p aria-live="polite" className="min-h-12 text-sm leading-6 text-muted-foreground">{battleLog}</p>
            </section>
            <section className="panel p-4 text-sm leading-7 text-muted-foreground">無盡妖域：每擊敗三隻妖獸便進入下一輪。輪數越高，妖獸氣血、反擊與獎勵同步提升。境界、道友與法寶會增強你的戰力。</section>
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
        {started && tab === "quests" && <QuestPanel save={save} onClaim={(kind, id) => updateSave((current) => claimReward(current, kind, id))} onCraft={() => { updateSave(craftPill); setToast({ ok: true, text: "丹爐火候正好！\n破境丹 ×1 已煉成" }); }} onExplore={() => {
          const current = saveRef.current;
          if (!current) return;
          const result = explore(current, Math.random());
          commitSave(result.save);
          setToast({ ok: true, text: result.text });
        }} />}
      </main>

      {started && <nav aria-label="遊戲導航" className="fixed bottom-0 left-0 right-0 z-20 mx-auto grid max-w-md grid-cols-6 border-t bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {([["home", "主殿", "殿"], ["battle", "戰鬥", "戰"], ["chars", "角色", "人"], ["art", "古寶", "寶"], ["pets", "靈寵", "獸"], ["quests", "任務", "錄"]] as const).map(([k, label, g]) => (
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
    <div className={`collection-card panel flex items-center gap-4 p-4 ${p.owned ? "is-owned" : "is-locked opacity-65"}`}>
      <div className={`collection-glyph flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 bg-ink/70 ${rarityClass[p.rarity]}`}>
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