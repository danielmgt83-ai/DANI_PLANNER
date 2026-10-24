# DANI Planner

پلنر شخصی فارسی؛ بدون سرور، داده فقط داخل مرورگر خودت ذخیره می‌شود.
راهنمای فنی و قاعده‌های کار: `PROJECT.md`.

## انتشار رایگان روی GitHub Pages
1. در GitHub یک مخزن (repository) جدید بساز؛ مثلاً `dani-planner`.
2. همه‌ی فایل‌های همین پوشه (نه خودِ پوشه) را در مخزن آپلود کن. `index.html` باید در ریشه‌ی مخزن باشد.
3. Settings ← Pages ← Source: **Deploy from a branch** ← Branch: **main** و پوشه‌ی **/ (root)** ← Save.
4. بعد از یکی دو دقیقه آدرس سایت شبیه `https://نام‌کاربری.github.io/dani-planner/` فعال می‌شود.

هر بار فایل‌ها را عوض کردی: `python3 tools/update-sw.py` را اجرا کن، و شماره‌ی `?v=` در `index.html` را بالا ببر، بعد دوباره آپلود (یا commit) کن.

## نصب روی گوشی
- **اندروید (Chrome):** منوی ⋮ ← Add to Home screen / Install app.
- **iPhone (Safari):** دکمه‌ی Share ← Add to Home Screen. اعلان‌های وب در iPhone فقط بعد از افزودن به صفحه‌ی اصلی و با iOS 16.4 به بعد کار می‌کنند.

## انتقال داده‌ی قدیمی
داده‌ی هر آدرس جدا ذخیره می‌شود. در نسخه‌ی قدیمی: تنظیمات ← داده ← پشتیبان کامل (فایل JSON)؛ در آدرس جدید: همان‌جا «بازیابی».

## اجرا روی کامپیوتر
`run-local.bat` (ویندوز) یا `run-local.command` / `run-local.sh` را اجرا کن؛ نیاز به Python 3 دارد. باز کردن مستقیم `index.html` با دوبار کلیک کار نمی‌کند.
