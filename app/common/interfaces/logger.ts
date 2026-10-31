export interface Logger {
    error(msg: string): void;
    warn(msg: string): void;
    info(msg: string): void;
    debug(msg: string): void;
    trace(msg: string): void;
}

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
