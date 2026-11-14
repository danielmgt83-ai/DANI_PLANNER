# AI.md — تنها فایلی که به هر هوش مصنوعی می‌دهی (قاعده‌ها + پرامپت + نقشه‌ی کد)

> کاربر فارسی‌زبان است، از گوشی اندروید کار می‌کند و Python/ترمینال ندارد. فارسی ساده بنویس و دستور خط فرمان نده.
> هر بار ساختار یا قاعده‌ای عوض شد، همین فایل را به‌روز کن (بخش ۹ «نقشه‌ی کد» هم).

## ⚡ خلاصه‌ی کار (اول این را بخوان؛ جزئیاتش در بخش‌های ۲ تا ۷ است)
وقتی کاربر **کل پروژه (zip) + همین `AI.md`** را می‌فرستد و کاری می‌خواهد:
1. کار را انجام بده؛ هیچ ویژگی، تم، داده یا کیفیتی کم نشود و کار هوش مصنوعی‌های قبلی حفظ شود.
2. **فقط فایل‌هایی را که واقعاً عوض شده یا تازه‌اند** برگردان (کامل، با همان مسیر و نام، در یک zip با همان پوشه‌بندی). فایل دست‌نخورده نفرست؛ کاربر فقط همین‌ها را در GitHub جایگزین/آپلود می‌کند.
3. **رعایت حجم (بخش ۴):** کمترین بایت ممکن، با استفاده از چیزهای موجود، بدون کم‌کردن ویژگی یا کیفیت؛ در گزارش حجم «قبل ← بعد» هر فایل را بنویس.
4. **`AI.md` را هر بار به‌روز کن** (نقشه‌ی کد، ترتیب اسکریپت‌ها، قاعده‌ها، تنظیم‌ها و افزونه‌های تازه، `CHANGELOG.md` هم یک خط) و **همیشه همراه فایل‌های به‌روز در همان zip بفرست**، حتی اگر فقط یک خط عوض شده؛ تا هوش مصنوعی بعدی با آخرین نسخه‌ی راهنما کار کند.
5. همراه zip سه فهرست بنویس: **جایگزین کن** (مسیر کامل)، **اضافه کن** (مسیر کامل)، **حذف کن** (یا «هیچ فایلی حذف نشود») و بگو APK دوباره ساخته شود یا فقط آپلود کافی است.
6. نکته‌های فنی (ترتیب اسکریپت‌ها، ترجمه‌ی انگلیسی، کش `sw.js`/`?v=`، ذخیره‌ی فایل در اپ) را رعایت کن و گزارش پایانی را طبق بخش ۷ بده.

## ★ اصول محصول (خواسته‌ی صاحب پروژه؛ هر کار تازه باید رعایتشان کند)
1. **چرخه‌ی کار:** اول **پیش‌بینی و برنامه‌ریزی** (چه کارهایی باید انجام شود)، بعد **اجرا و ثبت زمان**، در پایان **نتیجه، گزارش و مشکلات**. هر مرحله اعلان/یادآوری مناسب خودش را دارد و هدفش **حفظ پیوستگی** (زنجیره‌ی روزها) است؛ ویژگی تازه باید در همین چرخه جا بگیرد (`rhythm.js`).
2. **حق انتخاب:** هر سیستم تازه کنار سیستم قدیمی می‌آید (نه جایگزینش). مثال: خانه‌ی جدید / کلاسیک. انتخاب‌ها در جای موجودشان (ظاهر، زمان و اعلان) جمع می‌شوند؛ **منوی اصلی شلوغ نشود**. شیک، مینیمال و «بدون گشتن» باشد.
3. **سربرگ ثابت خانه‌ی جدید:** آیکون برنامه + سلام (صبح/ظهر/عصر بخیر، شب بخیر) + تاریخ طبق تقویم انتخابی + ساعت گوشی؛ در هیچ شخصی‌سازی حذف یا عوض نمی‌شود.
4. **جمله‌ها و تم جمله‌ها هرگز حذف نمی‌شوند** (نه داده، نه بخش). فقط از داخل خود بخش جمله‌ها می‌شود بستشان (جمع‌کردن) یا محدودشان کرد.
5. همه‌ی قابلیت‌های تازه در حالت انگلیسی هم کامل باشند و هیچ قابلیتی حذف نشود.

## ۱) پروژه
DANI Planner: پلنر شخصی فارسی (RTL، با لایه‌ی ترجمه‌ی انگلیسی)، چندفایلی، بدون سرور، HTML/CSS/JS ساده. داده در `localStorage` (کلید `hamrah_v3`). روی GitHub Pages منتشر می‌شود و با اپ اندروید (Capacitor، حالت live) باز می‌شود. شامل: برنامه‌ریز و تایمر، لاگ، یادآور و اعلان، عادت و اهداف، ددلاین، آکادمی (فلش‌کارت SM-2، دوره‌ها)، جمله‌ها، تم‌ها (Itachi، Eren، Barcelona، AOT) و پشتیبان‌گیری.
**شرط اصلی صاحب پروژه: هیچ قابلیتی حذف نشود؛ فقط اضافه یا بهتر شود.**

## ۲) شروع کار (اجباری)
1. هیچ فایلی از پیام‌های قبلی را «آخرین نسخه» فرض نکن؛ فقط فایل‌هایی معتبرند که همین حالا فرستاده شده. اول بپرس: «از وقتی فایل‌ها را آخرین بار گرفتم، هوش مصنوعی دیگری چیزی عوض کرده؟ اگر بله، آخرین ZIP را بفرست.»
2. فایل لازم را نداری؟ فقط نام دقیقش را بگو و صبر کن. حدس نزن و کد را از حافظه بازنویسی نکن.
3. فقط همین یک کار را بکن. هر چه خودت نساخته‌ای ولی در فایل هست (کار هوش مصنوعی دیگر) نگه دار و در گزارش بنویس.
4. قبل از تحویل دوباره بپرس: «از شروع کار تا الان چیزی در فایل‌ها عوض شده؟» اگر فایلی فرستاد، تغییرهایت را روی آن اعمال کن و مطمئن شو ویژگی‌های هر دو طرف مانده.
5. اگر مطمئن نیستی فایل کاربر آخرین نسخه است، صریح بگو و منتظر بمان.

## ۳) خروجی «فایل قابل‌وارد‌کردن» را به تغییر GitHub ترجیح بده
اگر کار یکی از این‌هاست، فقط یک فایل بساز که کاربر داخل برنامه وارد کند و بقیه‌ی پروژه را عوض نکن:
- تم یا ظاهر: `dani-themepack` یا `hamrah-theme` (عکس‌ها `data:image` داخل همان فایل).
- جمله‌ها: `dani-quotepack`.
- درس، فلش‌کارت، ویجت خانه، صفحه‌ی تازه، CSS: افزونه‌ی DANI (API در `js/extensions.js`؛ اگر نمی‌دانی، همان فایل را بخواه).
- دوره: بسته‌ی دوره‌ی ماژول courses (`js/courses.js`).
فقط اگر کار واقعاً تغییر هسته می‌خواهد (تایمر، اعلان و زنگ، ذخیره‌سازی، تغییر فایل موجود، ساختار) اول بنویس «این کار داخل برنامه ممکن نیست و باید GitHub را عوض کنیم» و دلیلش را بگو.
پایان کار فایل قابل‌وارد‌کردن: الف) نام فایل، ب) مراحل دقیق وارد کردن (کدام صفحه، کدام دکمه)، ج) تست‌شده‌ها و اینکه روی پروژه‌ی خودش تست نشده (اگر چنین است)، د) محدودیت‌ها.

## ۴) کم‌حجم‌ترین ساخت با همه‌ی ویژگی‌ها (اجباری؛ حجم = هزینه‌ی دانلود، آپلود با گوشی و توکن هوش مصنوعی)
هدف: کمترین بایت، بدون کم‌شدن یا بدشدن هیچ ویژگی و بدون خطر برای کدهای موجود.
- **اول از چیزهای موجود استفاده کن:** توابع، متغیرهای CSS، موتور تم (`skins.css` + `themes-engine.js`)، آیکون‌ها، عکس‌های مشترک (`js/data/du.js`) و دیکشنری‌های موجود. کد یا داده‌ی موجود را کپی نکن؛ فقط به آن ارجاع بده.
- **ممنوع:** کتابخانه، فریم‌ورک، CDN، فونت یا فایل خارجی؛ عکس/صدا به‌صورت base64 داخل کد (جز فایل تم/افزونه‌ی وارداتی)؛ فایل نمونه، دمو یا نسخه‌ی تکراری؛ کامنت‌های طولانی.
- **کد را مینیفای/مبهم نکن.** فایل‌ها باید برای کاربر و هر هوش مصنوعی بعدی قابل‌ویرایش بمانند؛ GitHub Pages خودش gzip می‌کند. پاکسازی کد نامرتبط هم نکن (قاعده‌ی «فقط یک کار»).
- **ویژگی تازه:** در یک فایل کوچک جدید یا افزونه بساز و در فایل مشترک فقط یک خط اضافه کن. چند چیز کوچک را در یک فایل جمع کن (هر فایل = یک درخواست شبکه‌ی اضافه). فایل‌های بزرگ (`courses.js`، `quotes-data.js`، `baked.js`، `i18n-extra.js`) را فقط اگر لازم است باز کن و ببر.
- **عکس تازه:** در `img/`، حداکثر ۸۳۰ پیکسل عرض (پس‌زمینه‌ی گوشی)، JPEG پروگرسیو با کیفیتی که SSIM≥۰٫۹۸۵ و PSNR≥۳۷ نسبت به اصل بماند (معمولاً ۷۰ تا ۸۰)، هدف ≤۸۰KB و سقف ۱۵۰KB؛ برای آیکون/تزئین SVG یا PNG پالتی. WebP برای عکس **تازه** مجاز است (بررسی‌کننده‌ی تم `webp` را می‌پذیرد). عکس موجود را دوباره‌فشرده نکن (قبلاً به حد خودش رسیده؛ اندازه‌ی بزرگ‌ترین‌ها: `aot-eren-scout-collage.jpg` ۴۰۱KB).
- **صدای تازه:** صدای داخل برنامه را با WebAudio بساز (بدون فایل؛ نمونه: `joyEv` در `sound-notify-backup.js`). اگر فایل لازم است: mp3 تک‌کاناله ۳۲kbps یا Ogg Vorbis تک‌کاناله؛ هرگز WAV (نمونه: زنگ ۳۳ ثانیه‌ای WAV ۱٫۴MB بود، Ogg همان ۶۴KB). صدای اعلان اندروید: `android-shell/res/raw/نام.ogg`.
- **داده و ترجمه:** برای هر متن جدید فقط یک خط `"فارسی":"English"` در `js/i18n-extra.js`؛ جمله و داده‌ی تکراری اضافه نکن؛ داده‌ای را که در `quotes-data.js` یا جای دیگر هست در `baked.js` تکرار نکن.
- **حسابرسی حجم در گزارش:** برای هر فایل تحویلی «قبل ← بعد» بر حسب KB بنویس. اگر تغییر بیش از ۲۰KB کد یا ۱۵۰KB دارایی اضافه می‌کند، دلیلش را بنویس و راه کم‌حجم‌تر را هم بگو.
- **بودجه‌ی فعلی (مبنای مقایسه، بعد از آخرین کاهش):** کد (js+css+html) ۱٫۲۲MB خام، حدود ۳۷۵KB با gzip؛ `img/` ۳٫۱MB؛ `audio/` ۲۴۸KB؛ `icons/` ۱۲۹KB؛ `android-shell/` ۴۳۹KB؛ کل مخزن حدود ۵٫۲MB. از این بالاتر نرود مگر با دلیل.

