import { apiFetch } from "./api";
import type { ProjetoDetalhes, Ambiente, Material } from "./mockData";
import type { ModeloDetalhes, Secao, ItemModelo } from "./mockData";

// map status BACKEND -> FRONT
function mapStatus(s: string): "aprovado" | "reprovado" | "pendente" {
  const x = s.toLowerCase();
  if (x.includes("aprovado")) return "aprovado";
  if (x.includes("reprovado")) return "reprovado";
  return "pendente";
}

function mapAmbiente(a: any): Ambiente {
  return {
    id: a.id,
    nome: a.nome_do_ambiente,
    materiais: a.materials || [],
    categoria: a.categoria || "",
    tipo: a.tipo || null,
    guia_de_cores: a.guia_de_cores || "",
  };
}


function mapProjeto(p: any): ProjetoDetalhes {
  return {
    id: p.id,
    nome: p.nome_do_projeto,
    tipoProjeto: p.tipo_do_projeto,
    dataCriacao: new Date(p.data_criacao).toLocaleDateString("pt-BR"),
    responsavel: p.responsavel_nome || "",
    status: mapStatus(p.status),
    ambientes: (p.ambientes || []).map(mapAmbiente),
    descricao_marcas: p.materiais_com_marcas || [],
    observacoes_gerais: p.observacoes_gerais || "",
  };
}

// 🔹 agora com paginação e filtro de status
export async function listarProjetos(
  page: number = 1,
  status?: "APROVADO" | "REPROVADO" | "PENDENTE"
) {
  const query = new URLSearchParams();
  query.set("page", page.toString());
  if (status) query.set("status", status);

  const data = await apiFetch(`/api/projetos/?${query.toString()}`);

  // ✅ Garante compatibilidade com backend que retorna lista direta
  const lista = Array.isArray(data) ? data : data.results || [];

  return {
    results: lista.map(mapProjeto),
    next: data.next || null,
    previous: data.previous || null,
    count: data.count || lista.length,
  };
}

export async function obterProjeto(id: number): Promise<ProjetoDetalhes> {
  // Busca os dados básicos do projeto
  const projeto = await apiFetch(`/api/projetos/${id}/`);

  // Para cada ambiente do projeto, busca seus materiais específicos
  const ambientesComMateriais = await Promise.all(
    (projeto.ambientes || []).map(async (amb: any) => {
      try {
        const data = await apiFetch(`/api/materiais/?projeto=${id}&ambiente=${amb.id}`);
        // Garante compatibilidade com paginação do DRF
        const materials = Array.isArray(data.results) ? data.results : data;
        return { ...amb, materials };
      } catch (err) {
        console.error(`Erro ao buscar materiais do ambiente ${amb.nome_do_ambiente}:`, err);
        return { ...amb, materials: [] };
      }
    })
  );

  // Retorna o projeto completo com materiais
  return {
    ...projeto,
    ambientes: ambientesComMateriais,
    descricao_marcas: projeto.materiais_com_marcas || [],
    observacoes_gerais: projeto.observacoes_gerais || "",
  };
}

export async function statsDashboard() {
  return apiFetch("/api/stats/dashboard/") as Promise<{
    total_projetos: number;
    projetos_aprovados: number;
    projetos_reprovados: number;
    projetos_pendentes: number;
  }>;
}

// 🔹 novo: estatísticas mensais
export async function statsMensais() {
  return apiFetch("/api/stats/mensais/") as Promise<
    Array<{
      mes: string; // exemplo: "2025-10"
      APROVADO: number;
      REPROVADO: number;
      PENDENTE: number;
    }>
  >;
}

