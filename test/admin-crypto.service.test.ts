import {describe, expect, it, jest} from '@jest/globals';
import {AdminCryptoService, CreateCryptoDTO, UpdateCryptoDTO} from '#app/services/admin/crypto.service.js';
import type {CryptoCmdRepo} from '#app/repositories/crypto.cmd.repo.js';
import type {Crypto} from '#app/domain/crypto.js';

const bitcoin: Crypto = {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 100,
    updated_at: null,
};

type Overrides = {
    findAll?: Crypto[] | null;
    findById?: Crypto | null;
    create?: Crypto | null;
    update?: Crypto | null;
    delete?: boolean;
    saveCryptoLog?: boolean;
};

type FakeCryptoCmdRepo = {
    [K in keyof CryptoCmdRepo]: jest.Mock<CryptoCmdRepo[K]>;
};

function makeFakeRepo(o: Overrides = {}): FakeCryptoCmdRepo {
    return {
        findAll: jest.fn<CryptoCmdRepo['findAll']>().mockResolvedValue(o.findAll ?? null),
        findById: jest.fn<CryptoCmdRepo['findById']>().mockResolvedValue(o.findById ?? null),
        create: jest.fn<CryptoCmdRepo['create']>().mockResolvedValue(o.create ?? null),
        update: jest.fn<CryptoCmdRepo['update']>().mockResolvedValue(o.update ?? null),
        delete: jest.fn<CryptoCmdRepo['delete']>().mockResolvedValue(o.delete ?? true),
        saveCryptoLog: jest.fn<CryptoCmdRepo['saveCryptoLog']>().mockResolvedValue(o.saveCryptoLog ?? true),
    };
}

describe('AdminCryptoService', () => {
    describe('getAll', () => {
        it('returns the cryptos from the repo', async () => {
            const service = new AdminCryptoService(makeFakeRepo({findAll: [bitcoin]}));
            await expect(service.getAll()).resolves.toEqual([bitcoin]);
        });

        it('throws ApiError 5001 when the repo returns null', async () => {
            const service = new AdminCryptoService(makeFakeRepo({findAll: null}));
            await expect(service.getAll()).rejects.toMatchObject({code: 5001});
        });
    });

    describe('getById', () => {
        it('returns the crypto found by id', async () => {
            const service = new AdminCryptoService(makeFakeRepo({findById: bitcoin}));
            await expect(service.getById('1')).resolves.toEqual(bitcoin);
        });

        it('throws ApiError 4041 when the crypto is missing', async () => {
            const service = new AdminCryptoService(makeFakeRepo({findById: null}));
            await expect(service.getById('missing')).rejects.toMatchObject({code: 4041});
        });
    });

    describe('create', () => {
        it('persists the crypto via the repo', async () => {
            const repo = makeFakeRepo({create: bitcoin});
            const service = new AdminCryptoService(repo);
            const data: CreateCryptoDTO = bitcoin;
            await expect(service.create(data)).resolves.toEqual(bitcoin);
            expect(repo.create).toHaveBeenCalledWith(data);
        });

        it('throws ApiError 5002 when the repo fails', async () => {
            const service = new AdminCryptoService(makeFakeRepo({create: null}));
            await expect(service.create(bitcoin)).rejects.toMatchObject({code: 5002});
        });
    });

    describe('update', () => {
        it('persists changes for an existing crypto', async () => {
            const updated = {...bitcoin, price: 111};
            const repo = makeFakeRepo({findById: bitcoin, update: updated});
            const service = new AdminCryptoService(repo);
            const data: UpdateCryptoDTO = {price: 111};
            await expect(service.update('1', data)).resolves.toEqual(updated);
            expect(repo.update).toHaveBeenCalledWith('1', data);
        });

        it('throws ApiError 4041 when the crypto is missing', async () => {
            const service = new AdminCryptoService(makeFakeRepo({findById: null}));
            await expect(service.update('missing', {price: 1})).rejects.toMatchObject({code: 4041});
        });

        it('throws ApiError 5003 when the repo fails to update', async () => {
            const service = new AdminCryptoService(makeFakeRepo({findById: bitcoin, update: null}));
            await expect(service.update('1', {price: 1})).rejects.toMatchObject({code: 5003});
        });
    });

    describe('delete', () => {
        it('deletes the crypto when it exists', async () => {
            const repo = makeFakeRepo({findById: bitcoin});
            const service = new AdminCryptoService(repo);
            await expect(service.delete('1')).resolves.toBe(true);
            expect(repo.delete).toHaveBeenCalledWith('1');
        });

        it('throws ApiError 4041 when the crypto is missing', async () => {
            const service = new AdminCryptoService(makeFakeRepo({findById: null}));
            await expect(service.delete('missing')).rejects.toMatchObject({code: 4041});
        });
    });
});
