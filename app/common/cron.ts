import EventEmitter from "node:events";
import {Logger} from "#app/common/logger.js";
import { ApiError } from "./errors.js";

function parse_int(str: string): number {
    const value = parseInt(str, 10);

    if (isNaN(value)) {
        throw new Error('Invalid value');
    }

    return value;
}

const min_values = [0, 0, 1];
const max_values = [59, 59, 31];

type Pattern = Array<number[]|null>;

function parse_cron_string(cron_string: string): Pattern {
    // process only 3 first parameters of the cron string:
    // minute, hour and day of month
    const parts = cron_string.split(/\s+/).slice(0, 3);

    return parts.map((part) => {
        if (part === '*') {
            return null;
        }

        const items = [
        ];

        const sections = part.split(',');
        for (const i_section in sections) {
            const period = sections[i_section];

            // period like 1-5
            if (period.includes('-')) {
                const [
                    from,
                    to,
                ] = period.split('-');

                for (let i = parse_int(from); i <= parse_int(to); i++) {
                    items.push(i);
                }

                continue;
            }

            if (period.startsWith('*/')) {
                const step = parse_int(period.substring(2));
                for (let n = min_values[i_section]; n <= max_values[i_section]; n += step) {
                    items.push(n);
                }

                continue;
            }

            // single numeric value
            items.push(parse_int(period));
        }

        return items;
    });
}

type Interval = ReturnType<typeof setInterval>;
type Handler = () => Promise<void>;
type Task = {
    pattern: Pattern;
    handler: Handler;
};

export class Cron {
    private tasks: Task[] = [];
    private interval: Interval|null = null;
    private last_minute: number;
    private service = new EventEmitter();

    constructor(private readonly logger: Logger, private readonly _check_interval: number = 10000) {
    }

    public schedule(cron_string: string, handler: Handler) {
        try {
            const pattern = parse_cron_string(cron_string);

            this.tasks.push({
                pattern,
                handler,
            });
        } catch (e) {
            this.logger.error(`Cannot parse cron string: ${cron_string}`);
        }
    }

    public start() {
        if (this.interval) {
            return;
        }

        this.interval = setInterval(() => {
            const now_d = new Date();
            const now_minute = Math.floor(now_d.getTime() / 60000);

            if (!this.last_minute) {
                this.last_minute = now_minute - 1;
            }

            if (this.last_minute < now_minute) {
                for (let minute = this.last_minute + 1; minute <= now_minute; minute++) {
                    const d = new Date(minute * 60000);

                    for (const task of this.tasks) {
                        if (
                            (!task.pattern[0] || task.pattern[0].includes(d.getMinutes())) &&
                            (!task.pattern[1] || task.pattern[1].includes(d.getHours())) &&
                            (!task.pattern[2] || task.pattern[2].includes(d.getDate()))
                        ) {
                            new Promise<void>(async (resolve) => {
                                try {
                                    await task.handler();
                                } catch (e) {
                                    this.logger.error('Failed cron job');
                                    if (e instanceof ApiError) {
                                        this.logger.error(`Failed cron job code: ${e.code}, message: ${e.message}`);
                                    } else if (e instanceof Error) {
                                        this.logger.error(`Failed cron job: ${e.message}`);
                                    } else {
                                        this.logger.error(`Failed cron job`);
                                    }
                                }
                                resolve();
                            }).then(() => {});
                            
                        }
                    }
                }

                this.last_minute = now_minute;
            }
        }, this._check_interval);
    }

    public stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

