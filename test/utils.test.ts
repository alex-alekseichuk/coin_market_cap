import {describe, expect, it} from '@jest/globals';
import {dtStr, strDt} from '#app/common/utils.js';

describe('utils', () => {
    describe('dtStr', () => {
        it('formats a Date as "YYYY-MM-DD HH:mm:ss"', () => {
            expect(dtStr(new Date(2025, 11, 4, 9, 5, 3))).toBe('2025-12-04 09:05:03');
        });

        it('zero-pads single-digit components', () => {
            expect(dtStr(new Date(2025, 0, 1, 2, 3, 4))).toBe('2025-01-01 02:03:04');
        });

        it('falls back to the current time for null, undefined or no argument', () => {
            const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
            expect(dtStr()).toMatch(pattern);
            expect(dtStr(null)).toMatch(pattern);
            expect(dtStr(undefined)).toMatch(pattern);
        });
    });

    describe('strDt', () => {
        it('parses "YYYY-MM-DD HH:mm:ss" into a Date', () => {
            const d = strDt('2025-12-04 09:05:03');
            expect(d).toBeInstanceOf(Date);
            expect(d.getFullYear()).toBe(2025);
            expect(d.getMonth()).toBe(11);
            expect(d.getDate()).toBe(4);
            expect(d.getHours()).toBe(9);
            expect(d.getMinutes()).toBe(5);
            expect(d.getSeconds()).toBe(3);
        });

        it('round-trips with dtStr', () => {
            const d = new Date(2025, 0, 1, 12, 30, 15);
            expect(strDt(dtStr(d)).getTime()).toBe(d.getTime());
        });
    });
});
