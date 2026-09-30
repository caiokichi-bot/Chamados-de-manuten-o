import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useChamados } from '../context/ChamadosContext.tsx';
import { Wrench, HardHat, LogOut, Database, RefreshCw, ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  onOpenSupabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSupabaseModal }) => {
  const { user, logout, switchRoleQuick } = useAuth();
  const { supabaseConfig, recarregarDados, isLoading } = useChamados();

  if (!user) return null;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl text-white shadow-sm shadow-orange-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                  SIGMA
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Sistema de Chamados de Manutenção Industrial
              </p>
            </div>
          </div>

          {/* Ações centrais e direita */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Status Supabase */}
            <button
              onClick={onOpenSupabaseModal}
              title="Configurações do Supabase"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                supabaseConfig.isConnected && supabaseConfig.tableExists
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
                  : 'bg-amber-950/70 border-amber-500/40 text-amber-300 hover:bg-amber-900/80 animate-pulse'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Supabase:</span>
              <span>
                {supabaseConfig.isConnected && supabaseConfig.tableExists
                  ? 'Conectado'
                  : supabaseConfig.isConnected
                  ? 'Falta Tabela'
                  : 'Pronto p/ Conectar'}
              </span>
              {supabaseConfig.isConnected && supabaseConfig.tableExists ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* Recarregar */}
            {supabaseConfig.isConnected && (
              <button
                onClick={() => recarregarDados()}
                disabled={isLoading}
                title="Recarregar dados do Supabase"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            )}

            {/* Alternador Rápido de Perfil (Facilitador para teste) */}
            <div className="hidden lg:flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60">
              <button
                onClick={() => switchRoleQuick('operador')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  user.role === 'operador'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                Operador
              </button>
              <button
                onClick={() => switchRoleQuick('mecanico')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  user.role === 'mecanico'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                Mecânico
              </button>
            </div>

            {/* Perfil do Usuário Ativo */}
            <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-white leading-tight">
                  {user.name}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      user.role === 'operador' ? 'bg-amber-400' : 'bg-blue-400'
                    }`}
                  />
                  <span className="text-[11px] text-slate-300 capitalize font-medium">
                    {user.role === 'operador' ? 'Operador' : 'Mecânico'}
                  </span>
                </div>
              </div>

              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${user.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-slate-800`}
                title={`${user.name} (${user.role})`}
              >
                {user.role === 'operador' ? (
                  <HardHat className="w-5 h-5" />
                ) : (
                  <Wrench className="w-5 h-5" />
                )}
              </div>

              {/* Botão Sair */}
              <button
                onClick={logout}
                title="Encerrar sessão"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
