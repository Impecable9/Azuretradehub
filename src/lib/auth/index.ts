import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
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
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user }) {
      // Auto-crear organización si es la primera vez
      if (user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
          include: { organization: true },
        });
        if (existing && !existing.organizationId) {
          const slug = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
          const org = await prisma.organization.create({
            data: { name: user.name ?? user.email, slug: `${slug}-${Date.now()}` },
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
});

declare module "next-auth" {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}
