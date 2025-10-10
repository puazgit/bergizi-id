import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/db'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import type { UserRole, UserType } from '@prisma/client'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials)
        
        if (!validatedFields.success) {
          return null
        }

        const { email, password } = validatedFields.data

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            profileImage: true,
            userRole: true,
            userType: true,
            sppgId: true,
            isActive: true,
            sppg: {
              select: {
                id: true,
                name: true,
                code: true,
                status: true,
                isDemoAccount: true
              }
            }
          }
        })

        if (!user || !user.password || !user.isActive) {
          return null
        }

        // Check SPPG status for SPPG users
        if (user.sppgId && user.sppg) {
          if (user.sppg.status !== 'ACTIVE') {
            return null
          }
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.profileImage,
          userRole: user.userRole!,
          userType: user.userType,
          sppgId: user.sppgId,
          sppgName: user.sppg?.name || null,
          sppgCode: user.sppg?.code || null,
          isDemoAccount: user.sppg?.isDemoAccount || false
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userRole = user.userRole
        token.userType = user.userType
        token.sppgId = user.sppgId
        token.sppgName = user.sppgName
        token.sppgCode = user.sppgCode
        token.isDemoAccount = user.isDemoAccount
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.userRole = token.userRole as UserRole
        session.user.userType = token.userType as UserType
        session.user.sppgId = token.sppgId as string | null
        session.user.sppgName = token.sppgName as string | null
        session.user.sppgCode = token.sppgCode as string | null
        session.user.isDemoAccount = token.isDemoAccount as boolean
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always allow relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      
      return baseUrl
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours for enterprise security
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  }
})