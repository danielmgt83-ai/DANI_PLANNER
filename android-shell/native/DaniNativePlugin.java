package app.dani.planner;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.print.DaniPdfPrint;
import android.provider.CalendarContract;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.TimeZone;

/*
 * DANI · DaniNativePlugin
 *  - saveFromCache : کپی فایل از حافظه‌ی موقت اپ به Downloads/DANI یا Documents/DANI (MediaStore؛ بدون نیاز به مجوز)
 *  - prune         : نگه‌داشتن فقط N پشتیبان آخر
 *  - openUri / shareUri : باز کردن یا اشتراک‌گذاری فایل ذخیره‌شده
 *  - htmlToPdf     : ساخت PDF واقعی از HTML گزارش و ذخیره در Downloads/DANI
 *  - calendarAdd   : افزودن مستقیم موعد/یادآور به تقویم گوشی (تقویم محلی «DANI»)
 *  - pickAudio / playUri / stopPlay / soundChannel : انتخاب آهنگ از حافظه‌ی گوشی بدون کپی داخل اپ
 */
@CapacitorPlugin(
        name = "DaniNative",
        permissions = {
                @Permission(alias = "calendar", strings = {Manifest.permission.READ_CALENDAR, Manifest.permission.WRITE_CALENDAR})
        })
public class DaniNativePlugin extends Plugin {
    private static final String TAG_DESC = "[DANI]";
    private MediaPlayer mp;
    private WebView pdfView;

    /* ---------------------------------------------------------- فایل */
    private Uri collection(String folder) {
        return "Download".equals(folder) ? MediaStore.Downloads.EXTERNAL_CONTENT_URI : MediaStore.Files.getContentUri("external");
    }

    private JSObject store(File src, String name, String folder, String sub, String mime, boolean replace) throws Exception {
        if (Build.VERSION.SDK_INT < 29) throw new Exception("legacy");
        ContentResolver cr = getContext().getContentResolver();
        String rel = folder + "/" + sub;
        Uri coll = collection(folder);
        if (replace) {
            try {
                cr.delete(coll, MediaStore.MediaColumns.RELATIVE_PATH + "=? AND " + MediaStore.MediaColumns.DISPLAY_NAME + "=?",
                        new String[]{rel + "/", name});
            } catch (Exception ignored) {}
        }
        ContentValues v = new ContentValues();
        v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
        v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
        v.put(MediaStore.MediaColumns.RELATIVE_PATH, rel);
        v.put(MediaStore.MediaColumns.IS_PENDING, 1);
        Uri u = cr.insert(coll, v);
        if (u == null) throw new Exception("insert failed");
        try (InputStream is = new FileInputStream(src); OutputStream os = cr.openOutputStream(u)) {
            if (os == null) throw new Exception("open failed");
            byte[] buf = new byte[65536];
            int n;
            while ((n = is.read(buf)) > 0) os.write(buf, 0, n);
        } catch (Exception e) {
            try { cr.delete(u, null, null); } catch (Exception ignored) {}
            throw e;
        }
        v.clear();
        v.put(MediaStore.MediaColumns.IS_PENDING, 0);
        cr.update(u, v, null, null);
        JSObject r = new JSObject();
        r.put("uri", u.toString());
        r.put("path", rel + "/" + name);
        return r;
    }

