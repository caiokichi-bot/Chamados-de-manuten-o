import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Chamado, SupabaseConfig, Prioridade, Categoria } from '../types/index.ts';
import {
  testSupabaseConnection,
  fetchChamadosFromSupabase,
  upsertChamadoToSupabase,
  getSupabaseCredentials,
  saveSupabaseCredentials,
} from '../lib/supabase.ts';

interface AbrirChamadoInput {
  titulo: string;
  equipamento: string;
  setor: string;
  categoria: Categoria;
  prioridade: Prioridade;
  descricao_problema: string;
  operador_nome: string;
  operador_id: string;
}

interface EncerrarChamadoInput {
  chamadoId: string;
  mecanico_nome: string;
  mecanico_id: string;
  descricao_solucao: string;
  causa_raiz: string;
  pecas_utilizadas: string;
  tempo_reparo_minutos: number;
  maquina_liberada: boolean;
  recomendacoes: string;
}

interface ChamadosContextType {
  chamados: Chamado[];
  isLoading: boolean;
  supabaseConfig: SupabaseConfig;
  isSyncing: boolean;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
  clearNotification: () => void;
  abrirChamado: (input: AbrirChamadoInput) => Promise<Chamado>;
  iniciarAtendimento: (chamadoId: string, mecanico_nome: string, mecanico_id: string) => Promise<void>;
  encerrarChamado: (input: EncerrarChamadoInput) => Promise<void>;
  recarregarDados: () => Promise<void>;
  sincronizarComSupabase: () => Promise<number>;
  salvarConfiguracaoSupabase: (url: string, key: string) => Promise<SupabaseConfig>;
}

const STORAGE_CHAMADOS = 'manutencao_chamados_cache';

const INITIAL_DEMO_CHAMADOS: Chamado[] = [
  {
    id: 'chm-demo-1',
    codigo: 'CHM-2026-001',
    titulo: 'Vazamento de óleo no cilindro da Prensa 02',
    equipamento: 'Prensa Hidráulica 150T - StampLine',
    setor: 'Estamparia Pesada',
    categoria: 'Hidráulica',
    prioridade: 'alta',
    descricao_problema: 'Identificado gotejamento constante de óleo hidráulico ISO VG 68 no retentor principal do pistão durante o ciclo de descida. Risco de perda de pressão e contaminação do piso.',
    operador_nome: 'Carlos Oliveira',
    operador_id: 'usr-op-01',
    status: 'aberto',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    synced_with_supabase: false,
  },
  {
    id: 'chm-demo-2',
    codigo: 'CHM-2026-002',
    titulo: 'Aquecimento anormal no fuso do Torno CNC Haas',
    equipamento: 'Torno CNC Haas ST-20',
    setor: 'Usinagem de Precisão',
    categoria: 'Mecânica',
    prioridade: 'critica',
    descricao_problema: 'Fuso principal atingiu 68°C em regime de corte contínuo com forte ruído agudo metálico. O alarme 142 de sobrecarga térmica disparou duas vezes na operação da manhã.',
    operador_nome: 'Carlos Oliveira',
    operador_id: 'usr-op-01',
    status: 'em_atendimento',
    mecanico_nome: 'Roberto Silveira',
    mecanico_id: 'usr-mec-01',
    data_atendimento: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    synced_with_supabase: false,
  },
  {
    id: 'chm-demo-3',
    codigo: 'CHM-2026-003',
    titulo: 'Desalinhamento da correia transportadora',
    equipamento: 'Esteira de Saída - Linha 04',
    setor: 'Linha de Montagem',
    categoria: 'Mecânica',
    prioridade: 'media',
    descricao_problema: 'A lona da esteira está raspando na lateral da guia metálica, gerando resíduo de borracha e vibração perceptível no motor redutor.',
    operador_nome: 'Carlos Oliveira',
    operador_id: 'usr-op-01',
    status: 'encerrado',
    mecanico_nome: 'Roberto Silveira',
    mecanico_id: 'usr-mec-01',
    descricao_solucao: 'Efetuado alinhamento dos roletes tensores traseiros, reaperto dos mancais com torquímetro (45 Nm) e ajuste da tensão da correia conforme manual do fabricante. Realizado teste em vazio por 20 minutos com sucesso.',
    causa_raiz: 'Folga mecânica nos parafusos de fixação do rolete de esticamento devido à vibração acumulada na operação.',
    pecas_utilizadas: '1x Conjunto de parafusos M10x40 zincados com arruela de pressão, 200ml Lubrificante para correntes.',
    tempo_reparo_minutos: 45,
    maquina_liberada: true,
    recomendacoes: 'Inspecionar visualmente o alinhamento da correia no início de cada turno de produção.',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    data_atendimento: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    data_encerramento: new Date(Date.now() - 21 * 3600 * 1000).toISOString(),
    synced_with_supabase: false,
  },
];

