import { Capacitor, registerPlugin } from '@capacitor/core';
import { apiUrl } from '../utils/apiBase.js';

const OnlineUpdate = registerPlugin('OnlineUpdate');

export function isAndroidNative() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function getInstalledAndroidVersion() {
  if (!isAndroidNative()) return null;
  return OnlineUpdate.getInstalledVersion();
}

export async function checkAndroidUpdate(signal) {
  if (!isAndroidNative()) return { available: false, reason: 'not-android' };
  const installed = await getInstalledAndroidVersion();
  const response = await fetch(apiUrl('/api/app-update/android'), {
    method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store', signal
  });
  if (!response.ok) throw new Error('Nao foi possivel verificar atualizacoes.');
  const remote = await response.json();
  const remoteCode = Number(remote?.versionCode || 0);
  const installedCode = Number(installed?.versionCode || 0);
  return {
    available: Boolean(remote?.enabled && remoteCode > installedCode),
    installed, remote,
    mandatory: Boolean(remote?.mandatory || (remote?.minimumVersionCode > 0 && installedCode < remote.minimumVersionCode))
  };
}

export async function canInstallAndroidPackages() {
  return OnlineUpdate.canInstallPackages();
}

export async function openAndroidInstallPermission() {
  return OnlineUpdate.openInstallPermission();
}

export async function downloadAndInstallAndroidUpdate(remote) {
  if (!remote?.apkUrl || !remote?.sha256) throw new Error('Atualizacao invalida.');
  return OnlineUpdate.downloadAndInstall({
    url: remote.apkUrl,
    sha256: remote.sha256,
    versionCode: Number(remote.versionCode || 0)
  });
}