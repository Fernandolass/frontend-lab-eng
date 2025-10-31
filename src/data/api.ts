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
    GET DETALHES DE PROJETO (com materiais filtrados por projeto)
   ========================================================== */
export async function getProjetoDetalhes(id: number) {
  const projeto = await apiFetch(`/api/projetos/${id}/`);

  //  Carrega os materiais de cada ambiente, filtrando por projeto
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
    MATERIAIS
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
    DASHBOARD / ESTATÍSTICAS
   ========================================================== */
export async function getDashboardStats() {
  return apiFetch("/api/stats/dashboard/");
}

export async function getStatsMensais() {
  return apiFetch("/api/stats/mensais/");
}