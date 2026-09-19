import { useEffect, useRef } from 'react';
import {
  adsRuntimeConfig,
  encerrarAnuncios,
  registrarNavegacaoParaAnuncio,
  sincronizarBanner,
} from '../services/adMonetization.js';

export default function AdMonetizationController({ proAtivo, viewMode, jogoSelecionado, menuAtivo }) {
  const firstRender = useRef(true);

  useEffect(() => {
    if (!adsRuntimeConfig.enabled) return undefined;
    const context = { proAtivo, viewMode, jogoSelecionado, menuAtivo };
    sincronizarBanner(context).catch(() => {});
    if (firstRender.current) {
      firstRender.current = false;
    } else {
      registrarNavegacaoParaAnuncio(context).catch(() => {});
    }
    return undefined;
  }, [proAtivo, viewMode, Boolean(jogoSelecionado), menuAtivo]);

  useEffect(() => () => { encerrarAnuncios().catch(() => {}); }, []);
  return null;
}
