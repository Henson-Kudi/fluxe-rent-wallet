"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getExplorerUrl } from "@/lib/tron-utils"
import { formatDistanceToNow } from "date-fns"
import type { Transaction } from "@/lib/types"
import { WalletInfo } from "./wallet-setup"

interface TransactionHistoryProps {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  walletInfo: WalletInfo
}

export default function TransactionHistory({ transactions, isLoading, error, walletInfo }: TransactionHistoryProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getTransactionType = (tx: Transaction) => {
    if (tx.ownerAddress.toLowerCase() === walletInfo.address.hex.toLowerCase()) {
      return "Sent"
    }
    return "Received"
  }

  return (
    <>
      {/* <CardHeader>
        <CardTitle className="text-xl">Transaction History</CardTitle>
      </CardHeader> */}
      <>
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.txID}
                className="flex flex-col space-y-2 p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      getTransactionType(tx) === "Sent" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {getTransactionType(tx)} {tx.amount.toFixed(6)} {tx.tokenType || "TRX"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => window.open(getExplorerUrl("transaction", tx.txID), "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>From: {formatAddress(tx.ownerAddress)}</span>
                    <span>To: {formatAddress(tx.toAddress)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                    </span>
                    <span className={`text-xs ${tx.confirmed ? "text-green-600" : "text-yellow-600"} font-medium`}>
                      {tx.confirmed ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    </>
  )
}

