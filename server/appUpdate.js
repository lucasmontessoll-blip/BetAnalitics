const SHA256_RE = /^[a-f0-9]{64}$/i;

function positiveInteger(value) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export function androidUpdateConfig(env = process.env) {
  const enabled = String(env.ANDROID_UPDATE_ENABLED || 'false').toLowerCase() === 'true';
  const versionCode = positiveInteger(env.ANDROID_UPDATE_VERSION_CODE);
  const versionName = String(env.ANDROID_UPDATE_VERSION_NAME || '').trim().slice(0, 40);
  const apkUrl = safeHttpsUrl(env.ANDROID_UPDATE_APK_URL);
  const sha256 = String(env.ANDROID_UPDATE_APK_SHA256 || '').trim().toLowerCase();
  const minimumVersionCode = positiveInteger(env.ANDROID_UPDATE_MINIMUM_VERSION_CODE);
  const mandatory = String(env.ANDROID_UPDATE_MANDATORY || 'false').toLowerCase() === 'true';
  const notes = String(env.ANDROID_UPDATE_NOTES || '').trim().slice(0, 500);
  const ready = enabled && versionCode > 0 && versionName && apkUrl && SHA256_RE.test(sha256);

  return {
    enabled: Boolean(ready),
    versionCode: ready ? versionCode : 0,
    versionName: ready ? versionName : '',
    apkUrl: ready ? apkUrl : '',
    sha256: ready ? sha256 : '',
    mandatory: Boolean(ready && mandatory),
    minimumVersionCode: ready ? minimumVersionCode : 0,
    notes: ready ? notes : ''
  };
}

export function instalarRotasAppUpdate(app) {
  app.get('/api/app-update/android', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).json({ ok: true, platform: 'android', ...androidUpdateConfig() });
  });
}