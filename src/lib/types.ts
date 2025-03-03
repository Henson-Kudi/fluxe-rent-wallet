export interface Transaction {
    txID: string
    timestamp: number
    ownerAddress: string
    toAddress: string
    amount: number
    tokenType?: string
    confirmed: boolean
    contractData?: {
        amount?: string
        to_address?: string
    }
}

export interface TransactionState {
    data: Transaction[]
    isLoading: boolean
    error: string | null
}

