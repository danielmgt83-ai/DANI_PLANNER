package app.dani.planner;

import android.app.RemoteInput;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

/* دکمه‌های پنل سریع پین‌شده (بدون باز شدن برنامه) */
public class DaniPinAction extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        String a = i.getAction();
        if (a == null) return;
        if (a.equals("dani.pin.pause")) DaniPin.pause(c);
        else if (a.equals("dani.pin.resume")) DaniPin.resume(c);
        else if (a.equals("dani.pin.stop")) DaniPin.stop(c);
        else if (a.equals("dani.pin.cancel")) DaniPin.cancelRun(c);
        else if (a.equals("dani.pin.log15")) {
            DaniPin.queue(c, "log:15");
            DaniPin.sp(c).edit().putString("last", "⚡ +۱۵ دقیقه (در برنامه ثبت می‌شود)").apply();
            DaniPin.show(c);
        } else if (a.equals("dani.pin.note")) {
            Bundle r = RemoteInput.getResultsFromIntent(i);
            CharSequence t = r == null ? null : r.getCharSequence("note");
            if (t != null && t.toString().trim().length() > 0) {
                DaniPin.queue(c, "note:" + t.toString().trim());
                DaniPin.sp(c).edit().putString("last", "📝 یادداشت ذخیره شد").apply();
            }
            DaniPin.show(c);
        }
    }
}
