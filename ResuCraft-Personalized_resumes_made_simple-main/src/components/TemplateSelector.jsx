const templates = [
  { id: 'classic', label: 'Classic', description: 'Simple serif headings with clean columns.' },
  { id: 'modern', label: 'Modern', description: 'Minimal sans-serif with accent bar.' },
  { id: 'creative', label: 'Creative', description: 'Soft gradient and pill badges.' },
  { id: 'professional', label: 'Professional', description: 'Clean layout with strong typography.' },
]

const TemplateSelector = ({ value, onChange }) => (
  <div className="section-card">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Templates</h3>
      <p className="text-xs text-slate-500 mt-0.5">Choose a design style</p>
    </div>
    <div className="grid grid-cols-1 gap-2.5">
      {templates.map((tpl) => {
        const active = value === tpl.id
        return (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onChange(tpl.id)}
            className={`text-left rounded-xl border px-4 py-3 transition-all duration-200 flex items-center gap-3 ${
              active
                ? 'border-blue-500/60 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 shadow-lg shadow-blue-100/40'
                : 'border-slate-200/60 hover:border-blue-300/60 hover:bg-gradient-to-br hover:from-slate-50/50 hover:to-white/50 hover:shadow-md'
            }`}
            title={tpl.description}
            style={active ? {
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.2) inset'
            } : {}}
          >
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
              active 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {tpl.label[0]}
            </div>
            <div className={`font-medium text-sm tracking-tight ${active ? 'text-slate-900' : 'text-slate-700'}`}>
              {tpl.label}
            </div>
          </button>
        )
      })}
    </div>
  </div>
)

export default TemplateSelector

