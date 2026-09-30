import React from 'react';
import { Chamado } from '../types/index.ts';
import {
  X,
  HardHat,
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Calendar,
  Layers,
  Database,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';

interface ChamadoDetailsModalProps {
  chamado: Chamado | null;
  isOpen: boolean;
  onClose: () => void;
  onEncerrar?: (chamado: Chamado) => void;
  isMecanico?: boolean;
}

export const ChamadoDetailsModal: React.FC<ChamadoDetailsModalProps> = ({
  chamado,
  isOpen,
  onClose,
  onEncerrar,
  isMecanico,
}) => {
  if (!isOpen || !chamado) return null;

  const prioridadeBadge = {
    baixa: 'bg-slate-100 text-slate-800 border-slate-300',
    media: 'bg-blue-100 text-blue-800 border-blue-300',
    alta: 'bg-amber-100 text-amber-900 border-amber-300',
    critica: 'bg-rose-100 text-rose-900 border-rose-300 font-bold animate-pulse',
  }[chamado.prioridade];

  const statusBadge = {
    aberto: {
      label: 'Aberto (Aguardando Atendimento)',
      bg: 'bg-amber-500 text-white',
      border: 'border-amber-600',
    },
    em_atendimento: {
      label: 'Em Atendimento Técnico',
      bg: 'bg-blue-600 text-white',
      border: 'border-blue-700',
    },
    encerrado: {
      label: 'Encerrado / Resolvido',
      bg: 'bg-emerald-600 text-white',
      border: 'border-emerald-700',
    },
  }[chamado.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono font-bold text-xs text-amber-400">
              {chamado.codigo}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-700 text-sm">
          {/* Título e Equipamento */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{chamado.titulo}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-800 border border-slate-200">
                Máquina: <strong>{chamado.equipamento}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-800 border border-slate-200">
                Setor: <strong>{chamado.setor}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-800 border border-slate-200">
                Categoria: <strong>{chamado.categoria}</strong>
              </span>
              <span className={`px-2.5 py-1 rounded-md font-semibold border ${prioridadeBadge}`}>
                Prioridade: {chamado.prioridade.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Seção 1: Relato da Abertura pelo Operador */}
          <div className="p-4.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-amber-900 font-semibold border-b border-amber-200/60 pb-2">
              <span className="flex items-center gap-1.5 text-amber-800 font-bold">
                <HardHat className="w-4 h-4 text-amber-600" />
                Abertura pelo Operador: {chamado.operador_nome}
              </span>
              <span className="text-slate-500 font-normal">
                {new Date(chamado.created_at).toLocaleString('pt-BR')}
              </span>
            </div>
            <div>
              <h4 className="text-xs uppercase font-bold text-amber-900 tracking-wider mb-1">
                Descrição do Problema Observado
              </h4>
              <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line bg-white/80 p-3 rounded-xl border border-amber-200/40">
                {chamado.descricao_problema}
              </p>
            </div>
          </div>

          {/* Seção 2: Atendimento e Solução pelo Mecânico */}
          {chamado.status === 'encerrado' ? (
            <div className="p-4.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold border-b border-emerald-200/60 pb-2">
                <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  Manutenção Executada por: {chamado.mecanico_nome || 'Mecânico da Equipe'}
                </span>
                <span className="text-slate-500 font-normal">
                  Encerrado em: {chamado.data_encerramento ? new Date(chamado.data_encerramento).toLocaleString('pt-BR') : '-'}
                </span>
              </div>

              {/* O QUE FOI FEITO */}
              <div>
                <h4 className="text-xs uppercase font-bold text-emerald-950 tracking-wider mb-1 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                  O que foi feito (Serviço Executado)
                </h4>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                  {chamado.descricao_solucao}
                </div>
              </div>

              {/* Informações complementares da intervenção */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 block mb-0.5">Causa Raiz Identificada:</span>
                  <span className="font-bold text-slate-800">{chamado.causa_raiz || 'Não especificada'}</span>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-emerald-200">
                  <span className="text-slate-500 block mb-0.5">Tempo de Reparo:</span>
                  <span className="font-bold text-slate-800">
                    {chamado.tempo_reparo_minutos ? `${chamado.tempo_reparo_minutos} minutos` : 'Não registrado'}
                  </span>
                </div>
              </div>

              {chamado.pecas_utilizadas && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-emerald-950 tracking-wider mb-1 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-emerald-700" />
                    Peças / Materiais Utilizados
                  </h4>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-slate-700 text-xs">
                    {chamado.pecas_utilizadas}
                  </div>
                </div>
              )}

              {chamado.recomendacoes && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-emerald-950 tracking-wider mb-1">
                    Recomendações para a Produção
                  </h4>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-slate-700 text-xs italic">
                    "{chamado.recomendacoes}"
                  </div>
                </div>
              )}

              <div className="p-2.5 bg-emerald-100/70 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {chamado.maquina_liberada
                    ? 'Equipamento testado e liberado para produção total.'
                    : 'Equipamento liberado com restrições operacionais.'}
                </span>
              </div>
            </div>
          ) : chamado.status === 'em_atendimento' ? (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                <Wrench className="w-4 h-4 text-blue-600 animate-spin" />
                Chamado em Atendimento Técnico
              </div>
              <p className="text-xs text-blue-700">
                Mecânico responsável: <strong>{chamado.mecanico_nome}</strong>. Atendimento iniciado em{' '}
                {chamado.data_atendimento ? new Date(chamado.data_atendimento).toLocaleString('pt-BR') : 'pouco tempo'}.
              </p>

              {isMecanico && onEncerrar && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onEncerrar(chamado);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Encerrar este Chamado Agora
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Clock className="w-4 h-4 text-amber-500" />
                Aguardando Alocação de Mecânico
              </div>
              <p>
                Este chamado está na fila de manutenção industrial aguardando o início do diagnóstico.
              </p>
            </div>
          )}

          {/* Status do Supabase */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              {chamado.synced_with_supabase
                ? 'Sincronizado na Nuvem Supabase'
                : 'Salvo em Cache Local (Pronto p/ Sincronizar)'}
            </span>
            <span className="font-mono">ID: {chamado.id}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
