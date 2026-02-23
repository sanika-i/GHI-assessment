'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileRecord, FilesResponse } from '@/lib/types'

function SkeletonRow() {
  return (
    <li className="file-item">
      <div className="file-info">
        <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '13px', width: '25%' }} />
      </div>
    </li>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [uploadName, setUploadName] = useState('')

  function fetchFiles(query = '') {
    setLoading(true)
    setError(null)
    const url = query ? `/api/files?q=${encodeURIComponent(query)}` : '/api/files'
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`)
        return res.json() as Promise<FilesResponse>
      })
      .then(data => setFiles(data.files))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchFiles() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchFiles(search)
  }

  function handleClear() {
    setSearch('')
    fetchFiles('')
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: uploadName }),
    })
    if (res.ok) {
      setUploadName('')
      fetchFiles(search)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <>
      <h1>Dashboard</h1>
      <p>Welcome, <strong>test@example.com</strong>!</p>

      <div className="search-box">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            name="q"
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
          {search && (
            <button type="button" onClick={handleClear}>Clear</button>
          )}
        </form>
      </div>

      <h2>Your Files ({loading ? '…' : files.length})</h2>

      {error && <p className="error">Failed to load files: {error}</p>}

      {loading ? (
        <ul className="file-list">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </ul>
      ) : files.length > 0 ? (
        <ul className="file-list">
          {files.map(file => (
            <li key={file.id} className="file-item">
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">{file.size} • Uploaded {file.date}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files found.</p>
      )}

      <h2>Upload New File</h2>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          name="filename"
          placeholder="Filename (e.g., report.pdf)"
          required
          value={uploadName}
          onChange={e => setUploadName(e.target.value)}
        />
        <button type="submit">Upload</button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <button type="button" onClick={handleLogout}>Logout</button>
      </div>
    </>
  )
}