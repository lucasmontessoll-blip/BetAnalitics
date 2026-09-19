package com.betanalytics.pro;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "OnlineUpdate")
public class OnlineUpdatePlugin extends Plugin {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final long MAX_APK_BYTES = 200L * 1024L * 1024L;

    @PluginMethod
    public void getInstalledVersion(PluginCall call) {
        try {
            android.content.pm.PackageInfo info = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            long code = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P ? info.getLongVersionCode() : info.versionCode;
            JSObject result = new JSObject();
            result.put("versionCode", code);
            result.put("versionName", info.versionName == null ? "" : info.versionName);
            result.put("packageName", getContext().getPackageName());
            call.resolve(result);
        } catch (Exception error) { call.reject("Nao foi possivel ler a versao instalada."); }
    }

    @PluginMethod
    public void canInstallPackages(PluginCall call) {
        boolean allowed = Build.VERSION.SDK_INT < Build.VERSION_CODES.O || getContext().getPackageManager().canRequestPackageInstalls();
        JSObject result = new JSObject(); result.put("allowed", allowed); call.resolve(result);
    }

    @PluginMethod
    public void openInstallPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); getContext().startActivity(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String source = call.getString("url", "");
        String expected = call.getString("sha256", "").toLowerCase(Locale.ROOT);
        if (!source.startsWith("https://") || !expected.matches("[a-f0-9]{64}")) { call.reject("Metadados da atualizacao invalidos."); return; }
        executor.execute(() -> {
            File apk = null;
            try {
                apk = new File(getContext().getExternalFilesDir("updates"), "golnexa-update.apk");
                HttpURLConnection connection = openHttps(source);
                int length = connection.getContentLength();
                if (length > MAX_APK_BYTES) throw new SecurityException("APK excede o limite permitido.");
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                long total = 0;
                try (InputStream input = connection.getInputStream(); FileOutputStream output = new FileOutputStream(apk, false)) {
                    byte[] buffer = new byte[32768]; int read;
                    while ((read = input.read(buffer)) != -1) {
                        total += read; if (total > MAX_APK_BYTES) throw new SecurityException("APK excede o limite permitido.");
                        digest.update(buffer, 0, read); output.write(buffer, 0, read);
                    }
                } finally { connection.disconnect(); }
                String actual = hex(digest.digest());
                if (!actual.equals(expected)) { apk.delete(); throw new SecurityException("SHA-256 do APK nao confere."); }
                File finalApk = apk;
                getActivity().runOnUiThread(() -> {
                    try {
                        Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", finalApk);
                        Intent intent = new Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/vnd.android.package-archive");
                        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                        getContext().startActivity(intent);
                        JSObject result = new JSObject(); result.put("verified", true); call.resolve(result);
                    } catch (Exception error) { call.reject("Nao foi possivel abrir o instalador Android."); }
                });
            } catch (Exception error) {
                if (apk != null) apk.delete(); call.reject(error.getMessage() == null ? "Falha no download seguro." : error.getMessage());
            }
        });
    }

    private HttpURLConnection openHttps(String source) throws Exception {
        URL current = new URL(source);
        for (int redirects = 0; redirects < 5; redirects++) {
            if (!"https".equalsIgnoreCase(current.getProtocol())) throw new SecurityException("Somente HTTPS e permitido.");
            HttpURLConnection connection = (HttpURLConnection) current.openConnection();
            connection.setConnectTimeout(15000); connection.setReadTimeout(60000); connection.setInstanceFollowRedirects(false);
            connection.setRequestProperty("Accept", "application/vnd.android.package-archive");
            int status = connection.getResponseCode();
            if (status >= 300 && status < 400) {
                String location = connection.getHeaderField("Location"); connection.disconnect();
                if (location == null) throw new SecurityException("Redirecionamento invalido.");
                current = new URL(current, location); continue;
            }
            if (status != 200) { connection.disconnect(); throw new IllegalStateException("Servidor do APK respondeu " + status + "."); }
            return connection;
        }
        throw new SecurityException("Muitos redirecionamentos.");
    }

    private String hex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) builder.append(String.format(Locale.ROOT, "%02x", value));
        return builder.toString();
    }

    @Override protected void handleOnDestroy() { executor.shutdownNow(); super.handleOnDestroy(); }
}