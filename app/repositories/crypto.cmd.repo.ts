import {Crypto, CryptoLog} from "#app/domain/crypto.js";
import {CreateCryptoDTO, UpdateCryptoDTO} from "#app/services/admin/crypto.service.js";

export interface CryptoCmdRepo {
    findAll(): Promise<Crypto[]|null>;
    findById(id: string): Promise<Crypto|null>;
    create(data: CreateCryptoDTO): Promise<Crypto|null>;
    update(id: string, data: UpdateCryptoDTO): Promise<Crypto|null>
    delete(id: string): Promise<boolean>;
    saveCryptoLog(log: CryptoLog): Promise<boolean>;
}

