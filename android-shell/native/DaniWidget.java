package app.dani.planner;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/* ویجت DANI در سه اندازه (کوچک/متوسط/بزرگ). متن‌ها از SharedPreferences «dani_widget» می‌آید که برنامه با widgetSet می‌نویسد.
   دکمه‌ها: ▶ شروع (برنامه را باز می‌کند)، تیک عادت و ‎+۱۵ دقیقه (بدون باز شدن برنامه؛ در صف prefs می‌روند و دفعه‌ی بعد که برنامه باز شود اعمال می‌شوند). */
public class DaniWidget extends AppWidgetProvider {
    protected int type() { return 1; } /* 0 کوچک، 1 متوسط، 2 بزرگ */

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) m.updateAppWidget(id, build(c, type()));
    }

    private static int rid(Context c, String name, String kind) {
        return c.getResources().getIdentifier(name, kind, c.getPackageName());
    }

    private static int flags() {
        return Build.VERSION.SDK_INT >= 23 ? (PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE) : PendingIntent.FLAG_UPDATE_CURRENT;
    }

    private static void txt(Context c, RemoteViews v, String name, String t, boolean hideEmpty) {
        int id = rid(c, name, "id");
        if (id == 0) return;
        v.setTextViewText(id, t);
        if (hideEmpty) v.setViewVisibility(id, t.isEmpty() ? View.GONE : View.VISIBLE);
    }

    static RemoteViews build(Context c, int type) {
        SharedPreferences sp = c.getSharedPreferences("dani_widget", Context.MODE_PRIVATE);
        String[] lay = {"dani_widget_small", "dani_widget", "dani_widget_large"};
        RemoteViews v = new RemoteViews(c.getPackageName(), rid(c, lay[type], "layout"));
        String l1 = sp.getString("l1", ""), l2 = sp.getString("l2", ""), l3 = sp.getString("l3", "");
        if (l1.isEmpty()) l1 = "DANI";
        txt(c, v, "dw_l1", l1, false);
        if (type >= 1) {
            txt(c, v, "dw_l2", l2, true);
            txt(c, v, "dw_l3", l3, true);
        }
        Intent li = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        if (li != null) {
            v.setOnClickPendingIntent(rid(c, "dw_root", "id"), PendingIntent.getActivity(c, 7712, li, flags()));
            Intent st = new Intent(li);
            st.setAction("dani.widget.start");
            st.putExtra("dani_live", "start");
            st.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int go = rid(c, "dw_go", "id");
            if (go != 0) v.setOnClickPendingIntent(go, PendingIntent.getActivity(c, 7713, st, flags()));
        }
        if (type == 2) {
            int p15 = rid(c, "dw_p15", "id");
            if (p15 != 0) v.setOnClickPendingIntent(p15, q(c, "log:15", 7714));
            JSONArray hb = new JSONArray();
            try { hb = new JSONArray(sp.getString("hb", "[]")); } catch (Exception ignored) {}
            for (int i = 0; i < 3; i++) {
                int hid = rid(c, "dw_h" + (i + 1), "id");
                if (hid == 0) continue;
                if (i < hb.length()) {
                    try {
                        JSONObject o = hb.getJSONObject(i);
                        boolean d = o.optBoolean("d");
                        v.setTextViewText(hid, (d ? "✅ " : "⬜ ") + o.optString("n"));
                        v.setViewVisibility(hid, View.VISIBLE);
                        v.setOnClickPendingIntent(hid, q(c, "hab:" + o.optString("id") + ":" + (d ? "0" : "1"), 7720 + i));
                    } catch (Exception e) { v.setViewVisibility(hid, View.GONE); }
                } else v.setViewVisibility(hid, View.GONE);
            }
        }
        return v;
    }

    /* دکمه‌ای که فقط در صف prefs می‌نویسد (گیرنده: DaniWidgetAction) */
    static PendingIntent q(Context c, String q, int code) {
        Intent i = new Intent(c, DaniWidgetAction.class);
        i.setAction("dani.widget.q");
        i.setData(Uri.parse("dani://widget/" + Uri.encode(q)));
        i.putExtra("q", q);
        return PendingIntent.getBroadcast(c, code, i, flags());
    }

    static void refresh(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        Class<?>[] cl = {DaniWidgetSmall.class, DaniWidget.class, DaniWidgetLarge.class};
        for (int t = 0; t < 3; t++) {
            int[] ids = m.getAppWidgetIds(new ComponentName(c, cl[t]));
            for (int id : ids) m.updateAppWidget(id, build(c, t));
        }
    }
}
