import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowRight, Eraser, Trash2, Pencil, ImagePlus, BookOpen, Video, Circle, Moon, Sun, Undo2, Redo2, ZoomIn, ZoomOut, Maximize, Menu, Search, X, Camera, CameraOff, MousePointer2, Highlighter, Type, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  { name: "أحمر", token: "kid-red" }, { name: "برتقالي", token: "kid-orange" },
  { name: "أصفر", token: "kid-yellow" }, { name: "أخضر", token: "kid-green" },
  { name: "أزرق", token: "kid-blue" }, { name: "بنفسجي", token: "kid-purple" },
  { name: "وردي", token: "board-pink" }, { name: "أسود", token: "board-ink" },
];
type Tool = "select" | "pen" | "eraser" | "highlighter" | "text";
type Point = { x: number; y: number };
type Item = { kind: "stroke"; points: Point[]; color: string; size: number; tool: Tool } | { kind: "image"; image: HTMLImageElement | HTMLCanvasElement; x: number; y: number; w: number; h: number } | { kind: "text"; text: string; color: string; size: number; x: number; y: number };
function Board() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const items = useRef<Item[]>([]);
  const undoStack = useRef<Item[][]>([]);
  const redoStack = useRef<Item[][]>([]);
  const drag = useRef<{ last: Point; item: number | null } | null>(null);
  const activeStroke = useRef<Item | null>(null);
  const [tick, setTick] = useState(0);
  const [color, setColor] = useState("kid-blue");
  const [size, setSize] = useState(6);
  const [tool, setTool] = useState<Tool>("pen");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [dark, setDark] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [mushafOpen, setMushafOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [search, setSearch] = useState("");
  const [textEntry, setTextEntry] = useState<{ point: Point; value: string } | null>(null);
  const clone = () => items.current.map(i => i.kind === "stroke" ? { ...i, points: [...i.points] } : { ...i });
  const snapshot = () => { undoStack.current.push(clone()); if (undoStack.current.length > 40) undoStack.current.shift(); redoStack.current = []; };
  const refresh = () => setTick(t => t + 1);
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const w = window.innerWidth, h = window.innerHeight, dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.scale(dpr, dpr);
    const css = getComputedStyle(canvas);
    const token = (name: string) => css.getPropertyValue(`--color-${name}`).trim();
    ctx.fillStyle = token(dark ? "board-paper-dark" : "board-paper"); ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = token(dark ? "board-line-dark" : "board-line"); ctx.lineWidth = 1;
    const spacing = 36 * zoom;
    for (let y = ((pan.y % spacing) + spacing) % spacing; y < h; y += spacing) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    const layer = document.createElement("canvas"); layer.width = canvas.width; layer.height = canvas.height;
    const c = layer.getContext("2d"); if (!c) return;
    c.scale(dpr, dpr); c.translate(pan.x, pan.y); c.scale(zoom, zoom);
    for (const item of items.current) {
      c.save();
      if (item.kind === "image") c.drawImage(item.image, item.x, item.y, item.w, item.h);
      else if (item.kind === "text") { c.fillStyle = token(item.color); c.font = `${item.size}px Cairo, sans-serif`; c.textAlign = "right"; c.fillText(item.text, item.x, item.y); }
      else {
        const first = item.points[0]; if (!first) { c.restore(); continue; }
        c.globalCompositeOperation = item.tool === "eraser" ? "destination-out" : "source-over";
        c.globalAlpha = item.tool === "highlighter" ? 0.28 : 1;
        c.strokeStyle = token(item.color); c.lineWidth = item.size; c.lineCap = "round"; c.lineJoin = "round";
        c.beginPath(); c.moveTo(first.x, first.y);
        if (item.points.length === 1) c.lineTo(first.x + 0.01, first.y);
        for (const p of item.points.slice(1)) c.lineTo(p.x, p.y);
        c.stroke();
      }
      c.restore();
    }
    ctx.drawImage(layer, 0, 0, w, h);
  }, [dark, zoom, pan]);
  useEffect(() => { render(); window.addEventListener("resize", render); return () => window.removeEventListener("resize", render); }, [render, tick]);
  useEffect(() => { if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current; }, [camOn]);
  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); recorderRef.current?.stream.getTracks().forEach(t => t.stop()); }, []);
  const pos = (e: React.PointerEvent): Point => ({ x: (e.clientX - pan.x) / zoom, y: (e.clientY - pan.y) / zoom });
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = pos(e); setPaletteOpen(false);
    if (tool === "text") { setTextEntry({ point: p, value: "" }); return; }
    e.currentTarget.setPointerCapture(e.pointerId);
    if (tool === "select") {
      const reverseIndex = [...items.current].reverse().findIndex(i => i.kind === "image" ? p.x >= i.x && p.x <= i.x + i.w && p.y >= i.y && p.y <= i.y + i.h : i.kind === "text" ? p.x >= i.x - i.text.length * i.size && p.x <= i.x && Math.abs(p.y - i.y) <= i.size : false);
      const index = reverseIndex < 0 ? -1 : items.current.length - 1 - reverseIndex;
      if (index >= 0) snapshot();
      drag.current = { last: { x: e.clientX, y: e.clientY }, item: index >= 0 ? index : null }; return;
    }
    snapshot();
    const stroke: Item = { kind: "stroke", points: [p], color, size: tool === "eraser" ? size * 4 : tool === "highlighter" ? size * 4 : size, tool };
    items.current.push(stroke); activeStroke.current = stroke; refresh();
  };
  const move = (e: React.PointerEvent) => {
    const stroke = activeStroke.current;
    if (stroke?.kind === "stroke") { stroke.points.push(pos(e)); refresh(); }
    if (drag.current) {
      const dx = e.clientX - drag.current.last.x, dy = e.clientY - drag.current.last.y;
      const item = drag.current.item === null ? null : items.current[drag.current.item];
      if (item && item.kind !== "stroke") { item.x += dx / zoom; item.y += dy / zoom; refresh(); }
      else setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      drag.current.last = { x: e.clientX, y: e.clientY };
    }
  };
  const stop = () => { activeStroke.current = null; drag.current = null; };
  const clear = () => { snapshot(); items.current = []; refresh(); };
  const undo = () => { const previous = undoStack.current.pop(); if (!previous) return; redoStack.current.push(clone()); items.current = previous; refresh(); };
  const redo = () => { const next = redoStack.current.pop(); if (!next) return; undoStack.current.push(clone()); items.current = next; refresh(); };
  const addImage = (image: HTMLImageElement | HTMLCanvasElement) => {
    snapshot(); const scale = Math.min(window.innerWidth * 0.7 / image.width, window.innerHeight * 0.65 / image.height, 1) / zoom;
    const w = image.width * scale, h = image.height * scale;
    items.current.push({ kind: "image", image, w, h, x: (window.innerWidth / 2 - pan.x) / zoom - w / 2, y: (window.innerHeight / 2 - pan.y) / zoom - h / 2 }); refresh();
  };
  const insertImage = (file: File) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { addImage(img); URL.revokeObjectURL(url); };
    img.onerror = () => { URL.revokeObjectURL(url); setError("تعذر فتح الصورة"); }; img.src = url;
  };
  const dropMushafOnBoard = () => {
    const off = document.createElement("canvas"); off.width = 620; off.height = 880;
    const ctx = off.getContext("2d"); if (!ctx) return;
    drawMushafPage(ctx, off.width, off.height, page); addImage(off); setMushafOpen(false);
  };
  const toggleCamera = async () => {
    if (camOn) { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setCamOn(false); return; }
    try { streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); setCamOn(true); }
    catch { setError("تعذر فتح الكاميرا، يرجى السماح بالوصول إليها"); }
  };
  const toggleRecord = () => {
    if (recording) { recorderRef.current?.stop(); return; }
    const canvas = canvasRef.current; if (!canvas) return;
    try {
      const stream = canvas.captureStream(15);
      const mimeType = ["video/webm;codecs=vp9", "video/webm", "video/mp4"].find(t => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined); chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => { const url = URL.createObjectURL(new Blob(chunksRef.current, { type: rec.mimeType })); const a = document.createElement("a"); a.href = url; a.download = rec.mimeType.includes("mp4") ? "درس-السبورة.mp4" : "درس-السبورة.webm"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); stream.getTracks().forEach(t => t.stop()); setRecording(false); };
      recorderRef.current = rec; rec.start(); setRecording(true);
    } catch { setError("التسجيل غير متاح في هذا المتصفح"); }
  };
  const goToPage = () => { const p = Math.min(TOTAL_PAGES, Math.max(1, Number(pageInput) || 1)); setPage(p); setPageInput(String(p)); };
  const zoomBy = (factor: number) => {
    const next = Math.min(3, Math.max(0.4, +(zoom * factor).toFixed(2)));
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    setPan(p => ({ x: cx - (cx - p.x) * next / zoom, y: cy - (cy - p.y) * next / zoom })); setZoom(next);
  };
  const filteredSurahs = SURAHS.filter(s => s.name.includes(search.trim()) || String(s.page) === search.trim());
  const iconBtn = "board-icon";
  const commitText = () => { if (textEntry?.value.trim()) { snapshot(); items.current.push({ kind: "text", text: textEntry.value, color, size: Math.max(24, size * 4), ...textEntry.point }); refresh(); } setTextEntry(null); };
  return (
    <div dir="rtl" className={`${dark ? "dark" : ""} board-page font-body`}>
      <canvas ref={canvasRef} aria-label="مساحة السبورة" onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} className={`board-canvas board-cursor-${tool}`} />
      <header className="board-header">
        <Button asChild variant="ghost" className="board-home"><Link to="/"><ArrowRight /> <span>الرئيسية</span></Link></Button>
        <div className="board-header-actions">
          <Button variant="ghost" aria-label="المصحف الشريف" title="المصحف الشريف" onClick={() => setMushafOpen(true)} className={iconBtn}><BookOpen className="text-kid-yellow" fill="currentColor" /></Button>
          <Button variant="ghost" aria-label="الكاميرا" title="الكاميرا" onClick={toggleCamera} className={iconBtn}>{camOn ? <CameraOff className="text-kid-green" /> : <Video />}</Button>
          <Button variant="ghost" aria-label="تسجيل الدرس" title={recording ? "إيقاف التسجيل" : "تسجيل الدرس"} onClick={toggleRecord} className={iconBtn}><Circle className={`text-kid-red ${recording ? "animate-pulse" : ""}`} fill="currentColor" /></Button>
          <Button variant="ghost" aria-label="الوضع المظلم" title="الوضع المظلم" onClick={() => setDark(d => !d)} className={iconBtn}>{dark ? <Sun className="text-kid-yellow" /> : <Moon />}</Button>
        </div>
      </header>
      <div className="board-zoom" dir="ltr">
        <Button variant="ghost" className={iconBtn} aria-label="تصغير" title="تصغير" onClick={() => zoomBy(1 / 1.2)}><ZoomOut /></Button>
        <span className="w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" className={iconBtn} aria-label="تكبير" title="تكبير" onClick={() => zoomBy(1.2)}><ZoomIn /></Button>
        <Button variant="ghost" className={iconBtn} aria-label="إعادة الضبط" title="إعادة الضبط" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}><Maximize /></Button>
      </div>
      <div className="board-history" dir="ltr">
        <Button variant="ghost" className={iconBtn} aria-label="تراجع" title="تراجع" disabled={!undoStack.current.length} onClick={undo}><Undo2 /></Button>
        <Button variant="ghost" className={iconBtn} aria-label="إعادة" title="إعادة" disabled={!redoStack.current.length} onClick={redo}><Redo2 /></Button>
      </div>
      <nav className="board-toolbar" aria-label="أدوات الرسم">
        {paletteOpen && <div className="board-palette" dir="rtl">
          <div className="flex justify-between gap-2">{colors.map(c => <Button key={c.token} variant="ghost" aria-label={c.name} title={c.name} aria-pressed={color === c.token} onClick={() => setColor(c.token)} className={`board-swatch board-swatch-${c.token} ${color === c.token ? "board-swatch-active" : ""}`} />)}</div>
          <label className="mt-4 flex items-center gap-3 text-sm">سماكة الخط <input aria-label="سماكة الخط" type="range" min={2} max={24} value={size} onChange={e => setSize(Number(e.target.value))} className="min-w-0 flex-1 accent-kid-blue" /><span className="w-5">{size}</span></label>
        </div>}
        <Button variant="ghost" className={`${iconBtn} ${tool === "select" ? "board-tool-active" : ""}`} aria-label="التحديد والانتقال" title="التحديد والانتقال" aria-pressed={tool === "select"} onClick={() => { setTool("select"); setPaletteOpen(false); }}><MousePointer2 /></Button>
        <Button variant="ghost" className={`${iconBtn} ${tool === "pen" ? "board-tool-active" : ""}`} aria-label="قلم" title="القلم والألوان" aria-pressed={tool === "pen"} onClick={() => { setTool("pen"); setPaletteOpen(p => !p); }}><Pencil /></Button>
        <Button variant="ghost" className={`${iconBtn} ${tool === "eraser" ? "board-tool-active" : ""}`} aria-label="ممحاة" title="ممحاة" aria-pressed={tool === "eraser"} onClick={() => { setTool("eraser"); setPaletteOpen(false); }}><Eraser /></Button>
        <Button variant="ghost" className={`${iconBtn} ${tool === "highlighter" ? "board-tool-active" : ""}`} aria-label="التظليل" title="التظليل" aria-pressed={tool === "highlighter"} onClick={() => { setTool("highlighter"); setPaletteOpen(true); }}><Highlighter /></Button>
        <Button variant="ghost" className={`${iconBtn} ${tool === "text" ? "board-tool-active" : ""}`} aria-label="النص" title="النص" aria-pressed={tool === "text"} onClick={() => { setTool("text"); setPaletteOpen(false); }}><Type /></Button>
        <Button variant="ghost" className={iconBtn} aria-label="إدراج صورة" title="إدراج صورة" onClick={() => fileRef.current?.click()}><ImagePlus /></Button>
        <Button variant="ghost" className={`${iconBtn} text-kid-red`} aria-label="مسح السبورة" title="مسح السبورة" onClick={clear}><Trash2 /></Button>
      </nav>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) insertImage(file); e.target.value = ""; }} />
      {textEntry && <form className="board-text-entry" onSubmit={e => { e.preventDefault(); commitText(); }}><input autoFocus aria-label="النص المراد إضافته" value={textEntry.value} onChange={e => setTextEntry({ ...textEntry, value: e.target.value })} /><Button type="submit" variant="ghost" className={iconBtn} aria-label="إضافة النص"><Check /></Button><Button type="button" variant="ghost" className={iconBtn} aria-label="إلغاء" onClick={() => setTextEntry(null)}><X /></Button></form>}
      {camOn && <div className="board-camera"><video ref={videoRef} autoPlay playsInline muted /><span><Camera className="h-3 w-3" /> المعلم</span></div>}
      {recording && <span className="board-recording"><Circle className="h-3 w-3 animate-pulse text-kid-red" fill="currentColor" /> جارٍ تسجيل الدرس...</span>}
      {error && <div role="alert" className="board-error">{error}<Button variant="ghost" aria-label="إغلاق التنبيه" onClick={() => setError("")}><X /></Button></div>}
      {/* Mushaf modal */}
      {mushafOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-board-overlay p-4" onClick={() => setMushafOpen(false)}>
          <div dir="rtl" className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* sub toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
              <Button aria-label="الفهرس" title="فهرس السور" onClick={() => setIndexOpen((o) => !o)} className={iconBtn}>
                <Menu className="h-5 w-5" />
              </Button>
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
              <Button onClick={goToPage} className="rounded-full bg-kid-blue px-4 py-1.5 text-sm font-bold text-primary-foreground shadow transition-transform hover:scale-105">
                اذهب
              </Button>
              <Button aria-label="قلم" onClick={() => setTool("pen")} className={`${iconBtn} ${tool === "pen" ? "ring-2 ring-kid-purple" : ""}`}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button aria-label="ممحاة" onClick={() => setTool("eraser")} className={`${iconBtn} ${tool === "eraser" ? "ring-2 ring-kid-purple" : ""}`}>
                <Eraser className="h-4 w-4" />
              </Button>
              <span className="mx-auto font-display text-lg font-extrabold text-kid-purple">مصحف الأحكام — رواية ورش عن نافع</span>
              <Button aria-label="إغلاق" onClick={() => setMushafOpen(false)} className={iconBtn}>
                <X className="h-5 w-5" />
              </Button>
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
                      <Button
                        key={s.n}
                        onClick={() => { setPage(s.page); setPageInput(String(s.page)); setIndexOpen(false); }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition-colors hover:bg-secondary ${s.page === page ? "bg-kid-purple/15 text-kid-purple" : ""}`}
                      >
                        <span>{s.n}. {s.name}</span>
                        <span className="text-xs text-muted-foreground">ص {s.page}</span>
                      </Button>
                    ))}
                    {filteredSurahs.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">لا توجد نتائج</p>}
                  </div>
                </div>
              )}

              {/* mushaf page */}
              <div className="flex flex-1 flex-col items-center overflow-y-auto p-4">
                <Button
                  onClick={dropMushafOnBoard}
                  className="mb-3 rounded-full bg-kid-green px-6 py-2.5 font-display text-lg font-extrabold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  + للسبورة
                </Button>
                <MushafPageCanvas page={page} />
                <div className="mt-3 flex items-center gap-3">
                  <Button onClick={() => { const p = Math.max(1, page - 1); setPage(p); setPageInput(String(p)); }} className="rounded-full bg-secondary px-4 py-1.5 text-sm font-bold shadow hover:scale-105">السابقة</Button>
                  <span className="text-sm font-bold text-muted-foreground">سورة {surahForPage(page).name} — صفحة {page} من {TOTAL_PAGES}</span>
                  <Button onClick={() => { const p = Math.min(TOTAL_PAGES, page + 1); setPage(p); setPageInput(String(p)); }} className="rounded-full bg-secondary px-4 py-1.5 text-sm font-bold shadow hover:scale-105">التالية</Button>
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
    const ctx = canvas.getContext("2d");
    if (ctx) drawMushafPage(ctx, canvas.width, canvas.height, page);
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
