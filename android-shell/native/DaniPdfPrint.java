package android.print;

import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import java.io.File;

/* DANI: نوشتن خروجی چاپ WebView در فایل PDF (باید در پکیج android.print باشد چون سازنده‌ی callbackها package-private است) */
public class DaniPdfPrint {
    public interface Done { void ok(); void fail(String msg); }

    public static void write(final PrintDocumentAdapter adapter, final File out, final Done done) {
        PrintAttributes attrs = new PrintAttributes.Builder()
                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                .setResolution(new PrintAttributes.Resolution("pdf", "pdf", 300, 300))
                .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                .build();
        adapter.onLayout(null, attrs, new CancellationSignal(), new PrintDocumentAdapter.LayoutResultCallback() {
            @Override
            public void onLayoutFinished(PrintDocumentInfo info, boolean changed) {
                try {
                    final ParcelFileDescriptor fd = ParcelFileDescriptor.open(out,
                            ParcelFileDescriptor.MODE_READ_WRITE | ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_TRUNCATE);
                    adapter.onWrite(new PageRange[]{PageRange.ALL_PAGES}, fd, new CancellationSignal(),
                            new PrintDocumentAdapter.WriteResultCallback() {
                                @Override
                                public void onWriteFinished(PageRange[] pages) {
                                    try { fd.close(); } catch (Exception ignored) {}
                                    done.ok();
                                }
                                @Override
                                public void onWriteFailed(CharSequence error) {
                                    try { fd.close(); } catch (Exception ignored) {}
                                    done.fail(String.valueOf(error));
                                }
                                @Override
                                public void onWriteCancelled() {
                                    try { fd.close(); } catch (Exception ignored) {}
                                    done.fail("cancelled");
                                }
                            });
                } catch (Exception e) {
                    done.fail(String.valueOf(e));
                }
            }
            @Override
            public void onLayoutFailed(CharSequence error) { done.fail(String.valueOf(error)); }
            @Override
            public void onLayoutCancelled() { done.fail("cancelled"); }
        }, null);
    }
}
