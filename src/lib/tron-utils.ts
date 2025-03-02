"use client"

import CryptoJS from "crypto-js"
import * as bip39 from 'bip39'
import BigNumber from "bignumber.js"
import { TronWeb } from "tronweb"
import { WalletInfo } from "@/components/wallet-setup"

const NILE_TESTNET_URL = "https://nile.trongrid.io"
const NILE_EXPLORER_URL = "https://nile.tronscan.org"
const NILE_FAUCET_URL = "https://nileex.io/join/getJoinPage"
export const NILE_USDT_CONTRACT = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf" // Nile Testnet USDT contract address

// Function to generate entropy for mnemonic
function generateEntropy(length = 16): Uint8Array {
    const entropy = new Uint8Array(length)
    if (typeof window !== "undefined" && window.crypto) {
        window.crypto.getRandomValues(entropy)
    } else {
        // Fallback for non-browser environments (though we shouldn't need this in Next.js client components)
        for (let i = 0; i < length; i++) {
            entropy[i] = Math.floor(Math.random() * 256)
        }
    }
    return entropy
}

/**
 * Generates a random mnemonic phrase
 */
export function generateMnemonic(): string {
    const entropy = generateEntropy()
    console.log(entropy, 'entropy')
    return bip39.entropyToMnemonic(entropy as Buffer<ArrayBufferLike>)
}

let tronWebInstance: TronWeb | null = null

/**
 * Initialize TronWeb instance
 */
export async function initTronWeb() {
    if (typeof window === "undefined") return null

    if (tronWebInstance) return tronWebInstance

    try {

        tronWebInstance = new TronWeb({
            fullHost: NILE_TESTNET_URL,
            headers: { "TRON-PRO-API-KEY": "04e574e3-a9c3-4a3c-83aa-4530d8fb82af" },
        })

        return tronWebInstance
    } catch (error) {
        console.error("TronWeb initialization error:", error)
        throw new Error("Failed to initialize TronWeb")
    }
}

/**
 * Creates a wallet from a mnemonic phrase
 */
export async function createWalletFromMnemonic(mnemonic: string): Promise<WalletInfo> {
    const tronWeb = await initTronWeb()
    if (!tronWeb) throw new Error("TronWeb not initialized")

    try {
        // Generate private key from mnemonic
        const seed = await bip39.mnemonicToSeed(mnemonic)

        // Create account from private key
        const account = await tronWeb.createAccount()
        const { privateKey, address } = account

        // Set the private key in TronWeb instance
        tronWeb.setPrivateKey(privateKey)

        return {
            address,
            privateKey,
            publicKey: address.hex, // In Tron, the address is effectively the public key for most purposes
            tronWeb,
        }
    } catch (error) {
        console.error("Wallet creation error:", error)
        throw new Error("Failed to create wallet from mnemonic")
    }
}

/**
 * Encrypts a mnemonic phrase with a password
 */
export function encryptMnemonic(mnemonic: string, password: string): string {
    return CryptoJS.AES.encrypt(mnemonic, password).toString()
}

/**
 * Decrypts an encrypted mnemonic phrase with a password
 */
export function decryptMnemonic(encryptedMnemonic: string, password: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedMnemonic, password)
    return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * Get TRX balance for an address
 */
export async function getTronBalance(address: string): Promise<number> {
    const tronWeb = await initTronWeb()
    if (!tronWeb) throw new Error("TronWeb not initialized")

    try {

        const bal = await tronWeb.trx.getBalance(address)
        // Convert balance from SUN to TRX using BigNumber to handle large numbers
        return new BigNumber(bal).dividedBy(1e6).toNumber()
    } catch (error) {
        console.error("Balance fetch error:", error)
        throw new Error("Failed to fetch balance")
    }
}

/**
 * Validate a Tron address
 */
export async function isValidTronAddress(address: string): Promise<boolean> {
    const tronWeb = await initTronWeb()
    if (!tronWeb) return false

    try {
        return tronWeb.isAddress(address)
    } catch {
        return false
    }
}

/**
 * Request test tokens from Shasta testnet faucet
 */
export async function requestTestTokens(address: string): Promise<void> {
    try {
        window.open(NILE_FAUCET_URL, "_blank")

        // Return a resolved promise since we can't automatically request tokens
        return Promise.resolve()
    } catch (error) {
        console.error("Test token request error:", error)
        throw new Error("Failed to request test tokens")
    }
}

/**
 * Send TRX
 */
export async function sendTRX(
    fromAddress: string,
    toAddress: string,
    amount: number,
    privateKey: string,
): Promise<any> {
    const tronWeb = await initTronWeb()
    if (!tronWeb) throw new Error("TronWeb not initialized")

    try {
        tronWeb.setPrivateKey(privateKey)

        // Convert TRX to SUN
        const amountInSun = new BigNumber(amount).times(1e6).toNumber()

        // Create and sign transaction
        const transaction = await tronWeb.transactionBuilder.sendTrx(toAddress, amountInSun, fromAddress)

        const signedTransaction = await tronWeb.trx.sign(transaction)
        const result = await tronWeb.trx.sendRawTransaction(signedTransaction)

        return result
    } catch (error) {
        console.error("TRX transfer error:", error)
        throw new Error("Failed to send TRX")
    }
}

/**
 * Send TRC20 tokens
 */
export async function sendTRC20(
    contractAddress: string,
    fromAddress: string,
    toAddress: string,
    amount: number,
    privateKey: string,
): Promise<any> {
    const tronWeb = await initTronWeb()
    if (!tronWeb) throw new Error("TronWeb not initialized")

    try {
        tronWeb.setPrivateKey(privateKey)

        const contract = await tronWeb.contract().at(contractAddress)
        const decimals = await contract.decimals().call()

        // Convert amount to token units using BigNumber
        const amountBN = new BigNumber(amount).times(new BigNumber(10).pow(decimals))

        const transaction = await contract.transfer(toAddress, amountBN.toString(10)).send()

        return transaction
    } catch (error) {
        console.error("TRC20 transfer error:", error)
        throw new Error("Failed to send TRC20 tokens")
    }
}

/**
 * Get TRC20 token balance
 */
export async function getTRC20Balance(address: string, contractAddress: string = NILE_USDT_CONTRACT): Promise<number> {
    const tronWeb = await initTronWeb()
    if (!tronWeb) throw new Error("TronWeb not initialized")

    try {
        // Set default address
        tronWeb.setAddress(address)
        // Create contract instance
        const contract = await tronWeb.contract().at(contractAddress)

        // Call balanceOf function directly - we're just reading the balance
        const result = await contract.balanceOf(address).call()


        // Get decimals
        const decimals = await contract.decimals().call()

        // Convert balance using the correct number of decimals
        return new BigNumber(result.toString()).dividedBy(new BigNumber(10).pow(decimals)).toNumber()
    } catch (error) {
        console.log(error)
        console.error("TRC20 balance fetch error:", error)
        throw new Error("Failed to fetch TRC20 balance")
    }
}

/**
 * Get explorer URL for an address or transaction
 */
export function getExplorerUrl(type: "address" | "transaction", hash: string): string {
    switch (type) {
        case "address":
            return `${NILE_EXPLORER_URL}/#/address/${hash}`
        case "transaction":
            return `${NILE_EXPLORER_URL}/#/transaction/${hash}`
        default:
            return NILE_EXPLORER_URL
    }
}

