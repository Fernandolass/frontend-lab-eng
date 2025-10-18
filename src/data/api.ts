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
  // seu USERNAME_FIELD é 'email', então o payload é { email, password }
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

  // 🔹 garante que, se o método for POST ou PATCH e não houver Content-Type, define application/json
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