import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/db'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { loginSchema } from '@/schemas/auth'
import { UserRole } from '@prisma/client'

// Production configuration with trustHost for Coolify
export const { handlers, signIn, signOut, auth } = NextAuth({
  // CRITICAL: trustHost must be true for Coolify deployment
  trustHost: true,
  
  adapter: PrismaAdapter(prisma),
  
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  
  // Security configuration for production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          // 1. Validate input with Zod
          const result = loginSchema.safeParse(credentials)
          if (!result.success) {
            console.error('[AUTH] Login validation failed:', result.error.issues)
            return null
          }

          const { email, password } = result.data

          // 2. Find user by email
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              sppg: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  isDemoAccount: true,
                  demoExpiresAt: true
                }
              }
            }
          })

          if (!user) {
            console.error('[AUTH] User not found:', email)
            return null
          }

          // 3. Check password
          if (!user.password) {
            console.error('[AUTH] User has no password set:', email)
            return null
          }

          const isValidPassword = await compare(password, user.password)
          if (!isValidPassword) {
            console.error('[AUTH] Invalid password for user:', email)
            return null
          }

          // 4. Check user status
          if (!user.isActive) {
            console.error('[AUTH] User not active:', email, 'isActive:', user.isActive)
            return null
          }

          // 5. Check SPPG status (for SPPG users)
          if (user.sppgId && user.sppg) {
            if (user.sppg.status !== 'ACTIVE') {
              console.error('[AUTH] SPPG not active for user:', email)
              return null
            }

            // Check demo expiry
            if (user.sppg.isDemoAccount && user.sppg.demoExpiresAt) {
              if (new Date() > user.sppg.demoExpiresAt) {
                console.error('[AUTH] Demo account expired for user:', email)
                return null
              }
            }
          }

          // 6. Log successful login (production-safe)
          if (process.env.NODE_ENV === 'production') {
            console.log('[AUTH] Login success:', { userId: user.id, role: user.userRole, sppgId: user.sppgId })
          } else {
            console.log('[AUTH] Login success:', email, 'Role:', user.userRole)
          }

          // Return user data for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.profileImage
          } as any

        } catch (error) {
          console.error('[AUTH] Authorization error:', error)
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        // Get fresh user data from DB for token
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            userRole: true,
            sppgId: true,
            userType: true,
            isActive: true
          }
        })
        
        if (dbUser) {
          token.userRole = dbUser.userRole
          token.sppgId = dbUser.sppgId
          token.userType = dbUser.userType
        }
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        // Add user info to session
        session.user.id = token.sub!
        session.user.userRole = token.userRole as UserRole
        session.user.sppgId = token.sppgId as string | null
        session.user.userType = token.userType as any
      }
      return session
    }
  },
  
  // Enable debug messages in development  
  debug: process.env.NODE_ENV === 'development'
})