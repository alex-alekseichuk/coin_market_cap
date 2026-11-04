import {z} from "zod";
import type {ValidationSchemas} from "#app/common/express/validation.middleware.js";

/**
 * GET /crypto/v1/:symbol/history
 */
const cryptoSymbolParamSchema = z.object({
    symbol: z.string().min(1, "symbol must not be empty"),
});

const schemas: ValidationSchemas = {
    params: cryptoSymbolParamSchema,
};

export default schemas;
