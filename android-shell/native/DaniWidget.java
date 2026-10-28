package app.dani.planner;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.widget.RemoteViews;

/* ویجت DANI: سه خط متن (کارِ بعدی، پیشرفت امروز، تایمر) را از SharedPreferences می‌خواند؛ برنامه آن را با widgetSet به‌روز می‌کند. */
public class DaniWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        for (int id : ids) m.updateAppWidget(id, build(c));
    }

    static RemoteViews build(Context c) {
        SharedPreferences sp = c.getSharedPreferences("dani_widget", Context.MODE_PRIVATE);
        int lay = c.getResources().getIdentifier("dani_widget", "layout", c.getPackageName());
        RemoteViews v = new RemoteViews(c.getPackageName(), lay);
        String[] k = {"l1", "l2", "l3"};
        String[] n = {"dw_l1", "dw_l2", "dw_l3"};
        for (int i = 0; i < 3; i++) {
            int vid = c.getResources().getIdentifier(n[i], "id", c.getPackageName());
            String t = sp.getString(k[i], "");
            if (i == 0 && t.isEmpty()) t = "DANI";
            v.setTextViewText(vid, t);
            v.setViewVisibility(vid, t.isEmpty() ? android.view.View.GONE : android.view.View.VISIBLE);
        }
        Intent li = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        if (li != null) {
            int fl = Build.VERSION.SDK_INT >= 23 ? (PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE) : PendingIntent.FLAG_UPDATE_CURRENT;
            int root = c.getResources().getIdentifier("dw_root", "id", c.getPackageName());
            v.setOnClickPendingIntent(root, PendingIntent.getActivity(c, 7712, li, fl));
        }
        return v;
    }

    static void refresh(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, DaniWidget.class));
        for (int id : ids) m.updateAppWidget(id, build(c));
    }
}
