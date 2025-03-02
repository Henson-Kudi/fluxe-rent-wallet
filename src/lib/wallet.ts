import { ethers } from 'ethers';
import { getTronWeb } from './tronWeb';
import * as bip39 from "bip39"
import { TronWeb } from "tronweb"
import * as CryptoJS from "crypto-js"

// TRC20 token contract ABI (simplified for transfer function)
const trc20Abi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Create a wallet from a QR code value
export const createWalletFromQR = async (qrValue: string) => {
    try {
        // Assuming QR value is a random seed phrase or private key
        const wallet = ethers.Wallet.fromPhrase(qrValue);

        return {
            address: wallet.address,
            privateKey: wallet.privateKey
        };
    } catch (error) {
        console.error('Error creating wallet from QR:', error);
        throw new Error('Invalid QR code value for wallet creation');
    }
};

// Transfer TRC20 tokens
export const transferTRC20 = async (
    fromPrivateKey: string,
    toAddress: string,
    tokenContractAddress: string,
    amount: string
) => {
    try {
        const tronWeb = getTronWeb(fromPrivateKey);

        // Get the contract instance
        const contract = await tronWeb.contract(trc20Abi, tokenContractAddress);

        // Execute the transfer (amount should be in the token's smallest unit)
        const result = await contract.transfer(toAddress, amount).send();

        return {
            success: true,
            transactionId: result,
        };
    } catch (error) {
        console.error('Error transferring TRC20 tokens:', error);
        throw new Error('Failed to transfer tokens');
    }
};

// Simulate TRC20 transfer (for development without actual blockchain interaction)
export const simulateTRC20Transfer = async (
    fromAddress: string,
    toAddress: string,
    amount: string,
    tokenSymbol = 'USDT'
) => {
    // For simulation purposes, we'll just return a mock response
    return {
        success: true,
        fromAddress,
        toAddress,
        amount,
        tokenSymbol,
        transactionId: 'simulated_' + Date.now().toString(16),
        timestamp: new Date().toISOString()
    };
};

export const createWalletFromMnemonic = async (mnemonic: string) => {
    const seed = await bip39.mnemonicToSeed(mnemonic)
    const tronWeb = new TronWeb({
        fullHost: "https://api.trongrid.io",
        privateKey: seed.toString("hex"),
    })
    const account = await tronWeb.createAccount()
    return {
        address: account.address.base58,
        privateKey: account.privateKey,
    }
}

export const encryptWallet = (wallet: { address: string; privateKey: string }, password: string) => {
    const encryptedPrivateKey = CryptoJS.AES.encrypt(wallet.privateKey, password).toString()
    return {
        address: wallet.address,
        encryptedPrivateKey,
    }
}

export const decryptWallet = (encryptedWallet: { address: string; encryptedPrivateKey: string }, password: string) => {
    const decryptedPrivateKey = CryptoJS.AES.decrypt(encryptedWallet.encryptedPrivateKey, password).toString(
        CryptoJS.enc.Utf8,
    )
    return {
        address: encryptedWallet.address,
        privateKey: decryptedPrivateKey,
    }
}