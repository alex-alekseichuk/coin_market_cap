import {Logger} from "#app/common/logger.js";
import {NextFunction, Request, Response} from "express";

type ErrorWithStatus = Error & { status?: number };

export function buildErrorMiddleware(logger: Logger) {
    return function errorMiddleware(
        err: ErrorWithStatus,
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        logger.error(`Operation failed: ${err.message}\n${err.stack ?? "(no stack)"}`);

        res.status(err.status ?? 500).json({
            error: err.message || "Internal server error"
        });
    }
}
