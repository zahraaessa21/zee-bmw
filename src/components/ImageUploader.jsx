// ============================================================
// components/ImageUploader.jsx — Photo Upload Component
// ============================================================
// Supports TWO ways to add photos:
//   1. Upload from laptop (local file) → uploads to Supabase Storage
//   2. Paste online URL → saved directly
//
// Shows preview thumbnails for all photos.
// First photo = main photo (image_url).
// Extra photos = stored in photos[] array.
//
// SETUP REQUIRED in Supabase:
//   1. Go to Storage → Create bucket named "car-images"
//   2. Set bucket to PUBLIC
//   3. Run this SQL policy:
//      CREATE POLICY "Public upload" ON storage.objects
//        FOR INSERT WITH CHECK (bucket_id = 'car-images');
//      CREATE POLICY "Public read" ON storage.objects
//        FOR SELECT USING (bucket_id = 'car-images');
// ============================================================

import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function ImageUploader({ photos, onChange }) {
  // photos = array of URLs (first = main photo)
  // onChange(newPhotos) = called when photos change

  const [urlInput,    setUrlInput]    = useState('')
  const [uploading,   setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  // ── Upload file from laptop to Supabase Storage ───────── 
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setUploading(true)
    setUploadError('')

    const newUrls = []

    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setUploadError(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setUploadError(`${file.name} is too large (max 5MB)`)
          continue
        }

        // Create unique filename: timestamp_originalname
        const ext      = file.name.split('.').pop()
        const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const path     = `cars/${filename}`

        // Upload to Supabase Storage bucket "car-images"
        const { error: uploadError } = await supabase.storage
          .from('car-images')
          .upload(path, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        // Get the public URL of the uploaded file
        const { data } = supabase.storage
          .from('car-images')
          .getPublicUrl(path)

        newUrls.push(data.publicUrl)
      } catch (err) {
        console.error('Upload error:', err)
        setUploadError('Upload failed: ' + err.message + '. Make sure "car-images" bucket exists in Supabase Storage.')
      }
    }

    if (newUrls.length > 0) {
      onChange([...photos, ...newUrls])
    }

    setUploading(false)
    // Reset file input so same file can be uploaded again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Add photo via URL ─────────────────────────────────── 
  const handleAddUrl = () => {
    const url = urlInput.trim()
    if (!url) return

    // Basic URL validation
    if (!url.startsWith('http')) {
      setUploadError('Please enter a valid URL starting with http')
      return
    }

    setUploadError('')
    onChange([...photos, url])
    setUrlInput('')
  }

  // ── Remove a photo ────────────────────────────────────── 
  const handleRemove = (index) => {
    const updated = photos.filter((_, i) => i !== index)
    onChange(updated)
  }

  // ── Move photo to first position (make it main photo) ─── 
  const handleSetMain = (index) => {
    if (index === 0) return
    const updated = [...photos]
    const [moved] = updated.splice(index, 1)
    updated.unshift(moved)
    onChange(updated)
  }

  return (
    <div>
      <label style={{
        fontFamily: 'JetBrains Mono', fontSize: '10px',
        letterSpacing: '0.1em', color: '#888',
        textTransform: 'uppercase', display: 'block', marginBottom: '12px',
      }}>
        Vehicle Photos
        <span style={{ color: '#666', fontWeight: 400, marginLeft: '8px' }}>
          (first photo = main display photo)
        </span>
      </label>

      {/* ── Photo previews grid ──────────────────────────── */}
      {photos.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '10px',
          marginBottom: '16px',
        }}>
          {photos.map((url, index) => (
            <div key={index} style={{ position: 'relative', group: true }}>
              {/* Photo thumbnail */}
              <div style={{
                aspectRatio: '16/10',
                borderRadius: '4px',
                overflow: 'hidden',
                border: index === 0
                  ? '2px solid #a1c9ff'      // Main photo = blue border
                  : '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
              }}>
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                {/* Error fallback */}
                <div style={{
                  display: 'none', position: 'absolute', inset: 0,
                  background: '#1f2020', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', color: '#888', fontFamily: 'JetBrains Mono',
                }}>
                  NO IMAGE
                </div>

                {/* Main badge */}
                {index === 0 && (
                  <div style={{
                    position: 'absolute', top: '4px', left: '4px',
                    background: '#a1c9ff', color: '#00325a',
                    fontFamily: 'JetBrains Mono', fontSize: '9px',
                    fontWeight: 700, padding: '2px 6px', borderRadius: '2px',
                    letterSpacing: '0.05em',
                  }}>
                    MAIN
                  </div>
                )}
              </div>

              {/* Action buttons below thumbnail */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {/* Set as main */}
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(index)}
                    title="Set as main photo"
                    style={{
                      flex: 1, padding: '4px',
                      background: 'rgba(161,201,255,0.1)',
                      border: '1px solid rgba(161,201,255,0.25)',
                      borderRadius: '2px', cursor: 'pointer',
                      color: '#a1c9ff', fontSize: '11px',
                      fontFamily: 'JetBrains Mono', letterSpacing: '0.04em',
                    }}
                  >
                    ★ MAIN
                  </button>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  title="Remove photo"
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(255,100,100,0.1)',
                    border: '1px solid rgba(255,100,100,0.25)',
                    borderRadius: '2px', cursor: 'pointer',
                    color: '#ff8080',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Two upload methods ───────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>

        {/* METHOD 1: Upload from laptop */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: '2px dashed rgba(161,201,255,0.25)',
            borderRadius: '6px',
            padding: '20px',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'all 0.2s',
            background: 'rgba(161,201,255,0.03)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(161,201,255,0.5)'
            e.currentTarget.style.background  = 'rgba(161,201,255,0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(161,201,255,0.25)'
            e.currentTarget.style.background  = 'rgba(161,201,255,0.03)'
          }}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {uploading ? (
            <>
              <div style={{ marginBottom: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1c9ff" strokeWidth="2"
                  style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto', display: 'block' }}>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </svg>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#a1c9ff', letterSpacing: '0.06em' }}>
                UPLOADING...
              </span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined icon-filled"
                style={{ fontSize: '32px', color: '#a1c9ff', display: 'block', marginBottom: '8px' }}>
                upload
              </span>
              <div style={{ fontFamily: 'Montserrat', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                Upload from Laptop
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
                Click to browse files<br />
                JPG, PNG, WEBP — max 5MB each
              </div>
            </>
          )}
        </div>

        {/* METHOD 2: Paste online URL */}
        <div style={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px',
          padding: '20px',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '10px',
        }}>
          <div style={{ fontFamily: 'Montserrat', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#a1c9ff', verticalAlign: 'middle', marginRight: '6px' }}>
              link
            </span>
            Paste Online URL
          </div>

          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
            placeholder="https://example.com/car.jpg"
            className="input-ghost"
            style={{ padding: '10px 12px', fontSize: '13px' }}
          />

          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            style={{
              padding: '10px',
              background: urlInput.trim() ? '#a1c9ff' : 'rgba(255,255,255,0.05)',
              color: urlInput.trim() ? '#00325a' : '#888',
              border: 'none', borderRadius: '4px',
              fontFamily: 'JetBrains Mono', fontSize: '11px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: urlInput.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 700, transition: 'all 0.2s',
            }}
          >
            ADD PHOTO
          </button>
        </div>
      </div>

      {/* Error message */}
      {uploadError && (
        <div style={{
          marginTop: '10px',
          padding: '10px 14px',
          background: 'rgba(255,100,100,0.1)',
          border: '1px solid rgba(255,100,100,0.3)',
          borderRadius: '4px',
          fontFamily: 'Inter', fontSize: '13px', color: '#ff8080',
        }}>
          ⚠ {uploadError}
        </div>
      )}

      {/* Photo count info */}
      {photos.length > 0 && (
        <div style={{
          marginTop: '10px',
          fontFamily: 'JetBrains Mono', fontSize: '10px',
          color: '#666', letterSpacing: '0.06em',
        }}>
          {photos.length} PHOTO{photos.length !== 1 ? 'S' : ''} ADDED
          {photos.length > 0 && ' · FIRST PHOTO IS SHOWN IN FLEET GRID'}
        </div>
      )}
    </div>
  )
}
