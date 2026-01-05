const Section = ({ title, children }) => (
  <div className="mb-5" style={{ display: 'block', clear: 'both' }}>
    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-3 uppercase tracking-wider">{title}</h3>
    <div className="text-sm leading-normal text-slate-700" style={{ display: 'block' }}>{children}</div>
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
                <div key={item.id} className="mb-3 last:mb-0" style={{ display: 'block' }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div style={{ flex: '1' }}>
                      <div className="font-semibold text-slate-900 text-base">{item.role}</div>
                      <div className="text-slate-600 text-sm font-medium">{item.company}</div>
                    </div>
                    <div className="text-xs text-slate-500 font-semibold whitespace-nowrap ml-4">
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
                <div key={project.id} className="mb-3 last:mb-0" style={{ display: 'block' }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="font-semibold text-slate-900 text-base flex-1">{project.name}</div>
                    {project.link && (
                      <div className="text-primary font-medium text-xs ml-4 truncate" style={{ maxWidth: '200px' }}>
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
                <div key={edu.id} className="mb-3 last:mb-0" style={{ display: 'block' }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div style={{ flex: '1' }}>
                      <div className="font-semibold text-slate-900 text-base">{edu.degree}</div>
                      <div className="text-slate-600 text-sm font-medium">{edu.school}</div>
                    </div>
                    <div className="text-xs text-slate-500 font-semibold whitespace-nowrap ml-4">
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
      <header className="flex items-center pb-2 mb-4">
        {data.photo && (
          <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-slate-50 flex-shrink-0 mr-6 shadow-sm">
            <img src={data.photo} alt="Profile" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight uppercase">{data.personal.fullName || 'Your name'}</h1>
          <p className="text-lg text-slate-600 font-semibold mb-3 tracking-wide">{data.personal.title || 'Title or focus'}</p>
          <div className="flex flex-wrap text-sm text-slate-600 font-medium">
            {data.personal.email && (
              <div className="flex items-center mr-5 mb-1">
                {data.personal.email}
              </div>
            )}
            {data.personal.phone && (
              <div className="flex items-center mr-5 mb-1">
                {data.personal.phone}
              </div>
            )}
            {data.personal.location && (
              <div className="flex items-center mr-5 mb-1">
                {data.personal.location}
              </div>
            )}
            {data.personal.website && (
              <div className="flex items-center mr-5 mb-1">
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
