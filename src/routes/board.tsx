import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Eraser, Trash2, Palette, Pencil } from "lucide-react";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [
      { title: "سبورة إكرام — ارسم ولون الحروف | Ikram Kids" },
      { name: "description", content: "سبورة تفاعلية ممتعة يرسم فيها الطفل ويتدرّب على كتابة الحروف العربية بالألوان." },
      { property: "og:title", content: "سبورة إكرام — ارسم ولون الحروف" },
      { property: "og:description", content: "سبورة تفاعلية ممتعة لتعلم كتابة الحروف العربية بالألوان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Board,
});

const colors = [
  { name: "أحمر", value: "#ef4444" },
  { name: "برتقالي", value: "#f97316" },
  { name: "أصفر", value: "#eab308" },
  { name: "أخضر", value: "#22c55e" },
  { name: "أزرق", value: "#3b82f6" },
  { name: "بنفسجي", value: "#a855f7" },
  { name: "وردي", value: "#ec4899" },
  { name: "بني", value: "#92400e" },
];

const practiceLetters = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ر", "س", "ش", "م", "ن", "و", "ي"];

function Board() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(colors[4]!.value);
  const [size, setSize] = useState(8);
  const [letter, setLetter] = useState("ب");
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fffdf5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const pos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = pos(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const stop = () => { drawing.current = false; last.current = null; };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fffdf5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-hero font-body text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition-transform hover:scale-105">
            <ArrowRight className="h-4 w-4" /> العودة للرئيسية
          </Link>
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold text-kid-purple">
            <Palette className="h-6 w-6" /> سبورة إكرام
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-lg font-bold text-muted-foreground">
          اختر حرفًا وتدرّب على رسمه بالألوان فوق السبورة! 🎨
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {practiceLetters.map((l) => (
            <button
              key={l}
              onClick={() => setLetter(l)}
              className={`h-12 w-12 rounded-2xl font-display text-2xl font-extrabold shadow transition-transform hover:scale-110 ${
                letter === l ? "bg-kid-purple text-primary-foreground ring-4 ring-kid-purple/30" : "bg-card text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="relative mx-auto mt-6 max-w-3xl">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="select-none font-display text-[16rem] font-extrabold text-kid-purple/10">{letter}</span>
          </div>
          <canvas
            ref={canvasRef}
            width={900}
            height={520}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={stop}
            onPointerLeave={stop}
            className="w-full touch-none rounded-[2rem] border-8 border-kid-yellow/60 bg-[#fffdf5] shadow-xl"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow">
            <Pencil className="h-4 w-4 text-muted-foreground" />
            {colors.map((c) => (
              <button
                key={c.value}
                aria-label={c.name}
                onClick={() => setColor(c.value)}
                className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${color === c.value ? "ring-4 ring-foreground/20 scale-110" : ""}`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
          <label className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold shadow">
            حجم القلم
            <input type="range" min={3} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} className="accent-kid-purple" />
          </label>
          <button onClick={clear} className="flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 font-bold text-destructive-foreground shadow transition-transform hover:scale-105 active:scale-95">
            <Trash2 className="h-4 w-4" /> مسح السبورة
          </button>
          <span className="flex items-center gap-1 text-sm font-bold text-muted-foreground"><Eraser className="h-4 w-4" /> ارسم بإصبعك أو بالفأرة</span>
        </div>
      </main>
    </div>
  );
}