## ۵) پوشه‌بندی، ترتیب و قاعده‌های فنی
1. اسکریپت‌ها **کلاسیک‌اند، نه ES module**؛ همه یک فضای سراسری مشترک دارند. `import/export` اضافه نکن.
2. ترتیب `<script>` در `index.html` مهم است؛ بدون دلیل عوض نکن. فایل جدید را درست بعد از فایلی بگذار که به آن وابسته است. کد سطح‌بالای یک فایل نباید تابعی را صدا بزند که در فایل **بعدی** تعریف می‌شود (خطای `X is not defined`). `LANGEN`/`LANGBI` برای همین در ابتدای `core.js` هستند.
3. فایل‌های CSS کنار `index.html` بمانند (مسیر `img/…` داخل متغیرهای CSS نسبت به محل CSS حل می‌شود).
4. نام عکس/صدا: فقط `img/نام.jpg|png|webp` با حروف انگلیسی، عدد، `-`، `_`، `.`؛ بدون فاصله و زیرپوشه. صدا در `audio/`.
5. `js/data/baked.js` فقط یک‌بار روی هر مرورگر اعمال می‌شود (کلید `dani_baked_v1`)؛ تغییرش روی داده‌ی موجود اثر ندارد. افزونه‌ی `acadlessons` بعد از اولین اجرا در `localStorage` (`dani_ext_acadlessons`) می‌ماند و از همان‌جا اجرا می‌شود.
6. **نام فایل‌ها و مسیر عکس‌ها را عوض نکن** (مسیرها داخل داده‌ی ذخیره‌شده‌ی کاربر و تم‌ها هستند)؛ حذف/تغییر نام فقط با درخواست صریح.
7. **دانلود/ذخیره‌ی فایل (مهم برای اپ اندروید):** WebView اندروید دانلود `blob:` را ساکت نادیده می‌گیرد. `js/native-save.js` هر `<a download>` با آدرس blob/data را در اپ مستقیم در `Download/DANI` ذخیره می‌کند (افزونه‌ی بومی `DaniNative`؛ اگر نبود، پنجره‌ی اشتراک‌گذاری)؛ پس برای خروجی فایل فقط از `dl()` (core.js)، `download()` (courses.js) یا یک `<a download href=blob:>` استفاده کن، یا مستقیم `daniSaveFile(نام, blob)` را صدا بزن. هرگز با `window.open`، `location.href` یا `data:` در تب جدید دانلود نساز. تغییر افزونه‌های Capacitor (مثل filesystem/share) یعنی **باید APK دوباره ساخته شود**؛ این را به کاربر بگو.
8. اعلان و زنگ در اپ: `js/notifier.js` (کانال‌ها `dani-alarm-v2` و `dani-remind-v2`، صدا `res/raw/dani_alarm.ogg` و `dani_ping.ogg`). تغییر در `android-shell/`، صدا، آیکون یا مجوزها = ساخت دوباره‌ی APK. تغییر در سایت (js/css/img) = فقط آپلود در GitHub.
9. هیچ تم یا قابلیت قبلی (`itu1..3`, `itv1..3`, `eren2`, `aoe1..3`, `aow1`, `aol1`, `aom1` و غیره) حذف نشود.

## ۶-الف) قانون دوزبانه برای هر چیز تازه (اجباری؛ خواسته‌ی صاحب پروژه)
برنامه سه حالت زبان دارد: فارسی، انگلیسی، دوزبانه (پیش‌فرض: عنوان‌ها «English / فارسی»). هر ویژگی تازه باید در هر سه درست دیده شود:
1. همه‌ی متن‌ها فقط با `T(fa,en)` نوشته شود: `const T=window.daniT;` (فایل `js/dani-t.js`؛ باید قبل از فایل تو بارگذاری شود). `T` جفت را در دیکشنری ثبت می‌کند تا حالت دوزبانه هم کار کند. متن فارسیِ بدون `T` ممنوع.
2. عنوان کارت/بخش/پنجره فقط با `daniH(آیکون, fa, en)` یا یک `<h3>`/`<summary>` ساده نوشته شود، نه `<b>` یا `<div class="m">`؛ آیکون/ایموجی در همان عنوان باید در `<span>` جدا باشد (`daniH` خودش این کار را می‌کند). در حالت دوزبانه فقط h1–h4، summary، تب‌ها و placeholder دوزبان می‌شوند.
3. عنوان‌ها عدد داخل متن نداشته باشند (مثلاً «برنامه‌ی هفته» نه «برنامه‌ی ۷ روزه»).
4. بعد از ساخت، با Playwright سه حالت `db.set.lang='fa'|'en'|'bi'` را امتحان کن: در `en` هیچ حرف فارسی جز داده‌ی خود کاربر نماند؛ در `bi` هر `h3.dh` یک `.bi` داشته باشد.
5. اگر `#dksh` یا هر المان بیرون از `#pg/#ovl` ساختی، `data-nobi` روی آن نگذار (مگر بخواهی دوزبان نشود).

## ۶) ترجمه‌ی انگلیسی (برای هر متن جدید)
- رابط فارسی است و انگلیسی با لایه‌ی ترجمه‌ی زمان‌اجرا ساخته می‌شود. هر متن فارسی جدید (دکمه، پیام، عنوان، راهنما، خطا) را به‌صورت `"فارسی":"English",` به `js/i18n-extra.js` اضافه کن؛ کلید باید دقیقاً همان قطعه‌ی فارسی داخل کد باشد.
- بخش‌های `#qa-ovl`، `.qa-side`، `.qa-nav` و `#crs` را `js/i18n-late.js` ترجمه می‌کند؛ ترجمه‌اش باز هم در `i18n-extra.js` می‌آید.
- داده‌ی دوزبانه (جمله و …) فیلد انگلیسی جدا دارد (`en`).
- حالت انگلیسی را آزمایش کن (اگر مرورگر داری): نباید متن فارسی بماند، جز داده‌ی خود کاربر. در گزارش: «ترجمه‌ی انگلیسی: انجام شد، N عبارت».

## ۷) تحویل (همیشه به همین شکل)
1. **فقط فایل‌های تغییرکرده** را بفرست (نه کل پروژه و نه فایل دست‌نخورده)، هر کدام **کامل** (نه تکه‌کد)، با همان مسیر و نام؛ اگر می‌توانی در یک zip فقط با همان فایل‌ها و همان پوشه‌بندی. کاربر همان فایل‌ها را در GitHub جایگزین یا آپلود می‌کند.
   - همراهش همیشه سه فهرست دقیق با مسیر کامل بنویس: **«جایگزین کن»** (فایل‌های موجود)، **«اضافه کن»** (فایل‌های تازه)، **«حذف کن»** (فقط اگر لازم؛ اگر چیزی حذف نمی‌شود صریح بنویس «هیچ فایلی حذف نشود»).
   - کنار هر فایل بنویس سایت است یا اپ: تغییر `android-shell/`، `.github/` یا صدا/آیکون اندروید = ساخت دوباره‌ی APK؛ بقیه فقط آپلود در GitHub.
2. فایل یا عکس تازه: نام انگلیسی بدون فاصله؛ و `index.html` و `sw.js` هم به‌روز.
3. نسخه‌ی کش: اگر `index.html` متغیر `DANI_VER` دارد فقط آن را یکی بالا ببر و بگو «DANI_VER از X به X+1»؛ در غیر این صورت `?v=` فقط فایل‌های عوض‌شده را بالا ببر. در `sw.js` عدد `VERSION` یکی بالا برود و لیست `PRECACHE` با فایل‌های مجاز بازسازی شود (`tools/update-sw.py` را خودت اجرا کن؛ کاربر Python ندارد). اگر `index.html` را نفرستاده، بخواه؛ عدد را حدس نزن.
4. یک خط در `CHANGELOG.md` (جدیدترین بالا): چه فایلی، چه کاری، چه چیزی دست نخورد، حجم قبل ← بعد.
5. **`AI.md` همیشه به‌روز و همراه تحویل باشد** (نه فقط وقتی ساختار عوض شد): نقشه‌ی کد (بخش ۹)، ترتیب اسکریپت‌ها (بخش ۸)، قاعده‌ها، تنظیم‌ها و افزونه‌های تازه را بازتاب بده و فایل را در همان zip بگذار تا هوش مصنوعی بعدی با آخرین نسخه کار کند.
   - zip تحویلی فقط فایل‌های تغییرکرده + `AI.md` + `CHANGELOG.md` + (در صورت تغییر) `index.html` و `sw.js` را دارد.
   - حجم هر فایل تحویلی را با بخش ۴ بسنج؛ اگر بالا رفت، راه کم‌حجم‌تر را هم بگو.
6. قبل از تحویل اگر ابزار داری: `node --check` برای همه‌ی `js/*.js`، باز کردن برنامه در مرورگر و دیدن خطاها، حالت انگلیسی، و چند صفحه‌ی اصلی.
7. **گزارش پایانی:** الف) چه چیزی عوض کردی (فایل و کار هر کدام)؛ ب) چه چیزی عوض نکردی و حفظ کردی (از جمله کار دیگران)؛ ج) چه تست کردی و چه چیزی را نتوانستی تست کنی؛ د) حجم قبل ← بعد؛ هـ) فهرست دقیق «جایگزین کن» (فایل‌های موجود، با مسیر کامل) و «اضافه کن» (فایل‌های تازه) و «حذف کن» (فقط اگر لازم، با دلیل)؛ و) اگر باید APK دوباره ساخته شود، صریح بنویس.

## ۸) ترتیب اسکریپت‌ها (همان index.html؛ جابه‌جایی‌اش خطرناک است)
`js/data/du.js` ← `js/data/baked.js` ← `seed.js` ← `errorlog.js` ← `core.js` ← `dashboard-planner.js` ← `home-weekly.js` ← `sound-notify-backup.js` ← `themes-engine.js` ← `theme-eren.js` ← `quotes-data.js` ← `theme-aot.js` ← `modules-habits-reminders-quotes.js` ← `academy.js` ← `modules-deadlines.js` ← `theme-studio-export.js` ← `extensions.js` ← `home-desk.js` ← `notifier.js` ← `native-save.js` ← `native-extras.js` ← `quick-health.js` ← `pomodoro.js` ← `smartnext.js` ← `rhythm.js` ← `home2.js` ← `i18n.js` ← `i18n-extra.js` ← `boot.js` ← `courses.js` ← `quickaccess.js` ← `i18n-late.js`
(`courses.js` صفحه‌ی `PG.acd` را بازنویسی می‌کند؛ آکادمی از `academy.js` + `courses.js` + افزونه‌ی `acadlessons` داخل `baked.js` ساخته می‌شود.)
فایل‌های غیر js: `index.html` (فقط اسکلت)، `dani.css` (پایه)، `skins.css` (موتور تم)، `themes-itachi.css` / `themes-eren.css` / `themes-aot.css`، `manifest.webmanifest`، `sw.js`، `aot-quotes.json`، `icons/`، `img/`، `audio/`، `android-shell/`، `.github/workflows/build-android.yml`، `tools/` (`update-sw.py`، `make-single-file.py`، `zip-compare.html`)، `run-local.*` (اجرای محلی با Python).

