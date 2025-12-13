const Section = ({ title, children }) => (
  <section className="space-y-2">
    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h3>
    <div className="space-y-2 text-sm leading-relaxed text-slate-800">{children}</div>
  </section>
)

const Pill = ({ children }) => (
  <span className="inline-flex items-center bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-semibold mr-2 mb-2">
    {children}
  </span>
)

const ResumePreview = ({ data, template, order }) => {
  const renderSection = (key) => {
    switch (key) {
      case 'summary':
        return (
          <Section title="Summary">
            <p>{data.summary || 'Briefly summarize your impact and domain focus.'}</p>
          </Section>
        )
      case 'skills':
        return (
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {data.skills.length ? data.skills.map((skill) => <Pill key={skill}>{skill}</Pill>) : 'Add your top skills'}
            </div>
          </Section>
        )
      case 'experience':
        return (
          <Section title="Experience">
            {data.experience.length ? (
              data.experience.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">
                      {item.role} · {item.company}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.start} — {item.end || 'Present'}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">{item.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Add your recent roles and results.</p>
            )}
          </Section>
        )
      case 'projects':
        return (
          <Section title="Projects">
            {data.projects.length ? (
              data.projects.map((project) => (
                <div key={project.id} className="space-y-1">
                  <div className="font-semibold">
                    {project.name}{' '}
                    {project.link && (
                      <a href={project.link} className="text-primary underline" target="_blank" rel="noreferrer">
                        {project.link}
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{project.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Feature 1-2 flagship projects.</p>
            )}
          </Section>
        )
      case 'education':
        return (
          <Section title="Education">
            {data.education.length ? (
              data.education.map((edu) => (
                <div key={edu.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">
                      {edu.degree} — {edu.school}
                    </div>
                    <div className="text-xs text-slate-500">
                      {edu.start} — {edu.end}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">{edu.details}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Add your education or certifications.</p>
            )}
          </Section>
        )
      default:
        return null
    }
  }

  const templateClass =
    template === 'modern'
      ? 'template-modern'
      : template === 'creative'
        ? 'template-creative'
        : template === 'professional'
          ? 'template-professional'
          : 'template-classic'

  return (
    <div className={`preview-page p-10 ${templateClass}`}>
      <header className="flex items-start gap-4 pb-5 border-b border-slate-200">
        {data.photo && (
          <div className="h-20 w-20 rounded-full overflow-hidden border border-slate-200">
            <img src={data.photo} alt="Profile" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 space-y-1">
          <h1>{data.personal.fullName || 'Your name'}</h1>
          <p className="text-slate-700 font-medium text-base">{data.personal.title || 'Title or focus'}</p>
          <div className="text-xs text-slate-600 space-x-3 flex flex-wrap gap-2">
            {data.personal.email && <span>{data.personal.email}</span>}
            {data.personal.phone && <span>{data.personal.phone}</span>}
            {data.personal.location && <span>{data.personal.location}</span>}
            {data.personal.website && <span>{data.personal.website}</span>}
          </div>
        </div>
      </header>

      {template === 'modern' && <div className="header-bar" />}
      {template === 'creative' && (
        <div className="badge my-4">
          <span role="img" aria-label="sparkles">
            ✨
          </span>
          Available for new opportunities
        </div>
      )}

      <div className="space-y-6 mt-5">{order.map((section) => renderSection(section))}</div>
    </div>
  )
}

export default ResumePreview

