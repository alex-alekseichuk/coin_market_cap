import express, {ErrorRequestHandler, Express, RequestHandler, Router} from "express";
import {HttpServer} from "#app/common/interfaces/http_server.js";
import {Logger} from "#app/common/interfaces/logger.js";
import {Config} from "#app/services/config.js";
import * as http from "node:http";

// err: HttpError,
// req: Request,
// res: Response,
// next: NextFunction

export class ExpressHttpServer implements HttpServer {
    private app: Express;
    private server: http.Server;

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
        this.logger.info(`HTTP server closing...`);
        return new Promise((resolve) => {
            this.server.close(() => {
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