## ۹) نقشه‌ی کد (فقط وقتی لازم است بخوان؛ ستون‌ها: بخش‌های هر فایل، صفحه‌های `PG.x`، عمل‌های `H.x`، نام‌های سراسری مهم؛ برای جلوگیری از تداخل نام)
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

## js/courses.js  (121 KB)
- بخش‌ها:
  - DANI Courses (آکادمی دوره‌ها) v1 — ماژول افزوده؛ به داده‌های قبلی پلنر دست نمی‌زند
- صفحه‌هایی که ثبت می‌کند (PG): `set`، `acd`
- نام‌های مهم سطح‌بالا (0 مورد): 

## js/quickaccess.js  (28 KB)
- بخش‌ها:
  - DANI Quick Access (دسترسی سریع) v1 — ماژول افزوده؛ هیچ بخشی از پلنر را حذف یا بازنویسی نمی‌کند
- عمل‌ها (H.*): تعداد 2 ؛ نمونه: `crs_allexp`، `qa_open`
- نام‌های مهم سطح‌بالا (0 مورد):

## js/pomodoro.js  (جدید)
- پومودورو و حالت تمرکز روی تایمر معکوس (`TM.start('cd',…)`)؛ استراحت جدا و بدون ثبت در لاگ. کارت بالای «امروز و ثبت» (با بازتعریف `recCard`)؛ عمل‌ها `pm_go`، `pm_stop`، `pm_skip`، `pm_fin`، `pm_reset`، `pm_foc1/0`. داده: `db.set.pomo`. `window.daniPomoStart(actId)` و `window.daniPomoCard`. زنگ پایان استراحت در اپ با `window.daniExtraPlan` (آرایه‌ی توابع `now→[{id,at,title,body,ch,key,ongoing?}]`؛ `notifier.js` در `plan()` می‌خواند؛ کلید پومودورو با `pomo` شروع شود).

## js/smartnext.js  (جدید)
- «بعدی چی؟»: `cands()` امتیازدهی (برنامه‌ی امروز + ★ + زمان، عقب‌افتاده‌ها، موعدها، `srsDue`، عادت‌ها)؛ عمل‌ها `nx_go`، `nx_sw`، `nx_skip`، `nx_reset`، `nx_save`، `nx_off`؛ داده `db.set.nx`. کارت را به `PG.home` و `recCard` و `HSEC.nx` وصل می‌کند. اعلان صبح/شب ۳ روز با `daniExtraPlan` (صبح: «کپسول دیروز» + اولین کار). `window.daniNextTop()`.

## js/home2.js  (جدید)
- «خانه‌ی جدید» (انتخابی؛ کلاسیک می‌ماند): `PG.home` را بازتعریف می‌کند. سربرگ ثابت (آیکون، سلام، تاریخ، ساعت)، جمله‌ی ثابت قابل‌بستن (`h2_qc`؛ حذف‌شدنی نیست)، کاتالوگ `CAT` (بخش‌های `HSEC` + کارت‌های میزکار `d:*` + `banner` + `pm` + `rhythm`)، پیش‌تنظیم‌ها `PRE`. عمل‌ها `h2_edit`، `h2_pre`، `h2_off`، `h2_mv`، `h2_close`، `h2_no`. داده `db.set.h2`. بخش تازه = یک ورودی به `CAT`. کارت «سبک خانه» در تنظیمات ← ظاهر.
- هوک در `dashboard-planner.js` (`dashToday`): اگر `window.daniWant` (آرایه‌ی کلیدها) باشد HTML همان کارت‌ها را برمی‌گرداند؛ `window.daniNoExtra` کارت‌های «بعدی چی؟»/پومودورو را از `recCard` کنار می‌گذارد.

## js/quick-health.js  (جدید)
- «شروع سریع» (چیپ‌های فعالیت‌های پرکاربرد؛ فرم کامل زیر «جزئیات و ثبت دستی»): `recCard` را از داخل می‌پیچد، پس **قبل از `pomodoro.js`** بیاید. `qk_go`، `qk_pm`، `qk_t`؛ `db.set.qk`. «سلامت اعلان‌ها» در تنظیمات ← زمان و اعلان. نکته: `Notifier` یک `const` سراسری است؛ با `typeof Notifier!=='undefined'` بخوان.

## js/rhythm.js  (جدید)
- «چرخه‌ی امروز»: برنامه ← اجرا ← بازبینی + زنجیره‌ی 🔥 + مشکلات؛ `window.daniRhythmCard`؛ `rh_plan`، `rh_eod`، `rh_save`؛ `db.set.rh`. اعلان‌ها (`daniExtraPlan`): برنامه‌ی فردا ۲۰:۳۰، محافظت زنجیره ۲۱:۳۰، بازبینی هفتگی جمعه‌ها، و اعلان سنجاق‌شده (پیش‌فرض خاموش؛ `ongoing:true` روی کانال بی‌صدای `dani-pin-v1`؛ `at` پایدار تا متن عوض شود).

## js/notifier.js
- لایه‌ی یکپارچه‌ی اعلان و زنگ (اپ اندروید Capacitor + وب). نام: `Notifier` (`init`، `sync`، `refresh`، `plan`، `isNative`، `cardHTML`)
- عمل‌ها (H.*): `nt_perm`، `nt_exact`، `nt_t10`، `nt_t60`. بازتعریف می‌کند: `showN`، `notify`، `sysNotify`، `TM.*`، `setPage` (کارت در تنظیمات ← زمان). کانال‌ها: `dani-alarm-v2`، `dani-remind-v2`.

## js/native-save.js  (جدید)
- ذخیره‌ی فایل در اپ اندروید: هر `<a download>` با blob/data را با Filesystem(CACHE)+Share به پنجره‌ی اشتراک‌گذاری می‌فرستد؛ در مرورگر/PWA بی‌اثر. سراسری: `window.daniSaveFile(name, blob)`. نیاز: `@capacitor/filesystem` و `@capacitor/share` در `android-shell/package.json`. جایگزین‌ها اگر افزونه نبود: Web Share ← کپی متن در کلیپ‌بورد (فقط متن/JSON) ← پیام راهنما.

## js/theme-aot.js
- تم‌های Attack on Titan: Eren (aoe1..3)، Erwin (aow1)، Levi (aol1)، Mikasa (aom1)؛ جمله، عکس، آیکون، برند و خانه. نام‌ها: `AOT_CH`، `AOT_Q`، `AOT_I`، `aotImg`، `AOT`، `AOT_KJ`، `AOT_W`، `aotK`، `AOTQ`، `_aotApply`، `_aotDecor`، `aotExtra`، `aotTicker`، `aotGal`، `aotHome`. فقط اضافه می‌کند (بعد از `quotes-data.js`). استایل: `themes-aot.css`؛ جمله‌ها: `aot-quotes.json`.

## js/i18n-extra.js و js/i18n-late.js
- `i18n-extra.js`: دیکشنری `I18_EXTRA` (`"فارسی":"English"`)؛ ترجمه‌ی جدید فقط اینجا اضافه شود (کلید تکراری ← این فایل برنده است).
- `i18n-late.js`: ترجمه‌ی منوی دسترسی سریع و برچسب‌های درس‌ها + پنهان‌کردن خط فارسی جمله‌ها در حالت انگلیسی.

## android-shell/ (پوسته‌ی اندروید) و ساخت
- `capacitor.config.json`، `package.json` (افزونه‌ها: android، cli، core، filesystem، local-notifications، share)، `apply.mjs` (prepare / android)، `res/` (صداهای `raw/dani_alarm.ogg` و `dani_ping.ogg`، آیکون‌ها). ساخت: `.github/workflows/build-android.yml` (Actions ← Build Android app ← Run workflow).

## ۱۰) پیوست: بخش‌هایی از راهنمای قدیمی که عیناً حفظ شد
### نقش هر فایل js (توضیح کوتاه)
| فایل | محتوا |
|---|---|
| `errorlog.js` | گزارش خطای قابل‌مشاهده با دکمه‌ی کپی (تنظیمات › داده) |
| `core.js` | ابزارها و تاریخ، داده و ذخیره (`db`, `save`)، تایم‌لاین، برنامه‌ریز، تایمر، صفحه‌ها (`PG`)، خروجی‌ها، اکشن‌ها (`H`) |
| `dashboard-planner.js` | ۱۴ چیدمان داشبورد، وضعیت‌ها، چک‌لیست امروز، اولویت و جستجو، Icon Studio، خروجی `.ics` |
| `home-weekly.js` | خانه (بخش‌های قابل‌تنظیم `HSEC`)، مرور هفتگی، روز بد، صحت داده |
| `sound-notify-backup.js` | صداها، اعلان با سرویس‌ورکر، زنگ‌ها، اشتراک پشتیبان، بررسی فایل واردشده |
| `themes-engine.js` | موتور تم + تم‌های Itachi + بسته‌های تم |
| `theme-eren.js` | تم Eren Yeager |
| `theme-aot.js` | تم‌های Attack on Titan: Eren (aoe1..3)، Erwin، Levi، Mikasa؛ فقط اضافه می‌کند (بعد از `quotes-data.js`) |
| `quotes-data.js` | داده‌ی جمله‌ها (حجیم؛ بیشتر داده است) |
| `notifier.js` | لایه‌ی یکپارچه‌ی اعلان و زنگ: `Notifier` (زمان‌بندی تایمر/یادآورها در اندروید با Capacitor، اعلان قوی‌تر وب، wake lock، کارت «اعلان و زنگ» در تنظیمات ← زمان). بعد از `home-desk.js` بارگذاری می‌شود |
| `native-save.js` | ذخیره‌ی فایل در اپ اندروید (اشتراک‌گذاری)؛ سراسری: `daniSaveFile(name, blob)` |
| `modules-habits-reminders-quotes.js` | عادت‌ها، یادآورها (اعلان داخل برنامه و سیستمی)، جمله‌ها |
| **`academy.js`** | **آکادمی: زیرساخت، منابع، فلش‌کارت SM-2، لاگ آزمون تمرینی (`PG.acd`)** |
| `modules-deadlines.js` | تنظیم ماژول‌ها، ددلاین‌ها |
| `theme-studio-export.js` | Theme Studio، خروجی Word (.docx)، یادآور ددلاین |
| `extensions.js` | سیستم افزونه‌ها (فایل، لینک یا متن) |
| `home-desk.js` | چیدمان «Desk» (۳ ستونه) |
| `i18n.js` | ترجمه‌ی فارسی ← انگلیسی در زمان اجرا |
| `i18n-extra.js` | فرهنگ‌لغت تکمیلی انگلیسی (`"فارسی":"English"`)؛ ترجمه‌ی جدید را فقط اینجا اضافه کن |
| `i18n-late.js` | ترجمه‌ی منوی دسترسی سریع و برچسب‌های درس‌ها + پنهان‌کردن خط فارسی جمله‌ها در حالت انگلیسی |
| `boot.js` | راه‌اندازی: `?go=` ، `extLoadAll()` ، اولین `render()` |
| **`courses.js`** | **ماژول دروس آکادمی (بزرگ‌ترین فایل؛ `PG.acd` را بازنویسی می‌کند)** |
| `quickaccess.js` | دسترسی سریع |

