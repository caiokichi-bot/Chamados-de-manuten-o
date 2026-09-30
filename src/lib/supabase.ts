import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Chamado, SupabaseConfig } from '../types/index.ts';

const STORAGE_KEY_URL = 'manutencao_supabase_url';
const STORAGE_KEY_KEY = 'manutencao_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

/**
 * Obtém a URL e a Anon Key configuradas
 * Prioriza valores em localStorage (definidos pelo usuário na UI) ou env vars (VITE_SUPABASE_URL)
 */
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  return {
    url: (localUrl || envUrl || '').trim(),
    anonKey: (localKey || envKey || '').trim(),
  };
}

/**
 * Salva as credenciais no localStorage para persistência imediata
 */
export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
  cachedClient = null; // Invalida o cache
}

/**
 * Limpa as credenciais salvas
 */
export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
  cachedClient = null;
}

/**
 * Retorna uma instância do SupabaseClient ou null se não configurado
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey) {
    return null;
  }

  // Retorna client em cache se as credenciais não mudaram
  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Erro ao inicializar cliente Supabase:', error);
    return null;
  }
}

/**
 * Testa a conexão com o Supabase e verifica se a tabela chamados já foi criada
 */
export async function testSupabaseConnection(): Promise<SupabaseConfig> {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey) {
    return {
      url,
      anonKey,
      isConnected: false,
      tableExists: false,
      error: 'URL ou Chave Anônima não configuradas',
      lastChecked: new Date().toISOString(),
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      url,
      anonKey,
      isConnected: false,
      tableExists: false,
      error: 'Formato inválido de URL ou Chave do Supabase',
      lastChecked: new Date().toISOString(),
    };
  }

  try {
    // Tenta fazer um SELECT simples com limit 1 na tabela 'chamados'
    const { data, error } = await client
      .from('chamados')
      .select('id')
      .limit(1);

    if (error) {
      // Se a tabela não existir, o erro do Postgres costuma ter código 42P01 ("relation does not exist")
      if (error.code === '42P01' || error.message.includes('relation "public.chamados" does not exist') || error.message.includes('chamados')) {
        return {
          url,
          anonKey,
          isConnected: true, // Acesso ao projeto funcionou com sucesso!
          tableExists: false, // Apenas a tabela ainda não foi criada
          error: 'Conectado ao Supabase com sucesso, mas a tabela "chamados" ainda não existe. Execute o script SQL no SQL Editor.',
          lastChecked: new Date().toISOString(),
        };
      }

      return {
        url,
        anonKey,
        isConnected: false,
        tableExists: false,
        error: error.message || 'Erro ao conectar ao Supabase',
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      url,
      anonKey,
      isConnected: true,
      tableExists: true,
      error: null,
      lastChecked: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      url,
      anonKey,
      isConnected: false,
      tableExists: false,
      error: err.message || 'Falha de rede ao conectar com Supabase',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Busca todos os chamados salvos no Supabase
 */
export async function fetchChamadosFromSupabase(): Promise<Chamado[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('chamados')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Erro ao buscar chamados do Supabase:', error);
    throw error;
  }

  return (data || []).map((item) => ({
    ...item,
    synced_with_supabase: true,
  }));
}

/**
 * Salva ou atualiza um chamado no Supabase
 */
export async function upsertChamadoToSupabase(chamado: Chamado): Promise<Chamado | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const payload = {
    id: chamado.id,
    codigo: chamado.codigo,
    titulo: chamado.titulo,
    equipamento: chamado.equipamento,
    setor: chamado.setor,
    categoria: chamado.categoria,
    prioridade: chamado.prioridade,
    descricao_problema: chamado.descricao_problema,
    operador_nome: chamado.operador_nome,
    operador_id: chamado.operador_id,
    status: chamado.status,
    mecanico_nome: chamado.mecanico_nome ?? null,
    mecanico_id: chamado.mecanico_id ?? null,
    descricao_solucao: chamado.descricao_solucao ?? null,
    causa_raiz: chamado.causa_raiz ?? null,
    pecas_utilizadas: chamado.pecas_utilizadas ?? null,
    tempo_reparo_minutos: chamado.tempo_reparo_minutos ?? null,
    maquina_liberada: chamado.maquina_liberada ?? true,
    recomendacoes: chamado.recomendacoes ?? null,
    created_at: chamado.created_at,
    data_atendimento: chamado.data_atendimento ?? null,
    data_encerramento: chamado.data_encerramento ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from('chamados')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar no Supabase:', error);
    throw error;
  }

  return {
    ...data,
    synced_with_supabase: true,
  };
}
