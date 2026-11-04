export type Crypto = {
    id: string;
    symbol: string;
    name: string;
    price: number|null;
    updated_at: Date|null;
}

export type CryptoLog = {
    crypto_id: string,
    price: number;
    updated_at: Date;
}
