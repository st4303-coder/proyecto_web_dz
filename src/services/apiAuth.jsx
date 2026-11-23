const API_URL = import.meta.env.VITE_API_URL;
const APP_TOKEN = import.meta.env.VITE_API_APP_TOKEN; 

export async function apiAuth(endpoint, options = {}) {
  const userToken = localStorage.getItem("user_token");

  const headers = {
    "Content-Type": "application/json",
    "app-token": APP_TOKEN,
    ...options.headers,
  };

  if (userToken) {
    headers.Authorization = `Bearer ${userToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Sesión expirada o no autorizada (401).");
  }

  if (response.status === 403) {
    alert("Acceso restringido (403): no tienes permisos para esta acción.");
    throw new Error("Acceso restringido (403).");
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.msg || `Error HTTP ${response.status}`);
  }

  return data;
}