"use client"

import { useState, useCallback, useEffect } from "react"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
import { encryptMnemonic } from "@/lib/crypto-utils" // Note: Using crypto-utils instead of tron-utils

interface CreatePasswordProps {
  mnemonic: string
  onPasswordCreated: (encryptedMnemonic: string) => void
}

export default function CreatePassword({ mnemonic, onPasswordCreated }: CreatePasswordProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Memoize password validation to prevent unnecessary re-calculations
  const validatePassword = useCallback((pass: string) => {
    return {
      hasMinLength: pass.length >= 8,
      hasUppercase: /[A-Z]/.test(pass),
      hasLowercase: /[a-z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecialChar: /[^A-Za-z0-9]/.test(pass),
    }
  }, [])

//   useEffect(()=>{
//     setIsProcessing(false)
//   },[])

  const passwordChecks = validatePassword(password)
  const isPasswordStrong = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async () => {
    if (isProcessing) return

    try {
      setIsProcessing(true)
      setError(null)

      if (!isPasswordStrong) {
        setError("Please create a stronger password")
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      // Encrypt mnemonic
      const encrypted = encryptMnemonic(mnemonic, password)
      console.log(encrypted, 'encrypted password')
      onPasswordCreated?.(encrypted)
    console.log('encrypting')
    } catch (err) {
      console.error("Encryption error:", err)
      setError("Failed to encrypt mnemonic. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center space-x-2">
      {met ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
      <span className={`text-sm ${met ? "text-green-700" : "text-red-700"}`}>{text}</span>
    </div>
  )

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Create Password</CardTitle>
        <CardDescription className="text-center">Create a strong password to encrypt your wallet</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                className="pr-10"
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isProcessing}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError(null)
              }}
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Password strength indicators */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Password Requirements:</h3>
          <PasswordRequirement met={passwordChecks.hasMinLength} text="At least 8 characters" />
          <PasswordRequirement met={passwordChecks.hasUppercase} text="At least one uppercase letter" />
          <PasswordRequirement met={passwordChecks.hasLowercase} text="At least one lowercase letter" />
          <PasswordRequirement met={passwordChecks.hasNumber} text="At least one number" />
          <PasswordRequirement met={passwordChecks.hasSpecialChar} text="At least one special character" />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isProcessing || !password || !confirmPassword || password !== confirmPassword || !isPasswordStrong}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Create Wallet"
          )}
        </Button>
      </CardFooter>
    </>
  )
}

