import { NextResponse } from 'next/server';
import { simulateTRC20Transfer, transferTRC20 } from '@/lib/wallet';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fromPrivateKey, fromAddress, toAddress, amount, tokenContractAddress, simulate = true } = body;

        if (!toAddress || !amount || (!fromPrivateKey && !fromAddress)) {
            return NextResponse.json(
                { success: false, error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        let transaction;

        if (!simulate) {
            // Use simulation for development
            transaction = await simulateTRC20Transfer(
                fromAddress,
                toAddress,
                amount
            );
        } else {
            // Real transaction (requires private key and contract address)
            if (!fromPrivateKey || !tokenContractAddress) {
                return NextResponse.json(
                    { success: false, error: 'Private key and token contract address required for real transactions' },
                    { status: 400 }
                );
            }

            transaction = await transferTRC20(
                fromPrivateKey,
                toAddress,
                tokenContractAddress,
                amount
            );
        }

        return NextResponse.json({ success: true, transaction });
    } catch (error) {
        console.error('Error processing transfer:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process transfer' },
            { status: 500 }
        );
    }
}