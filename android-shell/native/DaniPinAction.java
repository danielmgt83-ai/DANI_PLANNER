package app.dani.planner;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

/* دکمه‌های پنل سریع پین‌شده (بدون باز شدن برنامه). بازخورد فقط Toast کوتاه است. */
public class DaniPinAction extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        String a = i.getAction();
        if (a == null) return;
        if (a.equals("dani.pin.start")) {
            String id = i.getStringExtra("id");
            String n = i.getStringExtra("n");
            if (id != null && !id.isEmpty()) {
                DaniPin.start(c, id, n == null ? "" : n);
                Toast.makeText(c, "⏱ " + (n == null ? "" : n), Toast.LENGTH_SHORT).show();
            }
        } else if (a.equals("dani.pin.pause")) DaniPin.pause(c);
        else if (a.equals("dani.pin.resume")) DaniPin.resume(c);
        else if (a.equals("dani.pin.stop")) {
            String m = DaniPin.stop(c);
            if (!m.isEmpty()) Toast.makeText(c, m, Toast.LENGTH_SHORT).show();
        } else if (a.equals("dani.pin.cancel")) DaniPin.cancelRun(c);
    }
}
