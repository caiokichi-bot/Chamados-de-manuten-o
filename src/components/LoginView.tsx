import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Wrench, HardHat, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Database } from 'lucide-react';

interface LoginViewProps {
  onOpenSupabaseModal: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenSupabaseModal }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Por favor, informe o login.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor, informe a senha.');
      return;
    }

    const result = login(username, password);
    if (!result.success) {
      setError(result.error || 'Credenciais inválidas.');
    }
  };

  const fillAndLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
    login(u, p);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-amber-500 selection:text-white">
      {/* Background industrial grid pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Decorative ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Logo and Brand */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl shadow-xl shadow-amber-500/20 text-white mb-4">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            SIGMA Industrial
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sistema de Abertura & Encerramento de Chamados de Manutenção
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <span className="font-bold">Aviso:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Usuário / Login
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="operador ou mecanico"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium transition-all"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Acessar o Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Access Badges for prompt-specified logins */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-center font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              Acesso Rápido de Demonstração
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Operador Card */}
              <button
                type="button"
                onClick={() => fillAndLogin('operador', 'operador123')}
                className="p-3 bg-slate-800/70 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                  <HardHat className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>Operador</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                  <div>login: <strong className="text-slate-200">operador</strong></div>
                  <div>senha: <strong className="text-slate-200">operador123</strong></div>
                </div>
                <div className="mt-2 text-[10px] text-amber-400/90 font-medium flex items-center gap-1">
                  Abrir chamados →
                </div>
              </button>

              {/* Mecanico Card */}
              <button
                type="button"
                onClick={() => fillAndLogin('mecanico', 'mecanico123')}
                className="p-3 bg-slate-800/70 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-500/60 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
                  <Wrench className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span>Mecânico</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                  <div>login: <strong className="text-slate-200">mecanico</strong></div>
                  <div>senha: <strong className="text-slate-200">mecanico123</strong></div>
                </div>
                <div className="mt-2 text-[10px] text-blue-400/90 font-medium flex items-center gap-1">
                  Encerrar chamados →
                </div>
              </button>
            </div>
          </div>

          {/* Supabase Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onOpenSupabaseModal}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:underline cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              Configurar / Verificar Banco Supabase
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Controle de Acesso por Perfil (Operador e Mecânico)</span>
        </div>
      </div>
    </div>
  );
};
