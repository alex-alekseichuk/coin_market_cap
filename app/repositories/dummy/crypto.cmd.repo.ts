import {CryptoCmdRepo} from "#app/repositories/crypto.cmd.repo.js";
import {Crypto} from "#app/domain/crypto.js";
import {CreateCryptoDTO, UpdateCryptoDTO} from "#app/services/admin/crypto.service.js";

export class DummyCryptoCmdRepo implements CryptoCmdRepo {
    cryptos: Crypto[] = [];

    findAll(): Promise<Crypto[]> {
        return Promise.resolve(this.cryptos);
    }

    findById(id: string): Promise<Crypto|null> {
        return Promise.resolve(this.cryptos.find(c => c.id === id) ?? null);
    }

    create(data: CreateCryptoDTO): Promise<Crypto|null> {
        const crypto: Crypto = {
            ...data,
            symbol: data.symbol.toUpperCase(),
        };

        this.cryptos.push(crypto);

        return Promise.resolve(crypto);
    }

    async update(id: string, data: UpdateCryptoDTO): Promise<Crypto|null> {
        const user = await this.findById(id);

        if (!user) return null;

        Object.assign(user, data);

        return user;
    }

    delete(id: string): Promise<boolean> {
        const index = this.cryptos.findIndex(c => c.id === id);

        if (index === -1) return Promise.resolve(false);

        this.cryptos.splice(index, 1);

        return Promise.resolve(true);
    }
}
