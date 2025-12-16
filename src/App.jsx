import { useEffect, useMemo, useRef, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import LoginRegister from './components/Auth/LoginRegister'
import ResumeForm from './components/Editor/ResumeForm'
import ResumePreview from './components/Preview/ResumePreview'
import SavedResumes from './components/SavedResumes'
import TemplateSelector from './components/TemplateSelector'
import {
  createEmptyResume,
  deleteResume,
  demoCredentials,
  getCurrentUser,
  loadDraft,
  loadResumes,
  loginUser,
  logoutUser,
  registerUser,
  saveDraft,
  saveResume,
  seedDemoUser,
} from './utils/localStorage'
import { exportToPDF } from './utils/pdfExport'

const defaultOrder = ['summary', 'skills', 'experience', 'projects', 'education']

const calculateCompleteness = (resume) => {
  let score = 0
  const total = 9

  if (resume.personal?.fullName) score++
  if (resume.personal?.email) score++
  if (resume.personal?.title) score++
  if (resume.summary) score++
  if (resume.skills?.length > 0) score++
  if (resume.experience?.length > 0) score++
  if (resume.education?.length > 0) score++
  if (resume.projects?.length > 0) score++
  if (resume.photo) score++

  return Math.round((score / total) * 100)
}

function App() {
  const previewRef = useRef(null)
  const previewContainerRef = useRef(null)
  const [user, setUser] = useState(getCurrentUser())
  const [resume, setResume] = useState(createEmptyResume())
  const [template, setTemplate] = useState('classic')
  const [resumes, setResumes] = useState([])
  const [order, setOrder] = useState(defaultOrder)
  const [zoom, setZoom] = useState(100)
  const [autoScale, setAutoScale] = useState(1)

  const zoomLevels = [50, 75, 100, 125, 150]
  const currentZoomIndex = zoomLevels.indexOf(zoom)

  const handleZoomIn = () => {
    const idx = zoomLevels.indexOf(zoom)
    if (idx < zoomLevels.length - 1) {
      setZoom(zoomLevels[idx + 1])
    }
  }

  const handleZoomOut = () => {
    const idx = zoomLevels.indexOf(zoom)
    if (idx > 0) {
      setZoom(zoomLevels[idx - 1])
    }
  }

  const handleZoomReset = () => {
    setZoom(100)
  }

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault()
          const idx = zoomLevels.indexOf(zoom)
          if (idx < zoomLevels.length - 1) {
            setZoom(zoomLevels[idx + 1])
          }
        } else if (e.key === '-') {
          e.preventDefault()
          const idx = zoomLevels.indexOf(zoom)
          if (idx > 0) {
            setZoom(zoomLevels[idx - 1])
          }
        } else if (e.key === '0') {
          e.preventDefault()
          setZoom(100)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoom])

  useEffect(() => {
    seedDemoUser()
    if (!user?.username) return
    const saved = loadResumes(user.username)
    setResumes(saved)
    const draft = loadDraft(user.username)
    if (draft) setResume(draft)
    else if (saved[0]) setResume(saved[0].data)
    else setResume(createEmptyResume())
  }, [user?.username])

  useEffect(() => {
    if (!user?.username) return
    const id = setInterval(() => {
      saveDraft(user.username, resume)
    }, 30000) // Autosave every 30 seconds
    return () => clearInterval(id)
  }, [user?.username, resume])

  // Auto-scale preview to fit viewport at 100% zoom
  useEffect(() => {
    let timeoutId = null
    let retryCount = 0
    const maxRetries = 10

    const calculateAutoScale = () => {
      const container = previewContainerRef.current
      const content = previewRef.current
      
      if (!container || !content) {
        // Retry if elements aren't ready yet
        if (retryCount < maxRetries) {
          retryCount++
          timeoutId = setTimeout(calculateAutoScale, 100)
        }
        return
      }

      // Get container dimensions (accounting for padding: 2rem = 32px on each side)
      const containerRect = container.getBoundingClientRect()
      const availableWidth = containerRect.width - 64 // 32px padding on each side
      const availableHeight = containerRect.height - 64 // 32px padding on each side

      // Get content natural dimensions (offsetWidth/offsetHeight are not affected by transform)
      const contentWidth = content.offsetWidth || content.scrollWidth
      const contentHeight = content.offsetHeight || content.scrollHeight

      // If content dimensions aren't ready, retry
      if (contentWidth === 0 || contentHeight === 0 || availableWidth <= 0 || availableHeight <= 0) {
        if (retryCount < maxRetries) {
          retryCount++
          timeoutId = setTimeout(calculateAutoScale, 100)
        }
        return
      }

      // Calculate scale to fit both width and height, maintaining aspect ratio
      const scaleX = availableWidth / contentWidth
      const scaleY = availableHeight / contentHeight
      const scale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond 100%

      // Apply a small margin (3%) to ensure content isn't touching edges
      const scaleWithMargin = Math.max(0.1, scale * 0.97) // Ensure minimum scale

      setAutoScale(scaleWithMargin)
      retryCount = 0 // Reset retry count on success
    }

    const debouncedCalculate = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(calculateAutoScale, 100)
    }

    // Calculate immediately and also after delays to ensure DOM is ready
    calculateAutoScale()
    setTimeout(calculateAutoScale, 100)
    setTimeout(calculateAutoScale, 300)
    setTimeout(calculateAutoScale, 500)

    // Use ResizeObserver to recalculate when container or content size changes
    const resizeObserver = new ResizeObserver(() => {
      retryCount = 0 // Reset retry count on resize
      debouncedCalculate()
    })

    const container = previewContainerRef.current
    const content = previewRef.current

    if (container) {
      resizeObserver.observe(container)
    }
    if (content) {
      resizeObserver.observe(content)
    }

    // Also recalculate on window resize
    window.addEventListener('resize', debouncedCalculate)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', debouncedCalculate)
    }
  }, [resume, template, order, user])

  const handleLogin = async ({ username, password }) => {
    const res = loginUser(username, password)
    if (res.success) {
      setUser({ username })
      toast.success(`Welcome back, ${username}!`)
    }
    return res
  }

  const handleRegister = async ({ username, password }) => {
    const res = registerUser(username, password)
    if (res.success) {
      setUser({ username })
      setResumes(loadResumes(username))
      toast.success('Account created with demo resume ready.')
    }
    return res
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setResume(createEmptyResume())
    setResumes([])
    toast('Logged out')
  }

  const handleSave = (name) => {
    if (!user?.username) return
    const record = saveResume(user.username, name, resume)
    setResumes(loadResumes(user.username))
    toast.success(`Saved as “${record.name}”`)
  }

  const handleDelete = (id) => {
    if (!user?.username) return
    deleteResume(user.username, id)
    setResumes(loadResumes(user.username))
    toast.success('Deleted')
  }

  const handleLoad = (record) => {
    setResume(record.data)
    toast.success(`Loaded “${record.name}”`)
  }

  const exportPdf = async () => {
    if (!previewRef.current) return
    try {
      await exportToPDF(previewRef.current, 'resume.pdf')
      toast.success('Exported!')
    } catch (error) {
      toast.error('Something went wrong')
      console.error('PDF export error:', error)
    }
  }

  const moveSection = (idx, direction) => {
    const target = idx + direction
    if (target < 0 || target >= order.length) return
    const next = [...order]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setOrder(next)
  }

  const howItWorks = useMemo(
    () => [
      'Register or log in (stored locally).',
      'Fill the editor on the left; preview updates live.',
      'Save versions by name, export to PDF, or download JSON.',
    ],
    []
  )

  if (!user) {
    return (
      <>
        <LoginRegister
          onLogin={handleLogin}
          onRegister={handleRegister}
          demoCredentials={demoCredentials}
        />
        <Toaster position="bottom-right" />
      </>
    )
  }

  return (
    <div className="min-h-screen">
      <Toaster position="bottom-right" />
      <header className="sticky top-0 z-20" style={{
        background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.85) 0%, rgba(241, 245, 249, 0.80) 100%)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(203, 213, 225, 0.3)',
        boxShadow: '0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 1px 3px rgba(15, 23, 42, 0.05), 0 4px 16px rgba(15, 23, 42, 0.06)'
      }}>
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 py-2 sm:py-3.5">
          <div className="flex items-center justify-between relative flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all duration-300" style={{
                background: 'rgba(34, 197, 94, 0.06)',
                border: '1px solid rgba(34, 197, 94, 0.12)'
              }}>
                <div className="relative">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500" style={{
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }} />
                </div>
                <span className="text-[10px] sm:text-xs text-green-700 font-medium tracking-wide hidden xs:inline">Autosaved</span>
              </div>
            </div>
            
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold tracking-wide text-center" style={{
                letterSpacing: '0.05em',
                position: 'relative',
                zIndex: 10,
                whiteSpace: 'nowrap'
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: '#3b82f6',
                  display: 'inline-block'
                }}>RESU</span>
                <span style={{ color: '#000000' }} className="ml-1">CRAFT</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 sm:flex-1 justify-end min-w-0">
              <button 
                className="text-xs sm:text-sm px-3 sm:px-5 py-1.5 sm:py-2.5 font-semibold rounded-xl transition-all duration-300 ease-out whitespace-nowrap" 
                onClick={exportPdf}
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)',
                  color: 'white',
                  border: '1px solid rgba(22, 163, 74, 0.2)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%)'
                  e.currentTarget.style.borderColor = 'rgba(22, 163, 74, 0.3)'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)'
                  e.currentTarget.style.borderColor = 'rgba(22, 163, 74, 0.2)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Download PDF
              </button>
              <button 
                className="text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2.5 font-medium rounded-xl transition-all duration-300 ease-out hidden sm:inline-flex items-center justify-center" 
                onClick={() => saveDraft(user.username, resume)}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#475569',
                  border: '1px solid rgba(203, 213, 225, 0.6)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
                  e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'
                  e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.6)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Save draft
              </button>
              <button 
                className="text-xs sm:text-sm px-2.5 sm:px-4 py-1.5 sm:py-2.5 font-medium rounded-xl transition-all duration-300 ease-out hidden sm:inline-flex items-center justify-center" 
                onClick={handleLogout}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#475569',
                  border: '1px solid rgba(203, 213, 225, 0.6)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
                  e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 1)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'
                  e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.6)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-8 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(22, 163, 74, 0.03) 0%, transparent 50%)'
        }} />
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 sm:gap-6 lg:gap-8 items-start relative z-10">
          <section className="space-y-4 sm:space-y-5 lg:sticky lg:top-[4.5rem] self-start lg:max-h-[calc(100vh-5.5rem)] overflow-y-auto overflow-x-hidden pr-0 sm:pr-3 custom-scrollbar">
            <div className="section-card" style={{
              background: 'linear-gradient(135deg, rgba(220, 252, 231, 0.9) 0%, rgba(187, 247, 208, 0.85) 50%, rgba(134, 239, 172, 0.7) 100%)',
              borderColor: 'rgba(74, 222, 128, 0.3)',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.12), 0 1px 4px rgba(34, 197, 94, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.7) inset'
            }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight" style={{ color: '#1e293b' }}>Resume Completeness</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Fill all sections for best results</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold tracking-tight" style={{ color: '#1e293b' }}>{calculateCompleteness(resume)}%</div>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden shadow-inner" style={{ background: 'rgba(203, 213, 225, 0.3)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${calculateCompleteness(resume)}%`,
                    background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    animation: 'progress-glow 3s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <TemplateSelector value={template} onChange={setTemplate} />
              <div className="section-card">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold tracking-tight" style={{ color: '#1e293b' }}>Section order</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Reorder sections to customize resume flow.</p>
                </div>
                <div className="space-y-2">
                  {order.map((item, idx) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-lg border border-slate-200/50 px-3 py-2.5 transition-all duration-200"
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
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-300 text-sm select-none" title="Drag handle">⋮⋮</span>
                        <span className="capitalize font-medium text-sm text-slate-800 tracking-tight">{item}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="btn-secondary text-xs px-1.5 py-1 h-7 w-7 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() => moveSection(idx, -1)}
                          disabled={idx === 0}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="btn-secondary text-xs px-1.5 py-1 h-7 w-7 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() => moveSection(idx, 1)}
                          disabled={idx === order.length - 1}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <ResumeForm data={resume} onChange={setResume} />

            <div className="section-card">
              <SavedResumes
                resumes={resumes}
                onSave={handleSave}
                onLoad={handleLoad}
                onDelete={handleDelete}
                onExportJson={(record) => {
                  const blob = new Blob([JSON.stringify(record.data, null, 2)], {
                    type: 'application/json',
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${record.name}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              />
            </div>
          </section>

          <section className="sticky-preview-section lg:sticky lg:top-[4.5rem] self-start w-full" style={{
            maxHeight: 'calc(100vh - 5.5rem)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="section-card flex flex-col w-full" style={{
              maxHeight: 'calc(100vh - 5.5rem)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: '0.75rem'
            }}>
              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-200/50 flex-shrink-0">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight" style={{ color: '#1e293b' }}>Live preview</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      disabled={currentZoomIndex === 0}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all duration-200 text-slate-600 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        borderColor: 'rgba(226, 232, 240, 0.6)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)'
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.08)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.6)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)'
                      }}
                      title="Zoom Out (Ctrl + -)"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={handleZoomReset}
                      className="px-2.5 h-7 flex items-center justify-center rounded-lg border transition-all duration-200 text-slate-700 text-xs font-medium"
                      style={{
                        borderColor: 'rgba(226, 232, 240, 0.6)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.6)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)'
                      }}
                      title="Reset Zoom (Ctrl + 0)"
                    >
                      {zoom}%
                    </button>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      disabled={currentZoomIndex === zoomLevels.length - 1}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all duration-200 text-slate-600 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        borderColor: 'rgba(226, 232, 240, 0.6)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)'
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.08)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.6)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.04)'
                      }}
                      title="Zoom In (Ctrl + +)"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs mt-1" style={{ color: '#64748b' }}>Changes update instantly as you type.</p>
              </div>
              <div
                ref={previewContainerRef}
                className="preview-container rounded-xl p-2 sm:p-4 border flex-1"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.6) 0%, rgba(226, 232, 240, 0.5) 100%)',
                  borderColor: 'rgba(203, 213, 225, 0.4)',
                  boxShadow: 'inset 0 2px 8px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.3) inset',
                  minHeight: 0,
                  maxWidth: '100%',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'auto',
                  overflowX: 'hidden'
                }}
                onDoubleClick={handleZoomReset}
                title="Double-click to reset zoom"
              >
                <div
                  className="preview-content"
                  style={{
                    transform: `scale(${(zoom / 100) * autoScale})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: 'fit-content',
                    height: 'fit-content',
                    margin: '1rem auto 0 auto',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }}
                >
                  <div ref={previewRef} style={{ display: 'block', margin: '0 auto' }}>
                    <ResumePreview data={resume} template={template} order={order} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App

