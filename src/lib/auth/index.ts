import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Auth necesita su propio cliente Prisma directo (no el Proxy singleton)
function getAuthPrisma() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL not set");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaLibSql({ url, authToken } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const prisma = getAuthPrisma();

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: PrismaAdapter(prisma as any),
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
      Resend({
        apiKey: process.env.RESEND_API_KEY,
        from: "Azuretradehub <acceso@azuretradehub.com>",
      }),
    ],
    pages: {
      signIn: "/login",
      verifyRequest: "/login?verify=1",
    },
    callbacks: {
      async session({ session, user }) {
        if (session.user) session.user.id = user.id;
        return session;
      },
      async signIn({ user }) {
        if (user.email) {
          const existing = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (existing && !existing.organizationId) {
            const slug = `${user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
            const org = await prisma.organization.create({
              data: { name: user.name ?? user.email, slug },
            });
            await prisma.user.update({
              where: { id: existing.id },
              data: { organizationId: org.id },
            });
          }
        }
        return true;
      },
    },
  };
});

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}
