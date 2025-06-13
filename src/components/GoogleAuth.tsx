'use client'

import { useState } from 'react'
import { Terminal } from 'lucide-react'
import { AuthService } from '@/lib/auth'
import { User } from '@/types'

interface GoogleAuthProps {
  onAuthSuccess: (user: User) => void
}

export default function GoogleAuth({ onAuthSuccess }: GoogleAuthProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await AuthService.initializeGoogleSignIn()
      const result = await AuthService.signInWithGoogle()
      
      if (result) {
        onAuthSuccess(result.user)
      } else {
        alert('Authentication failed. Please try again.')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Terminal className="h-8 w-8 text-green-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">DevNotes</h1>
          </div>
          <p className="text-gray-400">Your personal development notebook</p>
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  )
}