import {CryptoCmdRepo} from "#app/repositories/crypto.cmd.repo.js";
import {Crypto} from "#app/domain/crypto.js";
import {ApiError} from "#app/common/errors.js";

export type CreateCryptoDTO = Crypto;
export type UpdateCryptoDTO = {
    name?: string;
    price?: number;
};

export class AdminCryptoService {
    constructor(private readonly cryptoCmdRepo: CryptoCmdRepo) {
    }

    async getAll(): Promise<Crypto[]> {
        const result = await this.cryptoCmdRepo.findAll();
        if (!result) {
            throw new ApiError(5001, 'Failed to get All Cryptos');
        }
        return result;
    }

    async getById(id: string): Promise<Crypto> {
        const crypto = await this.cryptoCmdRepo.findById(id);
        if (!crypto) {
            throw new ApiError(4041, "Crypto not found");
        }
        return crypto;
    }

    async create(data: CreateCryptoDTO): Promise<Crypto> {
        const result = await this.cryptoCmdRepo.create(data);
        if (!result) {
            throw new ApiError(5002, "Failed to create Crypto");
        }
        return result;
    }

    async update(id: string, data: UpdateCryptoDTO): Promise<Crypto> {
        const existing = await this.getById(id);
        if (!existing) {
            throw new ApiError(4041, "Crypto not found");
        }
        const result = await this.cryptoCmdRepo.update(id, data);
        if (!result) {
            throw new ApiError(5003, "Failed to update Crypto");
        }
        return result;
    }

    async delete(id: string): Promise<boolean> {
        const existing = await this.getById(id);
        if (!existing) {
            throw new ApiError(4041, "Crypto not found");
        }
        return this.cryptoCmdRepo.delete(id);
    }
}
