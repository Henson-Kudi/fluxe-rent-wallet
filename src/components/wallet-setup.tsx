"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import VerifyMnemonic from "./verify-mnemonic"
import GenerateMnemonic from "./generate-mnemonic"
import CreatePassword from "./creat-password"
import WalletDetails from "./wallet-details"
import { TronWeb } from "tronweb"

export type SetupStep = "generate" | "verify" | "password" | "details"

export interface WalletInfo {
  address: {base58: string, hex: string}
  privateKey: string
  publicKey: string
  tronWeb: TronWeb
}

export default function WalletSetup() {
  const [currentStep, setCurrentStep] = useState<SetupStep>("generate")
  const [mnemonic, setMnemonic] = useState<string>("")
  const [encryptedMnemonic, setEncryptedMnemonic] = useState<string>("")

  const handleMnemonicGenerated = (generatedMnemonic: string) => {
    setMnemonic(generatedMnemonic)
    setCurrentStep("verify")
  }

  const handleMnemonicVerified = () => {
    setCurrentStep("password")
  }

  const handlePasswordCreated = (encrypted: string) => {
    setEncryptedMnemonic(encrypted)
    setCurrentStep("details")
  }

  

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      {currentStep === "generate" && <GenerateMnemonic onMnemonicGenerated={handleMnemonicGenerated} />}

      {currentStep === "verify" && (
        <VerifyMnemonic mnemonic={mnemonic} onVerificationSuccess={handleMnemonicVerified} />
      )}

      {currentStep === "password" && <CreatePassword mnemonic={mnemonic} onPasswordCreated={handlePasswordCreated} />}

      {currentStep === "details" && (
        <WalletDetails
          encryptedMnemonic={encryptedMnemonic}
          mnemonic={mnemonic}
        //   onWalletGenerated={handleWalletGenerated}
        />
      )}
    </Card>
  )
}

