package app.dani.planner;

import android.app.Activity;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

/* پنجره‌ی کوچکِ شناور برای انتخاب فعالیت (از دکمه‌ی «⏱ شروع» پنل سریع). با لمس یک فعالیت، شمارش از اعلان شروع می‌شود. */
public class DaniQuickActivity extends Activity {
    int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density); }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setFinishOnTouchOutside(true);
        getWindow().getDecorView().setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(16), dp(14), dp(16), dp(10));
        TextView t = new TextView(this);
        t.setText("⏱ شروع شمارش برای…");
        t.setTextSize(17);
        t.setGravity(Gravity.CENTER);
        t.setPadding(0, 0, 0, dp(8));
        root.addView(t);
        LinearLayout list = new LinearLayout(this);
        list.setOrientation(LinearLayout.VERTICAL);
        try {
            JSONArray a = new JSONArray(DaniPin.sp(this).getString("acts", "[]"));
            for (int k = 0; k < a.length() && k < 14; k++) {
                final JSONObject o = a.getJSONObject(k);
                Button bt = new Button(this);
                bt.setText(o.optString("n"));
                bt.setAllCaps(false);
                bt.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        DaniPin.start(DaniQuickActivity.this, o.optString("id"), o.optString("n"));
                        finish();
                    }
                });
                list.addView(bt);
            }
            if (a.length() == 0) {
                TextView e = new TextView(this);
                e.setText("فعالیتی نیست. یک‌بار برنامه را باز کن.");
                e.setGravity(Gravity.CENTER);
                list.addView(e);
            }
        } catch (Exception ignored) { }
        ScrollView sv = new ScrollView(this);
        sv.addView(list);
        root.addView(sv, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        Button x = new Button(this);
        x.setText("✖");
        x.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) { finish(); }
        });
        root.addView(x);
        setContentView(root);
    }
}
