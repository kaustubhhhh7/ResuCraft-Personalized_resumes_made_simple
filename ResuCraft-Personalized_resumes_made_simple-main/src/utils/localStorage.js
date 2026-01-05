const USERS_KEY = 'rb_users'
const SESSION_KEY = 'rb_current_user'

const DRAFT_KEY = (username) => `rb_draft_${username}`
const RESUME_KEY = (username) => `rb_resumes_${username}`

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`

const readJSON = (key, fallback) => {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const writeJSON = (key, value) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export const demoCredentials = { username: 'demo', password: 'demo123' }

export const createEmptyResume = () => ({
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
  },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  photo: '',
})

const demoResume = {
  personal: {
    fullName: 'Alex Morgan',
    title: 'Senior Frontend Engineer',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Remote · PST',
    website: 'alexm.dev',
  },
  summary:
    'Frontend engineer with a focus on design systems and performant, accessible UIs. Led multiple product redesigns and mentored small teams.',
  skills: [
    'React',
    'TypeScript',
    'Vite',
    'Tailwind',
    'Accessibility',
    'Testing Library',
    'GraphQL',
    'Storybook',
  ],
  experience: [
    {
      id: uid(),
      company: 'Acme Corp',
      role: 'Lead Frontend Engineer',
      start: '2021',
      end: 'Present',
      description:
        'Led migration to a design system, improved Lighthouse score from 72 to 96, and reduced bundle size by 35%.',
    },
    {
      id: uid(),
      company: 'Pixel Labs',
      role: 'Senior UI Engineer',
      start: '2018',
      end: '2021',
      description:
        'Built reusable React components, established testing practices, and collaborated closely with design to ship new pricing experience.',
    },
  ],
  education: [
    {
      id: uid(),
      school: 'State University',
      degree: 'B.S. Computer Science',
      start: '2013',
      end: '2017',
      details: 'Graduated magna cum laude. Human-Computer Interaction focus.',
    },
  ],
  projects: [
    {
      id: uid(),
      name: 'Design System Kit',
      link: 'github.com/alex/dskit',
      description: 'Composable React component library with theming support.',
    },
    {
      id: uid(),
      name: 'Remote Board',
      link: 'remoteboard.app',
      description: 'Real-time whiteboard for remote teams, 5k+ active users.',
    },
  ],
  photo: '',
}

export const seedDemoUser = () => {
  const users = readJSON(USERS_KEY, [])
  const hasDemo = users.some((u) => u.username === demoCredentials.username)
  if (!hasDemo) {
    users.push(demoCredentials)
    writeJSON(USERS_KEY, users)
    writeJSON(RESUME_KEY(demoCredentials.username), [
      {
        id: uid(),
        name: 'Demo Resume',
        data: demoResume,
        updatedAt: new Date().toISOString(),
      },
    ])
  }
}

export const getCurrentUser = () => readJSON(SESSION_KEY, null)

export const setCurrentUser = (user) => writeJSON(SESSION_KEY, user)

export const registerUser = (username, password) => {
  // Validation
  if (!username || !username.trim()) {
    return { success: false, message: 'Username is required' }
  }
  
  if (!password || password.length < 4) {
    return { success: false, message: 'Password must be at least 4 characters' }
  }
  
  const trimmedUsername = username.trim()
  
  // Check for invalid characters
  if (trimmedUsername.length < 3) {
    return { success: false, message: 'Username must be at least 3 characters' }
  }
  
  const users = readJSON(USERS_KEY, [])
  const exists = users.some((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase())
  if (exists) {
    return { success: false, message: 'Username already exists' }
  }
  
  const newUser = { username: trimmedUsername, password }
  users.push(newUser)
  writeJSON(USERS_KEY, users)
  setCurrentUser({ username: trimmedUsername })
  
  // Create initial resume for new user
  const baseResume = { ...createEmptyResume(), ...demoResume }
  writeJSON(RESUME_KEY(trimmedUsername), [
    {
      id: uid(),
      name: 'Example Resume',
      data: baseResume,
      updatedAt: new Date().toISOString(),
    },
  ])
  
  return { success: true }
}

export const loginUser = (username, password) => {
  // Validation
  if (!username || !username.trim()) {
    return { success: false, message: 'Username is required' }
  }
  
  if (!password) {
    return { success: false, message: 'Password is required' }
  }
  
  const trimmedUsername = username.trim()
  const users = readJSON(USERS_KEY, [])
  
  // Case-insensitive username matching
  const match = users.find(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase() && u.password === password
  )
  
  if (match) {
    setCurrentUser({ username: match.username }) // Use stored username to preserve casing
    return { success: true }
  }
  
  return { success: false, message: 'Invalid username or password' }
}

export const logoutUser = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export const loadResumes = (username) => readJSON(RESUME_KEY(username), [])

export const saveResume = (username, name, data) => {
  const resumes = loadResumes(username)
  const existing = resumes.find((r) => r.name === name)
  const record = {
    id: existing?.id ?? uid(),
    name,
    data,
    updatedAt: new Date().toISOString(),
  }
  const next = existing
    ? resumes.map((r) => (r.id === existing.id ? record : r))
    : [...resumes, record]
  writeJSON(RESUME_KEY(username), next)
  return record
}

export const deleteResume = (username, id) => {
  const resumes = loadResumes(username).filter((r) => r.id !== id)
  writeJSON(RESUME_KEY(username), resumes)
}

export const saveDraft = (username, data) => writeJSON(DRAFT_KEY(username), data)

export const loadDraft = (username) => readJSON(DRAFT_KEY(username), null)

