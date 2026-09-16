import { getSession } from "next-auth/react";

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const session: any = await getSession();
  
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {})
  };

  // Only set application/json if Content-Type is not explicitly provided and body is not FormData
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  if (headers["Content-Type"] === "") {
    delete headers["Content-Type"];
  }

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
