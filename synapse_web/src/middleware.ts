import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Evita que el navegador guarde en caché (incluyendo el bfcache)
  // las páginas del dashboard. Así, al usar "atrás"/"adelante" después
  // de cerrar sesión, el navegador se ve forzado a volver a pedir la
  // página en vez de mostrar una versión ya renderizada/guardada.
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

// Aplica a TODAS las rutas del dashboard, sin importar el rol:
// /dashboard, /dashboard/admin/*, /dashboard/coordinador/*,
// /dashboard/programas/*, /dashboard/perfil, etc.
export const config = {
  matcher: ['/dashboard/:path*'],
};