آکادمی از سه جا ساخته می‌شود: `academy.js` (فلش‌کارت و منابع) + `courses.js` (دروس) + افزونه‌ی `acadlessons` (محتوای درس‌ها، گرامر فصل ۳) که داخل `js/data/baked.js` به‌صورت رشته‌ی کد نگهداری می‌شود. آیکون‌ها: ماه کامل + نوشته‌ی Dani.

### الف) چه چیزهایی نسبت به فایل تک‌فایل v3 عوض شد (همه‌ی دستکاری‌ها) چه چیزهایی نسبت به فایل تک‌فایل v3 عوض شد (همه‌ی دستکاری‌ها)
- عکس‌ها و صدا از متن base64 به فایل تبدیل شدند (`img/`, `audio/`)؛ مسیرها جای متن را گرفتند.
- `js/seed.js`: به‌جای خواندن بلوک‌های JSON داخل HTML، از `window.DANI_BAKED_SRC` می‌خواند.
- بررسی‌کننده‌های تصویر تم (۳ جا) و دو شرط `startsWith('data:image/')` حالا مسیر `img/…` را هم می‌پذیرند.
- آیکون اعلان از `icon-192.png` به `icons/icon-192.png` رفت.
- ترتیب و توابع: بند ۳-۲ بالا.
- بقیه‌ی کد عیناً همان v3 است، فقط بین فایل‌ها بر اساس بخش‌بندی خودِ کد (کامنت‌های `/* ===== … ===== */`) تقسیم شده.
- تست: ۵۲۷ نام سراسری، لیست تم‌ها، حافظه‌ی مرورگر و ۴۰ اسکرین‌شات (همه‌ی تم‌ها و صفحه‌ها) با فایل اصلی مقایسه شد؛ تنها تفاوت، نوار جمله‌های متحرک بود.

### ب) کار روزمره (اجرای محلی، نسخه‌ی تک‌فایل، عکس، بخش جدید) کار روزمره
- **اجرای محلی:** `run-local.bat` (ویندوز) یا `run-local.command` / `run-local.sh` (مک و لینوکس)؛ نیاز به Python دارد. باز کردن مستقیم `index.html` با دوبار کلیک کار نمی‌کند (سرور لازم است).
- **انتشار:** `README.md`.
- **نسخه‌ی تک‌فایل برای ارسال/پشتیبان:** `python3 tools/make-single-file.py` ← `dist/DANI_Planner_single.html`.
- **افزودن عکس به بخش‌ها:** فایل را در `img/` بگذار و مسیرش را در همان بخش بنویس (یا از چت بخواه). آیکون جدید: SVG یا PNG در `icons/` یا `img/`.
- **افزودن بخش جدید:** یک `js/نام.js` بساز، `"use strict";` را بالایش بگذار، در `index.html` قبل از `boot.js` اضافه کن (صفحه‌ی جدید با `PG.نام=function…` ثبت می‌شود؛ نمونه: `academy.js`)، بعد `update-sw.py`.

### ج) نقشه‌ی راه (بر اساس تصمیم‌های صاحب پروژه) نقشه‌ی راه (بر اساس تصمیم‌های صاحب پروژه)
1. ✔️ جداکردن فایل‌ها، PWA (manifest، سرویس‌ورکر)، آیکون Dani.
2. ✔️ (کد نوشته و با شبیه‌ساز تست شد؛ ساخت APK هنوز روی GitHub امتحان نشده) اعلان و زنگ واقعی روی گوشی: لایه‌ی یکپارچه‌ی `Notifier`؛ اعلان پایان تایمر در لحظه‌ی شروع زمان‌بندی شود؛ خروجی `.ics` (از قبل در برنامه هست) برای زنگ تقویم گوشی؛ برای زنگ دقیق در اندازه‌ی اپ، پوسته‌ی Capacitor برای اندروید با `LocalNotifications` و مجوز آلارم دقیق (`SCHEDULE_EXACT_ALARM`) و صدای سفارشی. (iOS رایگان فقط تا حد PWA و تقویم.)
3. پشتیبان خودکار و یادآور هفتگی بکاپ؛ انتقال ذخیره به IndexedDB.
4. تایمر پومودورو، جستجوی سراسری، گزارش هفتگی/ماهانه.
5. **حالت انگلیسی کامل:** با انتخاب English همه‌ی متن‌ها، آیتم‌ها و زیرمنوها و صفحه‌های داخلی انگلیسی شوند و هیچ متن فارسی نماند (کار بعدی، بعد از اعلان و زنگ).
6. دکمه‌ی «انتشار» داخل برنامه (ارسال فایل‌های تغییرکرده به GitHub با توکن محدود، رایگان).
7. افزونه‌ی `acadlessons` به فایل واقعی در `js/` تبدیل شود و با نسخه‌اش به‌روز شود (الان فقط بار اول نصب می‌شود).
8. ✔️ ذخیره‌ی فایل (دانلود/پشتیبان) در اپ اندروید با `native-save.js`؛ نیاز به ساخت دوباره‌ی APK و امتحان روی گوشی.


## افزونه‌ی بومی DaniNative (اندروید)
- کد جاوا: `android-shell/native/` (کپی خودکار توسط `apply.mjs`). متدها: `saveFromCache`، `prune`، `openUri`، `shareUri`، `htmlToPdf`، `calendarAdd`، `pickAudio`، `playUri`، `stopPlay`، `soundChannel`.
- سمت وب: `js/native-save.js` (ذخیره) و `js/native-extras.js` (پشتیبان خودکار، PDF، تقویم، آهنگ از گوشی). هر تغییر در `android-shell/` = ساخت دوباره‌ی APK.
- تنظیم‌های تازه در `db.set`: `abk` (پشتیبان خودکار)، `abkd` (هر چند روز)، `calAuto`، `soundUri` ({uri,name,sys}).

### js/quicklog.js
کارت «ثبت ۵ ثانیه‌ای» (`window.daniQuickLog`)؛ در home2 با کلید `ql`. بارگذاری قبل از home2.js. داده‌ی جدید ندارد.

### js/dock.js
نوار ابزار سریع پایین صفحه (`#dkbar` + برگه‌ی `#dksh`)، `db.set.dk={on,list}`. بعد از home2.js بارگذاری شود. آیتم جدید = یک ورودی در `ITEMS`.

### js/setsearch.js
جستجوی تنظیمات (`#sqbox`)؛ آخرین فایل بعد از dock.js. تب‌ها را برای ساخت شاخص رندر می‌کند.

### js/emptycta.js
دکمه‌ی «قدم اول» کنار پیام‌های خالی خانه/میزکار (RULES = regex ← دکمه‌ها). بعد از setsearch.js بارگذاری شود.

### js/insight.js + js/quicklog.js + home2.js (به‌روزرسانی)
- `insight.js`: کارت «الگوی تو» (`daniInsightCard`, کلید `in`). `quicklog.js`: کارت‌های `ql` (ثبت ۵ ثانیه‌ای) و `tk` (یک کار برای امروز) + دکمه‌ی برگردان.
- `home2.js`: دکمه‌ی «شخصی‌سازی خانه» پایین صفحه (`custBtn`)؛ حالت کلاسیک: `db.set.h2.cx` (ابزارهای اضافه) و `db.set.h2.cl={o,x}` (ترتیب/پنهان‌کردن کارت‌های هر تم، `applyCL()` بعد از render).

### js/soundcenter.js
صدای جدا برای هر دسته‌ی اعلان (alarm/rem/habit/gen). `db.set.snd2`, `db.set.sndCh`, `window.daniChFor`. دسته‌ی alarm همان `db.set.soundUri` (native-extras) است. متد native جدید: `pickRingtone` در DaniNativePlugin.java (نیازمند APK جدید).
قانون تاریخ: هیچ‌جا `<input type="date">` نگذار؛ از متن + `fmtD`/`readD` استفاده کن تا تقویم انتخابی تنظیمات رعایت شود.

### js/qa-more.js · js/capsule.js · js/onboard.js
- `qa-more.js`: ورودی‌های جستجوی سراسری (آرایه‌ی X) + `daniQADyn`. قابلیت جدید = یک خط در X.
- `capsule.js`: مدیریت کپسول (`db.days[d].tomorrow`).
- `onboard.js`: راهنمای شروع؛ گام جدید = یک شیء در آرایه‌ی S (k, t, why, done(), body()) + هندلرهای `ob_*`. بعد از qa-more.js بارگذاری شود.

### js/dani-t.js · js/onboard.js (v2)
- `dani-t.js`: `daniT(fa,en)` و `daniH(icon,fa,en)` (قانون ۶-الف).
- `onboard.js` v2: راه‌اندازی (اول زبان)، «پروژه‌ی جدید» (فعالیت+موعد+برنامه‌ی هفته+یادآور)، «مرکز راهنما» (۱۴ قابلیت با تیک از داده). گام/قابلیت جدید = یک ورودی در `ST` یا `FEATS`.

### js/livesync.js (+ فایل‌های بومی ویجت)
- هر متن جدید با `T(fa,en)`. قابلیت‌های بومی با `DN().liveStart/widgetSet/syncPick` تشخیص داده می‌شوند؛ اگر نبود، چیزی خراب نمی‌شود.
- `save` پوشانده شده تا اعلان/ویجت به‌روز و همگام‌سازی خودکار (۲۰ ثانیه تأخیر) زمان‌بندی شود. ادغام نباید `db.set` را لمس کند (تنظیمات هر دستگاه جداست).
- کانال اعلان زنده: `dani-live-v1` (بی‌صدا). شناسه‌ی اعلان ۷۷۱۰.

- ویجت سه اندازه دارد؛ دکمه‌های بدون‌بازشدن از صف `dani_widget.q` (فرمت `hab:<id>:1|0` و `log:<دقیقه>`) با `widgetPop` اعمال می‌شوند. فرمت جدید را بدون به‌روزکردن `DaniWidgetAction` و `widgetPop` تغییر نده.

### js/helpfab.js
- دکمه‌ی راهنما (`#hfab`) با `data-nobi`. متن‌ها با `T(fa,en)`. راهنما را از `daniOnboard.hub` باز می‌کند.

### js/compact.js
- منوی ادغام‌شده فقط نمایش است؛ هیچ صفحه/داده‌ای حذف نشده. صفحه‌ی `cm` گذراست: `page` را به آخرین تب تغییر می‌دهد. کارت‌های جدید در تنظیمات اگر `h3` مستقیم داشته باشند خودکار جمع‌شونده می‌شوند.

### همگام‌سازی (به‌روز)
- جایگزینیِ کامل فقط وقتی انجام می‌شود که این دستگاه از آخرین همگام‌سازی تغییری نداشته (`dani_sync_dirty` خالی). هر ذخیره‌ی عادی آن را روشن می‌کند؛ ذخیره‌های داخلِ همگام‌سازی با `busy` استثنا هستند.

