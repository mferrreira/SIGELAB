import NextAuth, { type AuthOptions, type SessionStrategy } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/database/prisma"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios.")
        }
        const user = await prisma.users.findUnique({ where: { email: credentials.email.toLowerCase() } })
        if (!user || !user.password) {
          throw new Error("Usuário não encontrado ou senha não definida.")
        }
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error("Senha incorreta.")
        }
        
        // Check if user is approved
        if (user.status !== "active") {
          throw new Error("Sua conta ainda não foi aprovada. Entre em contato com um administrador ou laboratorista.")
        }
        
        // Remove sensitive info
        const { password, ...safeUser } = user
        return safeUser as any // Type assertion to allow extra fields for JWT
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 60 * 60 * 48, // 2 days in seconds
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = (user as any).id
        token.roles = (user as any).roles
        token.name = (user as any).name
        token.email = (user as any).email
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.name = token.name as string | undefined
        session.user.email = token.email as string | undefined
        // @ts-ignore: custom fields
        session.user.roles = token.roles
        // @ts-ignore: custom fields
        session.user.id = token.id
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 