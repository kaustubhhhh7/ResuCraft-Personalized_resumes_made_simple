import { useState } from 'react'
import PhotoUpload from '../PhotoUpload'
import ExperienceEditor from './ExperienceEditor'
import EducationEditor from './EducationEditor'

const Chevron = ({ open }) => (
  <span
    className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
    aria-hidden
  >
    ▾
  </span>
)

const HeaderIcon = ({ children }) => (
  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200" style={{
    background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(224, 242, 254, 0.8) 100%)',
    color: '#2563eb',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.2) inset'
  }}>
    {children}
  </span>
)

const HeaderAddButton = ({ label, onClick }) => (
  <button
    type="button"
    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200"
    style={{
      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      border: '1px solid rgba(37, 99, 235, 0.2)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }}
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)'
      e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)'
      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.14), 0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
      e.currentTarget.style.transform = 'translateY(-1px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
      e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.2)'
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
    title={`Add new ${label.toLowerCase()}`}
  >
    +
    {label}
  </button>
)

const AccordionCard = ({ open, onToggle, icon, title, description, action, children }) => (
  <div className="rounded-xl border border-slate-200/60 transition-all duration-300" style={{
    background: open 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.9) 100%)',
    boxShadow: open
      ? '0 6px 20px rgba(15, 23, 42, 0.1), 0 2px 6px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.6) inset'
      : '0 2px 8px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.5) inset'
  }}>
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3.5 gap-3 rounded-xl transition-all duration-200"
      style={{
        background: open ? 'transparent' : 'transparent'
      }}
      onMouseEnter={(e) => {
        if (!open) {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(248, 250, 252, 0.6) 0%, rgba(241, 245, 249, 0.8) 100%)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <div className="flex items-center gap-3 text-left">
        <HeaderIcon>{icon}</HeaderIcon>
        <div>
          <div className="text-sm font-semibold text-slate-900 tracking-tight">{title}</div>
          <div className="text-xs text-slate-500 mt-0.5">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {action}
        <Chevron open={open} />
      </div>
    </button>
    {open && (
      <div 
        className="px-4 pb-4 pt-3 space-y-4 border-t border-slate-200/60 mt-1"
        style={{
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {children}
      </div>
    )}
  </div>
)

const ResumeForm = ({ data, onChange }) => {
  const [open, setOpen] = useState('personal')

  const toggle = (key) => setOpen((prev) => (prev === key ? '' : key))

  const updatePersonal = (field, value) =>
    onChange({ ...data, personal: { ...data.personal, [field]: value } })

  const updateSkills = (value) =>
    onChange({
      ...data,
      skills: value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })

  const updateProjects = (id, field, value) =>
    onChange({
      ...data,
      projects: data.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    })

  const addProject = () =>
    onChange({
      ...data,
      projects: [
        ...data.projects,
        {
          id: crypto.randomUUID?.() ?? Date.now().toString(),
          name: '',
          link: '',
          description: '',
        },
      ],
    })

  const removeProject = (id) =>
    onChange({ ...data, projects: data.projects.filter((p) => p.id !== id) })

  const addExperience = () =>
    onChange({
      ...data,
      experience: [
        ...data.experience,
        {
          id: crypto.randomUUID?.() ?? Date.now().toString(),
          company: '',
          role: '',
          start: '',
          end: '',
          description: '',
        },
      ],
    })

  const addEducation = () =>
    onChange({
      ...data,
      education: [
        ...data.education,
        {
          id: crypto.randomUUID?.() ?? Date.now().toString(),
          school: '',
          degree: '',
          start: '',
          end: '',
          details: '',
        },
      ],
    })

  return (
    <div className="space-y-5">
      <AccordionCard
        open={open === 'personal'}
        onToggle={() => toggle('personal')}
        icon="👤"
        title="Personal Info"
        description="Used in all templates"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label>Full name</label>
            <input
              value={data.personal.fullName}
              onChange={(e) => updatePersonal('fullName', e.target.value)}
              placeholder="e.g., Alex Morgan"
              required
            />
          </div>
          <div className="space-y-1">
            <label>Title</label>
            <input
              value={data.personal.title}
              onChange={(e) => updatePersonal('title', e.target.value)}
              placeholder="e.g., Senior Frontend Engineer"
            />
          </div>
          <div className="space-y-1">
            <label>Email</label>
            <input
              type="email"
              value={data.personal.email}
              onChange={(e) => updatePersonal('email', e.target.value)}
              placeholder="alex@example.com"
            />
          </div>
          <div className="space-y-1">
            <label>Phone</label>
            <input
              value={data.personal.phone}
              onChange={(e) => updatePersonal('phone', e.target.value)}
              placeholder="+1 555 123 4567"
            />
          </div>
          <div className="space-y-1">
            <label>Location</label>
            <input
              value={data.personal.location}
              onChange={(e) => updatePersonal('location', e.target.value)}
              placeholder="Remote · PST"
            />
          </div>
          <div className="space-y-1">
            <label>Website / Portfolio</label>
            <input
              value={data.personal.website}
              onChange={(e) => updatePersonal('website', e.target.value)}
              placeholder="alexm.dev"
            />
          </div>
        </div>
        <PhotoUpload value={data.photo} onChange={(val) => onChange({ ...data, photo: val })} />
      </AccordionCard>

      <AccordionCard
        open={open === 'summary'}
        onToggle={() => toggle('summary')}
        icon="📝"
        title="Summary"
        description="Short elevator pitch"
      >
        <div className="space-y-2">
          <textarea
            rows={4}
            value={data.summary}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
            placeholder="e.g., Product-minded frontend engineer who builds accessible, fast UIs."
            className="resize-none"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {data.summary.length} characters, {data.summary.split(/\s+/).filter(Boolean).length} words
            </span>
            <span className={`font-medium ${data.summary.length > 200 && data.summary.length < 300 ? 'text-green-600' : data.summary.length >= 300 ? 'text-amber-600' : 'text-slate-400'}`}>
              {data.summary.length < 200 ? 'Recommended: 200-300' : data.summary.length >= 300 ? 'Too long' : 'Good length'}
            </span>
          </div>
        </div>
      </AccordionCard>

      <AccordionCard
        open={open === 'skills'}
        onToggle={() => toggle('skills')}
        icon="💡"
        title="Skills"
        description="Comma separated"
      >
        <input
          value={data.skills.join(', ')}
          onChange={(e) => updateSkills(e.target.value)}
          placeholder="React, TypeScript, Accessibility, Testing Library"
        />
        <p className="text-xs text-slate-500">Tip: Use commas to add multiple skills.</p>
      </AccordionCard>

      <AccordionCard
        open={open === 'experience'}
        onToggle={() => toggle('experience')}
        icon="💼"
        title="Experience"
        description="Roles and impact"
        action={<HeaderAddButton label="Add role" onClick={addExperience} />}
      >
        <ExperienceEditor experience={data.experience} onChange={(val) => onChange({ ...data, experience: val })} />
      </AccordionCard>

      <AccordionCard
        open={open === 'education'}
        onToggle={() => toggle('education')}
        icon="🎓"
        title="Education"
        description="Schools & certificates"
        action={<HeaderAddButton label="Add education" onClick={addEducation} />}
      >
        <EducationEditor education={data.education} onChange={(val) => onChange({ ...data, education: val })} />
      </AccordionCard>

      <AccordionCard
        open={open === 'projects'}
        onToggle={() => toggle('projects')}
        icon="🚀"
        title="Projects"
        description="Flagship work"
        action={<HeaderAddButton label="Add project" onClick={addProject} />}
      >
        <div className="space-y-3">
          {data.projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-slate-200/80 p-4 space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <label>Name</label>
                <input
                  value={project.name}
                  onChange={(e) => updateProjects(project.id, 'name', e.target.value)}
                  placeholder="Design System Kit"
                />
              </div>
              <div className="space-y-1">
                <label>Link</label>
                <input
                  value={project.link}
                  onChange={(e) => updateProjects(project.id, 'link', e.target.value)}
                  placeholder="github.com/alex/dskit"
                />
              </div>
              <div className="space-y-1">
                <label>Description</label>
                <textarea
                  rows={2}
                  value={project.description}
                  onChange={(e) => updateProjects(project.id, 'description', e.target.value)}
                  placeholder="Short impact statement"
                />
              </div>
              <div className="text-right pt-1">
                <button
                  type="button"
                  className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                  onClick={() => removeProject(project.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {data.projects.length === 0 && (
            <p className="text-sm text-slate-500">Add 1-2 flagship projects with impact.</p>
          )}
        </div>
      </AccordionCard>
    </div>
  )
}

export default ResumeForm

