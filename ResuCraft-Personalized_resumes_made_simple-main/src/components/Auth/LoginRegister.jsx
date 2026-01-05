import { useEffect, useRef, useState } from 'react'

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', reject)
      if (existing.dataset.loaded) resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = reject
    document.body.appendChild(script)
  })

const LoginRegister = ({ onLogin, onRegister, demoCredentials }) => {
  const resuTarget = 'RESU'
  const craftTarget = 'CRAFT'

  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '' })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [typedResu, setTypedResu] = useState(resuTarget)
  const [typedCraft, setTypedCraft] = useState('')
  const [phase, setPhase] = useState('craftType') // craftType -> craftDelete (loop)
  const pageRef = useRef(null)
  const backgroundRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    
    // Validation
    const trimmedUsername = form.username.trim()
    const trimmedPassword = form.password.trim()
    
    if (!trimmedUsername) {
      setMessage('Username is required')
      return
    }
    
    if (!trimmedPassword) {
      setMessage('Password is required')
      return
    }
    
    if (trimmedPassword.length < 4) {
      setMessage('Password must be at least 4 characters')
      return
    }
    
    setIsLoading(true)
    
    try {
      const credentials = { username: trimmedUsername, password: trimmedPassword }
      let result
      
      if (mode === 'login') {
        result = await onLogin(credentials)
      } else {
        result = await onRegister(credentials)
      }
      
      if (result?.success) {
        // Clear form on success
        setForm({ username: '', password: '' })
        setMessage('')
      } else {
        setMessage(result?.message || (mode === 'login' ? 'Could not sign in' : 'Could not register'))
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setMessage('')
    setForm({ username: '', password: '' })
  }

  const useDemo = () =>
    setForm({ username: demoCredentials.username, password: demoCredentials.password })

  // Type then backspace the CRAFT word on a loop
  useEffect(() => {
    let id
    if (phase === 'craftType') {
      id = setInterval(() => {
        setTypedCraft((prev) => {
          const next = craftTarget.slice(0, prev.length + 1)
          if (next.length === craftTarget.length) {
            clearInterval(id)
            // pause full word before deleting
            setTimeout(() => setPhase('craftDelete'), 900)
          }
          return next
        })
      }, 120)
    }
    return () => clearInterval(id)
  }, [phase, craftTarget])

  useEffect(() => {
    let id
    if (phase === 'craftDelete') {
      id = setInterval(() => {
        setTypedCraft((prev) => {
          const next = prev.slice(0, -1)
          if (next.length === 0) {
            clearInterval(id)
            // pause empty before typing again
            setTimeout(() => setPhase('craftType'), 400)
          }
          return next
        })
      }, 80)
    }
    return () => clearInterval(id)
  }, [phase])

  // Vanta WAVES background on the full page
  useEffect(() => {
    let vantaEffect

    const initVanta = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js')
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js')

        if (window.VANTA && backgroundRef.current) {
          vantaEffect = window.VANTA.WAVES({
            el: backgroundRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00
          })
        }
      } catch (err) {
        console.error('Failed to load Vanta', err)
      }
    }

    initVanta()

    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [])

  const Cursor = ({ color = '#fff' }) => (
    <span
      className="inline-block align-middle ml-1 cursor-fade"
      style={{ width: '0.12em', height: '1em', backgroundColor: color, borderRadius: '1px' }}
    />
  )

  return (
    <div ref={pageRef} className="relative min-h-screen bg-slate-900">
      {/* Vanta WAVES background - full page */}
      <div ref={backgroundRef} className="absolute inset-0 z-0" />
      
      {/* Fade overlay only on left side */}
      <div className="pointer-events-none absolute inset-y-0 left-0 lg:w-1/2 bg-gradient-to-br from-slate-900/85 via-slate-900/60 to-slate-900/75 z-10" />
      
      <div className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 py-12 z-10">
        {/* Left side content */}
        <div className="relative w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-20 xl:px-28 space-y-10 text-white mb-12 lg:mb-0">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.6em] text-slate-300/75 font-semibold">Author - Kaustubh Ghadshi</p>
            <div className="mt-8 leading-[0.82]">
              <span className="block text-5xl sm:text-7xl lg:text-8xl xl:text-[8rem] font-black text-white mb-0 lg:mb-0" style={{ letterSpacing: '0.01em', textShadow: '0 6px 40px rgba(0, 0, 0, 0.5)' }}>
                {typedResu || resuTarget}
              </span>
              <span className="block text-8xl sm:text-9xl lg:text-[10.5rem] xl:text-[12rem] font-black text-white" style={{ letterSpacing: '0.01em', textShadow: '0 6px 40px rgba(0, 0, 0, 0.5)' }}>
                {typedCraft || ' '}
                <Cursor color="#fff" />
              </span>
            </div>
            <p className="max-w-xl text-base text-slate-200/90 leading-relaxed font-normal tracking-normal" style={{ lineHeight: '1.75', letterSpacing: '0.01em' }}>
              Create, preview, and export a polished resume. Everything stays private in your browser.
            </p>
          </div>
        </div>

        {/* Login Form - Right Side */}
        <div className="relative w-full lg:w-1/2 flex items-center justify-center">
          <div className="relative w-full max-w-md z-10">
            {/* White Login Card */}
          <div 
            className="relative bg-white rounded-2xl p-10 shadow-xl"
            style={{
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 
                className="text-4xl font-bold mb-2"
                style={{ color: '#1e40af' }}
              >
                HELLO!
              </h1>
            </div>

            {/* Toggle Tabs */}
            <div className="flex justify-center mb-6">
              <div className="relative grid grid-cols-2 bg-gray-100 rounded-full p-1 w-64">
                {/* Sliding pill indicator */}
                <div
                  className="absolute top-1 bottom-1 rounded-full transition-transform duration-300 ease-out"
                  style={{
                    width: 'calc(50% - 4px)',
                    left: '4px',
                    transform: mode === 'login' ? 'translateX(0)' : 'translateX(calc(100% + 4px))',
                    background: '#1e40af'
                  }}
                />
                {['login', 'register'].map((item) => (
                  <button
                    key={item}
                    className={`relative z-10 w-full px-4 py-2 rounded-full text-xs font-medium transition-colors duration-300 ${
                      mode === item
                        ? 'text-white'
                        : 'text-gray-500 bg-transparent hover:text-gray-700'
                    }`}
                    onClick={() => handleModeChange(item)}
                    type="button"
                    disabled={isLoading}
                  >
                    {item === 'login' ? 'Login' : 'Register'}
                  </button>
                ))}
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email/Username Input */}
              <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-3">
                <span className="text-gray-400 text-lg">👤</span>
                <input
                  className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none"
                  id="username"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Username"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-3">
                <span className="text-gray-400 text-lg">🔒</span>
                <input
                  className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none"
                  id="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="password"
                  minLength={4}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    style={{ accentColor: '#1e40af' }}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span style={{ color: 'rgba(100, 116, 139, 0.8)' }}>Remember me</span>
                </label>
              </div>

              {message && (
                <p className="text-xs text-red-600 font-medium">{message}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 rounded-lg text-white font-semibold text-sm py-3.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isLoading ? '#94a3b8' : '#1e40af'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#1e3a8a'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#1e40af'
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <span className="text-lg">→</span>
                  </>
                )}
              </button>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginRegister

