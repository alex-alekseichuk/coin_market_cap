import {Crypto, CryptoLog} from "#app/domain/crypto.js";
import {Logger} from "#app/common/logger.js";
import {SqliteDb} from "#app/common/sqlite_db.js";
import {strDt} from "#app/common/utils.js";
import {CryptoQueryRepo} from "#app/repositories/crypto.query.repo.js";

type CryptoRow = Omit<Crypto, "updated_at"> & { updated_at: string };
type CryptoLogRow = Omit<CryptoLog, "updated_at"> & { updated_at: string };

export class SqliteCryptoQueryRepo implements CryptoQueryRepo {
    constructor(
        private readonly logger: Logger,
        private readonly db: SqliteDb,
    ) {
    }

    async findAllCryptos(): Promise<Crypto[] | null> {
        const rows: CryptoRow[] | null = await this.db.all<CryptoRow[]>(
            'SELECT * FROM cryptos'
        );
        if (!rows) return null;
        return rows.map((row) => ({...row, updated_at: strDt(row.updated_at)}));
    }

    async findCryptoBySymbol(symbol: string): Promise<Crypto | null> {
        const row: CryptoRow|null = await this.db.get<CryptoRow>(
            'SELECT * FROM cryptos WHERE symbol = ?',
            [symbol.toUpperCase()]
        );
        if (!row) return null;
        return {...row, updated_at: strDt(row.updated_at)} as Crypto;
    }

    async findAllCryptoLogs(crypto_id: string): Promise<CryptoLog[] | null> {
        const rows: CryptoLogRow[] | null = await this.db.all<CryptoLogRow[]>(
            'SELECT * FROM crypto_logs WHERE crypto_id = ?',
            [crypto_id]
        );
        if (!rows) return null;
        return rows.map((row) => ({...row, updated_at: strDt(row.updated_at)}));
    }

}
