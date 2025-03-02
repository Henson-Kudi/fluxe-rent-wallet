"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface QRScannerProps {
  onScanSuccess: (mnemonic: string) => void
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const [scannerInitialized, setScannerInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const qrReaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scannerInitialized && qrReaderRef.current) {
      const timer = setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: false,
            },
            false,
          )

          scanner.render(
            (decodedText) => {
              onScanSuccess(decodedText)
              scanner.clear()
            },
            (errorMessage) => {
              console.error("QR scan error:", errorMessage)
              setError("Failed to scan QR code. Please try again.")
            },
          )

          setScannerInitialized(true)
        } catch (err) {
          console.error("Scanner initialization error:", err)
          setError("Failed to initialize the QR scanner. Please refresh the page and try again.")
        } finally {
          setIsInitializing(false)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [onScanSuccess, scannerInitialized])

  const handleRetry = () => {
    setError(null)
    setIsInitializing(true)
    setScannerInitialized(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold">Scan Mnemonic QR Code</CardTitle>
        <CardDescription>Scan the QR code containing your wallet&apos;s mnemonic phrase</CardDescription>
      </CardHeader>
      <CardContent>
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Initializing camera...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button onClick={handleRetry} className="mt-2">
              Retry
            </Button>
          </Alert>
        ) : (
          <>
            <div
              id="qr-reader"
              ref={qrReaderRef}
              className="mx-auto rounded-lg overflow-hidden border border-gray-200"
            />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Position the QR code within the frame to scan
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default QRScanner

