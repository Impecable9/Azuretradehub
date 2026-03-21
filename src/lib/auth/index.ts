import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

// Auth simplificado: JWT sessions + Google OAuth
// Magic link se añade cuando RESEND_API_KEY esté configurada
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      const allowed = process.env.ALLOWED_EMAILS?.split(",").map((e) => e.trim()) ?? [];
      if (allowed.length === 0) return true; // sin lista → permitir todos (desarrollo)
      if (allowed.includes(user.email ?? "")) return true;
      // Email no autorizado → guardar en waitlist y redirigir
      try {
        await prisma.waitlist.upsert({
          where: { email: user.email ?? "" },
          update: {},
          create: { email: user.email ?? "", name: user.name, image: user.image },
        });
      } catch { /* silencioso */ }
      return "/en-espera";
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}
