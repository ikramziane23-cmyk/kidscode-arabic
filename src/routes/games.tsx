import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Gamepad2, Star, RotateCcw, Volume2 } from "lucide-react";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "ألعاب الحروف القرآنية — تعلم باللعب | Ikram Kids" },
      { name: "description", content: "ألعاب تعليمية ممتعة لتعليم الأطفال الحروف القرآنية: اختر الحرف الصحيح واربح النجوم." },
      { property: "og:title", content: "ألعاب الحروف القرآنية — تعلم باللعب" },
      { property: "og:description", content: "ألعاب تعليمية ممتعة لتعليم الأطفال الحروف القرآنية وربح النجوم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Games,
});

const questions = [
  { word: "بَطَّة", emoji: "🦆", correct: "ب", options: ["ب", "ت", "د"] },
  { word: "أَسَد", emoji: "🦁", correct: "أ", options: ["ح", "أ", "ع"] },
  { word: "قَمَر", emoji: "🌙", correct: "ق", options: ["ف", "م", "ق"] },
  { word: "شَمْس", emoji: "☀️", correct: "ش", options: ["س", "ش", "ص"] },
  { word: "نَحْلَة", emoji: "🐝", correct: "ن", options: ["ن", "ل", "ر"] },
  { word: "تُفَّاحَة", emoji: "🍎", correct: "ت", options: ["ث", "ت", "ط"] },
  { word: "جَمَل", emoji: "🐪", correct: "ج", options: ["خ", "ح", "ج"] },
  { word: "مُزْهِرِيَّة", emoji: "🏺", correct: "م", options: ["م", "و", "ي"] },
];

const optionColors = ["bg-kid-red", "bg-kid-blue", "bg-kid-green"];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function Games() {
  const [round, setRound] = useState(0);
  const [stars, setStars] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const q = questions[round % questions.length]!;
  const options = useMemo(() => shuffle(q.options), [round]); // eslint-disable-line react-hooks/exhaustive-deps

  const speak = () => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(q.word);
      u.lang = "ar-SA";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  };

  const pick = (letter: string) => {
    if (picked) return;
    setPicked(letter);
    if (letter === q.correct) setStars((s) => s + 1);
    setTimeout(() => {
      setPicked(null);
      if (round + 1 >= questions.length) setDone(true);
      else setRound((r) => r + 1);
    }, 900);
  };

  const restart = () => { setRound(0); setStars(0); setPicked(null); setDone(false); };

  return (
    <div dir="rtl" className="min-h-screen bg-hero font-body text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition-transform hover:scale-105">
            <ArrowRight className="h-4 w-4" /> العودة للرئيسية
          </Link>
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-kid-orange">
            <Gamepad2 className="h-6 w-6" /> ألعاب الحروف القرآنية
          </h1>
          <span className="flex items-center gap-1 rounded-full bg-kid-yellow/30 px-4 py-2 font-display text-lg font-extrabold text-kid-orange">
            <Star className="h-5 w-5 fill-kid-yellow text-kid-orange" /> {stars}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 text-center">
        {done ? (
          <div className="rounded-[2rem] border border-border bg-card p-10 shadow-xl">
            <div className="text-7xl">🏆</div>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-kid-purple">أحسنت يا بطل!</h2>
            <p className="mt-3 text-lg font-bold text-muted-foreground">
              جمعت {stars} من {questions.length} نجوم {stars === questions.length ? "— نتيجة مثالية! 🌟" : "— حاول مجددًا لجمع كل النجوم!"}
            </p>
            <button onClick={restart} className="mt-6 inline-flex items-center gap-2 rounded-full bg-kid-green px-8 py-3 font-display text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
              <RotateCcw className="h-5 w-5" /> العب من جديد
            </button>
          </div>
        ) : (
          <>
            <p className="text-lg font-bold text-muted-foreground">
              السؤال {round + 1} من {questions.length} — ما هو الحرف الأول في هذه الكلمة؟
            </p>

            <div className="mt-6 rounded-[2rem] border border-border bg-card p-8 shadow-xl">
              <div className="text-8xl">{q.emoji}</div>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="font-display text-4xl font-extrabold text-foreground">{q.word}</span>
                <button onClick={speak} aria-label="استمع للكلمة" className="icon-btn transition-transform hover:scale-110">
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                {options.map((letter, i) => {
                  const isCorrect = picked && letter === q.correct;
                  const isWrong = picked === letter && letter !== q.correct;
                  return (
                    <button
                      key={letter}
                      onClick={() => pick(letter)}
                      className={`h-20 w-20 rounded-3xl font-display text-4xl font-extrabold text-primary-foreground shadow-lg transition-all hover:scale-110 active:scale-95 ${optionColors[i % optionColors.length]} ${
                        isCorrect ? "ring-4 ring-kid-green scale-110" : isWrong ? "opacity-40 ring-4 ring-destructive" : ""
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              {picked && (
                <p className={`mt-6 font-display text-2xl font-extrabold ${picked === q.correct ? "text-kid-green" : "text-destructive"}`}>
                  {picked === q.correct ? "رائع! إجابة صحيحة 🎉" : `حاول مرة أخرى! الحرف الصحيح هو «${q.correct}»`}
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
