import { createFileRoute } from "@tanstack/react-router";
import { Menu, Bell, Globe, ChevronDown, Sparkles, ShieldCheck } from "lucide-react";
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

function Index() {
  return (
    <div dir="rtl" className="min-h-screen bg-hero font-body text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <button aria-label="القائمة" className="icon-btn"><Menu className="h-5 w-5" /></button>
            <button aria-label="التنبيهات" className="icon-btn relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-kid-red" />
            </button>
          </div>
          <div dir="ltr" className="font-fun text-2xl font-bold tracking-wide sm:text-3xl">
            {logo.map(([c, cls], i) => (
              <span key={i} className={`${cls} inline-block wiggle`} style={{ animationDelay: `${i * 0.15}s` }}>{c}</span>
            ))}
            <span className="text-kid-purple"> Kids</span>
          </div>
          <button className="flex items-center gap-1 rounded-full bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground">
            <Globe className="h-4 w-4" /> العربية <ChevronDown className="h-4 w-4" />
          </button>
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
        </section>
        <div className="relative">
          <div className="absolute -inset-3 rotate-3 rounded-[2.5rem] bg-kid-yellow/40" />
          <img src={hero} alt="أطفال يتعلمون الحروف العربية" className="relative w-full rounded-[2.5rem] shadow-xl" width={1024} height={896} />
        </div>
      </main>
    </div>
  );
}
