// Surah index for the Warsh mushaf viewer: [name, page] — standard 604-page pagination.
export const SURAHS: Array<{ n: number; name: string; page: number }> = [
  { n: 1, name: "الفاتحة", page: 1 }, { n: 2, name: "البقرة", page: 2 }, { n: 3, name: "آل عمران", page: 50 },
  { n: 4, name: "النساء", page: 77 }, { n: 5, name: "المائدة", page: 106 }, { n: 6, name: "الأنعام", page: 128 },
  { n: 7, name: "الأعراف", page: 151 }, { n: 8, name: "الأنفال", page: 177 }, { n: 9, name: "التوبة", page: 187 },
  { n: 10, name: "يونس", page: 208 }, { n: 11, name: "هود", page: 221 }, { n: 12, name: "يوسف", page: 235 },
  { n: 13, name: "الرعد", page: 249 }, { n: 14, name: "إبراهيم", page: 255 }, { n: 15, name: "الحجر", page: 262 },
  { n: 16, name: "النحل", page: 267 }, { n: 17, name: "الإسراء", page: 282 }, { n: 18, name: "الكهف", page: 293 },
  { n: 19, name: "مريم", page: 305 }, { n: 20, name: "طه", page: 312 }, { n: 21, name: "الأنبياء", page: 322 },
  { n: 22, name: "الحج", page: 332 }, { n: 23, name: "المؤمنون", page: 342 }, { n: 24, name: "النور", page: 350 },
  { n: 25, name: "الفرقان", page: 359 }, { n: 26, name: "الشعراء", page: 367 }, { n: 27, name: "النمل", page: 377 },
  { n: 28, name: "القصص", page: 385 }, { n: 29, name: "العنكبوت", page: 396 }, { n: 30, name: "الروم", page: 404 },
  { n: 31, name: "لقمان", page: 411 }, { n: 32, name: "السجدة", page: 415 }, { n: 33, name: "الأحزاب", page: 418 },
  { n: 34, name: "سبأ", page: 428 }, { n: 35, name: "فاطر", page: 434 }, { n: 36, name: "يس", page: 440 },
  { n: 37, name: "الصافات", page: 446 }, { n: 38, name: "ص", page: 453 }, { n: 39, name: "الزمر", page: 458 },
  { n: 40, name: "غافر", page: 467 }, { n: 41, name: "فصلت", page: 477 }, { n: 42, name: "الشورى", page: 483 },
  { n: 43, name: "الزخرف", page: 489 }, { n: 44, name: "الدخان", page: 496 }, { n: 45, name: "الجاثية", page: 499 },
  { n: 46, name: "الأحقاف", page: 502 }, { n: 47, name: "محمد", page: 507 }, { n: 48, name: "الفتح", page: 511 },
  { n: 49, name: "الحجرات", page: 515 }, { n: 50, name: "ق", page: 518 }, { n: 51, name: "الذاريات", page: 520 },
  { n: 52, name: "الطور", page: 523 }, { n: 53, name: "النجم", page: 526 }, { n: 54, name: "القمر", page: 528 },
  { n: 55, name: "الرحمن", page: 531 }, { n: 56, name: "الواقعة", page: 534 }, { n: 57, name: "الحديد", page: 537 },
  { n: 58, name: "المجادلة", page: 542 }, { n: 59, name: "الحشر", page: 545 }, { n: 60, name: "الممتحنة", page: 549 },
  { n: 61, name: "الصف", page: 551 }, { n: 62, name: "الجمعة", page: 553 }, { n: 63, name: "المنافقون", page: 554 },
  { n: 64, name: "التغابن", page: 556 }, { n: 65, name: "الطلاق", page: 558 }, { n: 66, name: "التحريم", page: 560 },
  { n: 67, name: "الملك", page: 562 }, { n: 68, name: "القلم", page: 564 }, { n: 69, name: "الحاقة", page: 566 },
  { n: 70, name: "المعارج", page: 568 }, { n: 71, name: "نوح", page: 570 }, { n: 72, name: "الجن", page: 572 },
  { n: 73, name: "المزمل", page: 574 }, { n: 74, name: "المدثر", page: 575 }, { n: 75, name: "القيامة", page: 577 },
  { n: 76, name: "الإنسان", page: 578 }, { n: 77, name: "المرسلات", page: 580 }, { n: 78, name: "النبأ", page: 582 },
  { n: 79, name: "النازعات", page: 583 }, { n: 80, name: "عبس", page: 585 }, { n: 81, name: "التكوير", page: 586 },
  { n: 82, name: "الانفطار", page: 587 }, { n: 83, name: "المطففين", page: 587 }, { n: 84, name: "الانشقاق", page: 589 },
  { n: 85, name: "البروج", page: 590 }, { n: 86, name: "الطارق", page: 591 }, { n: 87, name: "الأعلى", page: 591 },
  { n: 88, name: "الغاشية", page: 592 }, { n: 89, name: "الفجر", page: 593 }, { n: 90, name: "البلد", page: 594 },
  { n: 91, name: "الشمس", page: 595 }, { n: 92, name: "الليل", page: 595 }, { n: 93, name: "الضحى", page: 596 },
  { n: 94, name: "الشرح", page: 596 }, { n: 95, name: "التين", page: 597 }, { n: 96, name: "العلق", page: 597 },
  { n: 97, name: "القدر", page: 598 }, { n: 98, name: "البينة", page: 598 }, { n: 99, name: "الزلزلة", page: 599 },
  { n: 100, name: "العاديات", page: 599 }, { n: 101, name: "القارعة", page: 600 }, { n: 102, name: "التكاثر", page: 600 },
  { n: 103, name: "العصر", page: 601 }, { n: 104, name: "الهمزة", page: 601 }, { n: 105, name: "الفيل", page: 601 },
  { n: 106, name: "قريش", page: 602 }, { n: 107, name: "الماعون", page: 602 }, { n: 108, name: "الكوثر", page: 602 },
  { n: 109, name: "الكافرون", page: 603 }, { n: 110, name: "النصر", page: 603 }, { n: 111, name: "المسد", page: 603 },
  { n: 112, name: "الإخلاص", page: 604 }, { n: 113, name: "الفلق", page: 604 }, { n: 114, name: "الناس", page: 604 },
];

export const TOTAL_PAGES = 604;

export function surahForPage(page: number) {
  let current = SURAHS[0]!;
  for (const s of SURAHS) {
    if (s.page <= page) current = s;
    else break;
  }
  return current;
}

// Real scanned Warsh mushaf pages (CORS-enabled, so they can be drawn into the board canvas).
export function mushafPageUrl(page: number) {
  return `https://raw.githubusercontent.com/maknon/Quran/main/pages-warsh/${page}.png`;
}
