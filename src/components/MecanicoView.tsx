import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useChamados } from '../context/ChamadosContext.tsx';
import { Chamado } from '../types/index.ts';
import { EncerrarChamadoModal } from './EncerrarChamadoModal.tsx';
import { ChamadoDetailsModal } from './ChamadoDetailsModal.tsx';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Flame,
  Search,
  CheckCheck,
  AlertTriangle,
  PlayCircle,
  FileText,
  ChevronRight,
  Package,
  Sparkles,
  ShieldCheck,
  History
} from 'lucide-react';

export const MecanicoView: React.FC = () => {
  const { user } = useAuth();
  const { chamados, iniciarAtendimento } = useChamados();

  const [activeTab, setActiveTab] = useState<'abertos' | 'em_andamento' | 'encerrados'>('abertos');
  const [chamadoParaEncerrar, setChamadoParaEncerrar] = useState<Chamado | null>(null);
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [busca, setBusca] = useState('');

  // Agrupamentos
  const chamadosAbertos = useMemo(() => {
    return chamados
      .filter((c) => c.status === 'aberto')
      .sort((a, b) => {
        // Prioridade crítica primeiro
        const pesoPrio = { critica: 4, alta: 3, media: 2, baixa: 1 };
        return pesoPrio[b.prioridade] - pesoPrio[a.prioridade];
      });
  }, [chamados]);

  const chamadosEmAndamento = useMemo(() => {
    return chamados.filter((c) => c.status === 'em_atendimento');
  }, [chamados]);

  const chamadosEncerrados = useMemo(() => {
    return chamados.filter((c) => c.status === 'encerrado');
  }, [chamados]);

  // Tempo médio de reparo
  const tempoMedioMinutos = useMemo(() => {
    const resolvidosComTempo = chamadosEncerrados.filter((c) => c.tempo_reparo_minutos);
    if (resolvidosComTempo.length === 0) return 45;
    const soma = resolvidosComTempo.reduce((acc, c) => acc + (c.tempo_reparo_minutos || 0), 0);
    return Math.round(soma / resolvidosComTempo.length);
  }, [chamadosEncerrados]);

  // Lista da aba atual com filtro de busca
  const listaExibida = useMemo(() => {
    let base =
      activeTab === 'abertos'
        ? chamadosAbertos
        : activeTab === 'em_andamento'
        ? chamadosEmAndamento
        : chamadosEncerrados;

    if (!busca.trim()) return base;

    return base.filter(
      (c) =>
        c.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        c.codigo.toLowerCase().includes(busca.toLowerCase()) ||
        c.equipamento.toLowerCase().includes(busca.toLowerCase()) ||
        c.descricao_problema.toLowerCase().includes(busca.toLowerCase()) ||
        (c.descricao_solucao && c.descricao_solucao.toLowerCase().includes(busca.toLowerCase()))
    );
  }, [activeTab, chamadosAbertos, chamadosEmAndamento, chamadosEncerrados, busca]);

  const handleIniciarAtendimento = async (e: React.MouseEvent, item: Chamado) => {
    e.stopPropagation();
    await iniciarAtendimento(item.id, user?.name || 'Roberto Silveira', user?.id || 'usr-mec-01');
    setActiveTab('em_andamento');
  };

  const handleAbrirEncerramento = (e: React.MouseEvent, item: Chamado) => {
    e.stopPropagation();
    setChamadoParaEncerrar(item);
  };

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas Mecânico */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/15 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-blue-100 uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5" /> Portal da Manutenção Mecânica
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mecânico: {user?.name || 'Mecânico'}
            </h1>
            <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
              Consulte os chamados abertos pelos operadores, assuma o atendimento e encerre descrevendo detalhadamente o diagnóstico, peças substituídas e o serviço efetuado.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/15 backdrop-blur-xs text-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-sm">Pronto para Encerramento</div>
              <div className="text-blue-200 text-[11px]">
                {chamadosAbertos.length} chamado(s) aguardando atendimento
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Chamados Abertos */}
        <div
          onClick={() => setActiveTab('abertos')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'abertos'
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-300 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Fila Aberta</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{chamadosAbertos.length}</div>
          <div className="text-[11px] text-amber-700/80 mt-1">Aguardando assumir</div>
        </div>

        {/* Em Andamento */}
        <div
          onClick={() => setActiveTab('em_andamento')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'em_andamento'
              ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-300 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Em Atendimento</span>
            <Wrench className="w-4 h-4 text-blue-600 animate-spin" />
          </div>
          <div className="text-2xl font-black text-blue-600">{chamadosEmAndamento.length}</div>
          <div className="text-[11px] text-blue-700/80 mt-1">Prontos para encerrar</div>
        </div>

        {/* Encerrados */}
        <div
          onClick={() => setActiveTab('encerrados')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'encerrados'
              ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-300 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Encerrados</span>
            <CheckCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{chamadosEncerrados.length}</div>
          <div className="text-[11px] text-emerald-700/80 mt-1">Laudos concluídos</div>
        </div>

        {/* Tempo Médio */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">MTTR Médio</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800">{tempoMedioMinutos} min</div>
          <div className="text-[11px] text-slate-500 mt-1">Tempo médio de intervenção</div>
        </div>
      </div>

      {/* Navegação de Abas do Mecânico */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('abertos')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'abertos'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Fila de Chamados Abertos</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
              {chamadosAbertos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('em_andamento')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'em_andamento'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Meus Atendimentos</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
              {chamadosEmAndamento.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('encerrados')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'encerrados'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico Concluído</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
              {chamadosEncerrados.length}
            </span>
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar chamado..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Chamados do Mecânico */}
      <div className="space-y-3">
        {listaExibida.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {activeTab === 'abertos'
                ? 'Nenhum chamado pendente na fila!'
                : activeTab === 'em_andamento'
                ? 'Nenhum chamado em atendimento no momento.'
                : 'Nenhum chamado encerrado encontrado.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'abertos'
                ? 'Tudo em ordem nas linhas de produção. Novas aberturas aparecerão aqui.'
                : activeTab === 'em_andamento'
                ? 'Assuma um chamado aberto na aba "Fila de Chamados Abertos" para iniciar o trabalho.'
                : 'Os chamados encerrados com descrição do que foi feito serão arquivados aqui.'}
            </p>
          </div>
        ) : (
          listaExibida.map((item) => {
            const isCritica = item.prioridade === 'critica';
            const isAlta = item.prioridade === 'alta';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedChamado(item)}
                className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md cursor-pointer group ${
                  item.status === 'em_atendimento'
                    ? 'border-blue-300 ring-1 ring-blue-200'
                    : isCritica
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {item.codigo}
                    </span>

                    {/* Prioridade */}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
                        isCritica
                          ? 'bg-rose-600 text-white font-black animate-pulse flex items-center gap-1'
                          : isAlta
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCritica && <Flame className="w-3.5 h-3.5" />}
                      Prioridade: {item.prioridade.toUpperCase()}
                    </span>

                    <span className="text-xs text-slate-500 font-medium">
                      Setor: <strong>{item.setor}</strong> • Categoria: <strong>{item.categoria}</strong>
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Aberto por: <strong className="text-slate-600">{item.operador_nome}</strong> em{' '}
                    {new Date(item.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Título & Equipamento */}
                <div className="mb-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.titulo}
                  </h3>
                  <div className="text-xs text-slate-700 font-semibold mt-0.5">
                    Equipamento: <span className="text-slate-900">{item.equipamento}</span>
                  </div>
                </div>

                {/* Descrição do Operador */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Problema Relatado pelo Operador:
                  </div>
                  <p className="leading-relaxed whitespace-pre-line text-slate-600 pl-4">
                    {item.descricao_problema}
                  </p>
                </div>

                {/* Se Encerrado: Box com a Descrição do que foi feito pelo Mecânico */}
                {item.status === 'encerrado' && (
                  <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-emerald-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        O que foi feito pelo Mecânico ({item.mecanico_nome}):
                      </span>
                      <span className="text-[11px] font-normal text-slate-600">
                        Tempo de Reparo: <strong>{item.tempo_reparo_minutos} min</strong>
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-emerald-200/60">
                      {item.descricao_solucao}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-1">
                      <span>Causa Raiz: <strong>{item.causa_raiz}</strong></span>
                      {item.pecas_utilizadas && (
                        <span>Peças: <strong>{item.pecas_utilizadas}</strong></span>
                      )}
                    </div>
                  </div>
                )}

                {/* Botões de Ação do Mecânico */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    {item.status === 'aberto' && (
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Aguardando mecânico iniciar intervenção
                      </span>
                    )}
                    {item.status === 'em_atendimento' && (
                      <span className="text-blue-600 font-bold flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5" /> Em atendimento por {item.mecanico_nome}
                      </span>
                    )}
                    {item.status === 'encerrado' && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCheck className="w-3.5 h-3.5" /> Manutenção finalizada e máquina liberada
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botão de Iniciar Atendimento (quando aberto) */}
                    {item.status === 'aberto' && (
                      <button
                        onClick={(e) => handleIniciarAtendimento(e, item)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Assumir / Iniciar Atendimento</span>
                      </button>
                    )}

                    {/* Botão de Encerrar Chamado (quando em atendimento) */}
                    {item.status === 'em_atendimento' && (
                      <button
                        onClick={(e) => handleAbrirEncerramento(e, item)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer animate-pulse hover:animate-none"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Encerrar Chamado & Descrever Serviço</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedChamado(item)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>Detalhes</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modais */}
      <EncerrarChamadoModal
        chamado={chamadoParaEncerrar}
        isOpen={!!chamadoParaEncerrar}
        onClose={() => setChamadoParaEncerrar(null)}
      />

      <ChamadoDetailsModal
        chamado={selectedChamado}
        isOpen={!!selectedChamado}
        onClose={() => setSelectedChamado(null)}
        isMecanico={true}
        onEncerrar={(ch) => setChamadoParaEncerrar(ch)}
      />
    </div>
  );
};
