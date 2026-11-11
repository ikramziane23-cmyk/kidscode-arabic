# لعبة «أكمل الآية» — مصحف ورش

انسخ المجلدات (src و public) إلى جذر المشروع كما هي، ثم طبّق التعديلين على الملفات الموجودة:
`git apply changes-to-existing-files.patch`
(يضيف المسار /ayah-game في routeTree.gen.ts، وزرّ اللعبة في الصفحة الرئيسية).

- الصفحة: /ayah-game  (قائمة 114 سورة)، و /ayah-game?surah=2 (لعبة السورة).
- البيانات: public/data/warsh-ayat.json — 6214 آية برواية ورش من ملف مجمّع الملك فهد (KFGQPC warshData_v10)،
  مرتبة لكل سورة مع رقم صفحة كل آية.
- الخط: public/fonts/UthmanicWarsh.woff2 (خط KFGQPC لرسم ورش).
- الصوت: يستعمل ملف التصفيق الموجود أصلاً public/pwlpl-applause-sound-effect-521104.mp3.
- الاختبارات: bun run test  (src/lib/ayah-game.test.ts)
