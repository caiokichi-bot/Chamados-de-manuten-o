import React, { useState } from 'react';
import { useChamados } from '../context/ChamadosContext.tsx';
import { SUPABASE_SQL_SCRIPT } from '../lib/sqlScript.ts';
import { Database, CheckCircle, AlertTriangle, Copy, Check, RefreshCw, ExternalLink, X, ShieldAlert, Sparkles } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const {
    supabaseConfig,
    salvarConfiguracaoSupabase,
    recarregarDados,
    sincronizarComSupabase,
    isSyncing,
    isLoading,
  } = useChamados();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'passos'>('config');

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    try {
      await salvarConfiguracaoSupabase(url, anonKey);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Conexão com o Supabase
                {supabaseConfig.isConnected && supabaseConfig.tableExists ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Ativo
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Pronto p/ Conectar
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-300">
                Armazene os chamados de manutenção na nuvem PostgreSQL do Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Credenciais & Status
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Script SQL da Tabela</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              1-Clique
            </span>
          </button>
          <button
            onClick={() => setActiveTab('passos')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'passos'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Passo a Passo
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-slate-700 text-sm">
          {activeTab === 'config' && (
            <div className="space-y-5">
              {/* Status Banner */}
              {supabaseConfig.isConnected && supabaseConfig.tableExists ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-900">Conexão Estabelecida com Sucesso!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      A tabela <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">chamados</code> está pronta no seu Supabase. Novos chamados e encerramentos estão sendo salvos em tempo real na nuvem!
                    </p>
                  </div>
                </div>
              ) : supabaseConfig.isConnected && !supabaseConfig.tableExists ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900">Conectado ao Supabase, mas a tabela falta ser criada</h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Acesse a aba <strong>"Script SQL da Tabela"</strong> acima, copie o script e execute no SQL Editor do Supabase para criar a tabela <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">chamados</code>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Sistema com Armazenamento Local Pronto</h4>
                    <p className="text-xs text-blue-700 mt-0.5">
                      O sistema funciona perfeitamente agora mesmo em cache local. Para salvar no seu banco Supabase, informe a URL e a chave pública anônima abaixo.
                    </p>
                  </div>
                </div>
              )}

              {/* Form de credenciais */}
              <form onSubmit={handleSaveAndTest} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzabcdefghijklm.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Encontrado no painel do Supabase em Project Settings → API → Project URL.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Chave pública anônima (Project Settings → API → Project API Keys → "anon public").
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Testando Conexão...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        Salvar e Testar Conexão
                      </>
                    )}
                  </button>

                  {supabaseConfig.isConnected && supabaseConfig.tableExists && (
                    <button
                      type="button"
                      onClick={() => sincronizarComSupabase()}
                      disabled={isSyncing}
                      className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                      Sincronizar Chamados Locais p/ Nuvem
                    </button>
                  )}
                </div>
              </form>

              {supabaseConfig.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Detalhe:</strong> {supabaseConfig.error}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Script SQL Pronto para o Supabase</h3>
                  <p className="text-xs text-slate-500">
                    Copia e executa no <strong>SQL Editor</strong> do seu projeto Supabase para criar a estrutura completa.
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar SQL
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed selection:bg-emerald-600">
                  {SUPABASE_SQL_SCRIPT}
                </pre>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Este script inclui a tabela <code>chamados</code> com todos os campos do Operador e do Mecânico, índices para busca rápida e as políticas de segurança RLS necessárias.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'passos' && (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Crie seu projeto no Supabase</h5>
                    <p className="text-slate-600 mt-0.5">
                      Acesse <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> e crie uma conta gratuita caso ainda não tenha.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Execute o Script SQL</h5>
                    <p className="text-slate-600 mt-0.5">
                      No menu lateral esquerdo do Supabase, clique em <strong>SQL Editor</strong> → <strong>New Query</strong>. Cole o script da aba "Script SQL da Tabela" e clique no botão verde <strong>RUN</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Obtenha as chaves de API</h5>
                    <p className="text-slate-600 mt-0.5">
                      Vá em <strong>Project Settings</strong> (ícone de engrenagem) → <strong>API</strong>. Copie a <strong>Project URL</strong> e a chave <strong>anon public</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">4</span>
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Cole aqui e conecte</h5>
                    <p className="text-slate-600 mt-0.5">
                      Cole as credenciais na aba "Credenciais & Status" e clique em <strong>Salvar e Testar</strong>. Todos os chamados abertos pelo Operador e encerrados pelo Mecânico serão salvos automaticamente no seu banco!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {supabaseConfig.isConnected ? '🟢 Supabase Conectado' : '🟡 Modo Local Ativo (Pronto para sincronizar)'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
