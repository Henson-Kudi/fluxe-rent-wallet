import { TronWeb } from 'tronweb';

// Using Tron Nile testnet
const fullNode = 'https://api.nileex.io';
const solidityNode = 'https://api.nileex.io';
const eventServer = 'https://api.nileex.io';

// Initialize TronWeb instance (without private key initially)
export const getTronWeb = (privateKey?: string) => {
    const tronWeb = new TronWeb(
        fullNode,
        solidityNode,
        eventServer,
        privateKey
    );

    return tronWeb;
};

// Generate a new Tron wallet
export const generateWallet = async () => {
    const tronWeb = getTronWeb();
    const account = await tronWeb.createAccount();

    return {
        address: account.address.base58,
        privateKey: account.privateKey,
        publicKey: account.publicKey
    };
};