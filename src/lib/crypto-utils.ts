import CryptoJS from "crypto-js"
import { ethers } from "ethers"

export function encryptMnemonic(mnemonic: string, password: string): string {
    try {
        return CryptoJS.AES.encrypt(mnemonic, password).toString()
    } catch (error) {
        console.error("Encryption error:", error)
        throw new Error("Failed to encrypt mnemonic")
    }
}

/**
 * Decrypts an encrypted mnemonic phrase with a password
 */
export function decryptMnemonic(encryptedMnemonic: string, password: string): string {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedMnemonic, password)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)

        if (!decrypted) {
            throw new Error("Decryption failed")
        }

        return decrypted
    } catch (error) {
        console.error("Decryption error:", error)
        throw new Error("Failed to decrypt mnemonic")
    }
}


/**
 * Generates a random mnemonic phrase
 */
export function generateMnemonic(): string {
    const wallet = ethers.Wallet.createRandom()
    return wallet.mnemonic?.phrase || ""
}

/**
 * Creates a wallet from a mnemonic phrase
 */
export function createWalletFromMnemonic(mnemonic: string): ethers.Wallet {
    return ethers.HDNodeWallet.fromPhrase(mnemonic) as unknown as ethers.Wallet
}

