const ExperienceEditor = ({ experience, onChange }) => {
  const updateItem = (id, field, value) =>
    onChange(experience.map((item) => (item.id === id ? { ...item, [field]: value } : item)))

  const removeItem = (id) => onChange(experience.filter((item) => item.id !== id))

  return (
    <div className="space-y-4">
      {experience.map((item) => (
        <div key={item.id} className="rounded-lg border border-slate-200/80 p-4 space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label>Company</label>
              <input
                value={item.company}
                onChange={(e) => updateItem(item.id, 'company', e.target.value)}
                placeholder="e.g., Acme Corp"
              />
            </div>
            <div className="space-y-1">
              <label>Role / Title</label>
              <input
                value={item.role}
                onChange={(e) => updateItem(item.id, 'role', e.target.value)}
                placeholder="e.g., Senior Frontend Engineer"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label>Start</label>
              <input
                value={item.start}
                onChange={(e) => updateItem(item.id, 'start', e.target.value)}
                placeholder="e.g., Jan 2022"
              />
            </div>
            <div className="space-y-1">
              <label>End</label>
              <input
                value={item.end}
                onChange={(e) => updateItem(item.id, 'end', e.target.value)}
                placeholder="e.g., Present"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label>Impact (short paragraph)</label>
            <textarea
              rows={3}
              value={item.description}
              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
              placeholder="e.g., Led migration to design system, improved Lighthouse from 72 to 96."
            />
          </div>
          <div className="text-right pt-1">
            <button
              type="button"
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              onClick={() => removeItem(item.id)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      {experience.length === 0 && <p className="text-sm text-slate-500">Add roles to show your impact.</p>}
    </div>
  )
}

export default ExperienceEditor

