"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface VerifyMnemonicProps {
  mnemonic: string
  onVerificationSuccess: () => void
}

export default function VerifyMnemonic({ mnemonic, onVerificationSuccess }: VerifyMnemonicProps) {
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([])
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Split and shuffle the mnemonic words
    const words = mnemonic.split(" ")
    setMnemonicWords(words)

    // Create a shuffled copy of the words
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    setShuffledWords(shuffled)
  }, [mnemonic])

  const handleWordClick = (word: string) => {
    if (selectedWords.includes(word)) {
      // Remove word if already selected
      setSelectedWords(selectedWords.filter((w) => w !== word))
    } else {
      // Add word to selected words
      setSelectedWords([...selectedWords, word])
    }
    setError(null)
  }

  const handleVerify = () => {
    // Check if selected words match the original mnemonic
    if (selectedWords.length !== mnemonicWords.length) {
      setError("Please select all words in the correct order")
      return
    }

    const isCorrect = selectedWords.join(" ") === mnemonicWords.join(" ")

    if (isCorrect) {
      onVerificationSuccess()
    } else {
      setError("The order of words is incorrect. Please try again.")
      setSelectedWords([])
    }
  }

  const handleReset = () => {
    setSelectedWords([])
    setError(null)
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Verify Your Mnemonic</CardTitle>
        <CardDescription className="text-center">
          Select the words in the correct order to verify you've saved your mnemonic phrase
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Selected words display */}
        <div className="p-4 bg-gray-50 rounded-lg min-h-24 border border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedWords.length === 0 ? (
              <p className="text-sm text-gray-500">Select words in the correct order</p>
            ) : (
              selectedWords.map((word, index) => (
                <Button
                  key={`selected-${index}`}
                  variant="secondary"
                  size="sm"
                  className="h-8"
                  onClick={() => handleWordClick(word)}
                >
                  {word}
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Shuffled words */}
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Select words in the correct order:</h3>
          <div className="flex flex-wrap gap-2">
            {shuffledWords.map((word, index) => (
              <Button
                key={`shuffled-${index}`}
                variant={selectedWords.includes(word) ? "outline" : "secondary"}
                size="sm"
                className={`h-8 ${selectedWords.includes(word) ? "opacity-50" : ""}`}
                onClick={() => handleWordClick(word)}
                disabled={selectedWords.includes(word)}
              >
                {word}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={handleVerify}>Verify</Button>
      </CardFooter>
    </>
  )
}

