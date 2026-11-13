import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Evita la "pantalla blanca": si algo falla al renderizar, muestra un mensaje claro con opción de recargar. */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[La Reliquia Trabaja] Error de renderizado:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto font-black text-xl">
            LR
          </div>
          <h1 className="text-xl font-black text-slate-900">Algo salió mal</h1>
          <p className="text-sm text-slate-600">
            Ocurrió un error inesperado en La Reliquia Trabaja. Tus datos guardados están a salvo. Recarga la página para
            continuar.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm"
          >
            Recargar la página
          </button>
        </div>
      </div>
    );
  }
}
