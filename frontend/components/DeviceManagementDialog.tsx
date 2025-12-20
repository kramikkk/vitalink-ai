"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { tokenManager } from "@/lib/api"
import { Loader2, Trash2, UserCircle, Smartphone, Calendar, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Device {
  id: number
  device_id: string
  owner_id: number | null
  owner_name?: string
  owner_email?: string
  status: string
  paired_at?: string
  last_seen?: string
}

interface DeviceManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeviceManagementDialog({ open, onOpenChange }: DeviceManagementDialogProps) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null)
  const [deleteDeviceDialogOpen, setDeleteDeviceDialogOpen] = useState(false)
  const [deviceToDeletePermanently, setDeviceToDeletePermanently] = useState<Device | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchDevices = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = tokenManager.getToken()
      const response = await fetch(`${API_BASE_URL}/api/devices/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch devices')
      }

      const data = await response.json()
      setDevices(data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch devices")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchDevices()
    }
  }, [open])

  const handleUnpairDevice = async (device: Device) => {
    setDeviceToDelete(device)
    setDeleteDialogOpen(true)
  }

  const confirmUnpair = async () => {
    if (!deviceToDelete) return

    try {
      const token = tokenManager.getToken()
      const response = await fetch(`${API_BASE_URL}/api/devices/${deviceToDelete.device_id}/unpair`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to unpair device')
      }

      // Refetch devices to get updated list
      await fetchDevices()
      setDeleteDialogOpen(false)
      setDeviceToDelete(null)
      setError(null) // Clear any previous errors
    } catch (err: any) {
      setError(err.message || "Failed to unpair device")
      setDeleteDialogOpen(false)
      setDeviceToDelete(null)
    }
  }

  const handleDeleteDevice = async (device: Device) => {
    setDeviceToDeletePermanently(device)
    setDeleteDeviceDialogOpen(true)
  }

  const confirmDeleteDevice = async () => {
    if (!deviceToDeletePermanently) return

    try {
      const token = tokenManager.getToken()
      const response = await fetch(`${API_BASE_URL}/api/devices/${deviceToDeletePermanently.device_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete device')
      }

      // Refetch devices to get updated list
      await fetchDevices()
      setDeleteDeviceDialogOpen(false)
      setDeviceToDeletePermanently(null)
      setError(null) // Clear any previous errors
    } catch (err: any) {
      setError(err.message || "Failed to delete device")
      setDeleteDeviceDialogOpen(false)
      setDeviceToDeletePermanently(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh]">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Smartphone className="h-6 w-6" />
              Device Management
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by device ID, owner name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : devices.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Smartphone className="h-20 w-20 mx-auto mb-6 opacity-20" />
                <p className="text-lg">No devices found</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-[60vh] overflow-y-auto">
                    {devices
                      .filter((device) => {
                        const query = searchQuery.toLowerCase()
                        return (
                          device.device_id.toLowerCase().includes(query) ||
                          device.owner_name?.toLowerCase().includes(query) ||
                          device.owner_email?.toLowerCase().includes(query) ||
                          device.status.toLowerCase().includes(query)
                        )
                      })
                      .map((device, index) => (
                        <div
                          key={device.id}
                          className={`px-5 py-4 ${index !== 0 ? 'border-t' : ''} hover:bg-muted/30 transition-colors`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Smartphone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              <div className="font-mono font-semibold text-base truncate">
                                {device.device_id}
                              </div>
                            </div>
                            <Badge
                              variant={device.status === "paired" ? "default" : "secondary"}
                              className={device.status === "paired" ? "bg-green-600 flex-shrink-0" : "flex-shrink-0"}
                            >
                              {device.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Owner Info */}
                            <div className="flex items-start gap-3">
                              <UserCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground mb-0.5">Owner</span>
                                <span className="text-sm font-medium truncate">
                                  {device.owner_name || "No owner"}
                                </span>
                                {device.owner_email && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {device.owner_email}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Paired At */}
                            {device.paired_at && (
                              <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="text-xs text-muted-foreground mb-0.5">Paired At</span>
                                  <span className="text-sm truncate">
                                    {new Date(device.paired_at).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {device.status === "paired" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUnpairDevice(device)}
                                className="flex-1"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Unpair Device
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDevice(device)}
                              className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-xl">Unpair Device</AlertDialogTitle>
            <div className="space-y-3">
              <div className="text-base text-muted-foreground">Are you sure you want to unpair device <span className="font-mono font-semibold">{deviceToDelete?.device_id}</span>
              {deviceToDelete?.owner_name && (
                <> from <span className="font-semibold">{deviceToDelete.owner_name}</span></>
              )}?</div>
              <div className="text-sm text-muted-foreground">The device will need to be paired again with a new pairing code.</div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3 mt-2">
            <AlertDialogCancel className="px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnpair} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-6">
              Unpair Device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDeviceDialogOpen} onOpenChange={setDeleteDeviceDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-xl text-destructive">Delete Device Permanently</AlertDialogTitle>
            <div className="space-y-3">
              <div className="text-base text-muted-foreground">Are you sure you want to permanently delete device <span className="font-mono font-semibold">{deviceToDeletePermanently?.device_id}</span>?</div>
              <div className="text-sm font-semibold text-destructive">This action cannot be undone. All device data will be permanently removed.</div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-3 mt-2">
            <AlertDialogCancel className="px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDevice} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-6">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
