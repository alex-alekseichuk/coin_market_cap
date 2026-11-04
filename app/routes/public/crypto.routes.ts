import {Router, Request, Response} from "express";
import {CryptoService} from "#app/services/crypto.service.js";
import {apiErrorMiddleware} from "#app/common/express/error.middleware.js";
import {schemaValidationMiddleware} from "#app/common/express/validation.middleware.js";

export default function buildCryptoRoutes(
        cryptoService: CryptoService,
        router?: Router,
    ): Router{
    router = router ?? Router();

    router.use(schemaValidationMiddleware());

    /**
     * @swagger
     * /crypto/v1:
     *   get:
     *     tags: [Crypto]
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
        res.json(await cryptoService.getCryptos());
    });

    /**
     * @swagger
     * /crypto/v1/{symbol}/history:
     *   get:
     *     tags: [Crypto]
     *     summary: Price history of a crypto symbol
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: symbol
     *         in: path
     *         required: true
     *         description: Ticker symbol of the crypto asset
     *         schema:
     *           type: string
     *         example: BTC
     *     responses:
     *       200:
     *         description: Price history of the crypto symbol
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/CryptoLog'
     *       401:
     *         description: Missing or invalid Bearer token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.get("/:symbol/history", async (req: Request, res: Response) => {
        const symbol = String(req.params.symbol);

        res.json(await cryptoService.getCryptoLogsBySymbol(symbol));
    });

    router.use(apiErrorMiddleware());

    return router;
}
