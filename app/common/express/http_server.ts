import express, {ErrorRequestHandler, Express, RequestHandler, Router} from "express";
import {HttpServer} from "#app/common/http_server.js";
import {Logger} from "#app/common/logger.js";
import {Config} from "#app/config.js";
import * as http from "node:http";

export class ExpressHttpServer implements HttpServer {
    private app: Express;
    private server: http.Server|undefined;

    constructor(
        private readonly logger: Logger,
        private readonly config: Config,
    ) {
        this.app = express();
        this.app.use(express.json());
    }

    listen(port: number): Promise<void> {
        return new Promise((resolve) => {
            this.server = this.app.listen(port, () => {
                this.logger.info(`HTTP server listening on port ${port}`);
                resolve();
            });
        })
    }

    close(): Promise<void> {
        if (!this.server) return Promise.resolve();

        const server = this.server;
        this.server = undefined;

        this.logger.info(`HTTP server closing...`);
        return new Promise((resolve) => {
            server.close(() => {
                this.logger.info(`HTTP server closed`);
                resolve();
            });
        })
    }

    useRouter(url: string, router: Router) {
        this.app.use(url, router);
    }
    useMiddleware(middleware: RequestHandler|ErrorRequestHandler) {
        this.app.use(middleware);
    }
}
