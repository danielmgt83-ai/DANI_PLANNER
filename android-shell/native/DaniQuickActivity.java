package app.dani.planner;

import android.app.Activity;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

/* پنجره‌ی کوچک «یادداشت سریع» (از دکمه‌ی 📝 پنل سریع). یادداشت در صف می‌رود و دفعه‌ی بعد که برنامه باز شود ذخیره می‌شود. */
public class DaniQuickActivity extends Activity {
    int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density); }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        setFinishOnTouchOutside(true);
        getWindow().getDecorView().setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_VISIBLE);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(16), dp(14), dp(16), dp(10));
        TextView t = new TextView(this);
        t.setText("📝 یادداشت سریع");
        t.setTextSize(17);
        t.setGravity(Gravity.CENTER);
        t.setPadding(0, 0, 0, dp(8));
        root.addView(t);
        final EditText et = new EditText(this);
        et.setHint("بنویس…");
        et.setMinLines(2);
        et.setMaxLines(5);
        root.addView(et);
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        Button ok = new Button(this);
        ok.setText("ذخیره");
        ok.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String s = et.getText().toString().trim();
                if (s.length() > 0) {
                    DaniPin.queue(DaniQuickActivity.this, "note:" + s);
                    Toast.makeText(DaniQuickActivity.this, "📝 ذخیره شد", Toast.LENGTH_SHORT).show();
                }
                finish();
            }
        });
        Button x = new Button(this);
        x.setText("✖");
        x.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) { finish(); }
        });
        row.addView(ok, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        row.addView(x, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        root.addView(row);
        setContentView(root);
        et.requestFocus();
    }
}