### js/bin.js · js/growth.js
- سطل بازیافت فقط شناسه‌دار بودن را می‌خواهد؛ مسیرهای ردیابی‌شده در `MP`/`now()` هستند. بخش جدیدی که حذف می‌کند و می‌خواهی در سطل باشد را همان‌جا اضافه کن.
- برنامه‌ی فردا فقط می‌خواند و فقط به `db.plans[فردا]` می‌نویسد.

### js/safety.js
- `window.daniPlanFilter(out,now)` را notifier.js صدا می‌زند. هر اعلانِ ضروری (کانال alarm یا key با timer/pomo شروع شود) تعویق نمی‌خورد.

### js/phase2.js
- هیچ فرمِ موجودی تغییر نکرده؛ همه با پوشاندن PX/PG یا DOM بعد از render. اهداف ایندکسی‌اند (بدون id) پس زیرمرحله‌ها با ایندکس هدف کار می‌کنند.

### js/fx.js
- هر نسخه‌ی مهم: `VER` و آرایه‌ی `WN` (دوزبانه) را به‌روز کن تا «چه چیزی تازه است» یک‌بار نمایش داده شود.

## js/lock.js  (جدید، مرحله ۶)
- قفل PIN (۴/۶ رقم): هش PBKDF2 در `localStorage.dani_lock` (فقط همین دستگاه، نه پشتیبان/همگام‌سازی)، `dani_lock_f` (تلاش اشتباه)، کد بازیابی، «پاک‌کردن همه‌ی داده» به‌عنوان آخرین راه. `index.html` در `<head>` با یک اسکریپت کوچک تا بارگذاری `lock.js` محتوا را پنهان می‌کند (`html[data-lk]`)؛ اگر `lock.js` تا ۱۲ ثانیه بالا نیامد پنهان‌سازی برداشته می‌شود (جلوگیری از قفل‌ماندن).
- رمزگذاری فایل همگام‌سازی: `window.daniCrypt {on,isEnv,enc,dec,ask,setPw,clear}` (AES-GCM + PBKDF2 ۲۰۰هزار دور؛ رمز در `dani_sync_pw`). `livesync.js` در `doSync` و ادغام دستی از آن استفاده می‌کند (`decTxt/encTxt`). پاکت فایل: `{"dani_enc":1,...}`.
- عمل‌ها: `lk_set lk_chg lk_off lk_now lk_pw lk_pwoff lk_mke`. کارت در تنظیمات ← داده‌ها.

## js/share-csv.js  (جدید، مرحله ۶)
- کارت اشتراک پیشرفت: تب `shr` در نتیجه‌گیری (`RT`)؛ بوم ۱۰۸۰×۱۳۵۰؛ `db.set.sc {p,names,habits,dark,who}`؛ `H.sc_save` با `daniSaveFile`/Web Share/دانلود.
- ورود CSV: کارت در تنظیمات ← داده‌ها؛ `daniCsvImport.parseCSV/analyze`؛ ثبت‌ها با `src:'csv'`؛ قبل از نوشتن `snap()`.

## js/notifx.js  (جدید، بقیه‌ی مرحله ۵)
- اعلان گروهی (`db.set.ng`، هوک `window.daniNoteExtra` در `toNote` از `notifier.js`) و تاریخچه‌ی اعلان‌ها (`dani_ns` برنامه‌ی آینده، `dani_nh` تاریخچه؛ از طریق پوشاندن `daniPlanFilter`، بعد از `safety.js`). کارت در تنظیمات ← زمان.
- `notifier.js`: نوع اعلان `dani-hab` با دکمه‌ی `hdone` برای یادآورِ متصل به عادت (`tickHabit`).

> ترتیب تازه‌ی انتهای `index.html`: … `safety.js` ← `notifx.js` ← `phase2.js` ← `lock.js` ← `share-csv.js` ← `fx.js` ← `qa-more.js` ← `onboard.js` ← `i18n-late.js`.

## js/smart.js  (جدید، v38)
- افزودن سریع با جمله (`H.qn_add`, `daniQuickParse`؛ کارت بالای تب «برنامه»؛ فقط `db.plans[روز]` می‌نویسد)، ساعت‌های طلایی (تب `gld` در نتیجه‌گیری)، مناسبت‌ها و تعطیلات (`daniOccasions`؛ شمسی ثابت دقیق، قمری با Intl islamic-civil ±۱ روز؛ `db.set.oc`)، آینه‌ی IndexedDB (`dani_mirror`، پیشنهاد بازگردانی اگر داده‌ی اصلی خالی بود).
- `share-csv.js`: گزینه‌ی «یک سال» در کارت اشتراک (جمع‌بندی سال).

## js/daily.js و js/tomorrow.js  (جدید، v39 = «مرحله‌ی الف: چرخه‌ی روز»)
- `daily.js`: منوی ساده (`db.set.nv.mode` = `simple` پیش‌فرض | `classic` = منوی قبلی بدون تغییر): امروز، فردا، موعد و عادت، نتیجه‌گیری، بیشتر؛ صفحه‌ی `PG.day` (راه‌اندازی یک‌بار، برنامه‌ی امروز با پیشرفت، «برگرد به برنامه»، ثبت یکپارچه [کرنومتر/شمارش‌معکوس/پومودورو/ثبت سریع + تبدیل کرنومتر به پومودورو]، تایم‌لاین با بازه‌های ثبت‌نشده‌ی قابل‌ضربه، نتیجه)، تب `eod` («نتیجه‌ی امروز») در نتیجه‌گیری، `PG.mx` («بیشتر/راه‌اندازی»: خانه، میزکار، تنظیمات و همه‌ی بخش‌ها). شخصی‌سازی صفحه‌ی امروز: `db.set.dy {hide,order,gaps,setup}`.
- `tomorrow.js`: `PG.tmr` = ویرایشگر برنامه‌ی فردا/امروز (`daniPlanOpen(date)`): کادر چندخطی ← ردیف‌ها (فعالیت+زیرمجموعه+مدت+ساعت+★)، ظرفیت واقعی ۱۴ روز، پیشنهادها (`daniSuggest` از growth.js)، «توقع من» (`db.days[d].exp`)، مهم‌ترین کار (`db.days[d].goal`)، چیدن در ساعت‌ها. اعلان‌ها: تکرار شب (`db.set.tn {rep,gap}`) و «نتیجه‌ی امروز» (`tn.eod/tEod`) از `daniExtraPlan`؛ ضربه روی اعلان (`localNotificationActionPerformed` با `tap` و پیام SW) مستقیم صفحه‌ی درست را باز می‌کند (`route`).
- `H.rh_plan` (چرخه) و `window.daniPlanOpen` به همین صفحه می‌روند.

## js/datefield.js و js/pgband.js  (v41 — «مرتب‌سازی»، نه حالت جدید)
- `datefield.js`: `daniDF.html(id,iso)` / `daniDF.get(id)` — کادر تاریخ طبق `db.set.cal` (شمسی: سه لیست؛ میلادی: input date). **قانون: هر ورودی تاریخ جدید فقط با این بسازید** (هیچ `type=date` خام در حالت شمسی).
- `pgband.js`: نوار تم بالای همه‌ی صفحه‌ها جز خانه/تنظیمات (آیکون+سلام+تاریخ و ساعت+جمله‌ی شخصیت تم از `heroQuote(SKINS[skId()].qchar)` یا `tag`)؛ `db.set.bd {all,q,off:{page:1}}`؛ کارت `#bdcard` در تنظیمات←ظاهر؛ وقتی نوار هست `#qcard` (جمله‌ی امروز) پنهان می‌شود.
- «برنامه‌ی فردا» حالا تب `tmr` در میزکار است (`DT`, `PX.tmr`)؛ `daniPlanOpen` در منوی کلاسیک به آن می‌رود. منوی «ساده» (daily.js) **دیگر پیش‌فرض نیست** (`db.set.nv.mode` پیش‌فرض `classic`).
- قرار مرتب‌سازی (v42…): ۱) یک کارت «ثبت» به‌جای همه‌ی ابزارهای ثبت (کرنومتر/شمارش‌معکوس/پومودورو/تمرکز/ثبت سریع/۵ثانیه‌ای/دسترسی سریع/ریتم/بعدی‌چی) با «شیوه‌ی اندازه‌گیری» برای هر فعالیت؛ ۲) میزکار با تب‌های روشن (برنامه ← زیرتب‌ها)؛ ۳) پروژه+موعد+هدف یک بخش (موعد اختیاری، عادت/یادآور/ساعت)؛ ۴) هر کارتی که تکراری شد با کلید روشن/خاموش به همان یکی وصل شود.

## v52 — خانه‌ی قابل‌شخصی‌سازی، فعالیت‌ها، راهنما
- daily.js: `homeParts()` خانه‌ی تم را به th/qt/ls می‌شکند؛ `SECS` = th,sp,pl,tr,tl,ed,ls,qt + اختیاری wk,cp,dl,nt (پیش‌فرض مخفی؛ `db.set.dy.seen`). `DY().order/hide`. نوار بالای خانه: ⚡ (`qa_open`) و ⚙ شخصی‌سازی. **کد بعد از IIFE باید `const T=window.daniT` خودش را بگیرد** (T سراسری چیز دیگری است).
- acts2.js: `act.fav`، `daniQuickActs()`، `db.set.qan` (تعداد دکمه‌ی سریع)، `H.act_new/afav/amv`؛ در ثبت، برنامه‌ی روز و صفحه‌ی فعالیت‌ها استفاده می‌شود.
- guide2.js: `H.ob_open` را بعد از onboard.js جایگزین می‌کند؛ `db.set.gd {i,done,fin,auto}`؛ ۸ قدم با دکمه‌ی رفتن به صفحه‌ی واقعی.
- quickaccess.js: لنگر منو `a[data-p=day]`؛ قا​لب جدید در qa-more.js (p2day, p2exp, p2busy, pj, note).

## v51 — فعالیت‌ها (`db.acts`) تنها منبع است؛ ویرایش از `dash/acts` (✏️ در Track، دکمه در Projects). `focusGoal(d)` در secPlan. `PX.stats` با `hCompare()` شروع می‌شود. regex `DUP` در heroTop گسترش یافت.

## v50 — `heroTop()` لیست‌سیاه (DUP regex) به‌جای لیست‌سفید: تم جدید خودکار کامل می‌ماند. انتهای daily.js: زبانه‌های dash today/plan/tmr/cal/goals از DT برداشته و `PG.dash` آن‌ها را به day/plan2/pj هدایت می‌کند.

## v49 — `heroTop()` برای همه‌ی تم‌ها (خانه‌ی تم یا میز پیش‌فرض) با لیست سفید؛ اگر `.deskhead` نبود سلام+آیکون+تاریخ افزوده می‌شود.

## v48 — منو «خانه»؛ `PG.mx` («ابزارهای من») دیگر باز نمی‌شود (به day می‌رود). شناسه‌ی داخلیِ صفحه هنوز `day` است.

