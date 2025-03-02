import { NextResponse } from 'next/server';
import { generateWallet } from '@/lib/tronWeb';

export async function POST() {
    try {
        const wallet = await generateWallet();
        return NextResponse.json({ success: true, wallet });
    } catch (error) {
        console.error('Error creating wallet:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create wallet' },
            { status: 500 }
        );
    }
}