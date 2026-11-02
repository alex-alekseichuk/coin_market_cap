import sqlite3 from 'sqlite3';
import {open, Database, ISqlite} from "sqlite";
import {Logger} from "#app/common/logger.js";

export class SqliteDb {
    private db: Database|undefined;
    constructor(
        private readonly logger: Logger,
        private readonly filename: string = './database.sqlite',
    ) {
    }

    async open(filename?: string): Promise<Boolean> {
        filename = filename ?? this.filename;

        try {
            this.db = await open({
                filename,
                driver: sqlite3.Database,
            });

            return true;
        } catch (err) {
            this.logger.error(`Error opening sqlite db file ${filename}: ${err}`);

            return false;
        }
    }

    async close(): Promise<void> {
        if (!this.db) {
            return;
        }

        const db = this.db;
        this.db = undefined;
        this.logger.info('Closing db...');
        await db.close();
        this.logger.info('Db closed');
    }

    async exec(sql: string): Promise<Boolean> {
        if (!this.db) {
            this.logger.error(`Db is not opened.`);
            return false;
        }

        try {
            await this.db.exec(sql);

            return true;
        } catch (err) {
            this.logger.error(`Db Error: ${err}`);
            return false;
        }
    }

    async run(sql: string, params?: Array<any>): Promise<ISqlite.RunResult|null> {
        if (!this.db) {
            this.logger.error(`Db is not opened.`);
            return null;
        }

        try {
            return await this.db.run(sql, params);
        } catch (err) {
            this.logger.error(`Db Error: ${err}`);
            return null;
        }
    }

    async get<T>(sql: string, params?: Array<any>): Promise<T|null> {
        if (!this.db) {
            this.logger.error(`Db is not opened.`);
            return null;
        }

        try {
            return await this.db.get<T>(sql, params) ?? null;
        } catch (err) {
            this.logger.error(`Db Error: ${err}`);
            return null;
        }
    }

    async all<T = any[]>(sql: string, params?: Array<any>): Promise<T|null> {
        if (!this.db) {
            this.logger.error(`Db is not opened.`);
            return null;
        }

        try {
            return await this.db.all<T>(sql, params) ?? null;
        } catch (err) {
            this.logger.error(`Db Error: ${err}`);
            return null;
        }
    }
}
