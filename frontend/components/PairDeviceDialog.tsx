"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wifi, CheckCircle2, XCircle, Radio, Link2Off } from "lucide-react";
import { tokenManager } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";

interface PairDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PairDeviceDialog({ open, onOpenChange }: PairDeviceDialogProps) {
  const { user } = useUser();
  const [step, setStep] = useState<"detect" | "configure" | "pairing" | "success" | "paired">("detect");
  const [pairingCode, setPairingCode] = useState("");
  const [backendUrl, setBackendUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pairedDevice, setPairedDevice] = useState<{ device_id: string; paired_at: string } | null>(null);

  // Detect backend URL automatically
  useEffect(() => {
    if (open) {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const detectedBackend = `${protocol}//${hostname}:8000`;
      setBackendUrl(detectedBackend);
      checkExistingDevice(detectedBackend);
    }
  }, [open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("detect");
        setPairingCode("");
        setError("");
        setSuccess("");
        setLoading(false);
        setPairedDevice(null);
      }, 300);
    }
  }, [open]);

  const checkExistingDevice = async (url: string) => {
    try {
      const token = tokenManager.getToken();
      if (!token) return;

      const response = await fetch(`${url}/api/devices/my-device`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.device_id) {
          setPairedDevice(data);
          setStep("paired");
        }
      }
    } catch (err) {
      console.error("Failed to check existing device:", err);
    }
  };

  const handleDetectDevice = () => {
    setStep("configure");
  };

  const handlePairWithCode = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!pairingCode || pairingCode.length !== 6) {
        throw new Error("Please enter a valid 6-digit pairing code");
      }

      const token = tokenManager.getToken();
      if (!token) {
        throw new Error("You must be logged in to pair a device");
      }

      // Send pairing code to backend
      const response = await fetch(`${backendUrl}/api/devices/pair-with-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          pairing_code: pairingCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to pair device");
      }

      setStep("success");
      setSuccess("Device paired successfully! Your device will now start sending health data.");

    } catch (err: any) {
      setError(err.message || "Failed to pair device");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpair = async () => {
    setLoading(true);
    setError("");

    try {
      const token = tokenManager.getToken();
      if (!token) {
        throw new Error("You must be logged in");
      }

      const response = await fetch(`${backendUrl}/api/devices/unpair`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to unpair device");
      }

      setPairedDevice(null);
      setStep("detect");
      setSuccess("Device unpaired successfully");

    } catch (err: any) {
      setError(err.message || "Failed to unpair device");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === "success") {
      onOpenChange(false);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Radio className="h-6 w-6" />
            Pair VitalinkAI Device
          </DialogTitle>
          <DialogDescription className="text-base">
            Connect your VitalinkAI wearable device to start tracking your health metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Already Paired */}
          {step === "paired" && pairedDevice && (
            <div className="space-y-6">
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>
                  <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
                    <p className="font-semibold">Device Currently Paired</p>
                    <p>Device ID: <span className="font-mono font-bold">{pairedDevice.device_id}</span></p>
                    <p className="text-xs">Paired on {new Date(pairedDevice.paired_at).toLocaleDateString()}</p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your account is currently linked to this VitalinkAI device. To pair a different device, you must first unpair this one.
                </p>
                
                <Button
                  onClick={handleUnpair}
                  disabled={loading}
                  variant="destructive"
                  className="w-full h-11"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Unpairing...
                    </>
                  ) : (
                    <>
                      <Link2Off className="mr-2 h-5 w-5" />
                      Unpair Device
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Detect Device */}
          {step === "detect" && (
            <div className="space-y-6">
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Radio className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Ready to Pair</h3>
                  <p className="text-sm text-muted-foreground px-4">
                    Make sure your VitalinkAI device is powered on and displaying a pairing code on its screen.
                  </p>
                </div>
              </div>

              <Button onClick={handleDetectDevice} className="w-full h-11" size="lg">
                <Wifi className="mr-2 h-5 w-5" />
                Continue to Enter Code
              </Button>
            </div>
          )}

          {/* Step 2: Enter Pairing Code */}
          {step === "configure" && (
            <div className="space-y-5">
              <Alert className="border-primary/20 bg-primary/5">
                <AlertDescription>
                  <div className="space-y-2.5 text-sm">
                    <p className="font-semibold">Look at your device screen</p>
                    <p>A <strong>6-digit pairing code</strong> should be displayed on your VitalinkAI device.</p>
                    <p>Enter the code below to link the device to your account.</p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Pairing Code</Label>
                <Input
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="h-12 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <Button
                onClick={handlePairWithCode}
                disabled={loading || pairingCode.length !== 6}
                className="w-full h-11"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Pairing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Pair Device
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="text-center space-y-6 py-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Device Paired Successfully!</h3>
                <p className="text-sm text-muted-foreground px-6">
                  Your VitalinkAI device is now connected and will start sending health data.
                </p>
              </div>
              <Button onClick={handleClose} className="w-full h-11" size="lg">
                Done
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {success && !error && step !== "success" && (
            <Alert className="mt-4 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
