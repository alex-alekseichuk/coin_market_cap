import {describe, expect, it, jest} from '@jest/globals';
import {CryptoLoaderService} from '#app/services/crypto_loader.service.js';
import type {CryptoCmdRepo} from '#app/repositories/crypto.cmd.repo.js';
import type {CoinMarketCapApi, SimplePriceResponse} from '#app/api/coin_market_cap.api.js';
import type {Crypto} from '#app/domain/crypto.js';
import type {Logger} from '#app/common/logger.js';

const silentLogger: Logger = {
    error: () => undefined,
    warn: () => undefined,
    info: () => undefined,
    debug: () => undefined,
    trace: () => undefined,
};

const bitcoin: Crypto = {id: '1', symbol: 'BTC', name: 'Bitcoin', price: null, updated_at: null};
const ethereum: Crypto = {id: '2', symbol: 'ETH', name: 'Ethereum', price: null, updated_at: null};

type Overrides = {
    findAll?: Crypto[] | null;
    update?: boolean;
    saveCryptoLog?: boolean;
};

type FakeCryptoCmdRepo = {
    [K in keyof CryptoCmdRepo]: jest.Mock<CryptoCmdRepo[K]>;
};

function makeFakeCmdRepo(o: Overrides = {}): FakeCryptoCmdRepo {
    return {
        findAll: jest.fn<CryptoCmdRepo['findAll']>().mockResolvedValue(o.findAll ?? null),
        findById: jest.fn<CryptoCmdRepo['findById']>().mockResolvedValue(null),
        create: jest.fn<CryptoCmdRepo['create']>().mockResolvedValue(null),
        update: jest.fn<CryptoCmdRepo['update']>().mockResolvedValue((o.update ?? true) ? bitcoin : null),
        delete: jest.fn<CryptoCmdRepo['delete']>().mockResolvedValue(true),
        saveCryptoLog: jest.fn<CryptoCmdRepo['saveCryptoLog']>().mockResolvedValue(o.saveCryptoLog ?? true),
    };
}

type FakeApi = {
    getSimplePrice: jest.Mock<CoinMarketCapApi['getSimplePrice']>;
};

function makeFakeApi(prices: SimplePriceResponse | null): FakeApi {
    return {
        getSimplePrice: jest.fn<CoinMarketCapApi['getSimplePrice']>().mockResolvedValue(prices),
    };
}

function makeService(repo: FakeCryptoCmdRepo, api: FakeApi): CryptoLoaderService {
    return new CryptoLoaderService(silentLogger, repo, api as unknown as CoinMarketCapApi);
}

describe('CryptoLoaderService.load', () => {
    it('does nothing when the DB has no cryptos', async () => {
        const repo = makeFakeCmdRepo({findAll: []});
        const api = makeFakeApi(null);
        await makeService(repo, api).load();
        expect(api.getSimplePrice).not.toHaveBeenCalled();
        expect(repo.update).not.toHaveBeenCalled();
    });

    it('throws ApiError 5001 when the DB read fails', async () => {
        const repo = makeFakeCmdRepo({findAll: null});
        await expect(makeService(repo, makeFakeApi(null)).load()).rejects.toMatchObject({code: 5001});
    });

    it('throws ApiError 5002 when the API returns no prices', async () => {
        const repo = makeFakeCmdRepo({findAll: [bitcoin, ethereum]});
        await expect(makeService(repo, makeFakeApi(null)).load()).rejects.toMatchObject({code: 5002});
    });

    it('updates prices and saves a log for every symbol returned by the API', async () => {
        const repo = makeFakeCmdRepo({findAll: [bitcoin, ethereum]});
        const api = makeFakeApi({
            prices: [
                {symbol: 'BTC', price: 100},
                {symbol: 'ETH', price: 50},
            ],
        });

        await makeService(repo, api).load();

        expect(api.getSimplePrice).toHaveBeenCalledWith(['BTC', 'ETH']);
        expect(repo.update).toHaveBeenCalledWith('1', expect.objectContaining({
            price: 100,
            updated_at: expect.any(Date),
        }));
        expect(repo.update).toHaveBeenCalledWith('2', expect.objectContaining({
            price: 50,
            updated_at: expect.any(Date),
        }));
        expect(repo.saveCryptoLog).toHaveBeenCalledWith(expect.objectContaining({
            crypto_id: '1',
            price: 100,
        }));
        expect(repo.saveCryptoLog).toHaveBeenCalledWith(expect.objectContaining({
            crypto_id: '2',
            price: 50,
        }));
    });

    it('does not throw when a single price update fails', async () => {
        const repo = makeFakeCmdRepo({findAll: [bitcoin], update: false});
        const api = makeFakeApi({prices: [{symbol: 'BTC', price: 100}]});
        await expect(makeService(repo, api).load()).resolves.toBeUndefined();
    });
});
