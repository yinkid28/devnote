'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Save, LogOut, Terminal, Search, FileText, Trash2 } from 'lucide-react'
import { User, Note } from '@/types'
import { AuthService } from '@/lib/auth'
import { apiService } from '@/lib/api'
import GoogleAuth from './GoogleAuth'

export default function DevNotebook() {
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({ 
    title: '', 
    content: '', 
    tags: [] 
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    AuthService.getUser().then((existingUser) => {
      if (existingUser) {
        setUser(existingUser)
        loadNotes()
      }
    })
    setIsInitializing(false)
  }, [])

  const loadNotes = async () => {
    const fetchedNotes = await apiService.getNotes()
    setNotes(fetchedNotes)
  }

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser)
    loadNotes()
  }

  const handleSignOut = () => {
    AuthService.signOut()
    setUser(null)
    setNotes([])
    setCurrentNote({ title: '', content: '', tags: [] })
    setSelectedNoteId(null)
  }

  const handleNewNote = () => {
    setCurrentNote({ title: '', content: '', tags: [] })
    setSelectedNoteId(null)
  }

  const handleSaveNote = async () => {
    if (!currentNote.title?.trim() && !currentNote.content?.trim()) {
      alert('Please add a title or content to save the note.')
      return
    }

    setIsLoading(true)

    try {
      let savedNote: Note | null = null

      if (selectedNoteId) {
        // Update existing note
        savedNote = await apiService.updateNote(selectedNoteId, currentNote)
        if (savedNote) {
          setNotes(notes.map(note => note.id === selectedNoteId ? savedNote! : note))
        }
      } else {
        // Create new note
        savedNote = await apiService.createNote(currentNote)
        if (savedNote) {
          setNotes([savedNote, ...notes])
          setSelectedNoteId(savedNote.id)
        }
      }

      if (savedNote) {
        setCurrentNote(savedNote)
      } else {
        alert('Failed to save note. Please try again.')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save note. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectNote = (note: Note) => {
    setCurrentNote(note)
    setSelectedNoteId(note.id)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    const success = await apiService.deleteNote(noteId)
    if (success) {
      setNotes(notes.filter(note => note.id !== noteId))
      if (selectedNoteId === noteId) {
        handleNewNote()
      }
    } else {
      alert('Failed to delete note. Please try again.')
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    )
  }

  if (!user) {
    return <GoogleAuth onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Terminal className="h-6 w-6 text-green-400 mr-2" />
            <h1 className="text-xl font-bold">DevNotes</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src={user.avatar || '/api/placeholder/32/32'} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full" 
              />
              <span className="text-sm text-gray-300">{user.name}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden">
        <div className="px-4 pb-4 border-b border-gray-700">
            <button
              onClick={handleNewNote}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </button>
          </div>
          
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full box-border bg-gray-700 border border-gray-600 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {searchTerm ? 'No notes found' : 'No notes yet. Create your first note!'}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors group ${
                    selectedNoteId === note.id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      className="font-medium text-sm truncate flex-1 mr-2"
                      onClick={() => handleSelectNote(note)}
                    >
                      {note.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div onClick={() => handleSelectNote(note)}>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                      {note.content.substring(0, 60)}...
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-600 text-xs rounded text-gray-300">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Note Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
            <input
              type="text"
              placeholder="Note title..."
              value={currentNote.title || ''}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              className="text-lg font-medium bg-transparent border-none outline-none flex-1 text-white placeholder-gray-400"
            />
            <button
              onClick={handleSaveNote}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Note Content */}
          <div className="flex-1 p-6">
            <textarea
              placeholder="Start typing your notes here...

# You can use Markdown
- Lists work great
- For organizing thoughts

```javascript
// Code blocks are supported
const example = 'syntax highlighting';
```"
              value={currentNote.content || ''}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              className="w-full h-full bg-gray-900 text-white outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}