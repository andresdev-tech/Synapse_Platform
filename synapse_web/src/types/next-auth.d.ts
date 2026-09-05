import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    layoutPrefs?: string | null;
    apiToken?: string;
  }
  interface Session {
    user: User & {
      id: string;
      role: string;
      layoutPrefs?: string | null;
      apiToken?: string;
    }
    apiToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    layoutPrefs?: string | null;
    apiToken?: string;
  }
}