## v47 — تم‌ها در «امروز»، مرکز پشتیبان
- `heroTop()` در daily.js: برای تم‌های دارای خانه‌ی اختصاصی (`PKR.home[k]`، itu، `home==='desk'`) خروجی `deskHTML()` را می‌گیرد و فقط عنصرهای لیست‌سفید را نگه می‌دارد (hero/tick/strip/chips/gal/scrolls/polar/aot-x/uch-g2/deskhead + «یک اندیشه»). تم جدید با کلاس‌های دیگر باید به `KEEP` اضافه شود. «بعدی‌چی؟»، «موعد بعدی»، «شخصی‌سازی خانه» عمداً نیستند.
- `js/backupc.js`: کارت `#bkc` بالای تب «داده‌ها» (پشتیبان کامل، بازیابی، یادآوری، وضعیت رمز). برگه‌ی `uch` (baked.js) در زمان اجرا به «افزونه‌ها و گزارش» تغییر نام می‌دهد.

## v46 — منوی تازه و plan2.js
- `js/plan2.js`: `PG.plan2` با زبانه‌های day|exp|busy|hab|rem|dl|cal|tpl؛ `window.daniP2Go(tab,date)`؛ ساعت‌های پر در `db.set.bz.items[{id,t,s,e,days,date,dnd}]` و `window.daniBusy(date)`؛ فیلتر اعلان در بازه‌ی dnd؛ انتظار هفته/ماه `p.wk/p.mo` و `x.wk` در پروژه‌ها؛ `daniWeekLines`.
- منو همیشه: day, plan2, pj, res, (acd), set. `PRIMARY` در daily.js. `daniPlanLoad(d)` فقط وقتی تاریخ عوض شده بارگذاری می‌کند.
- کارت‌های سبک منو/خانه‌ی تازه از تنظیمات برداشته شد.

## v45 — بازگردانی و ساده‌سازی (به‌درخواست کاربر)
- `studiocard`/`pkcard` (استودیوی تم و بسته‌های تم) **برگردانده شدند** — کاربر آن‌ها را لازم دارد؛ فقط در لیست حذف v43 بودند. حالت تمرکز (`pm_foc1`، صفحه‌ی تاریک) حالا در حالت «پومودورو»ی کارت «ثبت» دیده می‌شود (فرم کامل `daniPomoCard`: کار/استراحت/دور/خودکار).
- `tdCard` در home2.js وقتی «ثبت یکپارچه» روشن است فقط کارت «بعدی؟» + `daniLogCard` را نشان می‌دهد (به‌جای ۹ زبانه: بعدی، ثبت، شروع، کار، چرخه، تمرکز، الگو، مرور، فردا). `window.daniLogOn`.
- **مهم:** پیش از حذف یا مخفی‌کردن هر چیز با کاربر لیست نهایی را تأیید کن؛ او فقط بخش‌های «بی‌استفاده» را می‌خواهد حذف شود، نه ابزارهای ساخت (تم، تمرکز).

## v44 — پروژه‌ها = موعد + هدف + عادت + یادآور (js/projects.js)
- `p.hb` (شناسه‌ی عادت‌های `zHB().items`)، `p.rm` (شناسه‌ی یادآورهای `zRM().items`)، `p.dl` موعد؛ تاریخ دستی ← یک موعد خودکار در `zDL()` (`p.dlAuto`، هشدار ۱ روز و ۱ ساعت قبل) تا در بخش موعدها و اعلان‌ها هم باشد. موعدهای مستقل و `db.goals` در بخش «بدون پروژه» فهرست می‌شوند؛ `pj_fromdl`/`pj_fromgl` پروژه می‌سازند (`g.pj` علامت تبدیل). داده‌ی قبلی تغییر نمی‌کند. عادت‌ها/یادآورها از همان ماژول‌ها ساخته می‌شوند (قالب داده‌ی خودشان)، پس در صفحه‌ی عادت‌ها/یادآوری‌ها هم دیده می‌شوند.
- بعدی: نمایش در «میزکار» (تب پروژه) و ادغام صفحه‌ی موعدها با همین صفحه (الان هر دو هستند)، تطبیق جمله‌ی برنامه‌ی فردا با نام پروژه/بخش.

## v43 — حذف‌های تأییدشده + قانون تم
- با تأیید صاحب پروژه از **نمایش** برداشته شد (کد برای بازگشت مانده): بنر «خانه‌ی جدید» (home2.js)، «راستی‌آزمایی انتقال از v4» (home-weekly.js)، `pkcard` (home-desk.js) و `studiocard` (quotes-data.js `injectSkinCard`)، `pfdet` (growth.js؛ پیشنهاد فردا در تب «برنامه‌ی فردا» هست)، `dlSel` یا «چیدمان و طرح» (dashboard-planner.js).
- **قانون تم (از صاحب پروژه):** هر تم ویژگی‌های منحصر‌به‌فرد خودش را دارد (کادر جمله، عکس شخصیت، …). هیچ قالب/حالت تازه‌ای نباید آن‌ها را حذف یا جایگزین کند؛ کسی که ظاهر ساده می‌خواهد از تم‌های پیش‌فرض استفاده می‌کند. نوار تم (pgband.js) فقط از همان جمله/شخصیت تم فعلی می‌خواند.
- صاحب پروژه از «قالب‌ها/حالت‌های» ساخته‌شده توسط ما (منوی ساده، …) راضی نیست؛ بعداً درباره‌شان تصمیم می‌گیریم. تا آن موقع چیزی درباره‌شان تغییر نکند.

## v42 — ثبت یکپارچه و گروه‌بندی (js/daily.js، js/groups.js)
- کارت «ثبت» یکپارچه = `secTrack` در daily.js (`window.daniLogCard`): کرنومتر، شمارش‌معکوس، پومودورو، ثبت سریع (daniQuickLog)، ثبت دستی (فرم اصلی `window.daniRecRaw` از dashboard-planner.js)، زیرمجموعه، یادداشت جلسه، میانبرها. شیوه‌ی هر فعالیت: `db.set.lg.ms[actId]`. کلید: `db.set.lg.on` (پیش‌فرض ۱؛ خاموش = کارت‌های جدای قدیمی). وصل‌شده به `recCard` (میزکار←امروز)، `hFocusTimer` (خانه‌ی میز)؛ `hQuickLog` و `hActionsDesk` در حالت یکپارچه خالی‌اند. توجه: `recCard` را compact.js/pomodoro.js/quick-health.js/smartnext.js هم می‌پیچند؛ لایه‌ی daily.js آخرین است و در حالت روشن آن‌ها را دور می‌زند.
- `groups.js`: کارت‌های هم‌هدف را زیر `<details class="bgrp">` جمع می‌کند — روی خروجی متنیِ `setPage` و `PX.plan` (قبل از ترجمه) + `domPass()` برای کارت‌هایی که با DOM می‌آیند. تعریف گروه‌ها: `DEF` (کلید تب: look/time/data/plan). کارت «پشتیبان کامل» تکراری یک بار نشان داده می‌شود. خاموش: `db.set.gp.off`. **هر کارت تازه‌ی تنظیمات را در یکی از گروه‌های DEF ثبت کن (id یا زیررشته‌ی عنوان).**

## js/projects.js  (جدید، v40 = «مرحله‌ی ب: پروژه‌ها»)
- داده: `db.mods.pj {items:[{id,name,dl,due,hrs,from,arch,parts:[{id,a,s:[],hrs}]}],today,v}`. بخش = یک فعالیت (`a`)، نوع‌ها = زیرمجموعه‌های همان فعالیت (`s` خالی = همه). هیچ فیلدی روی ثبت‌ها اضافه نشده؛ حساب‌کردن از `E(a,b)` با فیلتر `actId/subId`. موعد: `dl` (شناسه‌ی موعد در `zDL().items`) یا `due` دستی. `stats(p,v)` → آهنگ لازم، هدف و انجام‌شده‌ی دوره (d/w/m؛ ماه از `rngDates` با `rng.p='m'`).
- صفحه‌ی `PG.pj` (دکمه‌های `pj_*`)، ویرایشگر مودال با وضعیت `ED`، کارت کوچک `#pjmini` در «امروز» و «برنامه‌ی فردا» (`db.mods.pj.today`)، دکمه‌ی «＋ فردا» با `window.daniPlanAdd(date,actId,subId,min)` (در tomorrow.js). در منوی ساده از «بیشتر» و در کلاسیک از منوی اصلی در دسترس است. ترتیب اسکریپت: بعد از `daily.js`.

## ★ نقشه‌ی راه (جایی که کار را نگه داشتیم)
وضعیت: مرحله‌های ۱ تا ۶، بقیه‌ی مرحله‌ی ۵، v38 (smart.js) و «مرحله‌ی الف» (v39) ساخته شده. کاربر باید v23 تا v39 را به ترتیب آپلود کند. خواسته‌های صاحب پروژه (همه‌ی بخش‌ها باید **قابل‌انتخاب و اختیاری** باشند؛ چیزی حذف نشود):
- **مرحله‌ی ب: انجام شد در v40 (projects.js)؛ باقی‌مانده: تطبیق جمله‌ی ویرایشگر فردا با نام پروژه/بخش، نمایش ساعت پروژه در تایم‌لاین، بخش مشترک بین چند پروژه بدون شمارش دوباره.** (شرح اولیه:) مثال: MBA (موعد، هدف ساعت) ← ریاضی/انگلیسی/GMAT ← تمرین/مرور جزوه/فیلم. هر ثبت زمان به یک بخش وصل شود؛ نمایش روز/هفته/ماه: روزهای مانده، ساعت لازم در روز، ساعت گذاشته‌شده، سهم هر بخش و نوع کار. فعالیت‌ها و زیرمجموعه‌های فعلی به بخش‌ها نگاشت شوند (بدون ازدست‌رفتن داده)؛ یک بخش می‌تواند در دو پروژه باشد. موعدها (`modules-deadlines.js`) پایه‌ی پروژه‌اند. در ویرایشگر فردا، تطبیق جمله با «پروژه/بخش/نوع» (الان فقط فعالیت+زیرمجموعه با `matchAct`).
- **مرحله‌ی ج (نیازمند APK):** اعلان ساعتی «این ساعت چه کردی؟» با ≤۳ دکمه‌ی فعالیت + «دیگر» + «کلاس/مشغول»؛ دکمه‌ها بدون باز شدن برنامه (گیرنده‌ی بومی مثل `DaniWidgetAction`)؛ تکرار بعد از ۵ دقیقه؛ بازه‌ی ساعت/فاصله/«همان قبلی» قابل‌انتخاب؛ «بلوک مشغول» (یک‌بار | همین هفته | هفتگی | روزهای و ساعت‌های دلخواه) که اعلان را خاموش و تایم‌لاین را پر می‌کند؛ ویجت تایم‌لاین روز (نوار رنگی + کار فعلی)؛ اعلان سنجاق‌شده‌ی «الان چه می‌کنی؟». اعلان تمام‌صفحه‌ی شبیه تماس در اندروید جدید برای برنامه‌های معمولی ممنوع است؛ heads-up + صدای کوتاه.
- ادغام بیشتر ابزارهای مشابه (کرنومتر، ثبت ۵ ثانیه‌ای، پومودورو، تمرکز، بعدی‌چی؟) در کارت «ثبت»؛ در `daily.js` شروع شده، خانه‌ی جدید و dock هنوز کارت‌های جدا دارند.
- بعد از آزمایش یک‌هفته‌ای: مشکل‌های کاربر ← انتقال کامل ذخیره‌سازی به IndexedDB (آینه‌ی `dani_mirror` فعلاً هست) ← ثبت صوتی، تقویم دوطرفه، خلق‌وخو، میان‌بر آیکون، سطح و نشان‌ها، اوقات شرعی، Health Connect.
قاعده‌ها همان است: هیچ قابلیتی حذف نشود، همه‌ی متن‌ها دوزبانه، تحویل در zip با فهرست «جایگزین/اضافه/حذف» به فارسی ساده و ذکر نیاز به APK.

