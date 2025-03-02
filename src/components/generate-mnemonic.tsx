"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { generateMnemonic } from "@/lib/tron-utils"

interface GenerateMnemonicProps {
  onMnemonicGenerated: (mnemonic: string) => void
}

export default function GenerateMnemonic({ onMnemonicGenerated }: GenerateMnemonicProps) {
  const [mnemonic, setMnemonic] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const generateNewMnemonic = () => {
    try {
      const newMnemonic = generateMnemonic()
      setMnemonic(newMnemonic)
      setError(null)
      return newMnemonic
    } catch (err) {
      console.error("Mnemonic generation error:", err)
      setError("Failed to generate mnemonic. Please try again.")
      return null
    }
  }

  useEffect(() => {
    const newMnemonic = generateNewMnemonic()
    if (newMnemonic) {
      setIsGenerating(false)
    }
  }, []) // Removed generateNewMnemonic from dependencies

  const handleContinue = () => {
    if (mnemonic) {
      onMnemonicGenerated(mnemonic)
    }
  }

  const handleRegenerateClick = () => {
    setIsGenerating(true)
    const newMnemonic = generateNewMnemonic()
    if (newMnemonic) {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Generate Your Tron Wallet</CardTitle>
        <CardDescription className="text-center">
          Scan this QR code to save your mnemonic phrase securely
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-6">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Generating secure mnemonic...</p>
          </div>
        ) : error ? (
          <div className="text-center p-4 bg-red-50 text-red-700 rounded-lg">
            <p>{error}</p>
            <Button variant="outline" onClick={handleRegenerateClick} className="mt-2">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCodeSVG value={mnemonic} size={200} />
            </div>

            <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium mb-2">Your Mnemonic Phrase:</h3>
              <p className="text-sm break-all font-mono">{mnemonic}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg w-full">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Save this mnemonic phrase securely. It's the only way to recover your
                wallet. Never share it with anyone.
              </p>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleRegenerateClick} disabled={isGenerating}>
          Regenerate
        </Button>
        <Button onClick={handleContinue} disabled={isGenerating || !mnemonic || !!error}>
          Continue
        </Button>
      </CardFooter>
    </>
  )
}

