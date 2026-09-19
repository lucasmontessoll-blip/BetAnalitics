import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, ShieldCheck, X } from 'lucide-react';
import {
  canInstallAndroidPackages, checkAndroidUpdate, downloadAndInstallAndroidUpdate,
  isAndroidNative, openAndroidInstallPermission
} from '../services/appUpdate.js';

const LAST_CHECK_KEY = 'golnexa_update_check_v1';
const CHECK_INTERVAL = 6 * 60 * 60 * 1000;

export default function AppUpdateController() {
  const [state, setState] = useState({ loading: false, result: null, error: '', dismissed: false });

  useEffect(() => {
    if (!isAndroidNative()) return undefined;
    const last = Number(localStorage.getItem(LAST_CHECK_KEY) || 0);
    if (Date.now() - last < CHECK_INTERVAL) return undefined;
    const controller = new AbortController();
    localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));
    checkAndroidUpdate(controller.signal)
      .then((result) => setState((old) => ({ ...old, result })))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const result = state.result;
  if (!result?.available || (state.dismissed && !result.mandatory)) return null;

  async function install() {
    if (state.loading) return;
    setState((old) => ({ ...old, loading: true, error: '' }));
    try {
      const permission = await canInstallAndroidPackages();
      if (!permission?.allowed) {
        await openAndroidInstallPermission();
        throw new Error('Autorize a Golnexa a instalar atualizacoes e toque novamente em Atualizar.');
      }
      await downloadAndInstallAndroidUpdate(result.remote);
    } catch (error) {
      setState((old) => ({ ...old, error: error?.message || 'Falha ao preparar a atualizacao.' }));
    } finally {
      setState((old) => ({ ...old, loading: false }));
    }
  }

  return (
    <div className="fixed inset-x-3 bottom-20 z-[200] mx-auto max-w-md rounded-2xl border border-cyan-400/30 bg-[#08101f] p-4 text-white shadow-2xl">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10"><ShieldCheck className="h-5 w-5 text-cyan-300" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div><p className="text-sm font-black">Atualizacao Golnexa {result.remote.versionName}</p><p className="mt-1 text-[11px] text-slate-400">Download verificado antes da instalacao.</p></div>
            {!result.mandatory && <button type="button" aria-label="Fechar atualizacao" onClick={() => setState((old) => ({ ...old, dismissed: true }))}><X className="h-4 w-4 text-slate-400" /></button>}
          </div>
          {result.remote.notes ? <p className="mt-2 text-xs text-slate-300">{result.remote.notes}</p> : null}
          {state.error ? <p className="mt-2 text-xs text-amber-300">{state.error}</p> : null}
          <button type="button" disabled={state.loading} onClick={install} className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black disabled:opacity-60">
            {state.loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {state.loading ? 'Preparando...' : 'Atualizar agora'}
          </button>
        </div>
      </div>
    </div>
  );
}