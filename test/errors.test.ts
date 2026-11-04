import {describe, expect, it} from '@jest/globals';
import {ApiError, HttpApiError, HttpError} from '#app/common/errors.js';

describe('errors', () => {
    describe('HttpError', () => {
        it('stores status and message', () => {
            const err = new HttpError(404, 'not found');
            expect(err.status).toBe(404);
            expect(err.message).toBe('not found');
        });

        it('defaults status to 500 when omitted', () => {
            expect(new HttpError(undefined, 'boom').status).toBe(500);
        });
    });

    describe('ApiError', () => {
        it('stores code and message', () => {
            const err = new ApiError(5001, 'db failed');
            expect(err.code).toBe(5001);
            expect(err.message).toBe('db failed');
        });
    });

    describe('HttpApiError', () => {
        it('fromApiError maps code/message/error and defaults status to 500', () => {
            const api = new ApiError(42, 'msg', {detail: 1});
            const http = HttpApiError.fromApiError(api);
            expect(http.status).toBe(500);
            expect(http.code).toBe(42);
            expect(http.message).toBe('msg');
            expect(http.error).toEqual({detail: 1});
        });

        it('fromApiError honors an explicit status', () => {
            const http = HttpApiError.fromApiError(new ApiError(7, 'x'), 404);
            expect(http.status).toBe(404);
        });
    });
});
