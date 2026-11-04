import {Config} from "#app/config.js";
import {HttpClient} from "#app/common/http_client.js";
import {Logger} from "#app/common/logger.js";

export type SimplePrice = {
    symbol: string;
    price: number;
}

export type SimplePriceResponse = {
    prices: SimplePrice[];
}

type SimplePriceApiQuote = {
    symbol: string;
    price: number;
};

type SimplePriceApiCryptoCurrency = {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    quotes: SimplePriceApiQuote[];
};

type SimplePriceApiResponse = {
    data?: SimplePriceApiCryptoCurrency[];
    status?: {
        timestamp: string;
        error_code: string;
        error_message: string;
        elapsed: number;
        credit_count: number;
    };
};

export class CoinMarketCapApi {
    constructor(
        private logger: Logger,
        private config: Config,
        private httpClient: HttpClient
    ) {}

    async getSimplePrice(symbols: string[]): Promise<SimplePriceResponse|null> {
        const endpoint = '/v2/simple/price';
        const url = `${this.config.coinMarketCapApi.baseUrl}${endpoint}`;
        const resp = await this.httpClient.get<SimplePriceApiResponse>(url, {
            headers: {
                'X-CMC_PRO_API_KEY': this.config.coinMarketCapApi.key,
                'Content-Type': 'application/json',
            },
            params: {
                symbol: symbols.join(','),
                convert: this.config.currency ?? 'USD',
            },
            timeout: 5000
        });

        if (!resp) {
            this.logger.error(`Can't connect to CoinMarketCap API ${endpoint}`);
            return null;
        }

        if (resp.status?.error_code !== '0') {
            this.logger.error(`CoinMarketCap API ${endpoint} Error: code: ${resp.status?.error_code}, message: ${resp.status?.error_message}`);
            return null;
        }

        if (!resp.data || !Array.isArray(resp.data)) {
            this.logger.error(`CoinMarketCap API ${endpoint} incorrect response: ${JSON.stringify(resp)}`);
            return null;
        }

        return {
            prices: resp.data.map(record => ({
                symbol: record.symbol,
                price: record.quotes[0].price,
            })),
        }
    }
}
