import {z} from "zod";
import type {ValidationSchemas} from "#app/common/express/validation.middleware.js";

/**
 * POST /admin/crypto/v1/
 */
const createCryptoSchema = z.object({
    id: z.string().min(1, "id must not be empty"),
    symbol: z.string().min(1, "symbol must not be empty"),
    name: z.string().min(1, "name must not be empty"),
    price: z.number().finite().nullable().optional(),
    updated_at: z.coerce.date().optional(),
});

const schemas: ValidationSchemas = {
    body: createCryptoSchema,
};

export default schemas;
