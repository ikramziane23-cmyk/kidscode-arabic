import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Menu, Bell, Globe, ChevronDown, Sparkles, ShieldCheck,
  Home, Palette, Gamepad2, BookOpen, Star, Settings,
  Volume2, Trophy, CalendarClock, Check,
} from "lucide-react";
import hero from "@/assets/hero-kids.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ikram Kids — تعليم العربية والقرآن للأطفال" },
      { name: "description", content: "منصة تعليمية تفاعلية لتعليم الأطفال اللغة العربية وتحفيظ القرآن الكريم بطريقة ممتعة." },
      { property: "og:title", content: "Ikram Kids — تعليم العربية والقرآن للأطفال" },
      { property: "og:description", content: "حروف ومفردات وقراءة وكتابة وقرآن… كلها ألعاب ممتعة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const logo = [
  ["I", "text-kid-red"], ["k", "text-kid-orange"], ["r", "text-kid-yellow"], ["a", "text-kid-green"], ["m", "text-kid-blue"],
];

const menuItems = [
  { icon: Home, label: "الرئيسية", to: "/" as const, color: "text-kid-blue" },
  { icon: Palette, label: "سبورة إكرام", to: "/board" as const, color: "text-kid-purple" },
  { icon: Gamepad2, label: "ألعاب الحروف", to: "/games" as const, color: "text-kid-orange" },
  { icon: BookOpen, label: "قصصي", to: "/" as const, color: "text-kid-green" },
  { icon: Star, label: "نجومي وجوائزي", to: "/" as const, color: "text-kid-yellow" },
  { icon: Settings, label: "الإعدادات", to: "/" as const, color: "text-muted-foreground" },
];

const notifications = [
  { icon: Trophy, title: "مبروك! 🎉", text: "أكملت درس حرف الباء وربحت 10 نجوم", time: "قبل ساعة", color: "bg-kid-yellow/20 text-kid-orange" },
  { icon: Volume2, title: "درس جديد", text: "تمت إضافة سورة الفاتحة إلى دروس التحفيظ", time: "قبل 3 ساعات", color: "bg-kid-green/15 text-kid-green" },
  { icon: CalendarClock, title: "تذكير يومي", text: "حان وقت لعبتك المفضلة: صيد الحروف!", time: "اليوم", color: "bg-kid-purple/15 text-kid-purple" },
];

const languages = [
  { code: "ar", label: "العربية", flag: "🇩🇿" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

type Dropdown = "menu" | "bell" | "lang" | null;

function Index() {
  const [open, setOpen] = useState<Dropdown>(null);
  const [lang, setLang] = useState("ar");
  const [read, setRead] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = (d: Dropdown) => setOpen((o) => (o === d ? null : d));

  return (
    <div dir="rtl" className="min-h-screen bg-hero font-body text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div ref={headerRef} className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            {/* قائمة جانبية */}
            <div className="relative">
              <button
                aria-label="القائمة"
                aria-expanded={open === "menu"}
                onClick={() => toggle("menu")}
                className={`icon-btn transition-transform ${open === "menu" ? "scale-110 ring-2 ring-kid-purple/40" : ""}`}
              >
                <Menu className="h-5 w-5" />
              </button>
              {open === "menu" && (
                <div className="absolute right-0 top-12 z-30 w-60 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                  {menuItems.map(({ icon: Icon, label, to, color }) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setOpen(null)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-secondary"
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-secondary ${color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* تنبيهات */}
            <div className="relative">
              <button
                aria-label="التنبيهات"
                aria-expanded={open === "bell"}
                onClick={() => { toggle("bell"); setRead(true); }}
                className={`icon-btn relative transition-transform ${open === "bell" ? "scale-110 ring-2 ring-kid-purple/40" : ""}`}
              >
                <Bell className="h-5 w-5" />
                {!read && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-kid-red" />}
              </button>
              {open === "bell" && (
                <div className="absolute right-0 top-12 z-30 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                  <div className="border-b border-border px-4 py-3 font-display font-bold">التنبيهات</div>
                  {notifications.map(({ icon: Icon, title, text, time, color }) => (
                    <div key={title} className="flex items-start gap-3 border-b border-border/50 px-4 py-3 last:border-0 hover:bg-secondary/60">
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold">{title}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground/70">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div dir="ltr" className="font-fun text-2xl font-bold tracking-wide sm:text-3xl">
            {logo.map(([c, cls], i) => (
              <span key={i} className={`${cls} inline-block wiggle`} style={{ animationDelay: `${i * 0.15}s` }}>{c}</span>
            ))}
            <span className="text-kid-purple"> Kids</span>
          </div>

          {/* تغيير اللغة */}
          <div className="relative">
            <button
              aria-label="تغيير اللغة"
              aria-expanded={open === "lang"}
              onClick={() => toggle("lang")}
              className={`flex items-center gap-1 rounded-full bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground transition-transform ${open === "lang" ? "ring-2 ring-kid-purple/40" : ""}`}
            >
              <Globe className="h-4 w-4" /> {languages.find((l) => l.code === lang)?.label}
              <ChevronDown className={`h-4 w-4 transition-transform ${open === "lang" ? "rotate-180" : ""}`} />
            </button>
            {open === "lang" && (
              <div className="absolute left-0 top-12 z-30 w-44 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                {languages.map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => { setLang(code); setOpen(null); }}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold transition-colors hover:bg-secondary"
                  >
                    <span className="flex items-center gap-2"><span>{flag}</span>{label}</span>
                    {lang === code && <Check className="h-4 w-4 text-kid-green" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
        <section>
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-kid-purple/15 text-kid-purple"><Sparkles className="h-4 w-4" /> #1 منصة تعليمية شاملة</span>
            <span className="badge bg-kid-green/15 text-kid-green"><ShieldCheck className="h-4 w-4" /> آمنة وبدون إعلانات</span>
          </div>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.4] sm:text-5xl">
            علّم طفلك <span className="text-kid-orange">اللغة العربية</span> و<span className="text-kid-green">القرآن</span> بطريقة <span className="text-kid-purple">ممتعة!</span>
          </h1>
          <p className="mt-5 text-lg leading-loose text-muted-foreground">
            منصة تعليمية تفاعلية شاملة تجمع بين تعلم اللغة العربية وتحفيظ القرآن الكريم للأطفال. الحروف والمفردات والقراءة والكتابة... كلها ألعاب ممتعة تجعل التعلم فرحة يومية
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/board"
              className="flex items-center gap-2 rounded-full bg-kid-purple px-6 py-3 font-display text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Palette className="h-5 w-5" /> سبورة إكرام
            </Link>
            <Link
              to="/games"
              className="flex items-center gap-2 rounded-full bg-kid-orange px-6 py-3 font-display text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Gamepad2 className="h-5 w-5" /> ألعاب الحروف القرآنية
            </Link>
          </div>
        </section>
        <div className="relative">
          <div className="absolute -inset-3 rotate-3 rounded-[2.5rem] bg-kid-yellow/40" />
          <img src={hero} alt="أطفال يتعلمون الحروف العربية" className="relative w-full rounded-[2.5rem] shadow-xl" width={1024} height={896} />
        </div>
      </main>
    </div>
  );
}
