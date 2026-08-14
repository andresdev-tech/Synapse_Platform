import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Solo aplicar no-store a navegación de páginas (text/html).
  // Los assets estáticos (JS, CSS, fuentes, imágenes) usan su propio
  // sistema de caché de Next.js y NO deben ser bloqueados aquí.
  const accept = request.headers.get('accept') ?? '';
  const isPageNavigation = accept.includes('text/html');

  if (isPageNavigation) {
    // Evita que el navegador guarde en caché la *página* del dashboard.
    // Así, al usar "atrás"/"adelante" después de cerrar sesión, el
    // navegador pide la página de nuevo en lugar de mostrar una foto.
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

// Aplica a todas las rutas del dashboard:
export const config = {
  matcher: ['/dashboard/:path*'],
};