import {Logger} from "#app/common/logger.js";

export type CloseFn = () => Promise<void>;

export class GracefulShutdown {
    private close_fns: Array<CloseFn> = [];

    constructor(private readonly logger: Logger) {
        this.close_fns = [];

        process.on("SIGINT", () => this.shutdown());  // Ctrl+C
        process.on("SIGTERM", () => this.shutdown()); // Docker / Kubernetes
    }

    add(closeFn: CloseFn): GracefulShutdown {
        this.close_fns.push(closeFn);
        return this;
    }

    async shutdown(): Promise<void> {
        if (this.close_fns.length === 0) {
            return;
        }

        setTimeout(() => process.exit(2), 10_000);

        this.logger.info("Shutdown...");
        const close_fns = this.close_fns;
        this.close_fns = [];
        await Promise.all(close_fns.map(close_fn => close_fn()));
        process.exit(0);
    }
}
