import { User } from '@/types'
import { signIn, signOut, getSession } from 'next-auth/react'
import { Session } from 'next-auth'

interface CustomSession extends Session {
  backendToken?: string
  accessToken?: string
  user: Session['user'] & {
    id: string
  }
}

export class AuthService {
  static async signInWithGoogle(): Promise<{ user: User; token: string } | null> {
    try {
      const response = await signIn('google', {
        redirect: false,
        callbackUrl: '/',
      })

      if (response?.error) {
        console.error('❌ Google sign-in error:', response.error)
        return null
      }

      // Wait for session to be ready
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const session = await this.getSession()
      const token = session?.backendToken || session?.accessToken

      if (!session || !token) {
        console.error('❌ No session or token after sign-in')
        return null
      }

      return {
        user: {
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          avatar: session.user.image || '',
        },
        token,
      }
    } catch (error) {
      console.error('❌ Auth error:', error)
      return null
    }
  }

  static async getSession(): Promise<CustomSession | null> {
    return (await getSession()) as CustomSession | null
  }

  static async getToken(): Promise<string | null> {
    const session = await this.getSession()
    const token = session?.backendToken || session?.accessToken || null

    console.log('📦 Session:', JSON.stringify(session, null, 2))
    console.log('🔑 Token:', token)

    if (!token) return null

    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        console.log('📜 JWT payload:', payload)

        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn('⚠️ Token is expired')
          return null
        }
      }
    } catch (e) {
      console.error('❌ Could not decode JWT:', e)
      return null
    }

    return token
  }

  static async getUser(): Promise<User | null> {
    const session = await this.getSession()
    if (!session?.user) return null

    return {
      id: session.user.id,
      name: session.user.name || '',
      email: session.user.email || '',
      avatar: session.user.image || '',
    }
  }

  static async signOut(): Promise<void> {
    await signOut({
      redirect: false,
      callbackUrl: '/',
    })
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken()
    return !!token
  }

  static async initializeGoogleSignIn(): Promise<void> {
    console.warn('initializeGoogleSignIn is deprecated with NextAuth.js')
    return Promise.resolve()
  }
}
