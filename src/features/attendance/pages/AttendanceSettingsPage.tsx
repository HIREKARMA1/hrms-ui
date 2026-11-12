import { Fingerprint, MapPin, Plus, QrCode, RefreshCw, Save, Trash2, Wifi } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ToastBanner, useToast } from '@/hooks/useToast'

export function AttendanceSettingsPage() {
  const { message, toast } = useToast()

  const [gpsEnabled, setGpsEnabled] = useState(true)
  const [officeLocation, setOfficeLocation] = useState('Tower A, Hitech City, Hyderabad')
  const [gpsRadius, setGpsRadius] = useState('150')

  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(true)
  const [ipList, setIpList] = useState(['192.168.10.1', '203.0.113.42'])
  const [newIp, setNewIp] = useState('')

  const [biometricDevice, setBiometricDevice] = useState('ZKTeco MB360')
  const [lastSync, setLastSync] = useState('12 Nov 2026, 09:15 AM')

  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(false)
  const [faceStatus] = useState('Camera module not configured (UI preview).')

  const [qrValidityMinutes, setQrValidityMinutes] = useState('15')

  const [geofenceLocation, setGeofenceLocation] = useState('Main campus — Block B')
  const [geofenceRadius, setGeofenceRadius] = useState('200')
  const [geofenceRestrict, setGeofenceRestrict] = useState(true)

  const addIp = () => {
    const trimmed = newIp.trim()
    if (!trimmed) return
    if (ipList.includes(trimmed)) {
      toast('IP address already in the list.')
      return
    }
    setIpList((prev) => [...prev, trimmed])
    setNewIp('')
  }

  const removeIp = (ip: string) => {
    setIpList((prev) => prev.filter((item) => item !== ip))
  }

  const handleSync = () => {
    const now = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    setLastSync(now)
    toast('Biometric sync simulated (UI preview only).')
  }

  const handleGenerateQr = () => {
    toast(`QR code generated — valid for ${qrValidityMinutes} minutes (UI preview).`)
  }

  const handleSaveSettings = () => {
    toast('Settings saved (UI preview only). No hardware integrations connected.')
  }

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
      <ToastBanner message={message} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Attendance Settings</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Configure capture methods and restrictions. All controls are local UI state.
          </p>
        </div>
        <Button type="button" className="gap-2 self-start" onClick={handleSaveSettings}>
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy">
            <MapPin className="h-4 w-4 text-brand-500" />
            A) GPS-Based Attendance
          </CardTitle>
          <CardDescription>Require check-in within a geofenced office radius.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-app-bg px-4 py-3">
            <Label htmlFor="gps-enabled" className="font-medium text-navy">
              Enable GPS attendance
            </Label>
            <Switch id="gps-enabled" checked={gpsEnabled} onCheckedChange={setGpsEnabled} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="office-location">Office location</Label>
              <Input
                id="office-location"
                value={officeLocation}
                onChange={(e) => setOfficeLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gps-radius">Radius (meters)</Label>
              <Input
                id="gps-radius"
                type="number"
                min={0}
                value={gpsRadius}
                onChange={(e) => setGpsRadius(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy">
            <Wifi className="h-4 w-4 text-brand-500" />
            B) IP-Based Restrictions
          </CardTitle>
          <CardDescription>Allow web check-in only from approved networks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-app-bg px-4 py-3">
            <Label htmlFor="ip-enabled" className="font-medium text-navy">
              Enable IP restrictions
            </Label>
            <Switch
              id="ip-enabled"
              checked={ipRestrictionEnabled}
              onCheckedChange={setIpRestrictionEnabled}
            />
          </div>
          <ul className="space-y-2">
            {ipList.map((ip) => (
              <li
                key={ip}
                className="flex items-center justify-between rounded-xl border border-border-soft px-3 py-2"
              >
                <span className="font-mono text-sm text-navy">{ip}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => removeIp(ip)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Add IP address"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addIp()
              }}
            />
            <Button type="button" variant="outline" className="gap-2 shrink-0" onClick={addIp}>
              <Plus className="h-4 w-4" />
              Add IP
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy">
            <Fingerprint className="h-4 w-4 text-brand-500" />
            C) Biometric Integration
          </CardTitle>
          <CardDescription>Device connection status and manual sync.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="biometric-device">Device name</Label>
            <Input
              id="biometric-device"
              value={biometricDevice}
              onChange={(e) => setBiometricDevice(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-text-secondary">Connection status</span>
            <Badge variant="success">Connected</Badge>
          </div>
          <p className="text-sm text-text-secondary">
            Last sync: <span className="font-medium text-navy">{lastSync}</span>
          </p>
          <Button type="button" variant="outline" className="gap-2" onClick={handleSync}>
            <RefreshCw className="h-4 w-4" />
            Sync Now
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="text-navy">D) Face Recognition</CardTitle>
          <CardDescription>Toggle facial capture for kiosk attendance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-app-bg px-4 py-3">
            <Label htmlFor="face-enabled" className="font-medium text-navy">
              Enable face recognition
            </Label>
            <Switch
              id="face-enabled"
              checked={faceRecognitionEnabled}
              onCheckedChange={setFaceRecognitionEnabled}
            />
          </div>
          <p className="text-sm text-text-secondary">{faceStatus}</p>
        </CardContent>
      </Card>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy">
            <QrCode className="h-4 w-4 text-brand-500" />
            E) QR Code Attendance
          </CardTitle>
          <CardDescription>Generate time-bound QR codes for mobile check-in.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2 sm:flex-1">
            <Label htmlFor="qr-validity">Validity (minutes)</Label>
            <Input
              id="qr-validity"
              type="number"
              min={1}
              value={qrValidityMinutes}
              onChange={(e) => setQrValidityMinutes(e.target.value)}
            />
          </div>
          <Button type="button" className="gap-2" onClick={handleGenerateQr}>
            <QrCode className="h-4 w-4" />
            Generate QR
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle className="text-navy">F) Geofencing</CardTitle>
          <CardDescription>Additional location boundary for field staff.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="geofence-location">Location</Label>
              <Input
                id="geofence-location"
                value={geofenceLocation}
                onChange={(e) => setGeofenceLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geofence-radius">Radius (meters)</Label>
              <Input
                id="geofence-radius"
                type="number"
                min={0}
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border-soft bg-app-bg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-navy">Restrict check-in outside fence</p>
              <p className="text-xs text-text-secondary">
                Block punches when GPS coordinates fall outside the radius.
              </p>
            </div>
            <Switch checked={geofenceRestrict} onCheckedChange={setGeofenceRestrict} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AttendanceSettingsPage
