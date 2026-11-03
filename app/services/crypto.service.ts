import {CryptoQueryRepo} from "#app/repositories/crypto.query.repo.js";
import {Crypto, CryptoLog} from "#app/domain/crypto.js";
import {ApiError} from "#app/common/errors.js";

export class CryptoService {
    constructor(private readonly cryptoQueryRepo: CryptoQueryRepo) {
    }

    async getCryptos(): Promise<Crypto[]> {
        const cryptos = await this.cryptoQueryRepo.findAllCryptos();
        if (!cryptos) {
            throw new ApiError(5001, 'Failed to get All Cryptos');
        }
        return cryptos;
    }

    async getCryptoLogsBySymbol(symbol: string): Promise<CryptoLog[]> {
        const crypto = await this.cryptoQueryRepo.findCryptoBySymbol(symbol);
        if (!crypto) {
            throw new ApiError(4041, "Crypto not found");
        }

        const logs = await this.cryptoQueryRepo.findAllCryptoLogs(crypto.id);
        if (!logs) {
            throw new ApiError(5002, `Can't get logs of crypto ${symbol}`);
        }

        return logs;
    }
}
