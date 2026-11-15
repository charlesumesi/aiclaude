import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as storage from '../data/storage.js'
import { useAsyncData } from '../hooks/useAsyncData.js'

// Save groups to a file at one address and load them at another.
export default function MoveGroups() {
  const { user } = useAuth()
  const {
    data: groups,
    loading,
    error: loadError,
  } = useAsyncData(() => storage.getGroupsForUser(user.id), [user.id])
  const [picked, setPicked] = useState(new Set())
  const [downloadError, setDownloadError] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function toggle(id) {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleDownload() {
    setDownloadError('')
    try {
      const data = await storage.exportGroups([...picked])
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'splitmate-groups.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setDownloadError(`Couldn’t make the file: ${err.message}`)
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setMessage('')
    setError('')
    try {
      const result = await storage.importGroups(JSON.parse(await file.text()))
      setMessage(
        result.groups.length
          ? `Added ${result.groups.join(', ')} with ${result.expenses} expense(s).`
          : 'Nothing new to add. Those groups are already here.',
      )
    } catch (err) {
      setError(err instanceof SyntaxError ? "That file couldn't be read" : err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/dashboard" className="text-sm text-ink-2 transition-colors hover:text-ink">
          ← Back to dashboard
        </Link>
        <h1 className="mt-3 text-xl text-ink">Move groups</h1>
        <p className="mt-2 text-sm text-ink-2">
          Groups are saved in this browser at this address ({window.location.host}). To use a
          group at another address, download it here and load the file there.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
      <section className="card space-y-5 px-7 py-7">
        <h2 className="text-lg text-ink">1. Download groups from here</h2>
        {loading ? (
          <p className="text-sm text-ink-3">Loading…</p>
        ) : loadError ? (
          <p className="text-sm text-danger">Couldn’t load your groups: {loadError.message}</p>
        ) : !groups?.length ? (
          <p className="text-sm text-ink-3">You have no groups at this address.</p>
        ) : (
          <>
            <ul className="divide-y divide-line rounded-lg border border-line">
              {groups.map((g) => (
                <li key={g.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-page">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={picked.has(g.id)}
                      onChange={() => toggle(g.id)}
                    />
                    <span className="text-sm text-ink">{g.name}</span>
                  </label>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!picked.size}
              className="btn btn-primary"
            >
              Download file
            </button>
            {downloadError && <p className="text-sm text-danger">{downloadError}</p>}
          </>
        )}
      </section>

      <section className="card space-y-5 px-7 py-7">
        <h2 className="text-lg text-ink">2. Load groups into here</h2>
        <label className="btn btn-secondary cursor-pointer">
          Choose file…
          <input type="file" accept=".json,application/json" className="sr-only" onChange={handleFile} />
        </label>
        {message && (
          <p className="text-sm text-ink">
            {message}{' '}
            <Link to="/dashboard" className="font-medium text-primary hover:underline">
              Go to dashboard
            </Link>
          </p>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
      </section>
      </div>
    </div>
  )
}
