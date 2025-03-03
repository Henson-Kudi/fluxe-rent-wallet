"use client"
import WalletSetup from "@/components/wallet-setup"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="w-max mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Crypto Wallet Setup</h1>
        <WalletSetup />
      </div>
    </main>
  )
}

