import {CryptoCmdRepo} from "#app/repositories/crypto.cmd.repo.js";
import {Crypto} from "#app/domain/crypto.js";
import {CreateCryptoDTO, UpdateCryptoDTO} from "#app/services/admin/crypto.service.js";
import {Logger} from "#app/common/logger.js";
import {SqliteDb} from "#app/common/sqlite_db.js";
import {dtStr, strDt} from "#app/common/utils.js";
import { SimplePrice } from "#app/api/coin_market_cap.api.js";

type CryptoRow = Omit<Crypto, "updated_at"> & {updated_at: string};

export class SqliteCryptoCmdRepo implements CryptoCmdRepo {
    constructor(
        private readonly logger: Logger,
        private readonly db: SqliteDb,
    ) {
    }

    async init() {
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS cryptos (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                symbol TEXT UNIQUE NOT NULL,
                price NUMERIC,
                updated_at TEXT
            )
        `);

        await this.db.exec(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_cryptos_symbol
                ON cryptos (symbol COLLATE NOCASE);
        `);

        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS crypto_logs (
                crypto_id TEXT,
                price NUMERIC,
                updated_at TEXT,
                PRIMARY KEY (crypto_id, updated_at)
            )
        `);
    }

    async findAll(): Promise<Crypto[]|null> {
        const rows: CryptoRow[] | null = await this.db.all<CryptoRow[]>(
            'SELECT * FROM cryptos'
        );
        if (!rows) return null;
        return rows.map((row) => ({...row, updated_at: strDt(row.updated_at)}));
    }

    async findById(id: string): Promise<Crypto|null> {
        const row: CryptoRow|null = await this.db.get<CryptoRow>(
            'SELECT * FROM cryptos WHERE id = ?',
            [id]
        );
        if (!row) return null;
        return {...row, updated_at: strDt(row.updated_at)} as Crypto;
    }

    async create(data: CreateCryptoDTO): Promise<Crypto|null> {
        await this.db.run(
            `INSERT INTO cryptos (id, name, symbol, updated_at) VALUES (?, ?, ?, ?)`,
            [data.id, data.name, data.symbol.toUpperCase(), dtStr()]
        );

        return data;
    }

    async update(id: string, data: UpdateCryptoDTO): Promise<Crypto|null> {
        let crypto = await this.findById(id);

        if (!crypto) return null;

        crypto = {...crypto, ...data, updated_at: new Date};

        await this.db.run(
            'UPDATE cryptos SET name = ?, price = ?, updated_at = ? WHERE id = ?',
            [
                crypto?.name,
                crypto?.price,
                dtStr(crypto?.updated_at),
                id,
            ]
        );

        return crypto;
    }

    async delete(id: string): Promise<boolean> {
        return null !== await this.db.run('DELETE FROM cryptos WHERE id = ?', [id]);
    }

    async saveCryptoLogs(logs: SimplePrice[]): Promise<void> {
        const data: any[] = [];

        await this.db.run(
            `INSERT INTO crypto_logs (crypto_id, price, updated_at) VALUES (?, ?, ?)`,
            [data.id, data.name, data.symbol.toUpperCase(), dtStr()]
        );
        
    }
    
}
