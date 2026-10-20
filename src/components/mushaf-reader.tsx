import { useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Menu, Search, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SURAHS, TOTAL_PAGES, surahForPage, mushafPageUrl } from "@/lib/mushaf-data";

export function MushafReader({ open, onOpenChange, onInsert }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (image: HTMLImageElement) => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [indexOpen, setIndexOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const [failedPage, setFailedPage] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);
  const goTo = (value: number) => {
    if (!Number.isFinite(value)) return;
    const next = Math.min(TOTAL_PAGES, Math.max(1, Math.trunc(value)));
    if (next !== page) { setLoadedPage(null); setFailedPage(null); }
    setPage(next); setPageInput(String(next));
  };
  const insert = () => {
    const image = imageRef.current;
    if (loadedPage !== page || !image?.complete || !image.naturalWidth) return;
    onInsert(image);
    onOpenChange(false);
  };
  const matches = SURAHS.filter(s => s.name.includes(search.trim()) || String(s.page) === search.trim());

  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="mushaf-overlay" />
      <DialogPrimitive.Content dir="rtl" aria-describedby={undefined} className="mushaf-reader font-body" onCloseAutoFocus={e => e.preventDefault()}>
        <header className="mushaf-header">
          <DialogPrimitive.Title className="font-display text-xl font-bold">المصحف الشريف · ورش عن نافع</DialogPrimitive.Title>
          <Button variant="ghost" className="mushaf-icon" aria-label="إغلاق المصحف" title="إغلاق المصحف" onClick={() => onOpenChange(false)}><X /></Button>
        </header>
        <div className="mushaf-controls">
          <Button variant="ghost" className="mushaf-icon" aria-label="الفهرس" title="فهرس السور" aria-expanded={indexOpen} onClick={() => setIndexOpen(v => !v)}><Menu /></Button>
          <select aria-label="اختر السورة" value={surahForPage(page)?.n ?? 1} onChange={e => { const s = SURAHS.find(s => s.n === Number(e.target.value)); if (s) goTo(s.page); }} className="mushaf-select">
            {SURAHS.map(s => <option key={s.n} value={s.n}>{s.n}. {s.name}</option>)}
          </select>
          <form className="mushaf-page-form" onSubmit={e => { e.preventDefault(); goTo(Number(pageInput) || 1); }}>
            <label htmlFor="mushaf-page">ص</label>
            <input id="mushaf-page" aria-label="رقم الصفحة" inputMode="numeric" value={pageInput} onChange={e => setPageInput(e.target.value.replace(/\D/g, ""))} />
            <Button variant="ghost" type="submit" className="mushaf-go">اذهب</Button>
          </form>
          <div className="mushaf-navigation">
            <Button variant="ghost" className="mushaf-icon" aria-label="الصفحة السابقة" title="الصفحة السابقة" disabled={page === 1} onClick={() => goTo(page - 1)}><ChevronRight /></Button>
            <span aria-live="polite" className="mushaf-count">{page} / {TOTAL_PAGES}</span>
            <Button variant="ghost" className="mushaf-icon" aria-label="الصفحة التالية" title="الصفحة التالية" disabled={page === TOTAL_PAGES} onClick={() => goTo(page + 1)}><ChevronLeft /></Button>
          </div>
        </div>
        <div className="mushaf-body">
          {indexOpen && <aside className="mushaf-index">
            <label className="mushaf-search"><Search className="h-4 w-4 shrink-0" /><input aria-label="البحث في السور" placeholder="اسم السورة أو رقم الصفحة" value={search} onChange={e => setSearch(e.target.value)} /></label>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {matches.map(s => <Button key={s.n} variant="ghost" className="mushaf-index-item" onClick={() => { goTo(s.page); setIndexOpen(false); }}><span>{s.n}. {s.name}</span><span>ص {s.page}</span></Button>)}
              {!matches.length && <p className="p-4 text-center text-sm">لا توجد نتائج</p>}
            </div>
          </aside>}
          <div className="mushaf-insert-bar">
            <Button onClick={insert} disabled={loadedPage !== page || failedPage === page} className="mushaf-insert">+ للسبورة</Button>
          </div>
          <div className="mushaf-sheet">
            {failedPage === page ? <div role="alert" className="mushaf-status"><p>تعذر تحميل الصفحة، تحققي من الاتصال.</p><Button variant="outline" onClick={() => { setFailedPage(null); setLoadedPage(null); setRetry(v => v + 1); }}><RotateCcw />إعادة المحاولة</Button></div> : <>
              {loadedPage !== page && <div role="status" className="mushaf-status">جارٍ تحميل الصفحة…</div>}
              <img ref={imageRef} key={`${page}-${retry}`} crossOrigin="anonymous" src={mushafPageUrl(page)} alt={`صفحة ${page} من مصحف ورش عن نافع`} onLoad={() => setLoadedPage(page)} onError={() => { setFailedPage(page); setLoadedPage(null); }} className={`mushaf-page-image ${loadedPage !== page ? "invisible" : ""}`} />
            </>}
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}