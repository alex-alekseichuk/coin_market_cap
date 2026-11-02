import {CryptoCmdRepo} from "#app/repositories/crypto.cmd.repo.js";
import {Crypto} from "#app/domain/crypto.js";
import {httpError} from "#app/common/utils.js";

export type CreateCryptoDTO = Crypto;
export type UpdateCryptoDTO = {
    name?: string;
    price?: number;
};

export class AdminCryptoService {
    constructor(private readonly cryptoCmdRepo: CryptoCmdRepo) {
    }

    getAll(): Promise<Crypto[]|null> {
        return this.cryptoCmdRepo.findAll();
    }

    async getById(id: string): Promise<Crypto> {
        const crypto = await this.cryptoCmdRepo.findById(id);

        if (!crypto) {
            throw httpError(404, "Crypto not found");
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
