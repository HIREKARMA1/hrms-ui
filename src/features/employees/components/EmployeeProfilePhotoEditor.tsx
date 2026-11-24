import { Camera, RefreshCw, Trash2, Upload } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useUploadFileMutation } from '@/services/api/uploadsApi'

import {
  isEmployeePhotoUploadConfigured,
  uploadEmployeeProfilePhoto,
} from '../services/employeeApi'

const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp)$/i
const MAX_BYTES = 5 * 1024 * 1024

type EmployeeProfilePhotoEditorProps = {
  employeeId: string
  firstName: string
  lastName: string
  pictureName: string
  pictureUrl: string
  readOnly?: boolean
  onPhotoChange: (next: { name: string; url: string }) => void
}

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?'
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/**
 * Additive profile photo capture / upload UI for the existing Profile Picture field.
 */
export function EmployeeProfilePhotoEditor({
  employeeId,
  firstName,
  lastName,
  pictureName,
  pictureUrl,
  readOnly = false,
  onPhotoChange,
}: EmployeeProfilePhotoEditorProps) {
  const fileInputId = useId()
  const [triggerPhotoUpload] = useUploadFileMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [captureOpen, setCaptureOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const releaseCamera = useCallback(() => {
    stopStream(streamRef.current)
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraReady(false)
  }, [])

  useEffect(() => {
    if (!captureOpen) {
      releaseCamera()
      return
    }

    let cancelled = false
    setCameraError(null)
    setCapturedDataUrl(null)
    setCameraReady(false)

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          'Camera capture is not supported in this browser.',
        )
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })
        if (cancelled) {
          stopStream(stream)
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
        setCameraReady(true)
      } catch (error) {
        const name = error instanceof DOMException ? error.name : ''
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setCameraError(
            'Camera permission was denied. Allow camera access or use Upload Photo instead.',
          )
        } else if (
          name === 'NotFoundError' ||
          name === 'DevicesNotFoundError'
        ) {
          setCameraError('No camera was found on this device.')
        } else if (name === 'NotReadableError') {
          setCameraError(
            'Camera is unavailable because it is already in use by another application.',
          )
        } else {
          setCameraError('Unable to start the camera. Try Upload Photo instead.')
        }
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      releaseCamera()
    }
  }, [captureOpen, releaseCamera])

  const closeCapture = (open: boolean) => {
    if (!open) {
      releaseCamera()
      setCapturedDataUrl(null)
      setCameraError(null)
    }
    setCaptureOpen(open)
  }

  const captureFrame = () => {
    const video = videoRef.current
    if (!video || !cameraReady) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setCameraError('Could not capture a frame from the camera preview.')
      return
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    setCapturedDataUrl(canvas.toDataURL('image/jpeg', 0.92))
  }

  const persistPhoto = async (blob: Blob, fileName: string) => {
    setSaving(true)
    setStatusMessage(null)
    try {
      const result = await uploadEmployeeProfilePhoto(
        { employeeId, file: blob, fileName },
        (request) => triggerPhotoUpload(request).unwrap(),
      )

      if (result.ok) {
        onPhotoChange({ name: result.fileName, url: result.url })
        setStatusMessage('Profile photo updated successfully.')
        return true
      }

      // Local blob/data URLs cannot be stored as employee photoUrl — fail clearly.
      setStatusMessage(result.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const saveCaptured = async () => {
    if (!capturedDataUrl) return
    const blob = dataUrlToBlob(capturedDataUrl)
    const fileName = `capture-${employeeId || 'employee'}-${Date.now()}.jpg`
    const ok = await persistPhoto(blob, fileName)
    if (ok) closeCapture(false)
  }

  const validateAndSetUpload = (file: File | undefined) => {
    setUploadError(null)
    if (!file) return
    const typeOk =
      ACCEPTED_TYPES.has(file.type.toLowerCase()) ||
      ACCEPTED_EXTENSIONS.test(file.name)
    if (!typeOk) {
      setUploadError('Only JPG, JPEG, PNG and WEBP files are allowed.')
      setUploadFile(null)
      setUploadPreview(null)
      return
    }
    if (file.size > MAX_BYTES) {
      setUploadError('Image must be 5 MB or smaller.')
      setUploadFile(null)
      setUploadPreview(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setUploadFile(file)
      setUploadPreview(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.onerror = () => {
      setUploadError('Could not read the selected image.')
      setUploadFile(null)
      setUploadPreview(null)
    }
    reader.readAsDataURL(file)
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    validateAndSetUpload(event.target.files?.[0])
    event.target.value = ''
  }

  const closeUpload = (open: boolean) => {
    if (!open) {
      setUploadFile(null)
      setUploadPreview(null)
      setUploadError(null)
    }
    setUploadOpen(open)
  }

  const saveUpload = async () => {
    if (!uploadFile || !uploadPreview) return
    const ok = await persistPhoto(uploadFile, uploadFile.name)
    if (ok) closeUpload(false)
  }

  const clearPhoto = () => {
    onPhotoChange({ name: '', url: '' })
    setStatusMessage('Profile photo cleared locally. Server delete is not configured.')
  }

  const avatarFallback = initials(firstName, lastName)

  return (
    <div className="space-y-3">
      <Label>Profile Picture</Label>
      <div className="flex flex-wrap items-center gap-4">
        {readOnly ? (
          <Avatar className="h-20 w-20 border border-border-soft shadow-sm">
            {pictureUrl ? (
              <AvatarImage src={pictureUrl} alt="Employee profile" />
            ) : null}
            <AvatarFallback className="text-base">{avatarFallback}</AvatarFallback>
          </Avatar>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
                aria-label="Edit profile photo"
              >
                {saving ? (
                  <Skeleton className="h-20 w-20 rounded-full" />
                ) : (
                  <Avatar className="h-20 w-20 border border-border-soft shadow-sm">
                    {pictureUrl ? (
                      <AvatarImage src={pictureUrl} alt="Employee profile" />
                    ) : null}
                    <AvatarFallback className="text-base">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onSelect={() => {
                  setStatusMessage(null)
                  setCaptureOpen(true)
                }}
              >
                <Camera className="mr-2 h-4 w-4 text-brand-500" />
                Capture Photo
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setStatusMessage(null)
                  setUploadOpen(true)
                }}
              >
                <Upload className="mr-2 h-4 w-4 text-brand-500" />
                Upload Photo
              </DropdownMenuItem>
              {pictureUrl || pictureName ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={clearPhoto}>
                    <Trash2 className="mr-2 h-4 w-4 text-rose-600" />
                    Remove Photo
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="min-w-0 space-y-2">
          {!readOnly ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  Edit Photo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onSelect={() => {
                    setStatusMessage(null)
                    setCaptureOpen(true)
                  }}
                >
                  <Camera className="mr-2 h-4 w-4 text-brand-500" />
                  Capture Photo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setStatusMessage(null)
                    setUploadOpen(true)
                  }}
                >
                  <Upload className="mr-2 h-4 w-4 text-brand-500" />
                  Upload Photo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <p className="text-xs text-text-secondary">
            {pictureName
              ? `Current: ${pictureName}`
              : 'No photo selected — avatar initials are shown.'}
          </p>
          {isEmployeePhotoUploadConfigured() ? (
            <p className="text-xs text-text-secondary">
              Photos are uploaded to the shared folder <code>employees/photos</code>.
            </p>
          ) : (
            <p className="text-xs text-amber-700">
              Server upload is off: set VITE_EMPLOYEE_PHOTO_UPLOAD_ENABLED=true in
              .env and restart the Vite dev server.
            </p>
          )}
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {statusMessage}
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        id={fileInputId}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      <Dialog open={captureOpen} onOpenChange={closeCapture}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Capture Photo</DialogTitle>
            <DialogDescription>
              Allow camera access, capture a frame, then save. The stream stops
              when this dialog closes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {cameraError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {cameraError}
              </div>
            ) : null}

            {!capturedDataUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border-soft bg-navy/90">
                {!cameraReady && !cameraError ? (
                  <div className="flex h-64 items-center justify-center">
                    <Skeleton className="h-48 w-48 rounded-xl" />
                  </div>
                ) : null}
                <video
                  ref={videoRef}
                  className={cn(
                    'mx-auto max-h-72 w-full object-cover',
                    (!cameraReady || cameraError) && 'hidden',
                  )}
                  playsInline
                  muted
                  autoPlay
                />
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border-soft">
                <img
                  src={capturedDataUrl}
                  alt="Captured preview"
                  className="mx-auto max-h-72 w-full object-cover"
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {!capturedDataUrl ? (
                <Button
                  type="button"
                  onClick={captureFrame}
                  disabled={!cameraReady || Boolean(cameraError) || saving}
                >
                  <Camera className="h-4 w-4" />
                  Capture Photo
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCapturedDataUrl(null)}
                  disabled={saving}
                >
                  <RefreshCw className="h-4 w-4" />
                  Retake
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => closeCapture(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void saveCaptured()}
                disabled={!capturedDataUrl || saving}
              >
                {saving ? 'Saving…' : 'Save Photo'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={closeUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
            <DialogDescription>
              JPG, JPEG, PNG or WEBP · max 5 MB.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {uploadError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {uploadError}
              </div>
            ) : null}

            {uploadPreview ? (
              <div className="overflow-hidden rounded-2xl border border-border-soft">
                <img
                  src={uploadPreview}
                  alt="Upload preview"
                  className="mx-auto max-h-64 w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border-soft bg-muted-bg/40 text-sm text-text-secondary">
                No image selected
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
              >
                <Upload className="h-4 w-4" />
                {uploadFile ? 'Select another image' : 'Choose image'}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => closeUpload(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void saveUpload()}
              disabled={!uploadFile || !uploadPreview || saving}
            >
              {saving ? 'Saving…' : 'Save Photo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
