import { User } from '@/types'
import { Session } from 'next-auth'
import { signIn, signOut, getSession } from 'next-auth/react'

export class AuthService {
  static async signInWithGoogle(): Promise<{ user: User; token: string } | null> {
    try {
      const response = await signIn('google', { 
        redirect: false,
        callbackUrl: '/'
      })

      if (response?.error) {
        console.error('Google sign-in error:', response.error)
        return null
      }

      const session = await this.getSession()
      if (!session) return null

      return {
        user: {
          id: session.user?.id || '',
          name: session.user?.name || '',
          email: session.user?.email || '',
          avatar: session.user?.image || ''
        },
        token: session.accessToken || ''
      }
    } catch (error) {
      console.error('Auth error:', error)
      return null
    }
  }

  static async getSession(): Promise<Session | null> {
    return await getSession()
  }

  static async getToken(): Promise<string | null> {
    const session = await this.getSession()
    console.log('Full session object:', JSON.stringify(session, null, 2))
    console.log('Backend token from session:', session?.accessToken)
    
    if (session?.backendToken) {
      // Decode the JWT to see what's inside (just for debugging)
      try {
        const parts = session.backendToken.split('.')
        const payload = JSON.parse(atob(parts[1]))
        console.log('JWT payload:', payload)
      } catch (e) {
        console.log('Could not decode JWT:', e)
      }
    }
    
    return session?.backendToken || null
  }  

  static async getUser(): Promise<User | null> {
    const session = await this.getSession()
    if (!session?.user) return null

    return {
      id: session.user?.id || '',
      name: session.user?.name || '',
      email: session.user?.email || '',
      avatar: session.user?.image || ''
    }
  }

  static async signOut(): Promise<void> {
    await signOut({
      redirect: false,
      callbackUrl: '/'
    })
  }

  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!session?.user
  }

  // Kept for backward compatibility
  static async initializeGoogleSignIn(): Promise<void> {
    console.warn('initializeGoogleSignIn is deprecated with NextAuth.js')
    return Promise.resolve()
  }
}