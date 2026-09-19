import { Capacitor } from '@capacitor/core';

const TEST_IDS = Object.freeze({
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
});

const enabled = String(import.meta.env.VITE_ADS_ENABLED || 'false').toLowerCase() === 'true';
const testMode = String(import.meta.env.VITE_ADS_TEST_MODE || 'true').toLowerCase() !== 'false';
const minimumIntervalMs = Math.max(10, Number(import.meta.env.VITE_ADS_INTERVAL_MINUTES || 15)) * 60_000;
const minimumNavigations = Math.max(5, Number(import.meta.env.VITE_ADS_NAVIGATIONS || 8));
const blockedViews = new Set(['admin', 'aovivo', 'perfil', 'config', 'termos', 'vip-pro', 'banca-pro']);

let plugin = null;
let initialized = false;
let bannerVisible = false;
let lastInterstitialAt = 0;
let navigationCount = 0;

const envId = (name, fallback) => {
  const value = String(import.meta.env[name] || '').trim();
  return testMode ? fallback : value;
};

export const adsRuntimeConfig = Object.freeze({
  enabled,
  testMode,
  minimumIntervalMs,
  minimumNavigations,
});

export function adsPermitidos({ proAtivo, viewMode, jogoSelecionado, menuAtivo } = {}) {
  if (!enabled || !Capacitor.isNativePlatform() || proAtivo) return false;
  if (jogoSelecionado || menuAtivo === 'assinar pro' || blockedViews.has(viewMode)) return false;
  return true;
}

async function obterPlugin() {
  if (!plugin) plugin = await import('@capacitor-community/admob');
  return plugin;
}

export async function inicializarAnuncios() {
  if (!enabled || !Capacitor.isNativePlatform()) return false;
  if (initialized) return true;
  const { AdMob } = await obterPlugin();
  await AdMob.initialize({ initializeForTesting: testMode });
  initialized = true;
  return true;
}

export async function sincronizarBanner(contexto) {
  const permitido = adsPermitidos(contexto);
  const { AdMob, BannerAdSize, BannerAdPosition } = await obterPlugin().catch(() => ({}));
  if (!AdMob) return false;
  if (!permitido) {
    if (bannerVisible) await AdMob.hideBanner().catch(() => {});
    bannerVisible = false;
    return false;
  }
  await inicializarAnuncios();
  const adId = envId('VITE_ADMOB_BANNER_ID_ANDROID', TEST_IDS.banner);
  if (!adId) return false;
  if (!bannerVisible) {
    await AdMob.showBanner({
      adId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 88,
      isTesting: testMode,
    });
    bannerVisible = true;
  }
  return true;
}

export async function registrarNavegacaoParaAnuncio(contexto) {
  if (!adsPermitidos(contexto)) return false;
  navigationCount += 1;
  const now = Date.now();
  if (navigationCount < minimumNavigations || now - lastInterstitialAt < minimumIntervalMs) return false;
  const { AdMob } = await obterPlugin();
  await inicializarAnuncios();
  const adId = envId('VITE_ADMOB_INTERSTITIAL_ID_ANDROID', TEST_IDS.interstitial);
  if (!adId) return false;
  await AdMob.prepareInterstitial({ adId, isTesting: testMode });
  await AdMob.showInterstitial();
  navigationCount = 0;
  lastInterstitialAt = now;
  return true;
}

export async function mostrarAnuncioRecompensado(contexto) {
  if (!adsPermitidos(contexto)) return { rewarded: false, reason: 'not_allowed' };
  const { AdMob } = await obterPlugin();
  await inicializarAnuncios();
  const adId = envId('VITE_ADMOB_REWARDED_ID_ANDROID', TEST_IDS.rewarded);
  if (!adId) return { rewarded: false, reason: 'missing_id' };
  await AdMob.prepareRewardVideoAd({ adId, isTesting: testMode });
  const reward = await AdMob.showRewardVideoAd();
  return { rewarded: true, reward };
}

export async function encerrarAnuncios() {
  if (!plugin?.AdMob) return;
  await plugin.AdMob.hideBanner().catch(() => {});
  bannerVisible = false;
}
