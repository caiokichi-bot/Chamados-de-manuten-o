import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ChamadosProvider, useChamados } from './context/ChamadosContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginView } from './components/LoginView.tsx';
import { OperadorView } from './components/OperadorView.tsx';
import { MecanicoView } from './components/MecanicoView.tsx';
import { SupabaseModal } from './components/SupabaseModal.tsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function MainAppContent() {
  const { user, isAuthenticated } = useAuth();
  const { notification, clearNotification } = useChamados();
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <>
        <LoginView onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Barra de Navegação Superior */}
      <Navbar onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />

      {/* Notificação Toast Flutuante */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md animate-in slide-in-from-top-4 duration-200">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
                : notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-100'
                : 'bg-blue-950/90 border-blue-500/50 text-blue-100'
            }`}
          >
            {notification.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {notification.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            {notification.type === 'info' && (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
              {notification.message}
            </div>
            <button
              onClick={clearNotification}
              className="text-white/60 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {user.role === 'operador' ? <OperadorView /> : <MecanicoView />}
      </main>

      {/* Rodapé */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">SIGMA Industrial</span>
            <span>—</span>
            <span>Sistema Integrado de Manutenção Mecânica & Operacional</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              Status Supabase
            </button>
            <span>•</span>
            <span>Operador (operador/operador123)</span>
            <span>•</span>
            <span>Mecânico (mecanico/mecanico123)</span>
          </div>
        </div>
      </footer>

      {/* Modal de Configuração do Supabase */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChamadosProvider>
        <MainAppContent />
      </ChamadosProvider>
    </AuthProvider>
  );
}
