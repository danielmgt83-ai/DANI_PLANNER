package app.dani.planner;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.RemoteInput;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;

/* پنل سریع پین‌شده در اعلان‌ها (v92): شروع تایمر (با پنجره‌ی انتخاب فعالیت)، مکث/ادامه/پایان، +۱۵ دقیقه و یادداشت سریع
   بدون باز کردن برنامه. شمارش با Chronometer خودِ اندروید انجام می‌شود؛ نتیجه در صف dani_widget.q می‌ماند و برنامه
   دفعه‌ی بعد آن را با widgetPop اعمال می‌کند. */
public final class DaniPin {
    public static final int ID = 7790;
    static final String CH = "dani-pin-v1";

    static SharedPreferences sp(Context c) { return c.getSharedPreferences("dani_pin", Context.MODE_PRIVATE); }

    static int flags(boolean mutable) {
        int f = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 31) f |= mutable ? PendingIntent.FLAG_MUTABLE : PendingIntent.FLAG_IMMUTABLE;
        else if (Build.VERSION.SDK_INT >= 23) f |= PendingIntent.FLAG_IMMUTABLE;
        return f;
    }

    static PendingIntent bc(Context c, String a, int rc, boolean mutable) {
        Intent i = new Intent(c, DaniPinAction.class);
        i.setAction("dani.pin." + a);
        return PendingIntent.getBroadcast(c, rc, i, flags(mutable));
    }

    static String mmss(long ms) {
        long s = Math.max(0, ms / 1000);
        return String.format("%d:%02d", s / 60, s % 60);
    }

    static void addAction(Notification.Builder b, String title, PendingIntent pi) {
        b.addAction(new Notification.Action.Builder(0, title, pi).build());
    }

    public static void show(Context c) {
        try {
            SharedPreferences s = sp(c);
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (!s.getBoolean("on", false)) { nm.cancel(ID); return; }
            if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CH) == null) {
                NotificationChannel ch = new NotificationChannel(CH, "DANI quick panel", NotificationManager.IMPORTANCE_LOW);
                ch.setSound(null, null);
                ch.enableVibration(false);
                nm.createNotificationChannel(ch);
            }
            Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, CH) : new Notification.Builder(c);
            int ic = c.getResources().getIdentifier("ic_stat_dani", "drawable", c.getPackageName());
            b.setSmallIcon(ic != 0 ? ic : android.R.drawable.ic_lock_idle_alarm);
            int lg = c.getResources().getIdentifier("dani_large", "drawable", c.getPackageName());
            if (lg != 0) {
                try { b.setLargeIcon(android.graphics.BitmapFactory.decodeResource(c.getResources(), lg)); } catch (Exception ignored) { }
            }
            b.setOngoing(true);
            b.setOnlyAlertOnce(true);
            b.setShowWhen(false);
            Intent li = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
            if (li != null) b.setContentIntent(PendingIntent.getActivity(c, 7791, li, flags(false)));
            String rid = s.getString("rid", "");
            if (!rid.isEmpty()) {
                boolean paused = s.getBoolean("paused", false);
                String name = s.getString("rn", "");
                b.setContentTitle("⏱ " + name);
                if (paused) {
                    b.setContentText("⏸ " + mmss(s.getLong("acc", 0)));
                    addAction(b, "▶ ادامه", bc(c, "resume", 7801, false));
                } else {
                    b.setWhen(s.getLong("base", System.currentTimeMillis()));
                    b.setShowWhen(true);
                    b.setUsesChronometer(true);
                    b.setContentText("DANI");
                    addAction(b, "⏸ مکث", bc(c, "pause", 7802, false));
                }
                addAction(b, "⏹ پایان و ثبت", bc(c, "stop", 7803, false));
                addAction(b, "✖ لغو", bc(c, "cancel", 7804, false));
            } else {
                b.setContentTitle("DANI ⚡");
                String last = s.getString("last", "");
                b.setContentText(last.isEmpty() ? "شروع سریع، بدون باز کردن برنامه" : last);
                Intent qi = new Intent(c, DaniQuickActivity.class);
                qi.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
                addAction(b, "⏱ شروع", PendingIntent.getActivity(c, 7805, qi, flags(false)));
                addAction(b, "⚡ +۱۵", bc(c, "log15", 7806, false));
                if (Build.VERSION.SDK_INT >= 24) {
                    RemoteInput ri = new RemoteInput.Builder("note").setLabel("یادداشت سریع").build();
                    Notification.Action na = new Notification.Action.Builder(0, "📝 یادداشت", bc(c, "note", 7807, true)).addRemoteInput(ri).build();
                    b.addAction(na);
                }
            }
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
        sp(c).edit().putString("rid", id).putString("rn", name).putLong("base", now).putLong("t0", now).putLong("acc", 0).putBoolean("paused", false).putString("last", "").apply();
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

    public static void stop(Context c) {
        SharedPreferences s = sp(c);
        String rid = s.getString("rid", "");
        if (rid.isEmpty()) return;
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
        s.edit().remove("rid").remove("rn").putBoolean("paused", false).putString("last", msg).apply();
        show(c);
    }

    public static void cancelRun(Context c) {
        sp(c).edit().remove("rid").remove("rn").putBoolean("paused", false).putString("last", "").apply();
        show(c);
    }
}
