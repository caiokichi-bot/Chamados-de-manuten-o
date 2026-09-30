import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useChamados } from '../context/ChamadosContext.tsx';
import { Chamado, ChamadoStatus, Prioridade } from '../types/index.ts';
import { NovoChamadoModal } from './NovoChamadoModal.tsx';
import { ChamadoDetailsModal } from './ChamadoDetailsModal.tsx';
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  HardHat,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Layers,
  Wrench,
  Sparkles,
  Calendar
} from 'lucide-react';

export const OperadorView: React.FC = () => {
  const { user } = useAuth();
  const { chamados } = useChamados();

  const [isNovoModalOpen, setIsNovoModalOpen] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [prioridadeFiltro, setPrioridadeFiltro] = useState<string>('todas');

  // Métricas
  const stats = useMemo(() => {
    const total = chamados.length;
    const abertos = chamados.filter((c) => c.status === 'aberto').length;
    const emAtendimento = chamados.filter((c) => c.status === 'em_atendimento').length;
    const encerrados = chamados.filter((c) => c.status === 'encerrado').length;
    const criticos = chamados.filter((c) => c.prioridade === 'critica' && c.status !== 'encerrado').length;

    return { total, abertos, emAtendimento, encerrados, criticos };
  }, [chamados]);

  // Filtro
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((item) => {
      const matchStatus = statusFiltro === 'todos' || item.status === statusFiltro;
      const matchPrio = prioridadeFiltro === 'todas' || item.prioridade === prioridadeFiltro;
      const matchBusca =
        !busca.trim() ||
        item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        item.codigo.toLowerCase().includes(busca.toLowerCase()) ||
        item.equipamento.toLowerCase().includes(busca.toLowerCase()) ||
        item.setor.toLowerCase().includes(busca.toLowerCase()) ||
        item.descricao_problema.toLowerCase().includes(busca.toLowerCase());

      return matchStatus && matchPrio && matchBusca;
    });
  }, [chamados, statusFiltro, prioridadeFiltro, busca]);

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas & Ação Principal */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15 relative overflow-hidden">
        {/* Decorativo de fundo */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-amber-100 uppercase tracking-wider">
              <HardHat className="w-3.5 h-3.5" /> Portal do Operador
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olá, {user?.name || 'Operador'}!
            </h1>
            <p className="text-amber-100 text-sm max-w-xl leading-relaxed">
              Identificou alguma anomalia, ruído estranho ou falha em equipamentos? Abra um chamado descrevendo a situação para acionar a equipe de manutenção mecânica.
            </p>
          </div>

          <button
            onClick={() => setIsNovoModalOpen(true)}
            className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shrink-0 cursor-pointer border border-amber-400/30"
          >
            <div className="p-1 bg-amber-500 rounded-lg text-slate-950">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <span>Abrir Novo Chamado</span>
          </button>
        </div>
      </div>

      {/* Alerta de Linha Parada se houver críticos */}
      {stats.criticos > 0 && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm">
                Atenção: {stats.criticos} chamado(s) de Máquina Parada / Urgência Crítica ativo(s)!
              </h4>
              <p className="text-xs text-rose-700">
                A equipe mecânica está priorizando os reparos emergenciais.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setPrioridadeFiltro('critica');
              setStatusFiltro('todos');
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shrink-0 transition-colors"
          >
            Ver Críticos
          </button>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Chamados registrados</div>
        </div>

        {/* Abertos */}
        <div
          onClick={() => setStatusFiltro(statusFiltro === 'aberto' ? 'todos' : 'aberto')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            statusFiltro === 'aberto'
              ? 'bg-amber-500/10 border-amber-500 shadow-xs ring-2 ring-amber-300'
              : 'bg-white border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Abertos</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.abertos}</div>
          <div className="text-[11px] text-amber-700/80 mt-1">Aguardando atendimento</div>
        </div>

        {/* Em Atendimento */}
        <div
          onClick={() => setStatusFiltro(statusFiltro === 'em_atendimento' ? 'todos' : 'em_atendimento')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            statusFiltro === 'em_atendimento'
              ? 'bg-blue-500/10 border-blue-500 shadow-xs ring-2 ring-blue-300'
              : 'bg-white border-slate-200/80 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Em Atendimento</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{stats.emAtendimento}</div>
          <div className="text-[11px] text-blue-700/80 mt-1">Mecânico trabalhando</div>
        </div>

        {/* Concluídos */}
        <div
          onClick={() => setStatusFiltro(statusFiltro === 'encerrado' ? 'todos' : 'encerrado')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            statusFiltro === 'encerrado'
              ? 'bg-emerald-500/10 border-emerald-500 shadow-xs ring-2 ring-emerald-300'
              : 'bg-white border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Encerrados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.encerrados}</div>
          <div className="text-[11px] text-emerald-700/80 mt-1">Solucionados com sucesso</div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por código, equipamento, problema..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="px-2 font-medium">Status:</span>
            {(['todos', 'aberto', 'em_atendimento', 'encerrado'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFiltro(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFiltro === st
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'em_atendimento' ? 'Em Reparo' : st}
              </button>
            ))}
          </div>

          {/* Prioridade selector */}
          <select
            value={prioridadeFiltro}
            onChange={(e) => setPrioridadeFiltro(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="todas">Todas as Prioridades</option>
            <option value="critica">🚨 Crítica</option>
            <option value="alta">⚠️ Alta</option>
            <option value="media">🔹 Média</option>
            <option value="baixa">⚪ Baixa</option>
          </select>
        </div>
      </div>

      {/* Lista de Chamados */}
      <div className="space-y-3">
        {chamadosFiltrados.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Nenhum chamado encontrado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nenhum chamado coincide com os filtros aplicados. Tente limpar os filtros ou clique em "Abrir Novo Chamado".
            </p>
            <button
              onClick={() => {
                setBusca('');
                setStatusFiltro('todos');
                setPrioridadeFiltro('todas');
              }}
              className="text-xs text-amber-600 font-bold hover:underline"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          chamadosFiltrados.map((item) => {
            const isCritica = item.prioridade === 'critica';
            const isAlta = item.prioridade === 'alta';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedChamado(item)}
                className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md cursor-pointer group ${
                  item.status === 'aberto'
                    ? 'border-amber-200/80 hover:border-amber-400'
                    : item.status === 'em_atendimento'
                    ? 'border-blue-200/80 hover:border-blue-400'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {item.codigo}
                    </span>

                    {/* Status Pill */}
                    {item.status === 'aberto' && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        Aberto
                      </span>
                    )}
                    {item.status === 'em_atendimento' && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-blue-600 animate-spin" />
                        Em Atendimento
                      </span>
                    )}
                    {item.status === 'encerrado' && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Encerrado
                      </span>
                    )}

                    {/* Prioridade Badge */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                        isCritica
                          ? 'bg-rose-600 text-white font-black'
                          : isAlta
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : item.prioridade === 'media'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.prioridade.toUpperCase()}
                    </span>

                    <span className="text-xs text-slate-500 font-medium">
                      {item.categoria}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Título e Equipamento */}
                <div className="mb-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {item.titulo}
                  </h3>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Equipamento: <strong className="text-slate-800">{item.equipamento}</strong> • Setor:{' '}
                    <strong className="text-slate-800">{item.setor}</strong>
                  </div>
                </div>

                {/* Descrição do Operador */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-700">Relato do Operador ({item.operador_nome}): </span>
                  {item.descricao_problema}
                </p>

                {/* Se Encerrado: Box com a Solução do Mecânico */}
                {item.status === 'encerrado' && (
                  <div className="mt-2 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="line-clamp-2">
                      <span className="font-bold text-emerald-900">Solução do Mecânico ({item.mecanico_nome}): </span>
                      {item.descricao_solucao}
                    </div>
                  </div>
                )}

                {/* Rodapé com link de detalhes */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px]">
                    {item.status === 'em_atendimento' ? (
                      <span className="text-blue-600 font-medium">Mecânico atendendo: {item.mecanico_nome}</span>
                    ) : item.status === 'encerrado' ? (
                      <span className="text-emerald-700 font-medium">Máquina liberada • Ver laudo completo</span>
                    ) : (
                      <span>Aguardando técnico mecânico</span>
                    )}
                  </span>
                  <span className="font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Ver Detalhes <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modais */}
      <NovoChamadoModal
        isOpen={isNovoModalOpen}
        onClose={() => setIsNovoModalOpen(false)}
      />

      <ChamadoDetailsModal
        chamado={selectedChamado}
        isOpen={!!selectedChamado}
        onClose={() => setSelectedChamado(null)}
      />
    </div>
  );
};
