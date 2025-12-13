import { useRef } from 'react'

const PhotoUpload = ({ value, onChange }) => {
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => onChange(reader.result.toString())
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">Profile photo</label>
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
          {value ? (
            <img src={value} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
              Add
            </div>
          )}
        </div>
        <div className="space-x-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => inputRef.current?.click()}
          >
            Upload
          </button>
          {value && (
            <button type="button" className="text-sm text-red-600" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PhotoUpload

