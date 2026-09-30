import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useChamados } from '../context/ChamadosContext.tsx';
import { Categoria, Prioridade } from '../types/index.ts';
import {
  X,
  AlertTriangle,
  Send,
  HardHat,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface NovoChamadoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EQUIPAMENTOS_SUGERIDOS = [
  'Prensa Hidráulica 150T',
  'Torno CNC Haas ST-20',
  'Centro de Usinagem 5 Eixos',
  'Esteira Transportadora Linha 02',
  'Compressor Parafuso Atlas Copco',
  'Injetora Plástica Romi 220T',
  'Robô Soldador Fanuc',
  'Caldeira a Gás Industrial',
  'Ponte Rolante 10T - Vão 2',
  'Misturador Industrial 500L',
];

const SETORES_SUGERIDOS = [
  'Linha de Montagem',
  'Usinagem de Precisão',
  'Estamparia Pesada',
  'Injeção Plástica',
  'Soldagem & Funilaria',
  'Pintura Industrial',
  'Expedição & Estoque',
  'Utilidades & Compressores',
];

const CATEGORIAS: Categoria[] = [
  'Mecânica',
  'Elétrica',
  'Hidráulica',
  'Pneumática',
  'Lubrificação',
  'Estrutural',
  'Outro',
];

const PRIORIDADES: { id: Prioridade; label: string; desc: string; color: string; badge: string }[] = [
  {
    id: 'baixa',
    label: 'Baixa',
    desc: 'Não afeta a produção imediata. Manutenção preventiva/ajuste.',
    color: 'border-slate-300 hover:border-slate-400 text-slate-700',
    badge: 'bg-slate-100 text-slate-700',
  },
  {
    id: 'media',
    label: 'Média',
    desc: 'Operando com rendimento reduzido ou ruído/vibração leve.',
    color: 'border-blue-300 hover:border-blue-400 text-blue-800',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'alta',
    label: 'Alta',
    desc: 'Risco iminente de quebra ou peça defeituosa saindo.',
    color: 'border-amber-300 hover:border-amber-400 text-amber-800',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'critica',
    label: 'Crítica / Parada de Linha',
    desc: 'MÁQUINA PARADA. Produção totalmente interrompida!',
    color: 'border-rose-400 hover:border-rose-500 bg-rose-50/50 text-rose-900',
    badge: 'bg-rose-600 text-white font-bold',
  },
];

export const NovoChamadoModal: React.FC<NovoChamadoModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { abrirChamado } = useChamados();

  const [titulo, setTitulo] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [setor, setSetor] = useState(SETORES_SUGERIDOS[0]);
  const [categoria, setCategoria] = useState<Categoria>('Mecânica');
  const [prioridade, setPrioridade] = useState<Prioridade>('alta');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!titulo.trim()) {
      setValidationError('Por favor, informe um título ou assunto resumido.');
      return;
    }
    if (!equipamento.trim()) {
      setValidationError('Por favor, selecione ou informe o equipamento/máquina.');
      return;
    }
    if (!descricao.trim() || descricao.trim().length < 10) {
      setValidationError('Por favor, descreva detalhadamente o problema (mínimo 10 caracteres).');
      return;
    }

    setIsSubmitting(true);
    try {
      await abrirChamado({
        titulo: titulo.trim(),
        equipamento: equipamento.trim(),
        setor,
        categoria,
        prioridade,
        descricao_problema: descricao.trim(),
        operador_nome: user?.name || 'Operador',
        operador_id: user?.id || 'usr-op-01',
      });

      // Limpa form e fecha
      setTitulo('');
      setEquipamento('');
      setDescricao('');
      setPrioridade('alta');
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Erro ao registrar chamado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const aplicarExemploRapido = (ex: {
    titulo: string;
    equipamento: string;
    setor: string;
    cat: Categoria;
    prio: Prioridade;
    desc: string;
  }) => {
    setTitulo(ex.titulo);
    setEquipamento(ex.equipamento);
    setSetor(ex.setor);
    setCategoria(ex.cat);
    setPrioridade(ex.prio);
    setDescricao(ex.desc);
    setValidationError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs text-white">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Abertura de Chamado de Manutenção</h2>
              <p className="text-xs text-amber-100">
                Operador: <span className="font-semibold underline">{user?.name}</span> ({user?.cargo})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exemplos Rápidos Bar */}
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs text-amber-900">
          <span className="font-bold flex items-center gap-1 shrink-0 text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Exemplos rápidos:
          </span>
          <button
            type="button"
            onClick={() =>
              aplicarExemploRapido({
                titulo: 'Travamento no cilindro pneumático de ejeção',
                equipamento: 'Injetora Plástica Romi 220T',
                setor: 'Injeção Plástica',
                cat: 'Pneumática',
                prio: 'critica',
                desc: 'O cilindro pneumático de extração travou na posição avançada impedindo o fechamento do molde. Manômetro indica pressão normal de 6 bar mas a haste não recua.',
              })
            }
            className="px-2.5 py-1 rounded-md bg-white border border-amber-200 hover:border-amber-400 font-medium text-amber-900 shrink-0 text-[11px] shadow-2xs hover:bg-amber-100/50 transition-colors cursor-pointer"
          >
            🚨 Injetora Travada (Crítica)
          </button>
          <button
            type="button"
            onClick={() =>
              aplicarExemploRapido({
                titulo: 'Ruído estridente e vibração no rolamento',
                equipamento: 'Compressor Parafuso Atlas Copco',
                setor: 'Utilidades & Compressores',
                cat: 'Mecânica',
                prio: 'alta',
                desc: 'Durante a carga máxima, motor do compressor apresenta vibração excessiva e ruído metálico contínuo na caixa de mancais.',
              })
            }
            className="px-2.5 py-1 rounded-md bg-white border border-amber-200 hover:border-amber-400 font-medium text-amber-900 shrink-0 text-[11px] shadow-2xs hover:bg-amber-100/50 transition-colors cursor-pointer"
          >
            ⚠️ Rolamento Compressor (Alta)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-700">
          {validationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong>Atenção:</strong> {validationError}
              </div>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Título / Assunto Resumido <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Vazamento de óleo na Prensa 02 / Barulho no fuso do torno"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-amber-500 transition-all font-medium"
              required
            />
          </div>

          {/* Equipamento & Setor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Equipamento / Máquina <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                list="equipamentos-list"
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                placeholder="Ex: Torno CNC, Prensa..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-amber-500 transition-all font-medium"
                required
              />
              <datalist id="equipamentos-list">
                {EQUIPAMENTOS_SUGERIDOS.map((eq) => (
                  <option key={eq} value={eq} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Setor / Linha
              </label>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-amber-500 transition-all font-medium"
              >
                {SETORES_SUGERIDOS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Categoria e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Categoria do Problema
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Categoria)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-amber-500 transition-all font-medium"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Grau de Urgência / Prioridade <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORIDADES.map((p) => {
                  const isSelected = prioridade === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPrioridade(p.id)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? p.id === 'critica'
                            ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400 font-bold'
                            : p.id === 'alta'
                            ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300 font-bold'
                            : 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{p.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Descrição Detalhada do Problema <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Seja descritivo para orientar o mecânico
              </span>
            </div>
            <textarea
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o que você observou: ruídos, códigos de erro na tela, vazamentos, cheiro de queimado, se a máquina travou ou está operando mais devagar, etc."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-amber-500 transition-all font-medium leading-relaxed"
              required
            />
          </div>

          {/* Rodapé informativo */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <HardHat className="w-4 h-4 text-amber-600" />
              Registrado por: <strong>{user?.name}</strong>
            </span>
            <span className="text-[11px] text-slate-500">
              Data: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Enviando Chamado...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Abrir Chamado
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
