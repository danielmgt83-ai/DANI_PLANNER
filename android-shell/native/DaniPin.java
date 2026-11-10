package app.dani.planner;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.SystemClock;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/* پنل سریع پین‌شده (v99): اعلان اختصاصی با دکمه‌های «آیکون بالا، نام پایین».
   حالت آماده: تا ۴ فعالیت (یک لمس = شروع شمارش) + یادداشت + باز کردن برنامه.
   حالت شمارش: شمارنده‌ی بزرگ + مکث/ادامه، پایان و ثبت، لغو، باز کردن.
   نتیجه‌ها در صف dani_widget.q می‌روند و دفعه‌ی بعد که برنامه باز شود با widgetPop اعمال می‌شوند.
   هیچ متن ماندگاری در اعلان نمی‌ماند؛ بازخورد فقط با Toast کوتاه است. */
public final class DaniPin {
    public static final int ID = 7790;
    static final String CH = "dani-pin-v2";

    static SharedPreferences sp(Context c) { return c.getSharedPreferences("dani_pin", Context.MODE_PRIVATE); }

    static int flags() {
        int f = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) f |= PendingIntent.FLAG_IMMUTABLE;
        return f;
    }

    static PendingIntent bc(Context c, String a, String key, int rc, String id, String n) {
        Intent i = new Intent(c, DaniPinAction.class);
        i.setAction("dani.pin." + a);
        i.setData(Uri.parse("dani://pin/" + a + "/" + key));
        if (id != null) i.putExtra("id", id);
        if (n != null) i.putExtra("n", n);
        return PendingIntent.getBroadcast(c, rc, i, flags());
    }

    static String mmss(long ms) {
        long s = Math.max(0, ms / 1000);
        return String.format("%d:%02d", s / 60, s % 60);
    }

    static int rid(Context c, String name, String type) { return c.getResources().getIdentifier(name, type, c.getPackageName()); }

    /* یک دکمه‌ی اعلان: ایموجی روی دایره‌ی رنگی + نام زیرش */
    static void slot(Context c, RemoteViews rv, int i, String emoji, String label, int color, PendingIntent pi, boolean labels) {
        rv.setViewVisibility(rid(c, "pn_s" + i, "id"), 0);
        rv.setTextViewText(rid(c, "pn_e" + i, "id"), emoji);
        rv.setInt(rid(c, "pn_c" + i, "id"), "setColorFilter", color);
        rv.setTextViewText(rid(c, "pn_l" + i, "id"), label);
        rv.setViewVisibility(rid(c, "pn_l" + i, "id"), labels ? 0 : 8);
        rv.setOnClickPendingIntent(rid(c, "pn_s" + i, "id"), pi);
    }

    static RemoteViews build(Context c, SharedPreferences s, boolean big) {
        RemoteViews rv = new RemoteViews(c.getPackageName(), rid(c, "dani_pin", "layout"));
        for (int i = 1; i <= 6; i++) rv.setViewVisibility(rid(c, "pn_s" + i, "id"), 8);
        Intent li = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        PendingIntent home = li == null ? null : PendingIntent.getActivity(c, 7791, li, flags());
        String run = s.getString("rid", "");
        int GRAY = Color.parseColor("#8A94A6");
        if (!run.isEmpty()) {
            boolean paused = s.getBoolean("paused", false);
            rv.setViewVisibility(rid(c, "pn_top", "id"), 0);
            rv.setTextViewText(rid(c, "pn_nm", "id"), s.getString("rn", ""));
            if (paused) {
                rv.setViewVisibility(rid(c, "pn_chr", "id"), 8);
                rv.setViewVisibility(rid(c, "pn_tt", "id"), 0);
                rv.setTextViewText(rid(c, "pn_tt", "id"), "⏸ " + mmss(s.getLong("acc", 0)));
            } else {
                rv.setViewVisibility(rid(c, "pn_tt", "id"), 8);
                rv.setViewVisibility(rid(c, "pn_chr", "id"), 0);
                long el = System.currentTimeMillis() - s.getLong("base", System.currentTimeMillis());
                rv.setChronometer(rid(c, "pn_chr", "id"), SystemClock.elapsedRealtime() - el, null, true);
            }
            if (big) {
                if (paused) slot(c, rv, 1, "▶", "ادامه", Color.parseColor("#438DF5"), bc(c, "resume", "r", 7802, null, null), true);
                else slot(c, rv, 1, "⏸", "مکث", Color.parseColor("#438DF5"), bc(c, "pause", "p", 7802, null, null), true);
                slot(c, rv, 2, "⏹", "پایان و ثبت", Color.parseColor("#2E9E6B"), bc(c, "stop", "s", 7803, null, null), true);
                slot(c, rv, 3, "✖", "لغو", Color.parseColor("#D9534F"), bc(c, "cancel", "x", 7804, null, null), true);
                if (home != null) slot(c, rv, 4, "🏠", "باز کردن", GRAY, home, true);
            }
        } else {
            rv.setViewVisibility(rid(c, "pn_top", "id"), 8);
            int k = 0;
            try {
                JSONArray a = new JSONArray(s.getString("acts", "[]"));
                for (int j = 0; j < a.length() && k < 4; j++) {
                    JSONObject o = a.getJSONObject(j);
                    int col;
                    try { col = Color.parseColor(o.optString("c", "#438DF5")); } catch (Exception e) { col = Color.parseColor("#438DF5"); }
                    k++;
                    slot(c, rv, k, o.optString("e", "⏱"), o.optString("n"), col, bc(c, "start", o.optString("id"), 7810 + k, o.optString("id"), o.optString("n")), big);
                }
            } catch (Exception ignored) { }
            Intent qi = new Intent(c, DaniQuickActivity.class);
            qi.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
            k++;
            slot(c, rv, k, "📝", "یادداشت", Color.parseColor("#F0A23A"), PendingIntent.getActivity(c, 7805, qi, flags()), big);
            if (home != null) { k++; slot(c, rv, k, "🏠", "باز کردن", GRAY, home, big); }
        }
        return rv;
    }

    public static void show(Context c) {
        try {
            SharedPreferences s = sp(c);
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (!s.getBoolean("on", false) || Build.VERSION.SDK_INT < 24) { nm.cancel(ID); return; }
            if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CH) == null) {
                NotificationChannel ch = new NotificationChannel(CH, "DANI quick panel", NotificationManager.IMPORTANCE_LOW);
                ch.setSound(null, null);
                ch.enableVibration(false);
                nm.createNotificationChannel(ch);
            }
            Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CH) : new Notification.Builder(c);
            int ic = rid(c, "ic_stat_dani", "drawable");
            b.setSmallIcon(ic != 0 ? ic : android.R.drawable.ic_lock_idle_alarm);
            b.setOngoing(true);
            b.setOnlyAlertOnce(true);
            b.setShowWhen(false);
            b.setStyle(new Notification.DecoratedCustomViewStyle());
            boolean running = !s.getString("rid", "").isEmpty();
            b.setCustomContentView(build(c, s, false));
            b.setCustomBigContentView(build(c, s, true));
            if (!running) b.setCustomContentView(build(c, s, true));
            Intent li = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
            if (li != null) b.setContentIntent(PendingIntent.getActivity(c, 7792, li, flags()));
            nm.notify(ID, b.build());
        } catch (Exception ignored) { }
    }

    static void queue(Context c, String q) {
        try {
            SharedPreferences w = c.getSharedPreferences("dani_widget", Context.MODE_PRIVATE);
            JSONArray a = new JSONArray(w.getString("q", "[]"));
            if (a.length() < 100) a.put(q);
            w.edit().putString("q", a.toString()).apply();
        } catch (Exception ignored) { }
    }

    public static void start(Context c, String id, String name) {
        long now = System.currentTimeMillis();
        sp(c).edit().putString("rid", id).putString("rn", name).putLong("base", now).putLong("t0", now).putLong("acc", 0).putBoolean("paused", false).apply();
        show(c);
    }

    public static void pause(Context c) {
        SharedPreferences s = sp(c);
        if (s.getString("rid", "").isEmpty() || s.getBoolean("paused", false)) return;
        s.edit().putLong("acc", System.currentTimeMillis() - s.getLong("base", 0)).putBoolean("paused", true).apply();
        show(c);
    }

    public static void resume(Context c) {
        SharedPreferences s = sp(c);
        if (!s.getBoolean("paused", false)) return;
        s.edit().putLong("base", System.currentTimeMillis() - s.getLong("acc", 0)).putBoolean("paused", false).apply();
        show(c);
    }

    /* پیام کوتاه برای Toast برمی‌گرداند (در اعلان نمی‌ماند) */
    public static String stop(Context c) {
        SharedPreferences s = sp(c);
        String rid = s.getString("rid", "");
        if (rid.isEmpty()) return "";
        long el = s.getBoolean("paused", false) ? s.getLong("acc", 0) : System.currentTimeMillis() - s.getLong("base", 0);
        long min = Math.round(el / 60000.0);
        String msg;
        if (el < 30000) {
            msg = "لغو شد (کمتر از نیم‌دقیقه)";
        } else {
            if (min < 1) min = 1;
            queue(c, "tlog:" + rid + ":" + s.getLong("t0", System.currentTimeMillis()) + ":" + min);
            msg = "✅ " + min + " دقیقه ثبت شد: " + s.getString("rn", "");
        }
        s.edit().remove("rid").remove("rn").putBoolean("paused", false).apply();
        show(c);
        return msg;
    }

    public static void cancelRun(Context c) {
        sp(c).edit().remove("rid").remove("rn").putBoolean("paused", false).apply();
        show(c);
    }
}
