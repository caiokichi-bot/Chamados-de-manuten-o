export type UserRole = 'operador' | 'mecanico';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  cargo: string;
  avatarColor: string;
}

export type ChamadoStatus = 'aberto' | 'em_atendimento' | 'encerrado';
export type Prioridade = 'baixa' | 'media' | 'alta' | 'critica';
export type Categoria = 
  | 'Mecânica' 
  | 'Elétrica' 
  | 'Hidráulica' 
  | 'Pneumática' 
  | 'Lubrificação' 
  | 'Estrutural' 
  | 'Outro';

export interface Chamado {
  id: string;
  codigo: string; // Ex: CHM-2026-001
  titulo: string;
  equipamento: string;
  setor: string;
  categoria: Categoria;
  prioridade: Prioridade;
  descricao_problema: string;
  operador_nome: string;
  operador_id: string;
  status: ChamadoStatus;
  
  // Informações de atendimento / encerramento
  mecanico_nome?: string | null;
  mecanico_id?: string | null;
  descricao_solucao?: string | null; // O que foi feito
  causa_raiz?: string | null;
  pecas_utilizadas?: string | null;
  tempo_reparo_minutos?: number | null;
  maquina_liberada?: boolean | null;
  recomendacoes?: string | null;
  
  // Datas
  created_at: string;
  data_atendimento?: string | null;
  data_encerramento?: string | null;
  updated_at?: string;
  
  // Origem dos dados
  synced_with_supabase?: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  tableExists: boolean;
  lastChecked?: string;
  error?: string | null;
}