const ChamadosContext = createContext<ChamadosContextType | undefined>(undefined);

export const ChamadosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chamados, setChamados] = useState<Chamado[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAMADOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_DEMO_CHAMADOS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const creds = getSupabaseCredentials();
    return {
      url: creds.url,
      anonKey: creds.anonKey,
      isConnected: false,
      tableExists: false,
    };
  });

  // Salva no localStorage sempre que houver alteração
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAMADOS, JSON.stringify(chamados));
    } catch (e) {
      console.warn('Falha ao salvar chamados no localStorage', e);
    }
  }, [chamados]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  }, []);

  const clearNotification = () => setNotification(null);

  // Testa conexão com Supabase ao iniciar
  const verificarSupabase = useCallback(async () => {
    const status = await testSupabaseConnection();
    setSupabaseConfig(status);

    if (status.isConnected && status.tableExists) {
      try {
        setIsLoading(true);
        const remotos = await fetchChamadosFromSupabase();
        if (remotos && remotos.length > 0) {
          // Mescla itens remotos com os locais
          setChamados((locais) => {
            const map = new Map<string, Chamado>();
            // Adiciona locais
            locais.forEach((c) => map.set(c.id, c));
            // Sobrescreve com remotos
            remotos.forEach((c) => map.set(c.id, c));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
        }
      } catch (err: any) {
        console.warn('Não foi possível sincronizar chamados remotos na inicialização:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    verificarSupabase();
  }, [verificarSupabase]);

  // Salva credenciais do Supabase e retesta
  const salvarConfiguracaoSupabase = async (url: string, key: string): Promise<SupabaseConfig> => {
    saveSupabaseCredentials(url, key);
    const status = await testSupabaseConnection();
    setSupabaseConfig(status);

    if (status.isConnected && status.tableExists) {
      showNotification('Conectado ao Supabase com sucesso! Tabela "chamados" encontrada.', 'success');
      // Sincroniza dados
      await recarregarDados();
    } else if (status.isConnected && !status.tableExists) {
      showNotification('Conectado ao Supabase! Apenas execute o script SQL para criar a tabela.', 'info');
    } else {
      showNotification(status.error || 'Falha ao conectar com o Supabase.', 'error');
    }

    return status;
  };

  // Recarregar dados remotos do Supabase
  const recarregarDados = async () => {
    const status = await testSupabaseConnection();
    setSupabaseConfig(status);

    if (!status.isConnected || !status.tableExists) {
      return;
    }

    try {
      setIsLoading(true);
      const remotos = await fetchChamadosFromSupabase();
      if (remotos) {
        setChamados(remotos);
        showNotification(`${remotos.length} chamados sincronizados do Supabase.`, 'success');
      }
    } catch (err: any) {
      showNotification(`Erro ao carregar do Supabase: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar todos os chamados locais para o Supabase
  const sincronizarComSupabase = async (): Promise<number> => {
    const status = await testSupabaseConnection();
    setSupabaseConfig(status);

    if (!status.isConnected || !status.tableExists) {
      showNotification('O Supabase precisa estar conectado e a tabela "chamados" criada para sincronizar.', 'error');
      return 0;
    }

    setIsSyncing(true);
    let count = 0;
    try {
      for (const item of chamados) {
        await upsertChamadoToSupabase(item);
        count++;
      }
      // Marca todos como sincronizados
      setChamados((prev) =>
        prev.map((c) => ({ ...c, synced_with_supabase: true }))
      );
      showNotification(`${count} chamados sincronizados com o Supabase com sucesso!`, 'success');
    } catch (err: any) {
      showNotification(`Falha ao sincronizar: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
    return count;
  };

  // Operador: Abrir chamado
  const abrirChamado = async (input: AbrirChamadoInput): Promise<Chamado> => {
    const num = (chamados.length + 1).toString().padStart(3, '0');
    const novoChamado: Chamado = {
      id: `chm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      codigo: `CHM-2026-${num}`,
      titulo: input.titulo,
      equipamento: input.equipamento,
      setor: input.setor,
      categoria: input.categoria,
      prioridade: input.prioridade,
      descricao_problema: input.descricao_problema,
      operador_nome: input.operador_nome,
      operador_id: input.operador_id,
      status: 'aberto',
      created_at: new Date().toISOString(),
      synced_with_supabase: false,
    };

    // Atualiza estado local imediatamente (otimista)
    setChamados((prev) => [novoChamado, ...prev]);

    // Se o Supabase estiver pronto, envia para a nuvem
    if (supabaseConfig.isConnected && supabaseConfig.tableExists) {
      try {
        const salvo = await upsertChamadoToSupabase(novoChamado);
        if (salvo) {
          setChamados((prev) =>
            prev.map((c) => (c.id === novoChamado.id ? { ...salvo, synced_with_supabase: true } : c))
          );
          showNotification(`Chamado ${novoChamado.codigo} aberto e salvo no Supabase!`, 'success');
          return salvo;
        }
      } catch (e: any) {
        console.warn('Erro ao salvar no Supabase, mantido em cache local:', e);
        showNotification(`Chamado ${novoChamado.codigo} aberto localmente (erro ao enviar ao Supabase).`, 'info');
      }
    } else {
      showNotification(`Chamado ${novoChamado.codigo} aberto com sucesso!`, 'success');
    }

    return novoChamado;
  };

  // Mecânico: Iniciar atendimento
  const iniciarAtendimento = async (chamadoId: string, mecanico_nome: string, mecanico_id: string) => {
    const alvo = chamados.find((c) => c.id === chamadoId);
    if (!alvo) return;

    const atualizado: Chamado = {
      ...alvo,
      status: 'em_atendimento',
      mecanico_nome,
      mecanico_id,
      data_atendimento: new Date().toISOString(),
    };

    setChamados((prev) => prev.map((c) => (c.id === chamadoId ? atualizado : c)));

    if (supabaseConfig.isConnected && supabaseConfig.tableExists) {
      try {
        await upsertChamadoToSupabase(atualizado);
      } catch (e) {
        console.warn('Erro ao atualizar atendimento no Supabase:', e);
      }
    }
    showNotification(`Atendimento iniciado por ${mecanico_nome}!`, 'info');
  };

  // Mecânico: Encerrar chamado com relatório completo
  const encerrarChamado = async (input: EncerrarChamadoInput) => {
    const alvo = chamados.find((c) => c.id === input.chamadoId);
    if (!alvo) return;

    const atualizado: Chamado = {
      ...alvo,
      status: 'encerrado',
      mecanico_nome: input.mecanico_nome,
      mecanico_id: input.mecanico_id,
      descricao_solucao: input.descricao_solucao,
      causa_raiz: input.causa_raiz,
      pecas_utilizadas: input.pecas_utilizadas,
      tempo_reparo_minutos: input.tempo_reparo_minutos,
      maquina_liberada: input.maquina_liberada,
      recomendacoes: input.recomendacoes,
      data_encerramento: new Date().toISOString(),
    };

    setChamados((prev) => prev.map((c) => (c.id === input.chamadoId ? atualizado : c)));

    if (supabaseConfig.isConnected && supabaseConfig.tableExists) {
      try {
        await upsertChamadoToSupabase(atualizado);
        showNotification(`Chamado ${atualizado.codigo} encerrado e sincronizado no Supabase!`, 'success');
      } catch (e) {
        console.warn('Erro ao encerrar chamado no Supabase:', e);
        showNotification(`Chamado ${atualizado.codigo} encerrado localmente (erro ao sincronizar no Supabase).`, 'info');
      }
    } else {
      showNotification(`Chamado ${atualizado.codigo} encerrado com sucesso!`, 'success');
    }
  };

  return (
    <ChamadosContext.Provider
      value={{
        chamados,
        isLoading,
        supabaseConfig,
        isSyncing,
        notification,
        clearNotification,
        abrirChamado,
        iniciarAtendimento,
        encerrarChamado,
        recarregarDados,
        sincronizarComSupabase,
        salvarConfiguracaoSupabase,
      }}
    >
      {children}
    </ChamadosContext.Provider>
  );
};

export function useChamados() {
  const context = useContext(ChamadosContext);
  if (!context) {
    throw new Error('useChamados deve ser usado dentro de um ChamadosProvider');
  }
  return context;
}
