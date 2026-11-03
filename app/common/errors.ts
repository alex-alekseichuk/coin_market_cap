export class HttpError extends Error {
    constructor(
        public status: number = 500,
        message: string,
    ) {
        super(message);
    }
}

export class ApiError extends Error {
    constructor(
        public code: number,
        message: string,
        public error?: unknown,
    ) {
        super(message);
    }
}


export class HttpApiError extends Error {
    constructor(
        public status: number = 500,
        public code?: number,
        message?: string,
        public error?: unknown,
    ) {
        super(message);
    }

    public static fromApiError(apiError: ApiError, status?: number): HttpApiError {
        return new HttpApiError(status ?? 500, apiError.code, apiError.message, apiError.error);
    }
}

