import {describe, expect, it, jest} from '@jest/globals';
import {CoinMarketCapApi} from '#app/api/coin_market_cap.api.js';
import type {Config} from '#app/config.js';
import type {HttpRequestOptions} from '#app/common/http_client.js';
import type {Logger} from '#app/common/logger.js';

const silentLogger: Logger = {
    error: () => undefined,
    warn: () => undefined,
    info: () => undefined,
    debug: () => undefined,
    trace: () => undefined,
};

const config: Config = {
    currency: 'USD',
    coinMarketCapApi: {
        baseUrl: 'https://pro-api.example.com',
        key: 'test-key',
    },
    app: {
        port: 3000,
        auth_key: 'x',
    },
};

type ApiPayload = {
    data?: {
        symbol: string;
        quotes: {price: number}[];
    }[];
    status?: {
        timestamp: string;
        error_code: string;
        error_message: string;
        elapsed: string;
        credit_count: number;
    };
};

// HttpClient.get is generic, and jest.Mock<T> erases generics
// (Parameters<T>/ReturnType<T> instantiate them as unknown), so the fake
// is typed with any. It is a pure mock and never used as a real client.
type FakeHttpClient = {
    get: jest.Mock<any>;
};

function makeClient(response: unknown): FakeHttpClient {
    return {
        get: jest.fn(async (_url: string, _options: HttpRequestOptions) => response as any),
    };
}

describe('CoinMarketCapApi.getSimplePrice', () => {
    it('maps API records to a prices list', async () => {
        const client = makeClient({
            data: [
                {symbol: 'BTC', quotes: [{price: 100}]},
                {symbol: 'ETH', quotes: [{price: 50}]},
            ],
            status: {timestamp: 't', error_code: '0', error_message: '', elapsed: '0.1', credit_count: 1},
        });
        const api = new CoinMarketCapApi(silentLogger, config, client);

        await expect(api.getSimplePrice(['BTC', 'ETH'])).resolves.toEqual({
            prices: [
                {symbol: 'BTC', price: 100},
                {symbol: 'ETH', price: 50},
            ],
        });
    });

    it('sends the API key, joined symbols and currency in the request', async () => {
        const client = makeClient({data: []});
        const api = new CoinMarketCapApi(silentLogger, config, client);

        await api.getSimplePrice(['BTC', 'ETH']);

        expect(client.get).toHaveBeenCalledWith(
            'https://pro-api.example.com/v2/simple/price',
            expect.objectContaining({
                headers: {
                    'X-CMC_PRO_API_KEY': 'test-key',
                    'Content-Type': 'application/json',
                },
                params: {
                    symbol: 'BTC,ETH',
                    convert: 'USD',
                },
                timeout: 5000,
            }),
        );
    });

    it('returns null when the API reports an error code', async () => {
        const client = makeClient({
            data: [],
            status: {timestamp: 't', error_code: '400', error_message: 'bad key', elapsed: '0.1', credit_count: 1},
        });
        const api = new CoinMarketCapApi(silentLogger, config, client);

        await expect(api.getSimplePrice(['BTC'])).resolves.toBeNull();
    });

    it('returns null when the response has no data', async () => {
        const client = makeClient({
            status: {timestamp: 't', error_code: '0', error_message: '', elapsed: '0.1', credit_count: 1},
        });
        const api = new CoinMarketCapApi(silentLogger, config, client);

        await expect(api.getSimplePrice(['BTC'])).resolves.toBeNull();
    });

    it('returns null when the HTTP client fails', async () => {
        const client = makeClient(null);
        const api = new CoinMarketCapApi(silentLogger, config, client);

        await expect(api.getSimplePrice(['BTC'])).resolves.toBeNull();
    });
});
