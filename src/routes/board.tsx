import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowRight, Eraser, Trash2, Pencil, ImagePlus, BookOpen, Video, Circle,
  Volume2, VolumeX, Moon, Sun, Undo2, Redo2, ZoomIn, ZoomOut, Maximize,
  Menu, Search, X, Camera, CameraOff,
} from "lucide-react";
import { SURAHS, TOTAL_PAGES, surahForPage, drawMushafPage } from "@/lib/mushaf-data";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [
      { title: "سبورة إكرام — السبورة التفاعلية والمصحف | Ikram Kids" },
      { name: "description", content: "سبورة تفاعلية بخلفية دفتر، أدوات رسم، تكبير، ومصحف ورش التفاعلي للشرح والتظليل." },
      { property: "og:title", content: "سبورة إكرام — السبورة التفاعلية والمصحف" },
      { property: "og:description", content: "سبورة تفاعلية بخلفية دفتر مع مصحف ورش للشرح والتظليل." },
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

const W = 1200;
const H = 750;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;

function Board() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [color, setColor] = useState(colors[4]!.value);
  const [size, setSize] = useState(8);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [zoom, setZoom] = useState(1);
  const [dark, setDark] = useState(false);
  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mushafOpen, setMushafOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [search, setSearch] = useState("");

  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const [historyTick, setHistoryTick] = useState(0);

  const bg = dark ? "#1e293b" : "#fffdf5";

  const paintBackground = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // notebook lines
    ctx.strokeStyle = dark ? "rgba(148,163,184,0.25)" : "rgba(59,130,246,0.18)";
    ctx.lineWidth = 1;
    for (let y = 60; y < canvas.height; y += 44) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    // margin line
    ctx.strokeStyle = "rgba(239,68,68,0.35)";
    ctx.beginPath();
    ctx.moveTo(canvas.width - 70, 0);
    ctx.lineTo(canvas.width - 70, canvas.height);
    ctx.stroke();
  }, [bg, dark]);

  useEffect(() => { paintBackground(); }, [paintBackground]);

  const snapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    undoStack.current.push(canvas.toDataURL());
    if (undoStack.current.length > 40) undoStack.current.shift();
    redoStack.current = [];
    setHistoryTick((t) => t + 1);
  };

  const restore = (dataUrl: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStack.current.length === 0) return;
    redoStack.current.push(canvas.toDataURL());
    restore(undoStack.current.pop()!);
    setHistoryTick((t) => t + 1);
  };

  const redo = () => {
    const canvas = canvasRef.current;
    if (!canvas || redoStack.current.length === 0) return;
    undoStack.current.push(canvas.toDataURL());
    restore(redoStack.current.pop()!);
    setHistoryTick((t) => t + 1);
  };

  const pos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.PointerEvent) => {
    snapshot();
    drawing.current = true;
    last.current = pos(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = tool === "eraser" ? bg : color;
    ctx.lineWidth = tool === "eraser" ? size * 3 : size;
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
    snapshot();
    paintBackground();
  };

  const insertImage = (file: File) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      snapshot();
      const scale = Math.min((canvas.width * 0.7) / img.width, (canvas.height * 0.7) / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const dropMushafOnBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    snapshot();
    const off = document.createElement("canvas");
    off.width = 620;
    off.height = 880;
    drawMushafPage(off.getContext("2d")!, off.width, off.height, page);
    const scale = Math.min((canvas.height * 0.9) / off.height, 1);
    const w = off.width * scale;
    const h = off.height * scale;
    ctx.drawImage(off, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    setMushafOpen(false);
  };

  const toggleCamera = async () => {
    if (camOn) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCamOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
    } catch {
      setCamOn(false);
    }
  };

  const toggleRecord = () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stream = canvas.captureStream(15);
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    chunksRef.current = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "درس-السبورة.webm";
      a.click();
      URL.revokeObjectURL(a.href);
      setRecording(false);
    };
    recorderRef.current = rec;
    rec.start();
    setRecording(true);
  };

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const goToPage = () => {
    const p = Math.min(TOTAL_PAGES, Math.max(1, Number(pageInput) || 1));
    setPage(p);
    setPageInput(String(p));
  };

  const zoomBy = (f: number) => setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z * f).toFixed(2))));

  const filteredSurahs = SURAHS.filter((s) => s.name.includes(search.trim()));

  const iconBtn = "flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow transition-transform hover:scale-110 active:scale-95 border border-border";

  return (
    <div dir="rtl" className={`${dark ? "dark" : ""} min-h-screen bg-background font-body text-foreground`}>
      {/* notebook lined page background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: dark ? "#0f172a" : "#ffffff",
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 35px, ${dark ? "rgba(148,163,184,0.18)" : "rgba(59,130,246,0.15)"} 35px, ${dark ? "rgba(148,163,184,0.18)" : "rgba(59,130,246,0.15)"} 36px)`,
        }}
      />

      {/* Top toolbar */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground transition-transform hover:scale-105">
            <ArrowRight className="h-4 w-4" /> الرئيسية
          </Link>
          <h1 className="font-display text-xl font-extrabold text-kid-purple">سبورة إكرام</h1>

          <div className="mx-auto flex flex-wrap items-center gap-2">
            <button aria-label="إدراج صورة" title="إدراج صورة من الجهاز" onClick={() => fileRef.current?.click()} className={iconBtn}>
              <ImagePlus className="h-5 w-5 text-kid-blue" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) insertImage(f); e.target.value = ""; }} />

            <button aria-label="المصحف الشريف" title="مصحف ورش" onClick={() => setMushafOpen(true)} className={iconBtn}>
              <BookOpen className="h-5 w-5 text-kid-yellow" fill="currentColor" />
            </button>

            <button aria-label="الكاميرا" title="كاميرا المعلم" onClick={toggleCamera} className={iconBtn}>
              {camOn ? <CameraOff className="h-5 w-5 text-kid-red" /> : <Video className="h-5 w-5 text-kid-green" />}
            </button>
            <button aria-label="تسجيل الدرس" title={recording ? "إيقاف التسجيل" : "تسجيل الدرس"} onClick={toggleRecord} className={iconBtn}>
              <Circle className={`h-5 w-5 ${recording ? "animate-pulse text-kid-red" : "text-kid-red"}`} fill="currentColor" />
            </button>

            <button aria-label="الصوت" title="الصوت" onClick={() => setMuted((m) => !m)} className={iconBtn}>
              {muted ? <VolumeX className="h-5 w-5 text-muted-foreground" /> : <Volume2 className="h-5 w-5 text-kid-purple" />}
            </button>
            <button aria-label="الوضع المظلم" title="الوضع المظلم" onClick={() => setDark((d) => !d)} className={iconBtn}>
              {dark ? <Sun className="h-5 w-5 text-kid-yellow" /> : <Moon className="h-5 w-5 text-kid-blue" />}
            </button>

            <span className="mx-1 h-6 w-px bg-border" />

            <button aria-label="تراجع" title="تراجع" onClick={undo} disabled={undoStack.current.length === 0 && historyTick >= 0} className={`${iconBtn} disabled:opacity-40`}>
              <Undo2 className="h-5 w-5" />
            </button>
            <button aria-label="إعادة" title="إعادة" onClick={redo} disabled={redoStack.current.length === 0 && historyTick >= 0} className={`${iconBtn} disabled:opacity-40`}>
              <Redo2 className="h-5 w-5" />
            </button>

            <span className="mx-1 h-6 w-px bg-border" />

            <button aria-label="تصغير" title="تصغير" onClick={() => zoomBy(1 / 1.2)} className={iconBtn}><ZoomOut className="h-5 w-5" /></button>
            <span className="w-12 text-center text-sm font-bold">{Math.round(zoom * 100)}%</span>
            <button aria-label="تكبير" title="تكبير" onClick={() => zoomBy(1.2)} className={iconBtn}><ZoomIn className="h-5 w-5" /></button>
            <button aria-label="إعادة الضبط" title="إعادة الضبط" onClick={() => setZoom(1)} className={iconBtn}><Maximize className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Board with zoom */}
        <div className="overflow-auto rounded-[2rem] border-8 border-kid-yellow/60 bg-card shadow-xl" style={{ maxHeight: "70vh" }}>
          <div style={{ width: W * zoom, height: H * zoom }}>
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={stop}
              onPointerLeave={stop}
              className="touch-none"
              style={{ width: W * zoom, height: H * zoom }}
            />
          </div>
        </div>

        {/* teacher camera bubble */}
        {camOn && (
          <div className="fixed bottom-24 left-4 z-30 overflow-hidden rounded-2xl border-4 border-kid-green shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="h-36 w-48 bg-black object-cover" />
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white">
              <Camera className="h-3 w-3" /> المعلم
            </span>
          </div>
        )}
        {recording && (
          <span className="fixed left-4 top-20 z-30 flex items-center gap-2 rounded-full bg-destructive px-4 py-1.5 text-sm font-bold text-destructive-foreground shadow-lg">
            <Circle className="h-3 w-3 animate-pulse" fill="currentColor" /> جارٍ تسجيل الدرس...
          </span>
        )}

        {/* drawing tools */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow">
            <button aria-label="قلم" onClick={() => setTool("pen")} className={`rounded-full p-1.5 ${tool === "pen" ? "bg-kid-purple/20" : ""}`}>
              <Pencil className="h-4 w-4 text-kid-purple" />
            </button>
            <button aria-label="ممحاة" onClick={() => setTool("eraser")} className={`rounded-full p-1.5 ${tool === "eraser" ? "bg-kid-purple/20" : ""}`}>
              <Eraser className="h-4 w-4 text-muted-foreground" />
            </button>
            {colors.map((c) => (
              <button
                key={c.value}
                aria-label={c.name}
                onClick={() => { setColor(c.value); setTool("pen"); }}
                className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${color === c.value && tool === "pen" ? "scale-110 ring-4 ring-foreground/20" : ""}`}
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
        </div>
      </main>

      {/* Mushaf modal */}
      {mushafOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={() => setMushafOpen(false)}>
          <div dir="rtl" className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* sub toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
              <button aria-label="الفهرس" title="فهرس السور" onClick={() => setIndexOpen((o) => !o)} className={iconBtn}>
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-1 rounded-full bg-card px-3 py-1.5 shadow">
                <span className="text-sm font-bold">ص</span>
                <input
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && goToPage()}
                  className="w-14 bg-transparent text-center font-bold outline-none"
                  inputMode="numeric"
                />
              </div>
              <button onClick={goToPage} className="rounded-full bg-kid-blue px-4 py-1.5 text-sm font-bold text-white shadow transition-transform hover:scale-105">
                اذهب
              </button>
              <button aria-label="قلم" onClick={() => setTool("pen")} className={`${iconBtn} ${tool === "pen" ? "ring-2 ring-kid-purple" : ""}`}>
                <Pencil className="h-4 w-4" />
              </button>
              <button aria-label="ممحاة" onClick={() => setTool("eraser")} className={`${iconBtn} ${tool === "eraser" ? "ring-2 ring-kid-purple" : ""}`}>
                <Eraser className="h-4 w-4" />
              </button>
              <span className="mx-auto font-display text-lg font-extrabold text-kid-purple">مصحف الأحكام — رواية ورش عن نافع</span>
              <button aria-label="إغلاق" onClick={() => setMushafOpen(false)} className={iconBtn}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex flex-1 overflow-hidden">
              {/* surah index drawer */}
              {indexOpen && (
                <div className="absolute inset-y-0 right-0 z-10 flex w-72 flex-col border-l border-border bg-card shadow-xl">
                  <div className="flex items-center gap-2 border-b border-border p-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="ابحث عن سورة..."
                      className="w-full bg-transparent text-sm font-bold outline-none"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {filteredSurahs.map((s) => (
                      <button
                        key={s.n}
                        onClick={() => { setPage(s.page); setPageInput(String(s.page)); setIndexOpen(false); }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition-colors hover:bg-secondary ${s.page === page ? "bg-kid-purple/15 text-kid-purple" : ""}`}
                      >
                        <span>{s.n}. {s.name}</span>
                        <span className="text-xs text-muted-foreground">ص {s.page}</span>
                      </button>
                    ))}
                    {filteredSurahs.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">لا توجد نتائج</p>}
                  </div>
                </div>
              )}

              {/* mushaf page */}
              <div className="flex flex-1 flex-col items-center overflow-y-auto p-4">
                <button
                  onClick={dropMushafOnBoard}
                  className="mb-3 rounded-full bg-kid-green px-6 py-2.5 font-display text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  + للسبورة
                </button>
                <MushafPageCanvas page={page} />
                <div className="mt-3 flex items-center gap-3">
                  <button onClick={() => { const p = Math.max(1, page - 1); setPage(p); setPageInput(String(p)); }} className="rounded-full bg-secondary px-4 py-1.5 text-sm font-bold shadow hover:scale-105">السابقة</button>
                  <span className="text-sm font-bold text-muted-foreground">سورة {surahForPage(page).name} — صفحة {page} من {TOTAL_PAGES}</span>
                  <button onClick={() => { const p = Math.min(TOTAL_PAGES, page + 1); setPage(p); setPageInput(String(p)); }} className="rounded-full bg-secondary px-4 py-1.5 text-sm font-bold shadow hover:scale-105">التالية</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MushafPageCanvas({ page }: { page: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    drawMushafPage(canvas.getContext("2d")!, canvas.width, canvas.height, page);
  }, [page]);
  return (
    <canvas
      ref={ref}
      width={620}
      height={880}
      className="w-full max-w-md rounded-xl border-4 border-kid-yellow/70 shadow-lg"
    />
  );
}
