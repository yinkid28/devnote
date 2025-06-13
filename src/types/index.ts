export interface User {
    id: string
    email: string
    name: string
    avatar: string
  }
  
  export interface Note {
    id: string
    user_id: string
    title: string
    content: string
    tags: string[]
    created_at: string
    updated_at: string
  }
  
  export interface AuthResponse {
    user: User
    token: string
  }
  
  export interface NotesResponse {
    notes: Note[]
  }
  
  export interface NoteResponse {
    note: Note
  }