import React from 'react';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Erro inesperado no aplicativo.',
    };
  }

  componentDidCatch(error, info) {
    console.error('Erro capturado pelo ErrorBoundary:', error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-5">
        <div className="w-full max-w-md bg-[#0f172a] border border-red-500/20 rounded-[2rem] p-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-black mb-2">
            Algo deu errado
          </h1>

          <p className="text-sm text-slate-400 font-semibold leading-relaxed mb-4">
            O app encontrou um erro, mas a tela preta foi evitada. Tente recarregar ou voltar para o início.
          </p>

          <div className="bg-[#050816] border border-white/10 rounded-2xl p-3 text-left text-[11px] text-slate-500 font-mono mb-5 break-words">
            {this.state.errorMessage}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-12 rounded-2xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Recarregar
            </button>

            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              className="h-12 rounded-2xl bg-[#050816] border border-white/10 text-white text-xs font-black flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Início
            </button>
          </div>
        </div>
      </div>
    );
  }
}