## v53 — guide2.js (راهنمای شروع) و helpfab.js
- `js/guide2.js` باید بعد از onboard.js بارگذاری شود (`H.ob_open/ob_hub/ob_reset` را بازنویسی می‌کند). مراحل `STEPS`: lang,cal,pj,sch,exp,log,res,fin. وضعیت: `db.set.gd`. `window.daniPageTip()` نکته‌ی هر صفحه برای پنل «؟» (نقشه‌ی `TIPS`). ساخت پروژه با فعالیت cat:learn + زیرمجموعه‌ها + بخش با wk + موعد با `zDL().items`. کد بیرون IIFE باید `const T=window.daniT` خودش را داشته باشد.
- v54: guide2 first-run flag; step exp has live calc().

## v56 — برنامه (plan2.js) و مدیر فعالیت‌ها (acts2.js)
- plan2: `TABS` = day|exp|bh|cal؛ `OLD` نقشه‌ی کلیدهای قدیمی؛ `P2.sub` = busy|hab|rem. `embed()` نوار `.cmbar` ماژول‌ها را حذف می‌کند. `legacyCards([sel])` کارت‌های IIFE-محلیِ `PX.plan` (مثل `#tpcard`, `#ocdet`) را از خروجی HTML می‌کشد. `vd` را قبل از رندر کارت‌های قدیمی (`pst/ppr/pmv/pdel`) روی تاریخ صفحه بگذار.
- tomorrow.js: `addLine` جمله‌ی تاریخ‌دار را مستقیم در `db.plans[date]` می‌گذارد؛ `data-tpr` تکرار را در `db.set.prec` می‌سازد؛ `cfgHTML` در تنظیمات←time.
- acts2: `PX.acts` کارت‌محور؛ `PG.dash` وقتی dt==='acts' بدون tabBar؛ `H.ftag_add`, `H.trn`.

## v57 — تقویم یکپارچه (plan2.js)
- `calTab` با `monthOf(base)` (شمسی/میلادی) و `marks(d)`؛ حالت‌ها `P2.cm` (ماه نمایشی) و `P2.cs` (روز انتخابی)؛ دکمه‌ها `p2_cd/p2_cm/p2_cp/p2_cr/p2_cb`. `PX.cal` قدیمی دیگر در برنامه استفاده نمی‌شود (برای میزکار قدیمی می‌ماند).

## v59 — موتور پیش‌بینی (projects.js)
- `window.daniFcast(p)` → {pace(min/day), perDay/Week/Month, left, due, bud, rem, finish, days, margin, need, total, status}. `daniFcVerdict(f)` متن؛ `daniFcLine(p)`، `daniFcForDl(dlId)`، `daniFcFinishOn(date)`. آهنگ = `p.wk` (یا جمع `x.wk` بخش‌ها؛ اگر خالی: سرعت واقعی ۱۴ روز). ورودی UI: `p.pd`(ساعت/روز) و `p.dpw`(روز/هفته) → `p.wk=pd*dpw`. هر جای تازه‌ای که پروژه/موعد نشان می‌دهد باید از همین موتور استفاده کند، نه محاسبه‌ی جدا. `pj_save` فیلد `x.wk` بخش‌ها را حفظ می‌کند.

## v60 — results2.js
- `RT` = eod|stats|rep. `PG.res` را (آخرین لایه) می‌پیچد: `body(k)` خروجی زبانه‌ی قدیمی را بدون tabBar می‌گیرد، `fold()` کارت‌های بدون‌والد-`.c` با `h3` را به `<details>` تبدیل می‌کند. `OLD` نگاشت mon/gld→stats و shr→rep. اگر زبانه‌ی تازه‌ای به RT اضافه شد، همین‌جا ثبتش کن.

## v72 — guide continue
- `window.daniGuideProgress()` ← `{i,n}` یا null؛ `#gdbar` فقط وقتی راهنما شروع‌شده/ناتمام و `gd.hint` نیست؛ `H.gd_hint_x`.

## v71 — timeline (daily.js)
- `window.__tld` = روز دیده‌شده؛ `secTl()` فلش‌ها `H.tl_nav`، `H.tl_add`؛ `tlHTML(d,{pastGaps})`؛ بازه‌ی `.eb` دارای `data-a="eedit"`؛ `window.__gapDay` در `dy_gapsave`.

## v70 — usetime.js
- `cls(actId)` ← `a.use` یا خودکار؛ `calc(from,to)`/`range('d|w|m')`؛ `slim()`/`full(k)`؛ تزریق بعد از `render` (page `day` زیر کارت Result، `plan2` بعد از `.p2st`) و در `PG.res` برای `eod`/`rep`. فرم فعالیت: `select#fuse` و `H.asave` پیچیده.

## v69 — dlcard.js + sentences.js
- `db.set.dlh={hs,th[3],col,pulse,ph,fc,dir{},phr{}}`؛ `dlDashHTML/hDl` بازتعریف؛ سطح `level(ms)`؛ هر `#dlcard` داخل deskHTML در `homeParts` حذف می‌شود (کارت خانه از بخش‌های خانه می‌آید). sentences.js: `PG.qt` تب‌های set/mine را استاب می‌کند و محتوا را از `_qt` به `details#sntg` در Settings/look می‌برد.

## v68 — calm.js
- `db.set.dq={on}`؛ `apply()` بعد از هر `render` (و MutationObserver با debounce) کلاس `.dqh` را روی هیرو/گالری/کارت‌های غیر KEEP می‌گذارد؛ CSS `body.dq .dqh{display:none}`؛ `dqall` برای «نمایش همه». افزودن به ⚡ با `QA.catalog.push` (id `x-calm`).

## v67 — checkin.js
- `db.set.chk={on:false,ev,from,to}`؛ `daniExtraPlan` کلید `chk-<روز>-<دقیقه>`؛ `route('chk-…')` در tomorrow.js ← `daniCheckin.open()` ← `H.dy_gap({dataset:{s,e}})` با `lastGap()`. وب: `setInterval` ۳۰ثانیه؛ اگر تایمر `running` باشد نمی‌فرستد.

## v66 — results2.js group()
- در `rt==='stats'`: `group(fold(stats)+fold(gld),GR)`؛ GR چهار گروه با regex روی تیتر دوزبانه؛ هر گروه ≥۲ بخش دارد؛ بخش‌ها `div.sbg` می‌شوند. settings2.js `lookTab`: label «کارت‌های داشبورد» و چک‌باکس‌ها داخل `<details>`.

## v65 — backuppw.js
- `HTMLAnchorElement.prototype.click` پیچیده می‌شود: دانلود blob با نام `*.dani-all.zip` (غیر از DANI-safety) وقتی `db.set.bkpw` روشن است → `daniCrypt.ask` → `DANIENC1`+it(4)+salt(16)+iv(12)+AES-GCM. ورودی: capture روی `change` فایل `[data-crs-file=all]` به‌طور همگام متوقف می‌شود، اگر سرآیند قفل بود رمز می‌پرسد و فایل رمزگشایی‌شده را با رویداد change دوباره می‌فرستد (`_dn`).

## v64 — remain.js
- `db.set.rmn={on,t[],fired}`؛ `daniExtraPlan` کلید `rmn-<روز>-<ساعت>` (فقط امروز، فقط اگر `homeTarget().tgt>0` و `done<tgt`)؛ وب: `setInterval` ۳۰ثانیه با `sysNotify`. کارت `#rmc` بعد از `#qrc`.

## v63 — rating.js
- `save` پیچیده می‌شود؛ ثبت‌های تازه (≤۲ تا، غیر csv/import/smp) → `#qrs` (پنل ثابت پایین، ۱۴ ثانیه). `e.rt={en,fe,su,ac}`؛ تنظیم `db.set.qr={on,f[]}`. `PG.res` در `stats` کارت میانگین اضافه می‌کند؛ `render` در Settings/time کارت `#qrc` را بعد از `#ntc` می‌گذارد.

## v82 — notifroute.js
- `daniNotifRoute(k,n)`؛ کلید `<id>|<تاریخ>|<گام>` یادآوری (id با `dl_` = موعد، `link.type` = habit/act/res)؛ آیتم با `[data-m="rem:edit:<id>"]` / `[data-m^="hab:set:<id>:"]` پیدا و `flash()` می‌شود (۱۰ تلاش × ۲۵۰ms برای رندر دیرهنگام). برای افزودن نوع اعلان تازه: یک شاخه در `R()`.

## v81 — pace.js
- `daniPace(p)`: base=ریتم برنامه (`wk`) یا خط مستقیم تا موعد؛ gap=برنامه‌ی‌تا‌دیروز−انجام‌شده؛ target=`need` (باقی/روز مانده) یا base؛ `Fnow` از ریتم واقعی ۱۴ روز؛ `PF` پایان طبق برنامه؛ ledger ۷ روز؛ `w7` از `daniUseTime.calc`. `daniPaceLine` در انتهای `fcVerdict` (projects.js) افزوده می‌شود و کارت `.pcx` بعد از `render` زیر `.fcb` تزریق می‌شود.

## v80 — ثبت سریع با انتخاب
- `logSlot` به‌طور پیش‌فرض مودال انتخاب (`ckc_pick/ckc_other/ckc_quick`) نشان می‌دهد؛ فقط اگر `db.set.chk.quick` باشد حدس می‌زند (`est:1`). `slotOf/put/cands` در chkact.js.

## v79 — تست و ثبت سریع قابل‌اعتماد
- `tests/run.mjs` (Playwright؛ سرور ایستا؛ نسخه‌ی `VER` را از fx.js می‌خواند) — قبل از هر تحویل اجرا شود؛ تست XSS با تزریق در نام فعالیت/یادداشت/پروژه و رندر همه‌ی `PG`. CI: `.github/workflows/tests.yml`. ثبت‌های `src:'chk'` فیلد `est` دارند (1=تأییدنشده)؛ `daniChkAct.names/pick`. `extensions.js` پیش از `extInstall` برای کد اجرایی `confirm` می‌گیرد.

## v78 — chkact.js
- اعلان `chk-<تاریخ>-<دقیقه>` با `actionTypeId:'dani-chk'` (از `daniNoteExtra`)؛ اکشن‌ها `cu/cr/cw` → `daniChkAct.logSlot` آخرین فعالیتِ کلاس u / n,s / w را برای بازه‌ی [پایان آخرین ثبت یا ev دقیقه قبل، دقیقه‌ی اعلان] ثبت می‌کند (`src:'chk'`). `registerActionTypes` همه‌ی نوع‌ها را یک‌جا جایگزین می‌کند، پس نوع تازه فقط در notifier.js اضافه می‌شود.

## v77 — طرح solid
- `ICX_SOLID` در themes-engine.js (هر کلید `ICONS` را پوشش می‌دهد؛ `day=home`، `plan2=plan`) داخل `<g fill=currentColor stroke=none>`. `fam:'std'` فقط جایگزین آیکون‌های دست‌نقاشی‌شده‌ی تم‌ها با `ICONS` می‌شود (برای day/plan2/pj تفاوتی ندارد چون تم‌ها آن‌ها را override نمی‌کنند).

