# نقشه‌ی کد (CODE-MAP)

این فایل خودکار از روی کد ساخته شده. دستیار هوش مصنوعی از آن می‌فهمد هر قابلیت در کدام فایل است.
ستون‌ها: بخش‌های هر فایل (کامنت‌های `=====`)، صفحه‌هایی که ثبت می‌کند (`PG.x`)، و نام توابع و متغیرهای مهم.

## js/errorlog.js  (2 KB)
- نام‌های مهم سطح‌بالا (0 مورد): 

## js/core.js  (67 KB)
- بخش‌ها:
  - تابع‌های جابه‌جاشده این تابع‌ها در فایل اصلی (تک‌اسکریپت) hoist می‌شدند و از اول بارگذاری در دسترس بودند. بعد 
  - پایان تابع‌های جابه‌جاشده
  - utils & dates
  - data
  - timeline / gaps
  - plan & analysis
  - timer
  - ui helpers
  - pages
  - exports
  - actions
- نام‌های مهم سطح‌بالا (115 مورد، ۴۵ تای اول): `LANGEN()`، `LANGBI()`، `$`، `$$`، `FD`، `fa`، `en`، `pad`، `iso`، `P`، `addD`، `todayISO`، `nowHM`، `uid`، `esc`، `g2j()`، `j2g()`، `JM`، `WD`، `J`، `fmtD`، `fmtDL`، `readD()`، `tm`، `hm`، `fT`، `dur`، `mm`، `pct`، `hms`، `toast()`، `KEY`، `CATS`، `SEED_ORIG`، `SEED`، `db`، `page`، `vd`، `rng`، `calM`، `calV`، `stR`، `acQ`، `nQ`، `defSet`

## js/dashboard-planner.js  (55 KB)
- بخش‌ها:
  - v5: سه بخش اصلی، ثبت یکپارچه، فعالیت سریع
  - DANI v1: 14 dashboard layouts + 6 activity designs (two independent settings: db.set.dlay, db.set.alay)
  - DANI v1: Planner upgrades - extra statuses, carry-over with history and reason, overdue list, repeating tasks
  - DANI v1: Today's checklist (tick-off list) + success-rate comparison over days and weeks
  - DANI v1: planner priority + search/filter, and a 30-day trend line
  - DANI v1: Icon Studio (style + size, independent of the theme) and a background mood for every page
  - DANI v1: calendar export (.ics) - lets the phone's own calendar ring the alarms even when the app is closed
- عمل‌ها (H.*): تعداد 42 ؛ نمونه: `rmode`، `rpick`، `rgo2`، `alay`، `dlay`، `dcw`، `qadd`، `arec`، `sadd`، `sdel`، `sadd2`، `srm`
- نام‌های مهم سطح‌بالا (67 مورد، ۴۵ تای اول): `dt`، `rt`، `stt`، `RM`، `DT`، `RT`، `ST`، `tabBar`، `dlA`، `chips`، `catSel`، `prSel`، `recCard()`، `resolveAct()`، `ALLK`، `CK_N`، `DLAY`، `ALAY`، `alist`، `alBtns`، `logCards()`، `logTL()`، `wkIso`، `weekStrip()`، `cwList`، `cwEditor()`، `dlSel()`، `dashToday()`، `actForm()`، `subRow`، `repHTML()`، `setPage()`، `PG`، `PL_ST`، `PR_D`، `plOverdue()`، `overdueCard()`، `hOverdue()`، `plCarry()`، `prList`، `recurCard()`، `plRecur()`، `sumU()`، `hCheck()`، `ckRate()`

## js/home-weekly.js  (22 KB)
- بخش‌ها:
  - DANI v1: Home - customizable sections (db.set.hs), weekly review, bad-day mode, rotating quotes
  - v6: صحت داده، کیفیت یادگیری، وقفه، برنامه هفتگی، مقایسه بازه‌ها
