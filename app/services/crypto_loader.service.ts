import { CoinMarketCapApi, SimplePrice } from "#app/api/coin_market_cap.api.js";
import { ApiError } from "#app/common/errors.js";
import { CryptoLog } from "#app/domain/crypto.js";
import { CryptoCmdRepo } from "#app/repositories/crypto.cmd.repo.js";

export class CryptoLoaderService {
    constructor(
        private readonly cryptoCmdRepo: CryptoCmdRepo,
        private readonly coinMarketCapApi: CoinMarketCapApi,
    ) {
    }

    public async load() {
        const cryptos = await this.cryptoCmdRepo.findAll();
        if (!cryptos) {
            throw new ApiError(5001, 'Failed to get cryptos from DB.');
        }

        const symbols = cryptos.map(c => c.symbol);
        const symbolToId: Record<string, string> = {};
        for (const c of cryptos) {
            symbolToId[c.symbol] = c.id;
        }

        const response = await this.coinMarketCapApi.getSimplePrice(symbols);

        if (!response?.prices) {
            throw new ApiError(5002, `Failed to load prices for symbols: ${symbols.join(',')}`);
        }

        const logs: CryptoLog[] = response.prices.map((p: SimplePrice) => ({
            crypto_id: symbolToId[p.symbol],
            price: p.price,
            updated_at: new Date(),
        }));

        await this.cryptoCmdRepo.saveCryptoLogs(logs);
        
        for (const p of response.prices) {
            await this.cryptoCmdRepo.update(symbolToId[p.symbol], {
                price: p.price,
                updated_at: new Date(),
            });
        }
    }
}