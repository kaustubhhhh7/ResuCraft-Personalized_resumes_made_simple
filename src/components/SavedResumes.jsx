import { useState } from 'react'

const SavedResumes = ({ resumes, onSave, onLoad, onDelete, onExportJson }) => {
  const [name, setName] = useState('')

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim())
    setName('')
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Save & load</h3>
        <p className="text-xs text-slate-500">Local only — stays in this browser.</p>
      </div>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Frontend Resume — June 2025"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
          }}
        />
        <button
          type="button"
          className="btn-primary whitespace-nowrap text-sm px-4 py-2.5"
          onClick={handleSave}
          disabled={!name.trim()}
        >
          Save
        </button>
      </div>
      <div className="space-y-2 max-h-72 overflow-auto pr-1">
        {resumes.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No saved resumes yet.</p>
        )}
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="rounded-lg border border-slate-200/50 p-3 flex items-center justify-between transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.6) inset'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.7) inset'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.6) inset'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.5)'
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-slate-900 truncate tracking-tight">{resume.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {new Date(resume.updatedAt).toLocaleDateString()} at {new Date(resume.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="flex items-center gap-1.5 ml-3">
              <button
                type="button"
                className="btn-secondary text-xs px-3 py-1.5 h-8"
                onClick={() => onLoad(resume)}
                title="Load this resume"
              >
                Load
              </button>
              {onExportJson && (
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 transition-colors duration-200"
                  onClick={() => onExportJson(resume)}
                  title="Export as JSON"
                >
                  JSON
                </button>
              )}
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1.5 transition-colors duration-200"
                onClick={() => onDelete(resume.id)}
                title="Delete resume"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SavedResumes

