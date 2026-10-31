import {Logger} from "#app/common/logger.js";

export class ConsoleLogger implements Logger {
    debug(msg: string): void {
        console.log(msg);
    }

    error(msg: string): void {
        console.log(msg);
    }

    info(msg: string): void {
        console.log(msg);
    }

    trace(msg: string): void {
        console.log(msg);
    }

    warn(msg: string): void {
        console.log(msg);
    }
}
