import { apiFetch } from "./api";
import type { ProjetoDetalhes, Ambiente, Material } from "./mockData";
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

export async function listarProjetos(
  page: number = 1,
  status?: "APROVADO" | "REPROVADO" | "PENDENTE"
): Promise<{
  results: ProjetoDetalhes[];
  next: string | null;
  previous: string | null;
  count: number;
}> {
  const query = new URLSearchParams();
  query.set("page", page.toString());
  if (status) query.set("status", status);

  const data = await apiFetch(`/api/projetos/?${query.toString()}`);

  return {
    results: (data.results || []).map(mapProjeto),
    next: data.next,
    previous: data.previous,
    count: data.count,
  };
}

export async function obterProjeto(id: number): Promise<ProjetoDetalhes> {
  const projeto = await apiFetch(`/api/projetos/${id}/`);

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

export async function statsMensais() {
  return apiFetch("/api/stats/mensais/") as Promise<
    Array<{
      mes: string; 
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
  nome_do_ambiente: string;
  categoria?: string;
}) {
  return apiFetch("/api/ambientes/", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function listarAmbientes() {
  let url = "/api/ambientes/?disponiveis=1";
  let todos: any[] = [];

  while (url) {
    const data = await apiFetch(url);
    todos = todos.concat(data.results || []);
    url = data.next ? data.next.replace(/^https?:\/\/[^/]+/, "") : null;
  }

  return todos.map((a: any) => ({
    id: a.id,
    nome: a.nome_do_ambiente,
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

// Listar usuários com paginação
export async function listarUsuarios(page: number = 1) {
  return apiFetch(`/api/usuarios-admin/?page=${page}`, {
    method: "GET",
  });
}

// Obter usuário por ID
export async function obterUsuario(id: number) {
  return apiFetch(`/api/usuarios-admin/${id}/`, {
    method: "GET",
  });
}

// Atualizar usuário
export async function atualizarUsuario(
  id: number,
  payload: Partial<{
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
    cargo: "atendente" | "gerente" | "superadmin";
  }>
) {
  return apiFetch(`/api/usuarios-admin/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Deletar usuário
export async function deletarUsuario(id: number) {
  return apiFetch(`/api/usuarios-admin/${id}/`, {
    method: "DELETE",
  });
}