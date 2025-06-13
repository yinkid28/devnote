import { authOptions as baseAuthOptions } from '@/lib/authOptions'
import NextAuth from 'next-auth'
import jwt from 'jsonwebtoken'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    idToken?: string
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
  ...baseAuthOptions,
  callbacks: {
    async jwt({ token, account, user }) {
      // On initial sign in
      if (account && user) {
        token.id = user.id

        // Create your own signed token to send to your backend
        token.accessToken = jwt.sign(
          {
            user_id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.image,
          },
          process.env.JWT_SECRET!,
          { expiresIn: '1h' }
        )
      }

      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.accessToken = token.accessToken as string
      session.idToken = token.idToken as string
      return session
    }
  }
})

export { handler as GET, handler as POST }
