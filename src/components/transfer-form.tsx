"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isValidTronAddress } from "@/lib/tron-utils"

interface TransferFormProps {
  fromAddress: string
  onTransfer: (toAddress: string, amount: number, tokenType: "TRX" | "USDT") => Promise<unknown>
}

export default function TransferForm({ onTransfer }: TransferFormProps) {
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [tokenType, setTokenType] = useState<"TRX" | "USDT">("TRX")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate input
    if (!toAddress || !amount) {
      setError("Please fill in all fields")
      return
    }

    if (!isValidTronAddress(toAddress)) {
      setError("Invalid Tron address")
      return
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setIsLoading(true)

    try {
      await onTransfer(toAddress, amountValue, tokenType)
      setSuccess(`Successfully sent ${amount} ${tokenType} to ${toAddress.substring(0, 8)}...`)
      // Reset form
      setToAddress("")
      setAmount("")
    } catch (err) {
      setError((err as Error)?.message || "Transaction failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Transfer Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenType">Token Type</Label>
            <Select value={tokenType} onValueChange={(value: "TRX" | "USDT") => setTokenType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRX">TRX</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toAddress">Recipient Address</Label>
            <Input
              id="toAddress"
              value={toAddress}
              onChange={(e) => {
                setToAddress(e.target.value)
                setError(null)
              }}
              placeholder="Enter Tron address"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({tokenType})</Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              min="0.000001"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError(null)
              }}
              placeholder="0.0"
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Send ${tokenType}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

