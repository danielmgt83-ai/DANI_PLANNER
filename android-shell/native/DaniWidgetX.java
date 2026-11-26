package app.dani.planner;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/* چهار ویجت تازه (v180): آیزنهاور، شمارش معکوس، نقشه‌ی گرمایی، آمار تمرکز.
   داده از SharedPreferences «dani_widget» کلید «wx» (یک JSON) که برنامه با widgetSet می‌نویسد. */
public class DaniWidgetX extends AppWidgetProvider {
    protected int type() { return 0; } /* 0 آیزنهاور، 1 شمارش معکوس، 2 گرمایی، 3 تمرکز */

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

    private static void txt(Context c, RemoteViews v, String name, String t) {
        int id = rid(c, name, "id");
        if (id != 0) v.setTextViewText(id, t);
    }

    static RemoteViews build(Context c, int type) {
        SharedPreferences sp = c.getSharedPreferences("dani_widget", Context.MODE_PRIVATE);
        String[] lay = {"dani_wx_ei", "dani_wx_cd", "dani_wx_hm", "dani_wx_fo"};
        RemoteViews v = new RemoteViews(c.getPackageName(), rid(c, lay[type], "layout"));
        JSONObject o = new JSONObject();
        try { o = new JSONObject(sp.getString("wx", "{}")); } catch (Exception ignored) { }
        String[] ti = {"ei", "cd", "hm", "fo"};
        txt(c, v, "wx_t", o.optString("t_" + ti[type], ""));
        if (type == 0) {
            JSONArray n = o.optJSONArray("ei"), l = o.optJSONArray("el");
            String[] ic = {"🔥", "📌", "🤝", "🗑"};
            for (int i = 0; i < 4; i++) {
                String lab = l != null ? l.optString(i, "") : "";
                int cnt = n != null ? n.optInt(i, 0) : 0;
                txt(c, v, "wx_e" + (i + 1), ic[i] + " " + lab + "\n" + o.optString("fmt", "").replace("#", String.valueOf(cnt)).trim());
            }
        } else if (type == 1) {
            txt(c, v, "wx_dn", o.optString("dn", "—"));
            txt(c, v, "wx_du", o.optString("du", ""));
            txt(c, v, "wx_dt", o.optString("dt", ""));
            int dnId = rid(c, "wx_dn", "id");
            try { if (dnId != 0) v.setTextColor(dnId, Color.parseColor(o.optString("dc", "#8AB4FF"))); } catch (Exception ignored) { }
        } else if (type == 2) {
            String hm = o.optString("hm", "");
            int[] col = {0x22FFFFFF, 0x553B82F6, 0x883B82F6, 0xCC3B82F6, 0xFF8AB4FF};
            for (int i = 0; i < 70; i++) {
                int id = rid(c, "wx_h" + i, "id");
                if (id == 0) continue;
                int lv = 0;
                if (i < hm.length()) { int d = hm.charAt(i) - '0'; if (d >= 0 && d <= 4) lv = d; }
                v.setInt(id, "setBackgroundColor", col[lv]);
            }
            txt(c, v, "wx_hs", o.optString("hs", ""));
        } else {
            txt(c, v, "wx_ft", o.optString("ft", "0"));
            txt(c, v, "wx_fl", o.optString("fl", ""));
            txt(c, v, "wx_wt", o.optString("wt", "0"));
            txt(c, v, "wx_wl", o.optString("wl", ""));
            txt(c, v, "wx_go", o.optString("go", "▶"));
        }
        Intent li = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        if (li != null) {
            v.setOnClickPendingIntent(rid(c, "wx_root", "id"), PendingIntent.getActivity(c, 7740 + type, li, flags()));
            if (type == 3) {
                Intent st = new Intent(li);
                st.setAction("dani.widget.start");
                st.putExtra("dani_live", "start");
                st.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                int go = rid(c, "wx_go", "id");
                if (go != 0) v.setOnClickPendingIntent(go, PendingIntent.getActivity(c, 7750, st, flags()));
            }
        }
        return v;
    }

    static void refresh(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        Class<?>[] cl = {DaniWidgetEi.class, DaniWidgetCd.class, DaniWidgetHm.class, DaniWidgetFo.class};
        for (int t = 0; t < 4; t++) {
            int[] ids = m.getAppWidgetIds(new ComponentName(c, cl[t]));
            for (int id : ids) m.updateAppWidget(id, build(c, t));
        }
    }
}
