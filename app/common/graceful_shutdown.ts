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
        this.logger.info("Shutdown...");
        for (const close_fn of this.close_fns) {
            await close_fn();
        }
    }
}
