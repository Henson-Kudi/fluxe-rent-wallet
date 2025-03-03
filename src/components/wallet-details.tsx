"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"
import { createWalletFromMnemonic, fetchTransactions, getExplorerUrl, getTronBalance, NILE_USDT_CONTRACT } from "@/lib/tron-utils"
import type { WalletInfo } from "./wallet-setup"
import WalletInfoCard from "./wallet-info"
import TransferForm from "./transfer-form"
import TestTokens from "./test-tokens"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import BigNumber from "bignumber.js"
import { Transaction, TransactionState } from "@/lib/types"
import TransactionHistory from "./transaction-history"

interface WalletDetailsProps {
  encryptedMnemonic: string
  mnemonic: string
//   onWalletGenerated: (walletInfo: WalletInfo) => void
}



export default function WalletDetails({ mnemonic }: WalletDetailsProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transferResult, setTransferResult] = useState<any>(null)
  const [transactionState, setTransactionState] = useState<TransactionState>({
    data: [],
    isLoading: true,
    error: null,
  })

  const refreshTransactions = useCallback(async (address: string) => {
    setTransactionState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const formattedTransactions = await fetchTransactions(address)

      setTransactionState({
        data: formattedTransactions,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setTransactionState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load transaction history",
      }))
    }
  }, [])

  useEffect(() => {
    const generateWallet = async () => {
      try {
        const wallet = await createWalletFromMnemonic(mnemonic)

        // Fetch initial transactions
        await refreshTransactions(wallet.address.base58)

        setWalletInfo(wallet)
      } catch (error) {
        console.error("Error generating wallet:", error)
      } finally {
        setIsLoading(false)
      }
    }

    generateWallet()
  }, [mnemonic, refreshTransactions])

  const handleTransfer = async (toAddress: string, amount: number, tokenType: "TRX" | "USDT") => {
    if (!walletInfo || !walletInfo.tronWeb) return

    try {

      let result

      if (!toAddress?.length) {
        throw new Error('Please add receiver address')
      }

      if (!walletInfo.tronWeb.isAddress(toAddress)) {
        throw new Error('Invalid address')
      }

      if (toAddress === walletInfo.address.base58) {
        throw new Error('You cannot send to self')
      }

      if (amount<= 0) {
        throw new Error('Amount cannot be zero or less')
      }


      if (tokenType === "TRX") {
        const balance = await getTronBalance(walletInfo.address.base58)
 
          // Check if balance is enough
          if (amount > Number(balance.toFixed(6))) {
            throw new Error(`Insufficient TRX balance. Available: ${balance.toFixed(6)} TRX`)
          }
        // Send TRX
        const transaction = await walletInfo.tronWeb.transactionBuilder.sendTrx(
          toAddress,
          walletInfo.tronWeb.toSun(amount) as unknown as number,
          walletInfo.address.base58,
        )

        const signedTransaction = await walletInfo.tronWeb.trx.sign(transaction, walletInfo.privateKey)
        result = await walletInfo.tronWeb.trx.sendRawTransaction(signedTransaction)
      } else {
        try {
            // Set the default address
            walletInfo.tronWeb.setAddress(walletInfo.address.base58)
            
            // Create contract instance
            const contract = await walletInfo.tronWeb.contract().at(NILE_USDT_CONTRACT)
            
            // Get token decimals
            const decimals = await contract.decimals().call() || 6
            
            // Check balance
            const currentBalance = await contract.balanceOf(walletInfo.address.base58).call()
            const balanceInToken = new BigNumber(currentBalance.toString()).dividedBy(new BigNumber(10).pow(decimals)).toNumber()
            
            if (amount > balanceInToken) {
              throw new Error(`Insufficient USDT balance. Available: ${balanceInToken} USDT`)
            }
            
            // Convert amount to token units
            const amountInSmallestUnit = new BigNumber(amount).times(new BigNumber(10).pow(decimals))
            
            // Encode function call for transfer(address,uint256)
            const functionSelector = 'transfer(address,uint256)'
            const parameter = [
              {type: 'address', value: toAddress},
              {type: 'uint256', value: amountInSmallestUnit.toString(10)}
            ]
            
            // Build transaction
            const transaction = await walletInfo.tronWeb.transactionBuilder.triggerSmartContract(
              NILE_USDT_CONTRACT, 
              functionSelector,
              {
                feeLimit: 100000000,
                callValue: 0
              },
              parameter,
              walletInfo.address.hex
            )
            
            if (!transaction.result || !transaction.result.result) {
              throw new Error('Failed to create transaction')
            }
            
            // Sign transaction
            const signedTransaction = await walletInfo.tronWeb.trx.sign(transaction.transaction, walletInfo.privateKey)
            
            // Broadcast transaction
            result = await walletInfo.tronWeb.trx.sendRawTransaction(signedTransaction)
          } catch (error) {
            console.error("TRC20 transfer error:", error)
            throw new Error(`Failed to send USDT: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
      }

      // Add the new transaction to the list immediately
      const newTransaction: Transaction = {
        txID: result.txid || result.transaction.txID,
        timestamp: Date.now(),
        ownerAddress: walletInfo.address.hex,
        toAddress: toAddress,
        amount: amount,
        confirmed: false,
        tokenType: tokenType,
      }

      setTransactionState((prev) => ({
        ...prev,
        data: [newTransaction, ...prev.data],
      }))

      setTransferResult(result)
      return result
    } catch (error) {
      console.error("Transfer error:", error)
      throw error
    }
  }

  const handleRefresh = () => {
    if (walletInfo) {
      refreshTransactions(walletInfo.address.base58)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Generating wallet...</p>
      </div>
    )
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Tron Wallet Created!</CardTitle>
        <CardDescription className="text-center">
          Your Tron wallet has been successfully created on the Nile testnet
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {walletInfo && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <WalletInfoCard address={walletInfo.address.base58} />

                <Card className="my-4">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                      <CardTitle>Transaction History</CardTitle>
                      <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={transactionState.isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${transactionState.isLoading ? "animate-spin" : ""}`} />
                        Refresh
                      </Button>
                    </div>
                    </CardHeader>

                    <CardContent>
                        <TransactionHistory
                          transactions={transactionState.data}
                          isLoading={transactionState.isLoading}
                          error={transactionState.error}
                          walletInfo={walletInfo}
                        />
                    </CardContent>
                </Card>
              </div>
              <div>
                <TransferForm fromAddress={walletInfo.address.base58} onTransfer={handleTransfer} />
                <div className="my-4">
                    <TestTokens address={walletInfo.address.base58} />
                </div>
              </div>
            </div>

            


            {/* {transferResult && (
              <Alert className="bg-green-50 border-green-200">
                <div className="space-y-2">
                  <h3 className="font-medium text-green-800">Transaction Successful!</h3>
                  <p className="text-sm text-green-700 break-all">
                    Transaction ID: {transferResult.txid || transferResult.transaction.txID}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewTransaction(transferResult.txid || transferResult.transaction.txID)}
                    className="mt-2"
                  >
                    View Transaction
                  </Button>
                </div>
              </Alert>
            )} */}
          </>
        )}
      </CardContent>
    </>
  )
}

