import {Logger} from "#app/common/logger.js";
import {NextFunction, Request, Response} from "express";
import {HttpError, HttpApiError, ApiError} from "#app/common/errors.js";

const INTERNAL_ERROR = "Internal server error";

export function httpErrorMiddleware(logger: Logger) {
    return function _httpErrorMiddleware(
        err: unknown,
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        if (err instanceof Error) {
            logger.error(`Operation failed: ${err.message}\n${err.stack ?? "(no stack)"}`);
        }

        if (err instanceof HttpApiError) {
            const error = {
                code: err.code ?? 0,
                message: err.message,
                error: err.error,
            };
            if (err.error) error.error = err.error;
            return res.status(err.status ?? 500).json(error);
        }

        if (err instanceof HttpError) {
            return res.status(err.status ?? 500).type('text/plain').send(err.message ?? INTERNAL_ERROR);
        }

        if (err instanceof Error) {
            return res.status(500).json({
                message: err.message ?? INTERNAL_ERROR
            });
        }

        return res.status(500).json({
            message: INTERNAL_ERROR
        });
    }
}

export type CodeToStatus = Record<number, number>;

export function apiErrorMiddleware(codeToStatus?: CodeToStatus) {
    return function _apiErrorMiddleware(
        err: unknown,
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        if (err instanceof ApiError) {
            let status;
            if (codeToStatus) {
                status = codeToStatus[err.code];
            }
            if (!status && err.code >= 100) {
                status = Number(String(err.code).slice(0, 3));
            }
            return next(HttpApiError.fromApiError(err, status ?? 500));
        }

        return next(new HttpApiError());
    };
}
