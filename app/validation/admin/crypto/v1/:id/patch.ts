import {z} from "zod";
import type {ValidationSchemas} from "#app/common/express/validation.middleware.js";

/**
 * PATCH /admin/crypto/v1/:id
 */
const cryptoIdParamSchema = z.object({
    id: z.string().min(1, "id must not be empty"),
});

const updateCryptoSchema = z
    .object({
        name: z.string().min(1, "name must not be empty").optional(),
        price: z.number().finite().nullable().optional(),
        updated_at: z.coerce.date().optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {message: "At least one field must be provided"},
    );

const schemas: ValidationSchemas = {
    params: cryptoIdParamSchema,
    body: updateCryptoSchema,
};

export default schemas;
