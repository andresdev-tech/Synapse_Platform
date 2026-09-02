import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        try {
          const res = await fetch("http://127.0.0.1:4000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: credentials.email, 
              password: credentials.password 
            })
          })
          
          const data = await res.json()
          
          if (!res.ok) {
            throw new Error(data.error || "Credenciales incorrectas")
          }
          
          if (data.success && data.data?.user) {
            return {
              id: data.data.user.id,
              name: data.data.user.name,
              email: data.data.user.email,
              role: data.data.user.role,
              layoutPrefs: data.data.user.layoutPrefs,
              apiToken: data.data.token
            }
          }
          return null
        } catch (e: any) {
          throw new Error(e.message || "Error de conexión con la API")
        }
      }
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_super_secret_for_development_only",
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "Usuario"
        token.layoutPrefs = user.layoutPrefs
        token.apiToken = (user as any).apiToken
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.layoutPrefs = token.layoutPrefs as string
        ;(session as any).apiToken = token.apiToken
      }
      return session
    }
  },
  pages: { signIn: '/login' }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
