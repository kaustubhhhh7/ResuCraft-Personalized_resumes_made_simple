const EducationEditor = ({ education, onChange }) => {
  const updateItem = (id, field, value) =>
    onChange(education.map((item) => (item.id === id ? { ...item, [field]: value } : item)))

  const removeItem = (id) => onChange(education.filter((item) => item.id !== id))

  return (
    <div className="space-y-4">
      {education.map((item) => (
        <div key={item.id} className="rounded-lg border border-slate-200/80 p-4 space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label>School</label>
              <input
                value={item.school}
                onChange={(e) => updateItem(item.id, 'school', e.target.value)}
                placeholder="e.g., State University"
              />
            </div>
            <div className="space-y-1">
              <label>Degree</label>
              <input
                value={item.degree}
                onChange={(e) => updateItem(item.id, 'degree', e.target.value)}
                placeholder="e.g., B.S. Computer Science"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label>Start</label>
              <input
                value={item.start}
                onChange={(e) => updateItem(item.id, 'start', e.target.value)}
                placeholder="2016"
              />
            </div>
            <div className="space-y-1">
              <label>End</label>
              <input
                value={item.end}
                onChange={(e) => updateItem(item.id, 'end', e.target.value)}
                placeholder="2020"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label>Details</label>
            <textarea
              rows={2}
              value={item.details}
              onChange={(e) => updateItem(item.id, 'details', e.target.value)}
              placeholder="e.g., Honors, focus areas, GPA"
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
      {education.length === 0 && <p className="text-sm text-slate-500">Add schools or certifications.</p>}
    </div>
  )
}

export default EducationEditor

