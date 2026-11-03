import {Logger} from "#app/common/logger.js";
import {NextFunction, Request, Response} from "express";
import {ApiError} from "#app/common/errors.js";

const UNAUTHORIZED = 'Unauthorized request';

export function simpleAuthBearerMiddleware(logger: Logger, key: string) {
    return function _simpleAuthBearerMiddleware(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        let token;

        const authHeader = req.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }

        if (!token) {
            logger.warn('Request w/o token.');
            throw new ApiError(401, UNAUTHORIZED);
        }

        if (token !== key) {
            logger.warn(`Incorrect authorization token used: ${token}`);
            throw new ApiError(401, UNAUTHORIZED);
        }

        next();
    }
}
