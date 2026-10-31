import {CryptoCmdRepo} from "#app/repositories/crypto.cmd.repo.js";
import {Crypto} from "#app/domain/crypto.js";

export type CreateCryptoDTO = Crypto;
export type UpdateCryptoDTO = {
    price: number;
    timestamp: Date;
};
export type UpdateCryptoPriceDTO = {
    price: number;
    timestamp: Date;
};

export class AdminCryptoService {
    constructor(private readonly cryptoCmdRepo: CryptoCmdRepo) {
    }

    getAll(): Promise<Crypto[]> {
        return this.cryptoCmdRepo.findAll();
    }

    async getById(id: string): Promise<Crypto> {
        const crypto = await this.cryptoCmdRepo.findById(id);

        if (!crypto) {
            throw Object.assign(new Error("Crypto not found"), {
                status: 404
            });
        }

        return crypto;
    }

    create(data: CreateCryptoDTO): Promise<Crypto|null> {
        return this.cryptoCmdRepo.create(data);
    }

    async update(id: string, data: UpdateCryptoDTO): Promise<Crypto|null> {
        await this.getById(id);

        return this.cryptoCmdRepo.update(id, data);
    }

    async delete(id: string): Promise<boolean> {
        await this.getById(id);

        return this.cryptoCmdRepo.delete(id);
    }
}
