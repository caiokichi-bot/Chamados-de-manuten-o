import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useChamados } from '../context/ChamadosContext.tsx';
import { Chamado } from '../types/index.ts';
import {
  X,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock,
  Package,
  FileCheck2,
  Sparkles,
  Info
} from 'lucide-react';

interface EncerrarChamadoModalProps {
  chamado: Chamado | null;
  isOpen: boolean;
  onClose: () => void;
}

const CAUSAS_RAIZ_SUGERIDAS = [
  'Desgaste natural por tempo de operação',
  'Falta ou degradação de lubrificação',
  'Desalinhamento mecânico / Folga excessiva',
  'Fadiga ou quebra de componente mecânico',
  'Contaminação por cavacos / sujeira / pó',
  'Vazamento em vedação / retentor rompido',
  'Sobrecarga térmica ou elétrica',
  'Erro ou esforço além do limite operacional',
  'Parafusos ou fixações afrouxadas por vibração',
  'Outro (especificado na descrição)',
];

export const EncerrarChamadoModal: React.FC<EncerrarChamadoModalProps> = ({
  chamado,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { encerrarChamado } = useChamados();

  const [solucao, setSolucao] = useState('');
  const [causaRaiz, setCausaRaiz] = useState(CAUSAS_RAIZ_SUGERIDAS[0]);
  const [pecas, setPecas] = useState('');
  const [tempoMinutos, setTempoMinutos] = useState<number>(45);
  const [maquinaLiberada, setMaquinaLiberada] = useState<boolean>(true);
  const [recomendacoes, setRecomendacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !chamado) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!solucao.trim() || solucao.trim().length < 15) {
      setError('Por favor, descreva detalhadamente o que foi feito no equipamento (mínimo 15 caracteres).');
      return;
    }

    setIsSubmitting(true);
    try {
      await encerrarChamado({
        chamadoId: chamado.id,
        mecanico_nome: user?.name || 'Roberto Silveira',
        mecanico_id: user?.id || 'usr-mec-01',
        descricao_solucao: solucao.trim(),
        causa_raiz: causaRaiz,
        pecas_utilizadas: pecas.trim() || 'Nenhuma peça substituída (apenas ajuste/regulagem)',
        tempo_reparo_minutos: tempoMinutos,
        maquina_liberada: maquinaLiberada,
        recomendacoes: recomendacoes.trim() || 'Operação normal liberada. Seguir plano de manutenção preventiva.',
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao encerrar chamado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const aplicarModeloSolucao = (modelo: {
    solucao: string;
    causa: string;
    pecas: string;
    tempo: number;
    recom: string;
  }) => {
    setSolucao(modelo.solucao);
    setCausaRaiz(modelo.causa);
    setPecas(modelo.pecas);
    setTempoMinutos(modelo.tempo);
    setRecomendacoes(modelo.recom);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/30 rounded-xl backdrop-blur-xs border border-blue-400/30 text-white">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Encerramento de Chamado
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/80 border border-blue-400/40 text-blue-200 font-mono">
                  {chamado.codigo}
                </span>
              </h2>
              <p className="text-xs text-blue-200">
                Mecânico Responsável: <span className="font-semibold text-white">{user?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Chamado Aberto */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">{chamado.titulo}</span>
            <span className="text-[11px] font-mono text-slate-500">
              Setor: <strong>{chamado.setor}</strong> | Equipamento: <strong>{chamado.equipamento}</strong>
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-600 italic">
            <span className="font-semibold text-slate-700 not-italic">Relato do Operador ({chamado.operador_nome}): </span>
            "{chamado.descricao_problema}"
          </div>
        </div>

        {/* Modelos rápidos */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs text-indigo-900">
          <span className="font-bold flex items-center gap-1 shrink-0 text-indigo-800 text-[11px]">
            <Sparkles className="w-3 h-3 text-indigo-600" /> Preenchimento rápido:
          </span>
          <button
            type="button"
            onClick={() =>
              aplicarModeloSolucao({
                solucao: 'Desmontado conjunto de vedação, realizada limpeza e polimento da haste do cilindro. Substituído anel raspador e retentor de alta pressão. Efetuado reabastecimento de fluido e teste de pressão estática a 150 bar sem vazamentos.',
                causa: 'Vazamento em vedação / retentor rompido',
                pecas: '1x Retentor Viton 80x100x12, 1x Raspador Poliuretano, 2L Óleo Hidráulico ISO 68',
                tempo: 60,
                recom: 'Verificar nível no visor de óleo no início de cada turno e manter a haste limpa.',
              })
            }
            className="px-2 py-0.5 rounded bg-white border border-indigo-200 hover:border-indigo-400 font-medium text-indigo-900 shrink-0 text-[11px] shadow-2xs hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            🔧 Troca de Vedação / Retentor
          </button>
          <button
            type="button"
            onClick={() =>
              aplicarModeloSolucao({
                solucao: 'Efetuado alinhamento a laser dos mancais e polias, troca da correia sincronizadora gasta e reaperto com torquímetro. Realizado teste em vazio e teste sob carga por 30 minutos com temperatura estável.',
                causa: 'Desalinhamento mecânico / Folga excessiva',
                pecas: '1x Correia Dentada HTD 8M-1200-30, 2x Parafusos M12x50 classe 8.8',
                tempo: 45,
                recom: 'Reinspecionar a tensão da correia após 40 horas de trabalho contínuo.',
              })
            }
            className="px-2 py-0.5 rounded bg-white border border-indigo-200 hover:border-indigo-400 font-medium text-indigo-900 shrink-0 text-[11px] shadow-2xs hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            ⚙️ Alinhamento & Troca de Correia
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-700">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong>Atenção:</strong> {error}
              </div>
            </div>
          )}

          {/* O QUE FOI FEITO */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                Descrição do que foi feito pelo mecânico <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">Detalhe as intervenções</span>
            </div>
            <textarea
              rows={4}
              value={solucao}
              onChange={(e) => setSolucao(e.target.value)}
              placeholder="Descreva detalhadamente o diagnóstico realizado, os reparos executados, as desmontagens, substituições e os testes finais que comprovaram a resolução do problema..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium leading-relaxed"
              required
            />
          </div>

          {/* Causa Raiz e Peças */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Causa Raiz Identificada
              </label>
              <select
                value={causaRaiz}
                onChange={(e) => setCausaRaiz(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium"
              >
                {CAUSAS_RAIZ_SUGERIDAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Tempo de Reparo (minutos)
              </label>
              <input
                type="number"
                min="5"
                max="2880"
                step="5"
                value={tempoMinutos}
                onChange={(e) => setTempoMinutos(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Peças Utilizadas */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-slate-500" />
              Peças / Materiais Utilizados ou Substituídos
            </label>
            <input
              type="text"
              value={pecas}
              onChange={(e) => setPecas(e.target.value)}
              placeholder="Ex: 1x Rolamento 6205-2RS, 2L Óleo VG 68, 1x Retentor 45x65x10..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium"
            />
          </div>

          {/* Recomendações e Liberação */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Recomendações e Cuidados para a Operação
              </label>
              <input
                type="text"
                value={recomendacoes}
                onChange={(e) => setRecomendacoes(e.target.value)}
                placeholder="Ex: Verificar temperatura de hora em hora; evitar ultrapassar 75% da carga máxima hoje."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition-all font-medium"
              />
            </div>

            {/* Switch de Máquina Liberada */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-emerald-950 block">
                  Status de Liberação da Máquina
                </span>
                <span className="text-[11px] text-emerald-700">
                  {maquinaLiberada
                    ? 'Máquina 100% pronta e liberada para o operador retomar a produção.'
                    : 'Máquina ainda em observação ou liberada sob condições restritas.'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maquinaLiberada}
                  onChange={(e) => setMaquinaLiberada(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Ações */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Salvando Encerramento...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Encerrar Chamado com Sucesso
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
