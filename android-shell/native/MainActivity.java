package app.dani.planner;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/* DANI: ثبت افزونه‌ی بومی DaniNative (ذخیره‌ی فایل، PDF، تقویم، انتخاب آهنگ از گوشی) */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DaniNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
