import {Crypto, CryptoLog} from "#app/domain/crypto.js";

export interface CryptoQueryRepo {
    findAllCryptos(): Promise<Crypto[]|null>;
    findCryptoBySymbol(symbol: string): Promise<Crypto|null>;
    findAllCryptoLogs(crypto_id: string): Promise<CryptoLog[]|null>;
}
