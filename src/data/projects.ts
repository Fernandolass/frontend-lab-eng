import { apiFetch } from "./api";
import type { ProjetoDetalhes, Ambiente, Material } from "./mockData"; // reaproveita suas interfaces

// map status BACKEND -> FRONT
function mapStatus(s: string): "aprovado" | "reprovado" | "pendente" {
  const x = s.toLowerCase();
  if (x.includes("aprovado")) return "aprovado";
  if (x.includes("reprovado")) return "reprovado";
  return "pendente";
}

function mapAmbiente(a: any): Ambiente {
  // seu backend ainda não tem "materiais" por ambiente (são campos textuais).
  // Vamos mapear só nome/id; o front pode continuar exibindo os textos desses campos.
  return {
    id: a.id,
    nome: a.nome_do_ambiente,
    materiais: [] as Material[], // placeholder; você pode montar com base nos campos (piso, parede, etc.) se quiser
  };
}

function mapProjeto(p: any): ProjetoDetalhes {
  return {
    id: p.id,
    nome: p.nome_do_projeto,
    tipoProjeto: p.tipo_do_projeto,
    dataCriacao: new Date(p.data_criacao).toLocaleDateString("pt-BR"),
    responsavel: p.responsavel_nome || "", // você já expõe responsavel_nome no serializer
    status: mapStatus(p.status),
    ambientes: (p.ambientes || []).map(mapAmbiente),
  };
}

export async function listarProjetos(): Promise<ProjetoDetalhes[]> {
  const data = await apiFetch("/api/projetos/");
  return (data as any[]).map(mapProjeto);
}

export async function obterProjeto(id: number): Promise<ProjetoDetalhes> {
  const data = await apiFetch(`/api/projetos/${id}/`);
  return mapProjeto(data);
}

export async function statsDashboard() {
  return apiFetch("/api/dashboard-stats/") as Promise<{
    total_projetos: number;
    projetos_aprovados: number;
    projetos_reprovados: number;
    projetos_pendentes: number;
  }>;
}

export async function criarProjeto(payload: {
  nome_do_projeto: string;
  tipo_do_projeto: string;
  data_entrega: string;
  descricao?: string;
}) {
  return apiFetch("/api/projetos/", {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // 🔥 OBRIGATÓRIO
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
  const data = await apiFetch("/api/ambientes/");
  return (data as any[]).map((a) => ({
    id: a.id,
    nome: a.nome_do_ambiente, // <-- corrige aqui
    categoria: a.categoria,
    tipo: a.tipo || null,
    guia_de_cores: a.guia_de_cores || "",
  }));
}

// --- Tipos de Ambiente ---
export async function listarTiposAmbiente() {
  return apiFetch("/api/tipos-ambiente/") as Promise<Array<{id:number; nome:string}>>;
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
  return apiFetch("/api/marcas/") as Promise<Array<{id:number; nome:string}>>;
}
export async function criarMarca(nome: string) {
  return apiFetch("/api/marcas/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome }),
  });
}

// --- Materiais (itens aprováveis) ---
export async function criarMaterial(payload: {
  ambiente: number;
  item: string;       // ex.: "PISO", "PAREDE"...
  descricao?: string;
  marca?: number | null;
}) {
  try {
    // Tenta criar o material
    return await apiFetch("/api/materiais/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    // Se o backend responder com o erro de unicidade, atualiza o registro existente
    if (err.message?.includes("ambiente, item")) {
      // Busca materiais existentes no mesmo ambiente
      const existentes = await apiFetch(`/api/materiais/?ambiente=${payload.ambiente}`);
      const jaExiste = existentes.find((m: any) => m.item === payload.item);

      if (jaExiste) {
        // Faz PATCH no material existente (atualiza descrição e marca)
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
    // Propaga outros erros normalmente
    throw err;
  }
}

// --- Usuários (apenas superadmin) ---
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