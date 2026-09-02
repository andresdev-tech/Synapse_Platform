import { getSession } from "next-auth/react";

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const session: any = await getSession();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {})
  };

  if (session?.apiToken) {
    headers["Authorization"] = `Bearer ${session.apiToken}`;
  }

  // En el navegador usamos el endpoint proxy de Next.js (/api/proxy) que es del mismo origen
  // y evita cualquier conflicto de CORS, IPs de red o certificados.
  // En SSR (servidor) nos comunicamos directo con la API local.
  const isServer = typeof window === "undefined";
  const baseUrl = isServer 
    ? (process.env.API_BACKEND_URL || "http://127.0.0.1:4000/api")
    : "/api/proxy";
  
  const cleanUrl = url.startsWith("/api") ? url.replace("/api", "") : (url.startsWith("/") ? url : `/${url}`);

  return fetch(`${baseUrl}${cleanUrl}`, {
    ...options,
    headers
  });
};
