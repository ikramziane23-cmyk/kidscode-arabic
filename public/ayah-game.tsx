import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, Lightbulb, RotateCcw, Search, Star, Trophy, Volume2, VolumeX } from "lucide-react";
import {
  buildQuestion,
  clearProgress,
  loadDone,
  loadProgress,
  loadSurahs,
  markDone,
  normalizeArabic,
  questionCount,
  ratingFor,
  saveProgress,
  TOTAL_SURAHS,
  type Surah,
} from "@/lib/ayah-game";
import { playCelebration, playCorrect, playWrong, stopCelebration } from "@/lib/game-sounds";

export const Route = createFileRoute("/ayah-game")({
  validateSearch: (search: Record<string, unknown>): { surah?: number } => {
    const n = Number(search.surah);
    return Number.isInteger(n) && n >= 1 && n <= TOTAL_SURAHS ? { surah: n } : {};
  },
  head: () => ({
    meta: [
      { title: "لعبة أكمل الآية — مصحف ورش | Ikram Kids" },
      { name: "description", content: "لعبة تعليمية لحفظ القرآن الكريم برواية ورش: اختر الآية التي تأتي بعد الآية المعروضة، وأتمّ السورة لتفوز بالاحتفال." },
      { property: "og:title", content: "لعبة أكمل الآية — مصحف ورش" },
      { property: "og:description", content: "اختر الآية التالية في كل سورة وأتمّ السورة لتحتفل!" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AyahGame,
});

const FONT_CSS = `
@font-face { font-family: "UthmanicWarsh"; src: url("/fonts/UthmanicWarsh.woff2") format("woff2"); font-display: swap; }
.warsh { font-family: "UthmanicWarsh", "Amiri", "Scheherazade New", serif; line-height: 2.1; }
@keyframes ayah-fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9; } }
@keyframes ayah-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes ayah-pop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
.ayah-confetti { position: fixed; top: 0; width: 10px; height: 16px; border-radius: 2px; pointer-events: none; z-index: 60; animation: ayah-fall linear forwards; }
.ayah-shake { animation: ayah-shake 0.35s; }
.ayah-pop { animation: ayah-pop 0.5s ease-out both; }
@media (prefers-reduced-motion: reduce) { .ayah-confetti { display: none; } .ayah-shake, .ayah-pop { animation: none; } }
`;

const optionColors = ["bg-kid-blue", "bg-kid-green", "bg-kid-purple"];
const confettiColors = ["#ef4444", "#f59e0b", "#facc15", "#22c55e", "#3b82f6", "#a855f7"];

function sizeClass(text: string) {
  if (text.length > 220) return "text-xl";
  if (text.length > 110) return "text-2xl";
  return "text-3xl";
}

function useSurahs() {
  const [state, setState] = useState<{ data: Surah[] | null; error: boolean }>({ data: null, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setState({ data: null, error: false });
    loadSurahs().then(
      (data) => alive && setState({ data, error: false }),
      () => alive && setState({ data: null, error: true }),
    );
    return () => {
      alive = false;
    };
  }, [attempt]);
  return { ...state, retry: () => setAttempt((a) => a + 1) };
}

function AyahGame() {
  const { surah } = Route.useSearch();
  const { data, error, retry } = useSurahs();

  return (
    <div dir="rtl" className="min-h-screen bg-hero font-body text-foreground">
      <style dangerouslySetInnerHTML={{ __html: FONT_CSS }} />
      {error ? (
        <Shell title="لعبة أكمل الآية" backTo="home">
          <div className="rounded-[2rem] border border-border bg-card p-10 text-center shadow-xl">
            <p className="text-lg font-bold text-destructive">تعذّر تحميل آيات المصحف. تأكد من اتصالك بالإنترنت.</p>
            <button onClick={retry} className="mt-5 rounded-full bg-kid-blue px-8 py-3 font-display text-lg font-bold text-primary-foreground shadow-lg">
              إعادة المحاولة
            </button>
          </div>
        </Shell>
      ) : !data ? (
        <Shell title="لعبة أكمل الآية" backTo="home">
          <p className="py-20 text-center text-lg font-bold text-muted-foreground">جارٍ تحميل المصحف…</p>
        </Shell>
      ) : surah ? (
        <SurahGame key={surah} surahs={data} surahNumber={surah} />
      ) : (
        <SurahPicker surahs={data} />
      )}
    </div>
  );
}

function Shell({
  title,
  backTo,
  right,
  children,
}: {
  title: string;
  backTo: "home" | "list";
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const backClass =
    "flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition-transform hover:scale-105";
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
          {backTo === "home" ? (
            <Link to="/" className={backClass}>
              <ArrowRight className="h-4 w-4" /> الرئيسية
            </Link>
          ) : (
            <Link to="/ayah-game" search={{}} className={backClass}>
              <ArrowRight className="h-4 w-4" /> السور
            </Link>
          )}
          <h1 className="flex items-center gap-2 font-display text-xl font-extrabold text-kid-orange sm:text-2xl">
            <BookOpen className="h-6 w-6" /> {title}
          </h1>
          <div className="flex min-w-[5rem] justify-end">{right}</div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </>
  );
}

// ───────────── صفحة اختيار السورة ─────────────

function SurahPicker({ surahs }: { surahs: Surah[] }) {
  const [query, setQuery] = useState("");
  const [done, setDone] = useState<number[]>([]);
  const [progress, setProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    setDone(loadDone());
    const p: Record<number, number> = {};
    for (const s of surahs) {
      const saved = loadProgress(s.n, questionCount(s));
      if (saved) p[s.n] = saved.step;
    }
    setProgress(p);
  }, [surahs]);

  const q = normalizeArabic(query);
  const list = useMemo(
    () => surahs.filter((s) => !q || normalizeArabic(s.name).includes(q) || String(s.n) === q),
    [surahs, q],
  );

  return (
    <Shell
      title="أكمل الآية"
      backTo="home"
      right={
        <span className="flex items-center gap-1 rounded-full bg-kid-green/20 px-3 py-1.5 text-sm font-extrabold text-kid-green">
          <Check className="h-4 w-4" /> {done.length}/{TOTAL_SURAHS}
        </span>
      }
    >
      <div className="text-center">
        <p className="text-lg font-bold text-muted-foreground">
          اختر سورة، ثم اختر الآية التي تأتي بعد الآية المعروضة — برواية ورش عن نافع
        </p>
        <label className="relative mx-auto mt-5 block max-w-sm">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم السورة أو رقمها"
            className="w-full rounded-full border border-border bg-card py-3 pr-12 pl-4 text-right font-bold shadow-sm outline-none focus:ring-4 focus:ring-kid-blue/30"
          />
        </label>
      </div>

      {list.length === 0 ? (
        <p className="py-16 text-center font-bold text-muted-foreground">لا توجد سورة بهذا الاسم</p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {list.map((s) => {
            const isDone = done.includes(s.n);
            const step = progress[s.n];
            return (
              <li key={s.n}>
                <Link
                  to="/ayah-game"
                  search={{ surah: s.n }}
                  className="relative flex h-full flex-col items-center gap-1 rounded-3xl border border-border bg-card p-4 text-center shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  {isDone && (
                    <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-kid-green text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kid-yellow/40 font-display text-base font-extrabold text-kid-orange">
                    {s.n}
                  </span>
                  <span className="font-display text-xl font-extrabold text-kid-purple">{s.name}</span>
                  <span className="text-xs font-bold text-muted-foreground">{s.ayat.length} آية</span>
                  {!isDone && step ? (
                    <span className="text-xs font-bold text-kid-blue">
                      تابع من الآية {step + 1}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Shell>
  );
}

// ───────────── اللعبة داخل سورة ─────────────

type Feedback = "none" | "correct" | "wrong";

function SurahGame({ surahs, surahNumber }: { surahs: Surah[]; surahNumber: number }) {
  const surahIndex = surahNumber - 1;
  const surah = surahs[surahIndex]!;
  const total = questionCount(surah);

  const [saved] = useState(() => loadProgress(surahNumber, total));
  const [step, setStep] = useState(saved?.step ?? 0);
  const [stars, setStars] = useState(saved?.stars ?? 0);
  const [finished, setFinished] = useState(false);
  const [wrong, setWrong] = useState<number[]>([]);
  const [hint, setHint] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>("none");
  const [locked, setLocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [round, setRound] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopCelebration();
    },
    [],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const question = useMemo(() => (finished ? null : buildQuestion(surahs, surahIndex, step)), [surahs, surahIndex, step, finished, round]);

  const finish = useCallback(
    (finalStars: number) => {
      setStars(finalStars);
      setFinished(true);
      markDone(surahNumber);
      clearProgress(surahNumber);
      if (!muted) playCelebration();
    },
    [surahNumber, muted],
  );

  const pick = (i: number) => {
    if (!question || locked || wrong.includes(i)) return;
    if (i === question.answer) {
      setLocked(true);
      setFeedback("correct");
      if (!muted) playCorrect();
      const newStars = stars + (wrong.length === 0 && !hint ? 1 : 0);
      setStars(newStars);
      timer.current = setTimeout(() => {
        if (step + 1 >= total) {
          finish(newStars);
        } else {
          setStep(step + 1);
          setWrong([]);
          setHint(false);
          setFeedback("none");
          setLocked(false);
          saveProgress(surahNumber, { step: step + 1, stars: newStars });
        }
      }, 1300);
    } else {
      setWrong((w) => [...w, i]);
      setFeedback("wrong");
      if (!muted) playWrong();
    }
  };

  const restart = () => {
    if (timer.current) clearTimeout(timer.current);
    stopCelebration();
    clearProgress(surahNumber);
    setStep(0);
    setStars(0);
    setWrong([]);
    setHint(false);
    setFeedback("none");
    setLocked(false);
    setFinished(false);
    setRound((r) => r + 1);
  };

  const toggleMute = () => {
    if (!muted) stopCelebration();
    setMuted((m) => !m);
  };

  const headerRight = (
    <div className="flex items-center gap-2">
      <button onClick={toggleMute} aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"} className="icon-btn transition-transform hover:scale-110">
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>
      <span className="flex items-center gap-1 rounded-full bg-kid-yellow/30 px-3 py-1.5 font-display text-lg font-extrabold text-kid-orange">
        <Star className="h-5 w-5 fill-kid-yellow text-kid-orange" /> {stars}
      </span>
    </div>
  );

  if (finished) {
    const rating = ratingFor(stars, total);
    return (
      <Shell title={`سورة ${surah.name}`} backTo="list" right={headerRight}>
        <Confetti />
        <div className="ayah-pop rounded-[2rem] border border-border bg-card p-8 text-center shadow-xl sm:p-10">
          <div className="text-7xl">🏆</div>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-kid-purple">مبارك! أتممت سورة {surah.name}</h2>
          <p className="mt-3 text-lg font-bold text-muted-foreground">
            {rating.emoji} {rating.text}
          </p>
          <p className="mt-2 text-lg font-bold text-kid-orange">
            جمعت {stars} من {total} نجوم
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={restart} className="inline-flex items-center gap-2 rounded-full bg-kid-green px-6 py-3 font-display text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
              <RotateCcw className="h-5 w-5" /> أعد السورة
            </button>
            {surahNumber < TOTAL_SURAHS && (
              <Link
                to="/ayah-game"
                search={{ surah: surahNumber + 1 }}
                className="inline-flex items-center gap-2 rounded-full bg-kid-blue px-6 py-3 font-display text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <Trophy className="h-5 w-5" /> السورة التالية: {surahs[surahNumber]!.name}
              </Link>
            )}
            <Link
              to="/ayah-game"
              search={{}}
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 font-display text-lg font-bold text-secondary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              كل السور
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  if (!question) return null;
  const pct = Math.round((step / total) * 100);

  return (
    <Shell title={`سورة ${surah.name}`} backTo="list" right={headerRight}>
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-sm font-bold text-muted-foreground">
          <span>
            السؤال {step + 1} من {total}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-kid-green transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        {saved && step === saved.step && step > 0 && (
          <p className="mt-2 text-center text-sm font-bold text-kid-blue">تابعنا من حيث توقفت في المرة السابقة 👍</p>
        )}
      </div>

      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-xl sm:p-8">
        <p className="text-center text-sm font-bold text-muted-foreground">الآية {step + 1}</p>
        <p className={`warsh mt-2 text-center font-bold text-foreground ${sizeClass(question.given)}`}>{question.given}</p>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="font-display text-lg font-extrabold text-kid-orange">ما الآية التي بعدها؟</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-3">
          {question.options.map((text, i) => {
            const isAnswer = i === question.answer;
            const isWrong = wrong.includes(i);
            const showCorrect = feedback === "correct" && isAnswer;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={locked || isWrong}
                className={`warsh min-h-16 rounded-3xl px-4 py-2 text-center font-bold text-primary-foreground shadow-lg transition-all active:scale-95 ${sizeClass(text)} ${optionColors[i % optionColors.length]} ${
                  showCorrect ? "scale-[1.02] ring-4 ring-kid-yellow" : isWrong ? "ayah-shake opacity-40 ring-4 ring-destructive" : "hover:scale-[1.02]"
                } ${locked && !showCorrect ? "opacity-60" : ""}`}
              >
                {text}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3" aria-live="polite">
          {feedback === "correct" && <p className="ayah-pop font-display text-2xl font-extrabold text-kid-green">أحسنت! إجابة صحيحة 🎉</p>}
          {feedback === "wrong" && <p className="font-display text-xl font-extrabold text-destructive">ليست هذه، حاول مرة أخرى 💪</p>}
          {hint && feedback !== "correct" && (
            <p className="text-lg font-bold text-kid-purple">
              تلميح: تبدأ الآية بكلمة <span className="warsh text-2xl">{question.hintWord}</span>
            </p>
          )}
          {!hint && feedback !== "correct" && (
            <button
              onClick={() => setHint(true)}
              className="inline-flex items-center gap-2 rounded-full bg-kid-yellow/30 px-5 py-2 font-bold text-kid-orange transition-transform hover:scale-105"
            >
              <Lightbulb className="h-5 w-5" /> تلميح
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <button onClick={restart} className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground underline-offset-4 hover:underline">
          <RotateCcw className="h-4 w-4" /> ابدأ السورة من جديد
        </button>
      </div>
    </Shell>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.5 + Math.random() * 2.5,
        color: confettiColors[i % confettiColors.length]!,
      })),
    [],
  );
  return (
    <div aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="ayah-confetti"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
        />
      ))}
    </div>
  );
}