export async function criarProjeto(payload: {
  nome_do_projeto: string;
  tipo_do_projeto: string;
  data_entrega: string;
  descricao?: string;
  ambientes_ids?: number[];
}) {
  return apiFetch("/api/projetos/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function criarAmbiente(dados: {
  projeto: number;
  nome_do_ambiente: string;
  tipo?: number | null;
  categoria?: string;
  guia_de_cores?: string;
}) {
  return apiFetch("/api/ambientes/", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}
export async function listarAmbientes() {
  const data = await apiFetch("/api/ambientes/?disponiveis=1");

  const lista = Array.isArray(data) ? data : data.results || [];

  return lista.map((a: any) => ({
    id: a.id,
    nome: a.nome_do_ambiente, // 👈 converte aqui para nome simples
    categoria: a.categoria,
    tipo: a.tipo || null,
    guia_de_cores: a.guia_de_cores || "",
  }));
}

// --- Tipos de Ambiente ---
export async function listarTiposAmbiente() {
  return apiFetch("/api/tipos-ambiente/") as Promise<
    Array<{ id: number; nome: string }>
  >;
}
export async function criarTipoAmbiente(nome: string) {
  return apiFetch("/api/tipos-ambiente/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome }),
  });
}

// --- Marcas ---
export async function listarMarcas() {
  return apiFetch("/api/marcas/") as Promise<
    Array<{ id: number; nome: string }>
  >;
}
export async function criarMarca(nome: string) {
  return apiFetch("/api/marcas/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome }),
  });
}

// --- Materiais ---
export async function criarMaterial(payload: {
  ambiente: number;
  item: string;
  descricao?: string;
  marca?: number | null;
}) {
  try {
    return await apiFetch("/api/materiais/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    if (err.message?.includes("ambiente, item")) {
      const existentes = await apiFetch(
        `/api/materiais/?ambiente=${payload.ambiente}`
      );
      const jaExiste = existentes.find((m: any) => m.item === payload.item);

      if (jaExiste) {
        return await apiFetch(`/api/materiais/${jaExiste.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            descricao: payload.descricao,
            marca: payload.marca,
          }),
        });
      }
    }
    throw err;
  }
}

// --- Usuários ---
export async function criarUsuario(payload: {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  cargo: "atendente" | "gerente" | "superadmin";
}) {
  return apiFetch("/api/usuarios-admin/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function mapSecao(s: any): Secao {
  return {
    id: s.id,
    nome: s.nome,
    itens: s.itens || [],
    categoria: s.categoria || "",
    tipo: s.tipo || null,
    guia_de_cores: s.guia_de_cores || "",
  };
}

function mapModelo(m: any): ModeloDetalhes {
  return {
    id: m.id,
    nome: m.nome,
    tipoModelo: m.tipo_modelo,
    dataCriacao: new Date(m.data_criacao || m.created_at).toLocaleDateString("pt-BR"),
    responsavel: m.responsavel || '',
    descricao: m.descricao || '',
    observacoes_gerais: m.observacoes_gerais || '',
    projeto_origem_id: m.projeto_id,
    ambientes: m.ambientes || [],
  };
}

export async function listarModelos(): Promise<ModeloDetalhes[]> {
  const data = await apiFetch("/api/modelos-documento/");
  return (data.results || data).map(mapModelo);
}

export async function obterModelo(id: number): Promise<ModeloDetalhes> {
  try {
    console.log('🔍 Buscando modelo com ID:', id);
    
    const data = await apiFetch(`/api/modelos-documento/${id}/`);
    console.log('✅ Modelo encontrado:', data);
    
    return mapModelo(data);
  } catch (error) {
    console.error('❌ Erro em obterModelo:', error);
    throw error;
  }
}

export async function criarModelo(projeto: ProjetoDetalhes): Promise<ModeloDetalhes> {
  const payload = {
    projeto: projeto.id,
    nome: `Modelo - ${projeto.nome}`,
    descricao: `Modelo criado a partir do projeto ${projeto.nome}`
  };

  const data = await apiFetch("/api/modelos-documento/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapModelo(data);
}

export async function excluirModelo(id: number): Promise<void> {
  await apiFetch(`/api/modelos-documento/${id}/`, {
    method: "DELETE",
  });
}