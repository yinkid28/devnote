import { Note, NotesResponse, NoteResponse } from '@/types'
import { AuthService } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

class ApiService {
  private async getHeaders(): Promise<HeadersInit> {
    const token = await AuthService.getToken()
    console.log('Token received in API service:', token ? 'Token exists' : 'No token')
    console.log('Token length:', token?.length)
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async getNotes(): Promise<Note[]> {
    try {
      const headers = await this.getHeaders() // ✅ Await getHeaders
      const response = await fetch(`${API_URL}/notes`, {
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data: NotesResponse = await response.json()
      return data.notes
    } catch (error) {
      console.error('Error fetching notes:', error)
      return []
    }
  }

  async createNote(note: Partial<Note>): Promise<Note | null> {
    try {
      const headers = await this.getHeaders() // ✅ Await getHeaders
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(note),
      })

      if (!response.ok) {
        throw new Error('Failed to create note')
      }

      const data: NoteResponse = await response.json()
      return data.note
    } catch (error) {
      console.error('Error creating note:', error)
      return null
    }
  }

  async updateNote(id: string, note: Partial<Note>): Promise<Note | null> {
    try {
      const headers = await this.getHeaders()
  
      const sanitizedNote = {
        ...(note.title && { title: note.title }),
        ...(note.content && { content: note.content }),
        ...(note.tags && { tags: note.tags }),
      }
  
      console.log("📝 Updating note with:", JSON.stringify(sanitizedNote, null, 2))
  
      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(sanitizedNote),
      })
  
      const responseText = await response.text()
      console.log("🧾 Server response:", response.status, responseText)
  
      if (!response.ok) {
        throw new Error(`Failed to update note (${response.status})`)
      }
  
      const data: NoteResponse = JSON.parse(responseText)
      return data.note
    } catch (error) {
      console.error('Error updating note:', error)
      return null
    }
  }  
  

  async deleteNote(id: string): Promise<boolean> {
    try {
      const headers = await this.getHeaders() // ✅ Await getHeaders
      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'DELETE',
        headers,
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting note:', error)
      return false
    }
  }
}

export const apiService = new ApiService()
