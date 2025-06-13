import { authOptions as baseAuthOptions } from '@/lib/authOptions'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    backendToken?: string
    user: {
      id: string
      name: string
      email: string
      image?: string
    }
  }

  interface User {
    id: string
  }
}

const handler = NextAuth({
  ...baseAuthOptions, // ✅ Use the original
  callbacks: {
    ...baseAuthOptions.callbacks, // ✅ Preserve custom token logic
  }
})

export { handler as GET, handler as POST }