- صفحه‌هایی که ثبت می‌کند (PG): `home`
- عمل‌ها (H.*): تعداد 7 ؛ نمونه: `qrot`، `hs`، `hgoal`، `badday`، `hwsave`، `ssug`، `wpl`
- نام‌های مهم سطح‌بالا (40 مورد): `HM`، `homeTarget()`، `hTgt()`، `hFocus()`، `hLinks()`، `hDl()`، `hReview()`، `QR()`، `qPool()`، `QS_OPEN`، `qState()`، `qDue()`، `qPick()`، `qCur()`، `qNav()`، `hqInner()`، `hQuote()`، `HSEC`، `HS_DEF`، `hsList()`، `hsRender()`، `hNoteForm()`، `hMgr()`، `homeHTML`، `overlapsOf()`، `allOv`، `confOf`، `ovCard()`، `covLine`، `nextCard`، `weekCard()`، `_plan`، `compareHTML()`، `qualityHTML()`، `cutHTML()`، `integrityHTML()`، `_rep`، `_st`، `verifyHTML()`، `_sp`

## js/sound-notify-backup.js  (18 KB)
- بخش‌ها:
  - v7: صدای پیش‌فرض (سونات مهتاب، ~۱ دقیقه، سنتز داخلی) و اعلان مطمئن‌تر
  - v8: چند صدای پیش‌فرض مرموز (کلاسیک‌های عمومی + یک قطعه‌ی اورجینال)
  - v9: PWA و اعلان از طریق Service Worker
  - v10: سونات مهتاب با پیانوی نرم و جعبه‌موزیکی؛ حذف بقیه‌ی قطعه‌ها
  - DANI v1: ringtones - all older pieces removed; two original, cheerful, bell-like tunes (pure WebAudio, no file
  - v11: ارسال پشتیبان با اشتراک‌گذاری/ایمیل
  - v12-light: removed embedded MP3 tracks; retain synthesized Web Audio tones
  - v12: import vetting (runs only on imported backup files, never on stored data)
- عمل‌ها (H.*): تعداد 5 ؛ نمونه: `stopsnd`، `snd`، `notif`، `ntest`، `xshare`
- نام‌های مهم سطح‌بالا (25 مورد): `MOON`، `MSTEP`، `MLEN`، `moonSchedule()`، `SND`، `stopSound()`، `playMoon()`، `_sp2`، `seqSched()`، `mountainEv()`، `toccataEv()`، `gymnoEv()`، `nightEv()`، `PIECES`، `tonesOpts`، `playPiece()`، `_ps`، `showN()`، `makeIR()`، `softSched()`، `_ps2`، `joyEv()`، `_sp3`، `ovUnion()`، `vetImport()`

## js/themes-engine.js  (16 KB)
- بخش‌ها:
  - v14: skin engine (data-driven themes; theme files are validated data, never code)
  - Itachi Uchiha themes (3 skins): art, icon sets, sidebar decor and dashboards
  - Theme packs (developer mode): icons, CSS and optional code; signed with a passphrase
  - Itachi new themes: assets, icons, menu decor, dashboards (additive; every home section is kept)
- نام‌های مهم سطح‌بالا (29 مورد): `ICONS`، `icon`، `SK_DEF`، `SK_BTN`، `SK_ICW`، `ITU_IMG`، `ITU_SET`، `ITU_IC`، `ITU_Q`، `ITU_FAN`، `ITU_SHA`، `ituQ()`، `ituApply()`، `ituDecor()`، `ituStrip()`، `ituHero()`، `ituGal()`، `ituHome()`، `PKR`، `PK_IC`، `PK_REC`، `PKAPI`، `IV_SET`، `IV_KJ`، `ivBrand()`، `ivHead()`، `ivChips()`، `ivTicker()`، `ivHome()`

## js/theme-eren.js  (12 KB)
- بخش‌ها:
  - Eren Yeager · Paths of Freedom (eren2): images, icons, quotes, brand, home
- عمل‌ها (H.*): تعداد 1 ؛ نمونه: `pk`
- نام‌های مهم سطح‌بالا (18 مورد): `ERN_IMG`، `ERN_Q`، `ERN_WING`، `ernQ()`، `ernTick()`، `ernTiles()`، `pkOn()`، `pkSig()`، `pkVet()`، `pkRegister()`، `pkSave()`، `pkLoadAll()`، `pkBoot()`، `pkRead()`، `pkCrypto`، `pkImport()`، `pkSign()`، `pkCardHTML()`

## js/theme-aot.js  (19 KB)
- بخش‌ها:
  - Attack on Titan themes: quotes, images, icons, brand, home
- نام‌های مهم سطح‌بالا (15 مورد): `AOT_CH`، `AOT_Q`، `AOT_I`، `aotImg`، `AOT`، `AOT_KJ`، `AOT_W`، `aotK`، `AOTQ()`، `_aotApply`، `_aotDecor`، `aotExtra()`، `aotTicker()`، `aotGal()`، `aotHome()`

## js/quotes-data.js  (124 KB)
- بخش‌ها:
  - Quote packs (bilingual, data only) + theme banner quote
- عمل‌ها (H.*): تعداد 4 ؛ نمونه: `hq`، `qp`، `dim`، `pos`
- نام‌های مهم سطح‌بالا (44 مورد): `QPACKS`، `HQ_SEED`، `qpVet()`، `qpQ()`، `qPackAll()`، `qpRegister()`، `qpSave()`، `qpBoot()`، `qpImport()`، `heroCfg()`، `heroPool()`، `hqPool()`، `hqState()`، `HQ_OPENED`، `hqDue()`، `hqPick()`، `heroQuote()`، `hqNav()`، `heroQB()`، `qpCards()`، `SKINS`، `SK_BUILTIN`، `vetTheme()`، `registerSkin()`، `IMG`، `CUST`، `skId`، `skImgSel`، `imgUrl`، `heroUrl`، `setFavicon()`، `applySkin()`، `decorateIcons()`، `skinCardHTML()`، `injectSkinCard()`، `_renderBase`، `skSet()`، `skFile()`، `skImport()`، `skExport()`، `QT_TOPICS`، `QUOTES`، `I18_EN`، `I18_QEN`

## js/modules-habits-reminders-quotes.js  (49 KB)
- بخش‌ها:
  - v15 modules core + habits
  - v15 reminders: in-app alerts, optional system notifications (while the app is open), missed-list on open
  - v15 quotes
- صفحه‌هایی که ثبت می‌کند (PG): `hab`، `rem`، `qt`
- عمل‌ها (H.*): تعداد 1 ؛ نمونه: `items`
- نام‌های مهم سطح‌بالا (68 مورد، ۴۵ تای اول): `MODULES`، `modOn`، `NAV_BASE`، `syncNav()`، `zMS`، `S_`، `mDate`، `mTime`، `zMD`، `zmg`، `zarr`، `zobj`، `zHB`، `zRM`، `zQT`، `zAC`، `zcommit`، `zMA`، `keepFocus()`، `mBtn`، `mTabs`، `zCOLORS`، `zdow`، `zWD`، `WDN`، `WORDER`، `hOk`، `hItems`، `hExp`، `hSt`، `hStats()`، `hDots`، `hForm()`، `RSTEPS`، `RREP`، `rOk`، `rItems`، `rSet`، `rOcc()`، `rTs`، `rSteps`، `dayOf`، `rFires()`، `rNext()`، `inQuiet`

## js/academy.js  (16 KB)
- بخش‌ها:
  - v15 academy (infrastructure + real resource list; other entities reserved, not shown as active)
  - DANI v1: Academy - flashcards with spaced repetition (SM-2 style), practice-test log, weak topics, learning re
- صفحه‌هایی که ثبت می‌کند (PG): `acd`
- نام‌های مهم سطح‌بالا (19 مورد): `ACAT`، `aOk`، `zSOON`، `zAX`، `AR`، `srsOk`، `tsOk`، `srsNext()`، `srsPrev`، `srsDue()`، `acTopics()`، `acdTabs()`، `acdReview()`، `acdCards()`، `acdAcc()`، `acdTests()`، `acdReport()`، `_acdRes`، `hSrs()`

## js/modules-deadlines.js  (16 KB)
- بخش‌ها:
  - module settings card + dashboard quote + import vetting
  - DANI v1: Deadlines module (data in db.mods.dl; times are stored as local wall-clock ISO date + HH:MM, independ
- صفحه‌هایی که ثبت می‌کند (PG): `dl`
- نام‌های مهم سطح‌بالا (22 مورد): `modCardHTML()`، `BL()`، `BH()`، `BT()`، `BD()`، `DL_CATS`، `DL_IMP`، `DL_STY`، `zDL`، `dlCats`، `dlCat`، `dlCL`، `dlOpt`، `dlOk`، `dlTs`، `dlParts`، `dl2`، `dlCD()`، `dlRow()`، `dlDashHTML()`، `qStep()`، `qRotCard()`

## js/theme-studio-export.js  (18 KB)
- بخش‌ها:
  - DANI v1: Theme Studio - create / edit / copy custom themes inside the app (stored like imported themes, so the
  - DANI v1: real Word (.docx) export - no libraries: stored ZIP + WordprocessingML (RTL, tables). Opens and edits
  - DANI v1: deadline reminders - each deadline can carry offsets (1 day / 1 hour / ... before); they ride on the 
- عمل‌ها (H.*): تعداد 2 ؛ نمونه: `st`، `xdocx`
- نام‌های مهم سطح‌بالا (21 مورد): `STU`، `ST_DEFS`، `ST_VN`، `ST_OPT`، `stFrom()`، `stPreview()`، `studioCard()`، `stInput()`، `stBuild()`، `CRC_T`، `crc32()`، `zipStore()`، `wx`، `wP`، `wTbl()`، `docxBuild()`، `mmP`، `docxExport()`، `days_over()`، `dlRems()`، `dlAlertHint()`

## js/extensions.js  (9 KB)
- بخش‌ها:
  - DANI v1: attachable extensions and packs. Anything new can be built as a small file and attached here (file, l
- عمل‌ها (H.*): تعداد 5 ؛ نمونه: `extget`، `extpaste`، `extt`، `extd`، `exte`
- نام‌های مهم سطح‌بالا (18 مورد): `EXT_PAGES`، `EXT_ON`، `EXT_ERR`، `EXT_K`، `extIndex()`، `extSaveIndex()`، `extId`، `extHeader()`، `extStore()`، `daniApi()`، `extRun()`، `extLoadAll()`، `extInstall()`، `themeAdd()`، `daniImport()`، `extLoadOne()`، `extCard()`، `extDo()`

## js/home-desk.js  (12 KB)
- بخش‌ها:
  - DANI v1: "Desk" home layout (3-column dashboard) used by the Itachi / Focus Minimal themes; switchable in Home
- صفحه‌هایی که ثبت می‌کند (PG): `qt`
- عمل‌ها (H.*): تعداد 3 ؛ نمونه: `hstart`، `hql`، `hlay`
- نام‌های مهم سطح‌بالا (15 مورد): `homeLay()`، `hmsTxt`، `hFocusTimer()`، `hSummary()`، `hSchedule()`، `hQuickLog()`، `hNoteDesk()`، `hActionsDesk()`، `hGoalsBars()`، `deskHTML()`، `deskHTML0()`، `vetMods()`، `_rMods`، `_rPk`، `_pgqt`

## js/i18n.js  (40 KB)
- بخش‌ها:
  - v16 i18n: Persian (default, untouched) + English via a runtime translation layer
- نام‌های مهم سطح‌بالا (26 مورد): `I18_LET`، `I18_FA`، `I18_MAP`، `I18_RE`، `I18_M2`، `i18Build()`، `I18_DIG`، `I18_MEMO`، `I18_US`، `i18Collect()`، `i18Mask()`، `I18_MISS`، `i18Tr()`، `I18_ATTR`، `BI_DONE`، `BI_P`، `BI_L`، `biEn`، `biTree()`، `H_EN`، `i18Tree()`، `i18Html()`، `i18Apply()`، `i18Obs`، `i18Card()`، `_renderI18`

## js/boot.js  (0 KB)
- نام‌های مهم سطح‌بالا (0 مورد): 

## js/courses.js  (139 KB)
- ماژول بسته (IIFE؛ دستی ویرایش نشود — PROJECT.md بخش ۸). شامل: ورود و به‌روزرسانی بسته‌ی دوره (`.dani-course.zip`)، مطالعه/تمرین/آزمون، دفترچه‌ی خطا، منابع، گزارش پیشرفت، و **پشتیبان کامل «همه‌چیز»** (`.dani-all.zip`: پلنر + آکادمی، بدون تکرار و فشرده).
- نقاط اتصال به برنامه: `PG.acd` (تب «دوره‌ها»)، `acdTabs`، `PG.set` (کارت پشتیبان در تنظیمات › داده)، `i18Tree`.
- ذخیره: IndexedDB `dani_academy` (جدا از پلنر) + کلید `crs_mz` / `crs_lastall` در localStorage.
- عمل‌ها (H.*): پیشوند `crs_` (مثلاً `crs_open`, `crs_allexp`, `crs_allapply`)
- **بلوک الحاقی «v3.1» انتهای همین فایل (ساخته‌ی هوش مصنوعی دیگر؛ حفظ شود):** CSS محیط راحت‌تر مطالعه‌ی درس (`.crs-lesson`) + دکمه‌ی «❓ بپرس از Claude» روی هر بخش درس (`#ask-sheet`، `.crs-ask`، `.crs-lessonbar-ask`، `window.__daniAskInit`). از DOM خروجی ماژول بالا (`.crs-lesson`, `.crs-math`, `.np`) استفاده می‌کند؛ جایگزینی ماژول باید این بلوک را عیناً نگه دارد.
- نام‌های مهم سطح‌بالا: فقط `window.daniCourses` (برای آزمون)

## js/quickaccess.js  (30 KB)
- ماژول بسته (IIFE؛ دستی ویرایش نشود — PROJECT.md بخش ۸). آیتم ⚡ بعد از «خانه» در منو + پنل جست‌وجو/سنجاق/بیشتر استفاده‌شده/همه‌ی بخش‌ها. فهرست مقصدها: آرایه‌ی `C` ابتدای فایل (برای صفحه/تب جدید یک ردیف اضافه کن).
- نقاط اتصال: `render` و `i18Tree` (پیچیده می‌شوند)، `H.qa_open`، آیتم کپی‌شده از لینک «خانه» (هر تم ظاهر خودش را می‌دهد).
- ذخیره: localStorage `dani_qa_v1`.
- نام‌های مهم سطح‌بالا: فقط `window.daniQuickAccess` (برای آزمون)

## فایل‌های غیر js
- `dani.css` استایل پایه؛ `skins.css` موتور تم؛ `themes-itachi.css` / `themes-eren.css` / `themes-aot.css` استایل تم‌ها
- `js/data/baked.js` داده‌ی اولیه (تنظیمات، تم‌ها، بسته‌های جمله، افزونه‌ی acadlessons) ؛ `js/data/du.js` مسیر عکس‌های مشترک
- `js/seed.js` انتقال یک‌باره‌ی baked به localStorage
- `sw.js` آفلاین و اعلان؛ `manifest.webmanifest` اطلاعات PWA؛ `icons/` آیکون‌ها؛ `img/` `audio/` منابع (فهرست: `img/README.md`)
