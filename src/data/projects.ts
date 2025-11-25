import { apiFetch } from "./api";
import type { ProjetoDetalhes, Ambiente, Material } from "./mockData";
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
  return apiFetch("/api/marcas/") as Promise<Array<{ id: number; nome: string }>>;
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
      const existentes = await apiFetch(`/api/materiais/?ambiente=${payload.ambiente}`);
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

// --- Materiais (CRUD Completo) ---
export async function listarMateriais(page: number = 1): Promise<{
  results: any[];
  next: string | null;
  previous: string | null;
  count: number;
}> {
  const data = await apiFetch(`/api/materiais/?page=${page}`);
  return {
    results: data.results || data,
    next: data.next,
    previous: data.previous,
    count: data.count,
  };
}

export async function atualizarMaterialCRUD(
  id: number,
  payload: {
    ambiente: number;
    item: string;
    descricao?: string;
    marca?: number | null;
  }
) {
  return apiFetch(`/api/materiais/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deletarMaterial(id: number) {
  return apiFetch(`/api/materiais/${id}/`, {
    method: "DELETE",
  });
}

// 🔹 Estes estavam no conflito — foram mantidos e integrados corretamente
export async function listarMateriaisGerais(): Promise<any[]> {
  const data = await apiFetch("/api/materiais-gerais/");
  return data.results || data;
}

export async function criarMaterialGeral(payload: {
  nome: string;
  tipo: string;
  descricao?: string;
}): Promise<any> {
  return await apiFetch("/api/materiais-gerais/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// --- Itens Globais ---
export async function criarItem(payload: {
  ambiente: number;
  item: string;
  descricao: string;
  item_label?: string;
}) {
  return apiFetch("/api/item/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
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


export async function atualizarProjeto(id: number, payload: {
  nome_do_projeto?: string;
  tipo_do_projeto?: string;
  data_entrega?: string;
  descricao?: string;
  ambientes_ids?: number[];
  status?: string;
}) {
  return apiFetch(`/api/projetos/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function buscarItensProjeto(projetoId: number): Promise<any[]> {
  try {
    // Primeiro, buscar os ambientes do projeto
    const projeto = await apiFetch(`/api/projetos/${projetoId}/`);
    const ambientes = projeto.ambientes || [];
    
    // Buscar materiais de cada ambiente
    const itensComAmbientes = await Promise.all(
      ambientes.map(async (ambiente: any) => {
        try {
          const data = await apiFetch(`/api/materiais/?projeto=${projetoId}&ambiente=${ambiente.id}`);
          const materiais = Array.isArray(data.results) ? data.results : data;
          
          // Mapear os materiais para incluir informações do ambiente
          return materiais.map((material: any) => ({
            id: material.id,
            nome: material.item,
            descricao: material.descricao || '',
            quantidade: material.quantidade || 1,
            unidade: material.unidade || 'un',
            material: material.tipo_material || '',
            marca: material.marca_nome || material.marca || '',
            ambiente: ambiente.nome_do_ambiente,
            ambiente_id: ambiente.id,
            aprovado: material.aprovado !== false, // Assume aprovado se não especificado
            motivo_reprovacao: material.motivo_reprovacao || '',
            campo_reprovado: material.campos_reprovados || [] // Campos específicos reprovados
          }));
        } catch (error) {
          console.error(`Erro ao buscar materiais do ambiente ${ambiente.nome_do_ambiente}:`, error);
          return [];
        }
      })
    );

    // Juntar todos os itens em um único array
    return itensComAmbientes.flat();
  } catch (error) {
    console.error('Erro ao buscar itens do projeto:', error);
    throw error;
  }
}

// 🔹 Atualizar projeto com os itens editados (para reenvio)
export async function atualizarProjetoComItens(
  projetoId: number, 
  dadosAtualizacao: {
    nome?: string;
    tipo_projeto?: string;
    data_entrega?: string;
    descricao?: string;
    itens?: any[];
    status?: string;
  }
): Promise<any> {
  try {
    // 1. Primeiro atualizar os dados básicos do projeto
    const dadosProjeto: any = {};
    
    if (dadosAtualizacao.nome !== undefined) {
      dadosProjeto.nome_do_projeto = dadosAtualizacao.nome;
    }
    if (dadosAtualizacao.tipo_projeto !== undefined) {
      dadosProjeto.tipo_do_projeto = dadosAtualizacao.tipo_projeto;
    }
    if (dadosAtualizacao.data_entrega !== undefined) {
      dadosProjeto.data_entrega = dadosAtualizacao.data_entrega;
    }
    if (dadosAtualizacao.descricao !== undefined) {
      dadosProjeto.descricao = dadosAtualizacao.descricao;
    }
    if (dadosAtualizacao.status !== undefined) {
      dadosProjeto.status = dadosAtualizacao.status;
    }

    // Atualizar projeto se houver dados básicos para atualizar
    if (Object.keys(dadosProjeto).length > 0) {
      await apiFetch(`/api/projetos/${projetoId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosProjeto),
      });
    }

    // 2. Atualizar os itens/materiais individualmente
    if (dadosAtualizacao.itens && dadosAtualizacao.itens.length > 0) {
      await Promise.all(
        dadosAtualizacao.itens.map(async (item) => {
          try {
            const dadosMaterial: any = {
              item: item.nome,
              descricao: item.descricao,
              quantidade: item.quantidade,
              unidade: item.unidade,
              tipo_material: item.material,
              marca: item.marca_id || null, // Ajuste conforme sua API
            };

            // Se o item foi reprovado e agora está sendo reenviado, limpar o motivo
            if (item.motivo_reprovacao) {
              dadosMaterial.motivo_reprovacao = '';
              dadosMaterial.campos_reprovados = [];
              dadosMaterial.aprovado = true;
            }

            await apiFetch(`/api/materiais/${item.id}/`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dadosMaterial),
            });
          } catch (error) {
            console.error(`Erro ao atualizar material ${item.id}:`, error);
            // Não lançar erro para não interromper o processo todo
          }
        })
      );
    }

    // 3. Buscar o projeto atualizado para retornar
    return await obterProjeto(projetoId);
    
  } catch (error) {
    console.error('Erro ao atualizar projeto com itens:', error);
    throw error;
  }
}

// 🔹 Função específica para a tela de reprovados - buscar projetos com informações de reprovação
export async function listarProjetosReprovadosComDetalhes(): Promise<ProjetoDetalhes[]> {
  try {
    let allResults: any[] = [];
    let page = 1;
    let hasMore = true;

    // Buscar todos os projetos reprovados
    while (hasMore) {
      const data = await listarProjetos(page, "REPROVADO");
      allResults = [...allResults, ...data.results];
      hasMore = !!data.next;
      page++;
    }

    // Enriquecer com informações específicas de reprovação
    const projetosComReprovacao = await Promise.all(
      allResults.map(async (projeto) => {
        try {
          // Buscar itens para verificar quais campos foram reprovados
          const itens = await buscarItensProjeto(projeto.id);
          const itensReprovados = itens
            .filter(item => !item.aprovado)
            .map(item => item.nome);

          return {
            ...projeto,
            itensReprovados, // Lista de nomes de itens reprovados
            possuiItensReprovados: itensReprovados.length > 0
          };
        } catch (error) {
          console.error(`Erro ao buscar itens do projeto ${projeto.id}:`, error);
          return {
            ...projeto,
            itensReprovados: [],
            possuiItensReprovados: false
          };
        }
      })
    );

    return projetosComReprovacao;
  } catch (error) {
    console.error('Erro ao listar projetos reprovados com detalhes:', error);
    throw error;
  }
}

// 🔹 Atualizar um material específico (para edição individual)
export async function atualizarMaterial(
  materialId: number, 
  dados: {
    item?: string;
    descricao?: string;
    quantidade?: number;
    unidade?: string;
    tipo_material?: string;
    marca?: number | null;
    motivo_reprovacao?: string;
    campos_reprovados?: string[];
    aprovado?: boolean;
  }
): Promise<any> {
  return await apiFetch(`/api/materiais/${materialId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
}