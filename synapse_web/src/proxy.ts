import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next();

    // STRICT SECURITY HEADERS
    const isProd = process.env.NODE_ENV === "production";
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self';
      connect-src 'self' http://localhost:* http://127.0.0.1:* ws: wss: https:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      frame-src 'self' https://www.google.com/ https://www.google.com/maps/ https://app.powerbi.com/;
      ${isProd ? "upgrade-insecure-requests;" : ""}
    `;
    
    const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (isProd) {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Todas las llamadas a la API (Proxy y Auth) deben pasar directo; el Backend Express valida los tokens
        if (pathname.startsWith("/api/")) {
          return true;
        }

        // Rutas públicas de autenticación en la web
        if (
          pathname.startsWith("/login") || 
          pathname.startsWith("/register") || 
          pathname.startsWith("/verify-email") || 
          pathname.startsWith("/forgot-password")
        ) {
          return true;
        }

        // Permitir acceso público a la raíz (tablón/dashboard) y a las rutas simuladas del CTMA
        if (pathname === "/" || pathname.startsWith("/ctma")) {
          return true;
        }

        // Rutas privadas protegidas que exigen sesión
        return !!token;
      }
    },
    pages: {
      signIn: "/login",
    }
  }
);

// Define qué rutas evalúa este middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
