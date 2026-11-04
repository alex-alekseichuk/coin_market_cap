import {describe, expect, it, jest} from '@jest/globals';
import {CryptoService} from '#app/services/crypto.service.js';
import type {CryptoQueryRepo} from '#app/repositories/crypto.query.repo.js';
import type {Crypto, CryptoLog} from '#app/domain/crypto.js';

const bitcoin: Crypto = {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 100,
    updated_at: null,
};

const logs: CryptoLog[] = [
    {crypto_id: '1', price: 101, updated_at: new Date(2025, 11, 3, 10, 0, 0)},
    {crypto_id: '1', price: 100, updated_at: new Date(2025, 11, 2, 10, 0, 0)},
];

type Overrides = {
    findAllCryptos?: Crypto[] | null;
    findCryptoBySymbol?: Crypto | null;
    findAllCryptoLogs?: CryptoLog[] | null;
};

type FakeCryptoQueryRepo = {
    [K in keyof CryptoQueryRepo]: jest.Mock<CryptoQueryRepo[K]>;
};

function makeFakeRepo(o: Overrides = {}): FakeCryptoQueryRepo {
    return {
        findAllCryptos: jest.fn<CryptoQueryRepo['findAllCryptos']>().mockResolvedValue(o.findAllCryptos ?? null),
        findCryptoBySymbol: jest.fn<CryptoQueryRepo['findCryptoBySymbol']>().mockResolvedValue(o.findCryptoBySymbol ?? null),
        findAllCryptoLogs: jest.fn<CryptoQueryRepo['findAllCryptoLogs']>().mockResolvedValue(o.findAllCryptoLogs ?? null),
    };
}

describe('CryptoService', () => {
    describe('getCryptos', () => {
        it('returns all cryptos from the repo', async () => {
            const service = new CryptoService(makeFakeRepo({findAllCryptos: [bitcoin]}));
            await expect(service.getCryptos()).resolves.toEqual([bitcoin]);
        });

        it('throws ApiError 5001 when the repo returns null', async () => {
            const service = new CryptoService(makeFakeRepo({findAllCryptos: null}));
            await expect(service.getCryptos()).rejects.toMatchObject({code: 5001});
        });
    });

    describe('getCryptoLogsBySymbol', () => {
        it('returns the logs for a known symbol', async () => {
            const repo = makeFakeRepo({findCryptoBySymbol: bitcoin, findAllCryptoLogs: logs});
            const service = new CryptoService(repo);
            await expect(service.getCryptoLogsBySymbol('btc')).resolves.toEqual(logs);
            expect(repo.findCryptoBySymbol).toHaveBeenCalledWith('btc');
            expect(repo.findAllCryptoLogs).toHaveBeenCalledWith('1');
        });

        it('throws ApiError 4041 when the symbol is unknown', async () => {
            const service = new CryptoService(makeFakeRepo({findCryptoBySymbol: null}));
            await expect(service.getCryptoLogsBySymbol('xxx')).rejects.toMatchObject({code: 4041});
        });

        it('throws ApiError 5002 when the logs are unavailable', async () => {
            const service = new CryptoService(
                makeFakeRepo({findCryptoBySymbol: bitcoin, findAllCryptoLogs: null}),
            );
            await expect(service.getCryptoLogsBySymbol('BTC')).rejects.toMatchObject({code: 5002});
        });
    });
});
