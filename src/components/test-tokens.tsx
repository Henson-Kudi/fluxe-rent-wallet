"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ExternalLink } from "lucide-react"

interface TestTokensProps {
  address: string
}

export default function TestTokens({ address }: TestTokensProps) {
  const [error, setError] = useState<string | null>(null)

  const openNileFaucet = () => {
    window.open("https://nileex.io/join/getJoinPage", "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Get Test Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            To get test tokens on the Nile testnet:
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Click the button below to visit the Nile faucet</li>
              <li>Connect your wallet or paste your address</li>
              <li>Complete the verification if required</li>
              <li>Request TRX and other test tokens</li>
            </ol>
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-2">
          <Button onClick={openNileFaucet} className="w-full flex items-center justify-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Visit Nile Faucet
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Your wallet address: <code className="bg-gray-100 px-2 py-1 rounded">{address}</code>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

