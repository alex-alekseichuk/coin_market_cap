import {Router, Request, Response} from "express";
import {AdminCryptoService} from "#app/services/admin/crypto.service.js";
import {apiErrorMiddleware} from "#app/common/express/error.middleware.js";
import {schemaValidationMiddleware} from "#app/common/express/validation.middleware.js";

export default function buildAdminCryptoRoutes(
        adminCryptoService: AdminCryptoService,
        router?: Router,
    ): Router{
    router = router ?? Router();

    router.use(schemaValidationMiddleware());

    /**
     * @swagger
     * /admin/crypto/v1:
     *   get:
     *     tags: [Crypto Admin]
     *     summary: List all crypto assets
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of crypto assets
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Crypto'
     *       401:
     *         description: Missing or invalid Bearer token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get("/", async (req: Request, res: Response) => {
        res.json(await adminCryptoService.getAll());
    });

    /**
     * @swagger
     * /admin/crypto/v1/{id}:
     *   get:
     *     tags: [Crypto Admin]
     *     summary: Get a crypto asset by id
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: The crypto asset
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Crypto'
     *       401:
     *         description: Missing or invalid Bearer token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Crypto asset not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get("/:id", async (req: Request, res: Response) => {
        const id = String(req.params.id);

        res.json(await adminCryptoService.getById(id));
    });

    /**
     * @swagger
     * /admin/crypto/v1:
     *   post:
     *     tags: [Crypto Admin]
     *     summary: Create a crypto asset
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Crypto'
     *     responses:
     *       201:
     *         description: The created crypto asset
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Crypto'
     *       400:
     *         description: Validation failed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Missing or invalid Bearer token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post("/", async (req: Request, res: Response) => {
        const user = await adminCryptoService.create(req.body);

        res.status(201).json(user);
    });

    /**
     * @swagger
     * /admin/crypto/v1/{id}:
     *   patch:
     *     tags: [Crypto Admin]
     *     summary: Update a crypto asset
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CryptoUpdate'
     *     responses:
     *       200:
     *         description: The updated crypto asset
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Crypto'
     *       400:
     *         description: Validation failed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Missing or invalid Bearer token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Crypto asset not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.patch("/:id", async (req: Request, res: Response) => {
        const id = String(req.params.id);

        res.json(await adminCryptoService.update(id, req.body));
    });

    /**
     * @swagger
     * /admin/crypto/v1/{id}:
     *   delete:
     *     tags: [Crypto Admin]
     *     summary: Delete a crypto asset
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       204:
     *         description: The crypto asset was deleted
     *       401:
     *         description: Missing or invalid Bearer token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Crypto asset not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.delete("/:id", async (req: Request, res: Response) => {
        const id = String(req.params.id);

        await adminCryptoService.delete(id);

        res.status(204).send();
    });

    router.use(apiErrorMiddleware());

    return router;
}
