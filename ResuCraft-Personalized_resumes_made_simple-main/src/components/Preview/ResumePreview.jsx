const Section = ({ title, children }) => (
  <div className="mb-10" style={{ display: 'block', clear: 'both' }}>
    <h3 className="text-xl font-bold text-slate-900 border-b-2 border-slate-200 pb-1 mb-4 uppercase tracking-wider">{title}</h3>
    <div className="text-sm leading-relaxed text-slate-800" style={{ display: 'block' }}>{children}</div>
  </div>
)

const Pill = ({ children }) => (
  <div className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs font-bold mr-2 mb-2 border border-slate-200">
    {children}
  </div>
)

const ResumePreview = ({ data, template, order }) => {
  const renderSection = (key) => {
    switch (key) {
      case 'summary':
        return (
          <Section title="Summary">
            <p className="mb-0 whitespace-pre-wrap leading-relaxed">{data.summary || 'Briefly summarize your impact and domain focus.'}</p>
          </Section>
        )
      case 'skills':
        return (
          <Section title="Skills">
            <div className="flex flex-wrap mb-4">
              {data.skills.length ? data.skills.map((skill) => <Pill key={skill}>{skill}</Pill>) : 'Add your top skills'}
            </div>
          </Section>
        )
      case 'experience':
        return (
          <Section title="Experience">
            {data.experience.length ? (
              data.experience.map((item) => (
                <div key={item.id} className="mb-6 last:mb-0" style={{ display: 'block' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div style={{ flex: '1' }}>
                      <div className="font-bold text-slate-900 text-base">{item.role}</div>
                      <div className="text-slate-600 font-medium italic">{item.company}</div>
                    </div>
                    <div className="text-xs text-slate-500 font-bold whitespace-nowrap ml-4">
                      {item.start} — {item.end || 'Present'}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{item.description}</p>
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
                <div key={project.id} className="mb-6 last:mb-0" style={{ display: 'block' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-slate-900 text-base flex-1">{project.name}</div>
                    {project.link && (
                      <div className="text-primary font-medium text-xs ml-4 truncate opacity-80" style={{ maxWidth: '200px' }}>
                        {project.link}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{project.description}</p>
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
                <div key={edu.id} className="mb-6 last:mb-0" style={{ display: 'block' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div style={{ flex: '1' }}>
                      <div className="font-bold text-slate-900 text-base">{edu.degree}</div>
                      <div className="text-slate-600 font-medium italic">{edu.school}</div>
                    </div>
                    <div className="text-xs text-slate-500 font-bold whitespace-nowrap ml-4">
                      {edu.start} — {edu.end}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{edu.details}</p>
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
    <div
      className={`preview-page p-12 ${templateClass} bg-white`}
      style={{
        width: '794px',
        minHeight: '1123px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <header className="flex items-center pb-1 mb-2">
        {data.photo && (
          <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-slate-100 flex-shrink-0 mr-8 shadow-sm">
            <img src={data.photo} alt="Profile" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-5xl font-black text-slate-900 mb-2 leading-none tracking-tighter uppercase">{data.personal.fullName || 'Your name'}</h1>
          <p className="text-2xl text-slate-600 font-bold mb-4 tracking-wide border-b-2 border-slate-100 pb-2 inline-block">{data.personal.title || 'Title or focus'}</p>
          <div className="flex flex-wrap text-xs text-slate-700 font-bold">
            {data.personal.email && (
              <div className="flex items-center mr-6 mb-2">
                {data.personal.email}
              </div>
            )}
            {data.personal.phone && (
              <div className="flex items-center mr-6 mb-2">
                {data.personal.phone}
              </div>
            )}
            {data.personal.location && (
              <div className="flex items-center mr-6 mb-2">
                {data.personal.location}
              </div>
            )}
            {data.personal.website && (
              <div className="flex items-center mr-6 mb-2">
                {data.personal.website}
              </div>
            )}
          </div>
        </div>
      </header>


      {template === 'modern' && <div className="h-2 w-full bg-primary mb-6" />}

      <div className="block">
        {order.map((section) => (
          <div key={section}>{renderSection(section)}</div>
        ))}
      </div>
    </div>
  )
}

export default ResumePreview
