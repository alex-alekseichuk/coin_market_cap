import {z} from "zod";
import type {ValidationSchemas} from "#app/common/express/validation.middleware.js";

/**
 * DELETE /admin/crypto/v1/:id
 */
const cryptoIdParamSchema = z.object({
    id: z.string().min(1, "id must not be empty"),
});

const schemas: ValidationSchemas = {
    params: cryptoIdParamSchema,
};

export default schemas;