    @PluginMethod
    public void saveFromCache(PluginCall call) {
        try {
            File src = new File(getContext().getCacheDir(), call.getString("path", ""));
            JSObject r = store(src, call.getString("name", "dani-file"), call.getString("folder", "Download"),
                    call.getString("sub", "DANI"), call.getString("mime", "application/octet-stream"),
                    Boolean.TRUE.equals(call.getBoolean("replace", false)));
            src.delete();
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    @PluginMethod
    public void prune(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT < 29) { call.resolve(); return; }
            String folder = call.getString("folder", "Documents"), sub = call.getString("sub", "DANI/Backups");
            String prefix = call.getString("prefix", "dani-auto-");
            int keep = call.getInt("keep", 7);
            ContentResolver cr = getContext().getContentResolver();
            Uri coll = collection(folder);
            int removed = 0;
            try (Cursor c = cr.query(coll, new String[]{MediaStore.MediaColumns._ID},
                    MediaStore.MediaColumns.RELATIVE_PATH + "=? AND " + MediaStore.MediaColumns.DISPLAY_NAME + " LIKE ?",
                    new String[]{folder + "/" + sub + "/", prefix + "%"}, MediaStore.MediaColumns.DATE_MODIFIED + " DESC")) {
                int i = 0;
                while (c != null && c.moveToNext()) {
                    if (i++ < keep) continue;
                    try { cr.delete(ContentUris.withAppendedId(coll, c.getLong(0)), null, null); removed++; } catch (Exception ignored) {}
                }
            }
            JSObject r = new JSObject();
            r.put("removed", removed);
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    @PluginMethod
    public void openUri(PluginCall call) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(Uri.parse(call.getString("uri", "")), call.getString("mime", "*/*"));
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(Intent.createChooser(i, null));
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    @PluginMethod
    public void shareUri(PluginCall call) {
        try {
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType(call.getString("mime", "*/*"));
            i.putExtra(Intent.EXTRA_STREAM, Uri.parse(call.getString("uri", "")));
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(Intent.createChooser(i, null));
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    /* ---------------------------------------------------------- PDF */
    @PluginMethod
    public void htmlToPdf(final PluginCall call) {
        final String html = call.getString("html", "");
        final String name = call.getString("name", "DANI-report.pdf");
        final String folder = call.getString("folder", "Download"), sub = call.getString("sub", "DANI");
        getActivity().runOnUiThread(() -> {
            try {
                pdfView = new WebView(getActivity());
                pdfView.getSettings().setJavaScriptEnabled(false);
                pdfView.setWebViewClient(new WebViewClient() {
                    boolean started = false;
                    @Override
                    public void onPageFinished(final WebView view, String url) {
                        if (started) return;
                        started = true;
                        new Handler(Looper.getMainLooper()).postDelayed(() -> {
                            try {
                                final File out = new File(getContext().getCacheDir(), "dani-report-" + System.currentTimeMillis() + ".pdf");
                                DaniPdfPrint.write(view.createPrintDocumentAdapter("DANI"), out, new DaniPdfPrint.Done() {
                                    @Override public void ok() {
                                        try {
                                            JSObject r = store(out, name, folder, sub, "application/pdf", true);
                                            out.delete();
                                            call.resolve(r);
                                        } catch (Exception e) { call.reject(String.valueOf(e.getMessage()), e); }
                                        cleanPdf();
                                    }
                                    @Override public void fail(String msg) { call.reject("pdf: " + msg); cleanPdf(); }
                                });
                            } catch (Throwable t) { call.reject("pdf: " + t); cleanPdf(); }
                        }, 600);
                    }
                });
                pdfView.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
            } catch (Throwable t) {
                call.reject("pdf: " + t);
                cleanPdf();
            }
        });
    }

    private void cleanPdf() {
        getActivity().runOnUiThread(() -> {
            try { if (pdfView != null) pdfView.destroy(); } catch (Exception ignored) {}
            pdfView = null;
        });
    }

    /* ---------------------------------------------------------- تقویم */
    @PluginMethod
    public void calendarAdd(PluginCall call) {
        if (getPermissionState("calendar") != PermissionState.GRANTED) {
            if (Boolean.TRUE.equals(call.getBoolean("noAsk", false))) { call.reject("denied"); return; }
            requestPermissionForAlias("calendar", call, "calPerm");
            return;
        }
        doCalendar(call);
    }

    @PermissionCallback
    private void calPerm(PluginCall call) {
        if (getPermissionState("calendar") == PermissionState.GRANTED) doCalendar(call);
        else call.reject("denied");
    }

    private long findCalendar(ContentResolver cr) {
        try (Cursor c = cr.query(CalendarContract.Calendars.CONTENT_URI, new String[]{CalendarContract.Calendars._ID},
                CalendarContract.Calendars.ACCOUNT_NAME + "=? AND " + CalendarContract.Calendars.ACCOUNT_TYPE + "=?",
                new String[]{"DANI", CalendarContract.ACCOUNT_TYPE_LOCAL}, null)) {
            if (c != null && c.moveToFirst()) return c.getLong(0);
        } catch (Exception ignored) {}
        try {
            ContentValues v = new ContentValues();
            v.put(CalendarContract.Calendars.ACCOUNT_NAME, "DANI");
            v.put(CalendarContract.Calendars.ACCOUNT_TYPE, CalendarContract.ACCOUNT_TYPE_LOCAL);
            v.put(CalendarContract.Calendars.NAME, "DANI");
            v.put(CalendarContract.Calendars.CALENDAR_DISPLAY_NAME, "DANI Planner");
            v.put(CalendarContract.Calendars.CALENDAR_COLOR, 0xFF2563EB);
            v.put(CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL, CalendarContract.Calendars.CAL_ACCESS_OWNER);
            v.put(CalendarContract.Calendars.OWNER_ACCOUNT, "DANI");
            v.put(CalendarContract.Calendars.VISIBLE, 1);
            v.put(CalendarContract.Calendars.SYNC_EVENTS, 1);
            v.put(CalendarContract.Calendars.CALENDAR_TIME_ZONE, TimeZone.getDefault().getID());
            Uri u = CalendarContract.Calendars.CONTENT_URI.buildUpon()
                    .appendQueryParameter(CalendarContract.CALLER_IS_SYNCADAPTER, "true")
                    .appendQueryParameter(CalendarContract.Calendars.ACCOUNT_NAME, "DANI")
                    .appendQueryParameter(CalendarContract.Calendars.ACCOUNT_TYPE, CalendarContract.ACCOUNT_TYPE_LOCAL).build();
            Uri r = cr.insert(u, v);
            if (r != null) return ContentUris.parseId(r);
        } catch (Exception ignored) {}
        /* اگر ساخت تقویم محلی ممکن نبود: اولین تقویم قابل‌نوشتن (ترجیحاً اصلی) */
        try (Cursor c = cr.query(CalendarContract.Calendars.CONTENT_URI,
                new String[]{CalendarContract.Calendars._ID, CalendarContract.Calendars.IS_PRIMARY},
                CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL + ">=?", new String[]{"500"},
                CalendarContract.Calendars.IS_PRIMARY + " DESC")) {
            if (c != null && c.moveToFirst()) return c.getLong(0);
        } catch (Exception ignored) {}
        return -1;
    }

    private void doCalendar(PluginCall call) {
        try {
            ContentResolver cr = getContext().getContentResolver();
            long cal = findCalendar(cr);
            if (cal < 0) { call.reject("nocalendar"); return; }
            cr.delete(CalendarContract.Events.CONTENT_URI,
                    CalendarContract.Events.CALENDAR_ID + "=? AND " + CalendarContract.Events.DESCRIPTION + " LIKE ?",
                    new String[]{String.valueOf(cal), "%" + TAG_DESC + "%"});
            JSArray arr = call.getArray("events", new JSArray());
            String tz = call.getString("tz", TimeZone.getDefault().getID());
            int added = 0;
            for (int i = 0; i < arr.length(); i++) {
                JSONObject e = arr.getJSONObject(i);
                String rr = e.optString("rrule", "");
                ContentValues v = new ContentValues();
                v.put(CalendarContract.Events.CALENDAR_ID, cal);
                v.put(CalendarContract.Events.TITLE, e.optString("title", "DANI"));
                String d = e.optString("desc", "");
                v.put(CalendarContract.Events.DESCRIPTION, (d.isEmpty() ? "" : d + "\n") + TAG_DESC);
                v.put(CalendarContract.Events.DTSTART, e.getLong("start"));
                v.put(CalendarContract.Events.EVENT_TIMEZONE, tz);
                if (rr.isEmpty()) v.put(CalendarContract.Events.DTEND, e.optLong("end", e.getLong("start") + 1800000L));
                else { v.put(CalendarContract.Events.RRULE, rr); v.put(CalendarContract.Events.DURATION, "PT30M"); }
                JSONArray al = e.optJSONArray("alarms");
                v.put(CalendarContract.Events.HAS_ALARM, al != null && al.length() > 0 ? 1 : 0);
                Uri ev = cr.insert(CalendarContract.Events.CONTENT_URI, v);
                if (ev == null) continue;
                added++;
                long id = ContentUris.parseId(ev);
                for (int k = 0; al != null && k < al.length(); k++) {
                    ContentValues rv = new ContentValues();
                    rv.put(CalendarContract.Reminders.EVENT_ID, id);
                    rv.put(CalendarContract.Reminders.MINUTES, Math.max(0, al.getInt(k)));
                    rv.put(CalendarContract.Reminders.METHOD, CalendarContract.Reminders.METHOD_ALERT);
                    try { cr.insert(CalendarContract.Reminders.CONTENT_URI, rv); } catch (Exception ignored) {}
                }
            }
            JSObject r = new JSObject();
            r.put("added", added);
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    /* ---------------------------------------------------------- آهنگ از حافظه‌ی گوشی */
    @PluginMethod
    public void pickAudio(PluginCall call) {
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("audio/*");
        i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(call, i, "pickDone");
    }

    private JSObject audioInfo(Uri u) {
        try { getContext().getContentResolver().takePersistableUriPermission(u, Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (Exception ignored) {}
        String name = "audio";
        try (Cursor c = getContext().getContentResolver().query(u, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst()) name = c.getString(0);
        } catch (Exception ignored) {}
        String sys = "";
        try {
            if ("com.android.providers.media.documents".equals(u.getAuthority())) {
                String id = DocumentsContract.getDocumentId(u);
                if (id.startsWith("audio:")) sys = "content://media/external/audio/media/" + id.substring(6);
            }
        } catch (Exception ignored) {}
        JSObject o = new JSObject();
        o.put("uri", u.toString());
        o.put("name", name);
        o.put("sys", sys);
        return o;
    }

    @ActivityCallback
    private void pickDone(PluginCall call, ActivityResult res) {
        if (call == null) return;
        JSObject o = new JSObject();
        Intent d = res.getData();
        if (res.getResultCode() != Activity.RESULT_OK || d == null || (d.getData() == null && d.getClipData() == null)) {
            o.put("cancelled", true);
            call.resolve(o);
            return;
        }
        JSArray items = new JSArray();
        if (d.getClipData() != null) {
            for (int k = 0; k < d.getClipData().getItemCount(); k++) {
                Uri u = d.getClipData().getItemAt(k).getUri();
                if (u != null) items.put(audioInfo(u));
            }
        } else {
            items.put(audioInfo(d.getData()));
        }
        o.put("items", items);
        try {
            org.json.JSONObject f = items.getJSONObject(0);
            o.put("uri", f.getString("uri"));
            o.put("name", f.getString("name"));
            o.put("sys", f.getString("sys"));
        } catch (Exception ignored) {}
        call.resolve(o);
    }

    private void stopMp() {
        try { if (mp != null) { mp.stop(); } } catch (Exception ignored) {}
        try { if (mp != null) { mp.release(); } } catch (Exception ignored) {}
        mp = null;
    }

    @PluginMethod
    public void playUri(PluginCall call) {
        try {
            stopMp();
            float vol = (float) Math.max(0, Math.min(1, call.getDouble("volume", 0.8)));
            mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
            mp.setDataSource(getContext(), Uri.parse(call.getString("uri", "")));
            mp.setVolume(vol, vol);
            mp.setLooping(Boolean.TRUE.equals(call.getBoolean("loop", false)));
            mp.setOnCompletionListener(m -> { stopMp(); notifyListeners("playEnd", new JSObject()); });
            mp.prepare();
            mp.start();
            JSObject r = new JSObject();
            r.put("duration", mp.getDuration());
            call.resolve(r);
        } catch (Exception e) {
            stopMp();
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    @PluginMethod
    public void stopPlay(PluginCall call) {
        stopMp();
        call.resolve();
    }

    /* کانال اعلان با آهنگ دلخواه (صدای کانال بعد از ساخت قابل‌تغییر نیست؛ پس شناسه به آدرس فایل وابسته است) */
    @PluginMethod
    public void soundChannel(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
                String id = call.getString("id", "dani-alarm-u");
                for (NotificationChannel c : nm.getNotificationChannels())
                    if (c.getId().startsWith("dani-alarm-u") && !c.getId().equals(id)) nm.deleteNotificationChannel(c.getId());
                NotificationChannel ch = new NotificationChannel(id, call.getString("name", "DANI alarm"), NotificationManager.IMPORTANCE_HIGH);
                ch.setSound(Uri.parse(call.getString("uri", "")), new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
                ch.enableVibration(true);
                nm.createNotificationChannel(ch);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    /* ---------------------------------------------------------- زنگ/اعلان‌های خودِ گوشی (انتخابگر سیستم) */
    @PluginMethod
    public void pickRingtone(PluginCall call) {
        int type = call.getInt("type", 2);
        Intent i = new Intent(RingtoneManager.ACTION_RINGTONE_PICKER);
        i.putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, type);
        i.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true);
        i.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false);
        startActivityForResult(call, i, "ringDone");
    }

    @ActivityCallback
    private void ringDone(PluginCall call, ActivityResult res) {
        if (call == null) return;
        JSObject o = new JSObject();
        Intent d = res.getData();
        Uri u = null;
        if (d != null) {
            try { u = (Uri) d.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI); } catch (Exception ignored) {}
        }
        if (res.getResultCode() != Activity.RESULT_OK || u == null) {
            o.put("cancelled", true);
            call.resolve(o);
            return;
        }
        String name = "";
        try {
            Ringtone r = RingtoneManager.getRingtone(getContext(), u);
            if (r != null) name = r.getTitle(getContext());
        } catch (Exception ignored) {}
        o.put("uri", u.toString());
        o.put("name", name);
        call.resolve(o);
    }

    /* ---------------------------------------------------------- تایمر زنده در اعلان (کرنومتر خودِ اندروید؛ بدون مصرف باتری اضافه) */
    private static final int LIVE_ID = 7710;

    @PluginMethod
    public void liveStart(PluginCall call) {
        try {
            Context c = getContext();
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel("dani-live-v1") == null) {
                NotificationChannel ch = new NotificationChannel("dani-live-v1", "DANI timer", NotificationManager.IMPORTANCE_LOW);
                ch.setSound(null, null);
                ch.enableVibration(false);
                nm.createNotificationChannel(ch);
            }
            android.app.Notification.Builder b = Build.VERSION.SDK_INT >= 26
                    ? new android.app.Notification.Builder(c, "dani-live-v1")
                    : new android.app.Notification.Builder(c);
            int ic = c.getResources().getIdentifier("ic_stat_dani", "drawable", c.getPackageName());
            b.setSmallIcon(ic != 0 ? ic : android.R.drawable.ic_lock_idle_alarm);
            b.setContentTitle(call.getString("title", "DANI"));
            String text = call.getString("text", "");
            if (!text.isEmpty()) b.setContentText(text);
            b.setOngoing(true);
            b.setOnlyAlertOnce(true);
            b.setShowWhen(true);
            boolean running = call.getBoolean("running", true);
            if (running) {
                long base = call.getLong("base", System.currentTimeMillis());
                b.setWhen(base);
                b.setUsesChronometer(true);
                if (Build.VERSION.SDK_INT >= 24) b.setChronometerCountDown(call.getBoolean("countdown", false));
            } else {
                b.setShowWhen(false);
                b.setUsesChronometer(false);
            }
            Intent li = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
            if (li != null) {
                int fl = Build.VERSION.SDK_INT >= 23 ? (android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE) : android.app.PendingIntent.FLAG_UPDATE_CURRENT;
                b.setContentIntent(android.app.PendingIntent.getActivity(c, 7711, li, fl));
                JSArray acts = call.getArray("actions");
                if (acts != null) {
                    for (int i = 0; i < acts.length() && i < 3; i++) {
                        org.json.JSONObject o = acts.getJSONObject(i);
                        Intent ai = new Intent(li);
                        ai.setAction("dani.live." + o.optString("id"));
                        ai.putExtra("dani_live", o.optString("id"));
                        ai.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        b.addAction(0, o.optString("title"), android.app.PendingIntent.getActivity(c, 7720 + i, ai, fl));
                    }
                }
            }
            nm.notify(LIVE_ID, b.build());
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    /* دکمه‌های اعلان تایمر (مکث/ادامه/پایان): برنامه را باز می‌کنند و رویداد liveAction را به جاوااسکریپت می‌فرستند */
    @Override
    public void load() {
        try { liveFrom(getActivity().getIntent()); } catch (Exception ignored) {}
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        liveFrom(intent);
    }

    private void liveFrom(Intent i) {
        if (i == null) return;
        String a = i.getStringExtra("dani_live");
        if (a == null || a.isEmpty()) return;
        i.removeExtra("dani_live");
        JSObject o = new JSObject();
        o.put("action", a);
        notifyListeners("liveAction", o, true);
    }

    @PluginMethod
    public void liveStop(PluginCall call) {
        try {
            NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            nm.cancel(LIVE_ID);
        } catch (Exception ignored) {}
        call.resolve();
    }

    /* ---------------------------------------------------------- ویجت صفحه‌ی خانه */
    @PluginMethod
    public void widgetSet(PluginCall call) {
        try {
            Context c = getContext();
            c.getSharedPreferences("dani_widget", Context.MODE_PRIVATE).edit()
                    .putString("l1", call.getString("l1", ""))
                    .putString("l2", call.getString("l2", ""))
                    .putString("l3", call.getString("l3", ""))
                    .putString("hb", call.getString("hb", "[]"))
                    .apply();
            DaniWidget.refresh(c);
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    /* صف دکمه‌های ویجت (تیک عادت، +۱۵ دقیقه) را برمی‌گرداند و خالی می‌کند */
    @PluginMethod
    public void widgetPop(PluginCall call) {
        try {
            android.content.SharedPreferences sp = getContext().getSharedPreferences("dani_widget", Context.MODE_PRIVATE);
            String q = sp.getString("q", "[]");
            sp.edit().putString("q", "[]").apply();
            JSObject r = new JSObject();
            r.put("q", q);
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    /* ---------------------------------------------------------- همگام‌سازی با یک فایل (پوشه‌ی Drive/Syncthing/…) */
    @PluginMethod
    public void syncPick(PluginCall call) {
        Intent i;
        if (call.getBoolean("create", false)) {
            i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            i.setType("application/json");
            i.putExtra(Intent.EXTRA_TITLE, "dani-sync.json");
        } else {
            i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            i.setType("*/*");
        }
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(call, i, "syncDone");
    }

    @ActivityCallback
    private void syncDone(PluginCall call, ActivityResult res) {
        if (call == null) return;
        JSObject o = new JSObject();
        Intent d = res.getData();
        if (res.getResultCode() != Activity.RESULT_OK || d == null || d.getData() == null) {
            o.put("cancelled", true);
            call.resolve(o);
            return;
        }
        Uri u = d.getData();
        try {
            getContext().getContentResolver().takePersistableUriPermission(u, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        } catch (Exception ignored) {}
        o.put("uri", u.toString());
        call.resolve(o);
    }

    @PluginMethod
    public void syncRead(PluginCall call) {
        try {
            Uri u = Uri.parse(call.getString("uri", ""));
            java.io.InputStream in = getContext().getContentResolver().openInputStream(u);
            java.io.ByteArrayOutputStream bo = new java.io.ByteArrayOutputStream();
            if (in != null) {
                byte[] buf = new byte[16384];
                int n;
                while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
                in.close();
            }
            JSObject o = new JSObject();
            o.put("text", bo.toString("UTF-8"));
            call.resolve(o);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }

    @PluginMethod
    public void syncWrite(PluginCall call) {
        try {
            Uri u = Uri.parse(call.getString("uri", ""));
            java.io.OutputStream out = getContext().getContentResolver().openOutputStream(u, "wt");
            if (out == null) throw new Exception("cannot open");
            out.write(call.getString("text", "").getBytes("UTF-8"));
            out.flush();
            out.close();
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()), e);
        }
    }
}
