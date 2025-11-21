const BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

type Tokens = { access: string; refresh: string };
const ACCESS = "accessToken";
const REFRESH = "refreshToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS);
}
function setTokens(t: Tokens) {
  localStorage.setItem(ACCESS, t.access);
  localStorage.setItem(REFRESH, t.refresh);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

export async function login(email: string, password: string) {
  const r = await fetch(`${BASE}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error("Credenciais inválidas");
  const data = (await r.json()) as Tokens;
  setTokens(data);
  return data;
}

async function refresh() {
  const refresh = localStorage.getItem(REFRESH);
  if (!refresh) throw new Error("Sem refresh token");
  const r = await fetch(`${BASE}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!r.ok) throw new Error("Falha ao renovar token");
  const data = await r.json();
  localStorage.setItem(ACCESS, data.access);
  return data.access as string;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const method = (init.method || "GET").toUpperCase();
  if ((method === "POST" || method === "PATCH" || method === "PUT") && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  let res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401 && token) {
    try {
      const newAccess = await refresh();
      headers.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(`${BASE}${path}`, { ...init, headers });
    } catch {
      clearTokens();
      throw new Error("Sessão expirada. Faça login novamente.");
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/* ==========================================================
   🔹 PDF / DOWNLOAD
   ========================================================== */

/**
 * Gera PDF de um projeto específico
 */
export async function gerarPDFProjeto(projetoId: number): Promise<Blob> {
  try {
    const token = getAccessToken();
    const headers: HeadersInit = {
      'Accept': 'application/pdf',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE}/api/projetos/${projetoId}/gerar-pdf/`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Tenta ler como texto para evitar o HTML gigante
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      try {
        const errorText = await response.text();
        // Filtra HTML gigante
        if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
          errorMessage += ' - Endpoint não encontrado';
        } else {
          errorMessage += ` - ${errorText.substring(0, 100)}...`;
        }
      } catch {
        // Se não conseguir ler como texto, usa a mensagem básica
      }
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    
    // Verifica se é um PDF válido
    if (blob.type !== 'application/pdf') {
      throw new Error('Resposta não é um PDF válido');
    }

    return blob;

  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    throw error;
  }
}

/**
 * Função completa para download de PDF com nome personalizado
 */
export async function downloadPDFProjeto(projetoId: number, projetoNome: string): Promise<void> {
  const blob = await gerarPDFProjeto(projetoId);
  
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `projeto_${projetoNome.replace(/\s+/g, '_')}_${projetoId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/* ==========================================================
   🔹 GET DETALHES DE PROJETO (com materiais filtrados por projeto)
   ========================================================== */
export async function getProjetoDetalhes(id: number) {
  const projeto = await apiFetch(`/api/projetos/${id}/`);

  // 🔹 Carrega os materiais de cada ambiente, filtrando por projeto
  const ambientes = await Promise.all(
    (projeto.ambientes || []).map(async (a: any) => {
      const data = await apiFetch(`/api/materiais/?projeto=${id}&ambiente=${a.id}`);
      const materials = Array.isArray(data) ? data : data.results || [];
      return { ...a, materials };
    })
  );

  return { ...projeto, ambientes };
}

/* ==========================================================
   🔹 MATERIAIS
   ========================================================== */
export async function aprovarMaterial(materialId: number) {
  return apiFetch(`/api/materiais/${materialId}/aprovar/`, {
    method: "POST",
  });
}

export async function reprovarMaterial(materialId: number, motivo: string) {
  return apiFetch(`/api/materiais/${materialId}/reprovar/`, {
    method: "POST",
    body: JSON.stringify({ motivo }),
  });
}

/* ==========================================================
   🔹 DASHBOARD / ESTATÍSTICAS
   ========================================================== */
export async function getDashboardStats() {
  return apiFetch("/api/stats/dashboard/");
}

export async function getStatsMensais() {
  return apiFetch("/api/stats/mensais/");
}

/* ==========================================================
   🔹 MODELOS
   ========================================================== */
export async function listarModelos() {
  return apiFetch("/api/modelos/");
}

export async function obterModelo(id: number) {
  return apiFetch(`/api/modelos/${id}/`);
}

export async function criarModelo(payload: {
  nome: string;
  tipo_modelo: string;
  projeto_origem_id: number;
  descricao?: string;
  observacoes_gerais?: string;
}) {
  return apiFetch("/api/modelos/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function excluirModelo(id: number) {
  return apiFetch(`/api/modelos/${id}/`, {
    method: "DELETE",
  });
}

/* ==========================================================
   🔹 MARCAS DESCRIÇÃO
   ========================================================== */
// api.ts - APENAS ESTAS PARTES MUDAM:

/* ==========================================================
   🔹 MARCAS DESCRIÇÃO
   ========================================================== */
export interface MaterialMarca {
  id: number;
  material: string;
  marcas: string; // ← ESTA PERMANECE string (para o GET)
}

// MUDAR ESTA INTERFACE:
// api.ts - REVERTA a interface MarcaFormData:

export interface MarcaFormData {
  material: string;
  marcas: string; // ← Mantenha como string (não array)
}

export interface MarcasResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MaterialMarca[];
}

// GET para listar materiais e marcas existentes - NÃO MUDA
export async function getMarcasDescricao(): Promise<MarcasResponse> {
  return apiFetch("/api/marcas-descricao/");
}

// MUDAR ESTA FUNÇÃO:
// POST para salvar nova marca
// api.ts - Apenas esta função muda:

export async function salvarMarcaDescricao(data: MarcaFormData): Promise<any> {
  // Garante que marcas seja sempre um array
  const marcasArray = Array.isArray(data.marcas) 
    ? data.marcas 
    : [data.marcas.trim()].filter(marca => marca !== '');

  const payload = {
    material: data.material.trim(),
    marcas: marcasArray
  };

  console.log('Enviando para API:', payload); // Para debug

  return apiFetch("/api/marcas-descricao/salvar/", {
    method: "POST",
    body: JSON.stringify(payload), 
  });
}
/* ==========================================================
   🔹 AMBIENTES
   ========================================================== */

// Interfaces para Ambientes
export interface Ambiente {
  id: number;
  nome_do_ambiente: string;
  categoria: string;
  materials?: any[];
  guia_de_cores?: string;
}

export interface AmbienteFormData {
  nome_do_ambiente: string;
  categoria: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// GET para listar TODOS os ambientes (com paginação automática)
export async function listarAmbientes(): Promise<Ambiente[]> {
  try {
    let todosAmbientes: Ambiente[] = [];
    let nextUrl: string | null = "/api/ambientes/";

    // Loop para buscar todas as páginas
    while (nextUrl) {
      const response: any = await apiFetch(nextUrl);
      
      let ambientesDaPagina: Ambiente[] = [];
      let nextPageUrl: string | null = null;
      
      if (Array.isArray(response)) {
        ambientesDaPagina = response;
        nextPageUrl = null;
      } else if (response && typeof response === 'object' && Array.isArray(response.results)) {
        ambientesDaPagina = response.results;
        nextPageUrl = response.next ? response.next.replace(/^.*\/\/[^/]+/, '') : null;
      } else if (response && typeof response === 'object' && response.data) {
        ambientesDaPagina = response.data;
        nextPageUrl = response.next ? response.next.replace(/^.*\/\/[^/]+/, '') : null;
      } else {
        console.warn("⚠️ Formato de resposta inesperado:", response);
        break;
      }
      
      todosAmbientes = [...todosAmbientes, ...ambientesDaPagina];
      nextUrl = nextPageUrl;
      
      // Limite de segurança
      if (todosAmbientes.length >= 1000) {
        console.warn("⚠️ Limite de 1000 ambientes atingido");
        break;
      }
    }

    console.log("✅ Total de ambientes carregados:", todosAmbientes.length);
    return todosAmbientes;
  } catch (error) {
    console.error("❌ Erro ao listar ambientes:", error);
    return [];
  }
}

// POST para criar ambiente
export async function criarAmbiente(data: AmbienteFormData): Promise<Ambiente> {
  try {
    const token = getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('📤 Enviando POST para /api/ambientes/', data);
    
    const response = await fetch(`${BASE}/api/ambientes/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    console.log('📥 Resposta recebida:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const result: Ambiente = await response.json();
    console.log('✅ Ambiente criado com sucesso:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro na função criarAmbiente:', error);
    throw error;
  }
}

// GET para buscar categorias disponíveis
export async function getCategoriasAmbiente(): Promise<string[]> {
  return [ "COMUM", "PRIVATIVA"];
}

// GET para buscar um ambiente específico por ID
export async function getAmbientePorId(id: number): Promise<Ambiente> {
  return apiFetch(`/api/ambientes/${id}/`);
}

// PUT para atualizar um ambiente
export async function atualizarAmbiente(id: number, data: AmbienteFormData): Promise<Ambiente> {
  return apiFetch(`/api/ambientes/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE para excluir um ambiente
export async function excluirAmbiente(id: number): Promise<void> {
  return apiFetch(`/api/ambientes/${id}/`, {
    method: 'DELETE',
  });
}