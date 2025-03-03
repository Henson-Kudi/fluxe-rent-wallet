"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ExternalLink, RefreshCw, QrCode } from "lucide-react"
import { getTronBalance, getTRC20Balance, getExplorerUrl } from "@/lib/tron-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"

interface WalletInfoProps {
  address: string
}

interface BalanceState {
  trx: number | null
  usdt: number | null
  isLoading: boolean
  error: string | null
}

export default function WalletInfoCard({ address }: WalletInfoProps) {

  const [copied, setCopied] = useState(false)
  const [balanceState, setBalanceState] = useState<BalanceState>({
    trx: null,
    usdt: null,
    isLoading: true,
    error: null,
  })

  const fetchBalances = useCallback(async () => {
    setBalanceState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Fetch TRX balance first
      const trxBalance = await getTronBalance(address)

      // Then fetch USDT balance
      let usdtBalance = null
      try {
        usdtBalance = await getTRC20Balance(address)
      } catch (usdtError) {
        console.warn("USDT balance fetch error:", usdtError)
        // Don't fail completely if only USDT balance fails
      }

      setBalanceState({
        trx: trxBalance,
        usdt: usdtBalance,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error("Error fetching balances:", error)
      setBalanceState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to fetch balances",
      }))
    }
  }, [address])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openExplorer = (address: string) => {
    window.open(getExplorerUrl("address", address), "_blank")
  }

  const BalanceDisplay = ({ label, value, symbol }: { label: string; value: number | null; symbol: string }) => (
    <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-lg font-semibold">
        {value !== null ? `${value.toFixed(6)} ${symbol}` : "Not available"}
      </span>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Wallet Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Wallet Address:</h3>
          <div className="flex items-center gap-2">
            <code className="text-sm break-all font-mono bg-gray-100 p-2 rounded flex-1">{address}</code>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <QrCode className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Scan to Send Tokens</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      value={address}
                      size={200}
                      level="H"
                      includeMargin
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium">Network: Tron (Nile Testnet)</p>
                    <p className="text-xs text-muted-foreground break-all font-mono bg-gray-100 p-2 rounded">
                      {address}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(address)}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Balances:</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchBalances}
              className="h-8 px-2"
              disabled={balanceState.isLoading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${balanceState.isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {balanceState.isLoading ? (
            <div className="text-center p-4">
              <p className="text-sm text-gray-500">Loading balances...</p>
            </div>
          ) : balanceState.error ? (
            <Alert variant="destructive">
              <AlertDescription>{balanceState.error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <BalanceDisplay label="TRX Balance" value={balanceState.trx} symbol="TRX" />
              <BalanceDisplay label="USDT Balance" value={balanceState.usdt} symbol="USDT" />
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => openExplorer(address)}
          className="w-full flex items-center justify-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          View on Nile Explorer
        </Button>
      </CardContent>
    </Card>
  )
}