## v76 — iconstyle.js
- `db.set.icx={fam:''|'std'|'emoji',frame,col:''|'ac'|'rb',soft}`. `icon(k)` (themes-engine.js): ایموجی از `ICX_EMO`، `std` = فقط `ICONS` (نادیده‌گرفتن `PK_IC/ITU_IC`)، `rb` = رنگ از `ICX_COL` با `--icc`. قاب/رنگ/نرمی فقط با CSS و صفت‌های `html[data-icf|iccol|icsoft]` (در `apply()`). نوارهای اختصاصی تم (itu-strip، iv-chips، ern) قاب جدا نمی‌گیرند. پیش‌نمایش شش آیکون منو.

## v75 — دفترچه‌ی خطا (courses.js)
- `CR.ev` نمای جاری (all/lesson/topic/self). گروه‌بندی با `q.lessonIds[0]`/`q.topicIds[0]`؛ منبع = عنوان درس‌ها. خودآزمایی فقط متن سؤال را نشان می‌دهد؛ `crs_esres` شمارنده‌های `selfN/selfK` و `correctStreak` را به‌روز می‌کند. رشته‌های تازه با `TT()` (روی `daniT`).

## v74 — calio.js
- `icsBuild` (dashboard-planner.js) در calio.js پوشانده می‌شود تا VEVENT بلوک‌های `db.set.bz.items` (هفتگی=RRULE BYDAY، یک‌روزه) را اضافه کند. ورود: `H.cio_pick` (input file) → `parse()` → مودال → `H.cio_ok`؛ بلوک‌ها `uid` دارند برای جلوگیری از تکرار. دکمه بعد از `render` داخل کارتی که h3 آن «بلوک‌های مشغول» است تزریق می‌شود.

## v73 — iconswap.js
- `db.set.icmap={کلید:نویسه}`؛ `icon(k)` در themes-engine.js آن را (با مستعار day→home, plan2→plan, pj→dl, acd→acts) بر SVG مقدم می‌دارد. `iconStudio` در iconswap.js یک `<details>` اضافه می‌کند؛ `H.ics_pick/ics_set/ics_reset`. تم‌هایی با نوار آیکون اختصاصی (اوچیها) آیکون خود را نگه می‌دارند.

## v62 — کارت موعد خانه
- projects.js: `_dlOld` = `dlDashHTML` قدیمی؛ `dlDashHTML/hDl` به `dlHome()` بازتعریف شدند؛ `HSEC.dlc.r=hDl`. طرح‌ها در `DL_STY` (big/ring/bar/mini + hero/stack/line/pill)؛ `H.dl_cyc` طرح بعدی. عادت: `h.act`+`h.min` تیک خودکار؛ یادآور `repeat:'yearly'`؛ تقویم: `H.p2_qa`.

## v61 — settings2.js
- بعد از هر `render` اگر `page==='set'`: `stt==='time'` ← `timeTab()` کارت‌های اعلان را (با regex روی h3 دوزبانه) در `#ntc` جمع می‌کند؛ `stt==='look'` ← `lookTab()`. کارت تازه‌ی اعلان اضافه کردی: regex را در `timeTab` ثبت کن.


> v83: `boot.js` باید **آخرین** `<script>` در index.html بماند (اولین render و `window.__daniBooted`/رویداد `dani-booted`). هر کدی که به شروع سرد وابسته است (مثل `route` اعلان) تا `__daniBooted` صبر کند.

> v84: تنظیمات موعد فقط در `js/dlcard.js` (`group()`+`extra()`، hub `#dlhub` در صفحه‌ی موعدها) است؛ تنظیمات تازه‌ی موعد را همان‌جا اضافه کن، نه جای دیگر. ذخیره: `db.set.dlh` (+`x.hs` هر موعد). هشدار هوشمند: `js/dlnag.js`.

> v85: اسکریپتی که هنگام بارگذاری `render()` بزند اشکالی ندارد (صفحه‌ی `#bootv` پوشانده)، ولی `boot.js` باید آخرین اسکریپت بماند. اعلان در شروع سرد: بخش بومی `getLaunchNotif`.

> v86: ویجت = `widgetSync()` در livesync.js → `widgetSet({l1,l2,l3,hb,dn,du,dt,dc,qt,qp})` → `DaniWidget.build`. کلید جدید ویجت را هر سه جا (JS، افزونه، build) و layoutها اضافه کن.

> v87: ماه برنامه (آرم اعلان، صفحه‌ی آماده‌سازی) با یک SVG یکسان ساخته شده؛ برای تغییرش هر دو (`index.html#bootv` و PNGهای `android-shell/res`) را هم‌سبک نگه دار.

> v88: مرحله‌های موعد در `x.sub`؛ هر جا موعد را کپی/ادغام می‌کنی (تبدیل به پروژه، پشتیبان) این کلید را هم نگه دار.

> v89: کار پشتیبان تازه را فقط در `#bkc` (js/backupc.js `merge()`) اضافه کن؛ کارت پشتیبان جدا در تب داده‌ها نساز.

> v90: ادغام‌های کوچک بعد از رسم در `js/tidy.js`؛ کارت زبان+تقویم `#langcard`.

> v91: ترتیب بوت: `boot0.js` (extLoadAll) باید قبل از `courses.js` باشد؛ `boot.js` (render و آماده‌شدن) آخرین اسکریپت. این دو را جابه‌جا نکن.

> v110: workflow اثر انگشت امضا (apksigner) را در لاگ/Release می‌نویسد؛ کاربر گزارش «تداخل با بسته‌ی قبلی» داد با اینکه کلید ثابت است — SHA-256 ساخت‌ها را مقایسه کن (باید یکی باشد؛ keystore md5 7ed41340…).
> v109: صفحه‌ی انتظار `#bootv` در index.html = فانوس‌های رو به بالا (آبی نیمه‌شب) + ماه + نوار پیشرفت + ستاره‌های نرم گرد (ستاره‌ی چهارپر را کاربر نپسندید)؛ `window.daniBootDone` از boot.js صدا زده می‌شود؛ اسکریپت ایمنی ۹ ثانیه را نگه دار. آیکون برنامه عمداً همان قبلی ماند (کاربر طرح ماه سفید/آبی/بنفش جدید را نپسندید).
> v108: آیکون‌های اعلان (`ic_stat_dani`, `dani_large` در res/drawable-*) = مرد روی قله زیر ماه (استخراج‌شده از تصویر کاربر). آیکون لانچر و splash هنوز عوض نشده‌اند. کد بدون تغییر.
> v107: پیام `dani-update` فقط برای html و با `rv` (شماره‌ی fx.js?v در index سایت). boot.js مقایسه با نسخه‌ی در حال اجرا و شمارنده‌ی localStorage `dani_ota_told`؛ ۳ تکرار → `dani-reset-html` به SW. توجه: sw.js اجراشونده همان داخل APK است (OTA فقط کش فایل‌ها را عوض می‌کند، نه خود SW).
> v106: مرجع موعدها = صفحه‌ی pj (`#dlmv` از `js/dlmove.js` که `PG.dl()` را جاسازی می‌کند). تب cal در plan2 دیگر `PG.dl` را جاسازی نمی‌کند؛ `H.p2_pj` به pj می‌رود.
> v105: `js/datamerge.js` — تب `uch` پنهان؛ محتوای `center()` (baked.js) در `#uchx` تب data. `results2.js` `analysis()` برای تب rep. دو نوع پشتیبان کامل متفاوت‌اند: `crs_allexp` (مرکز پشتیبان) و `ufull` (قالب dani-fullbackup).
> v104: `js/homemerge.js` (باید بعد از calm.js و sentences.js باشد) — `#menux` و `#homex` در تب look؛ `bd_q` داخل `#sntg`؛ `#cmcard` برداشته می‌شود.
> v103: `js/lookmerge.js` — تب look: `#thmx` شامل `#thmio` (import/export از skincard)، `#studiocard`، و `details[data-tk=pk]>#pkcard`. idempotent.
> v102: `js/notifcentre.js` — بعد از هر رندر تب time، کارت‌های `ntcard/qhcard/qrc/rmc/chc` را داخل بخش‌های `#ntc` (data-nk=p/s/t/x/g) می‌برد؛ idempotent؛ دکمه‌ی `nt_perm` اگر `notif` هست حذف می‌شود.
> v101: همگام‌سازی (`#lscard`) در تب data و داخل `#bkc` (backupc.merge)؛ `#ntvcard` (ویجت/تایمر زنده/پین) در تب time. کارت تکراریِ «نمایش جمله‌ها در صفحه‌ی اصلی» در sentences.js part('mine') حذف می‌شود (نسخه‌ی part('set') می‌ماند). همپوشانی‌های دیگر: فقط لیست شده، منتظر تأیید کاربر.
> v100: APK پیش‌فرض bundled؛ sw.js حالت OTA دارد (OTA = hostname localhost بدون port). index.html/بدون-v با مقایسه‌ی متن، js/css نسخه‌دار immutable. هر فایل متنی تازه باید ?v= بخورد وگرنه فقط با مقایسه‌ی متن در index/بدون-v به‌روز می‌شود. live برای کسی که فیلتر ندارد هنوز هست. تست: tests/sw-ota.mjs.
> v99: پنل پین = اعلان اختصاصی RemoteViews (layout dani_pin.xml، ۶ اسلات)؛ فعالیت‌ها از `pinActs()` (db.set.pin.m = auto|man|mix، sel ≤۴) به `pinSet({acts})` با فیلدهای id/n/e/c. بدون متن ماندگار؛ Toast. ⚡+۱۵ حذف (کاربر نخواست؛ برنگردان).
> v98: آرم اعلان به طرح v92 برگشت؛ طرح «آدم تنها روی قله» رد شد، دوباره پیشنهاد نده مگر کاربر بخواهد.
> v97: هفته‌ی اول ساده = `db.set.fw{on,start,added[]}` در guide2.js (`H.g2_fw`)؛ فقط modOff را عوض می‌کند.
> v96: اعلان پشتیبان در safety.js از `db.set.bk` پیروی می‌کند؛ مسیر `bk-nag-` → `#bkc`.
> v95: امضای ثابت: `android-shell/dani-debug.keystore` (alias androiddebugkey، رمز android) در workflow کپی می‌شود. کلید Play باید جدا و خصوصی باشد؛ این را عوض نکن مگر کاربر بخواهد.
> v94: ویجت `nx`/`sk` (livesync.js widgetSync → widgetSet → DaniWidget.build، فقط type≥1؛ id‌ها dw_nx/dw_sk).
> v93: dlnag.js سطح‌بندی لحن (lvl 1-3) از `lateDue` و روزهای مانده؛ `active` اگر `todayMin`≥سهمیه پیام امروز حذف می‌شود.
> v92: پنل سریع = `DaniPin` (بومی) + `pinSync()` در livesync.js؛ دکمه‌ی تازه‌ی پنل را هم‌زمان در `DaniPin.show` و `DaniPinAction` اضافه کن. صف: `tlog:<act>:<startMs>:<min>`، `note:<text>`، `log:<min>`.
