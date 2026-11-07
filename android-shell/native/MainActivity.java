package app.dani.planner;

import android.content.Intent;
import android.os.Bundle;
import org.json.JSONObject;
import com.getcapacitor.BridgeActivity;

/* DANI: ثبت افزونه‌ی بومی DaniNative (ذخیره‌ی فایل، PDF، تقویم، انتخاب آهنگ از گوشی) */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DaniNativePlugin.class);
        super.onCreate(savedInstanceState);
        launchK = readK(getIntent());
    }

    /* v85: اگر برنامه با لمس یک اعلان از حالت بسته باز شد، کلید همان اعلان را نگه می‌داریم (افزونه‌ی اعلان این رویداد را در شروع سرد گاهی نمی‌فرستد). */
    public static String launchK = null;

    static String readK(Intent in) {
        try {
            if (in == null || in.getExtras() == null) return null;
            for (String key : in.getExtras().keySet()) {
                Object v = in.getExtras().get(key);
                if (v instanceof String && ((String) v).contains("\"extra\"")) {
                    JSONObject ex = new JSONObject((String) v).optJSONObject("extra");
                    if (ex != null && ex.optString("k", "").length() > 0) return ex.optString("k");
                }
            }
        } catch (Exception e) { }
        return null;
    }
}
