import { DefaultSession } from 'next-auth'
import type { UserRole, UserType } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    userRole: UserRole
    userType: UserType
    sppgId: string | null
    sppgName: string | null
    sppgCode: string | null
    isDemoAccount: boolean
  }

  interface Session {
    user: {
      id: string
      userRole: UserRole
      userType: UserType
      sppgId: string | null
      sppgName: string | null
      sppgCode: string | null
      isDemoAccount: boolean
    } & DefaultSession['user']
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    userRole?: UserRole
    userType?: UserType
    sppgId?: string | null
    sppgName?: string | null
    sppgCode?: string | null
    isDemoAccount?: boolean
  }
}