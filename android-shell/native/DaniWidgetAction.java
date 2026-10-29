package app.dani.planner;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

/* دکمه‌های ویجت که برنامه را باز نمی‌کنند: عمل را در صف prefs می‌گذارد و ویجت را فوراً به‌روز می‌کند. برنامه دفعه‌ی بعد صف را با widgetPop می‌خواند. */
public class DaniWidgetAction extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        String q = i.getStringExtra("q");
        if (q == null || q.isEmpty()) return;
        try {
            SharedPreferences sp = c.getSharedPreferences("dani_widget", Context.MODE_PRIVATE);
            JSONArray a = new JSONArray(sp.getString("q", "[]"));
            if (a.length() < 100) a.put(q);
            SharedPreferences.Editor e = sp.edit();
            e.putString("q", a.toString());
            if (q.startsWith("hab:")) {
                String[] p = q.split(":");
                if (p.length >= 3) {
                    JSONArray hb = new JSONArray(sp.getString("hb", "[]"));
                    for (int k = 0; k < hb.length(); k++) {
                        JSONObject o = hb.getJSONObject(k);
                        if (o.optString("id").equals(p[1])) o.put("d", "1".equals(p[2]));
                    }
                    e.putString("hb", hb.toString());
                }
            }
            e.apply();
            DaniWidget.refresh(c);
        } catch (Exception ignored) {}
    }
}
