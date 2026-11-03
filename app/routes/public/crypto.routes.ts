import {Router, Request, Response} from "express";
import {CryptoService} from "#app/services/crypto.service.js";
import {apiErrorMiddleware} from "#app/common/express/error.middleware.js";

export default function buildCryptoRoutes(
        cryptoService: CryptoService,
        router?: Router,
    ): Router{
    router = router ?? Router();

    router.get("/", (req: Request, res: Response) => {
        res.json(cryptoService.getCryptos());
    });

    router.get("/:symbol/history", (req: Request, res: Response) => {
        const symbol = String(req.params.symbol);

        res.json(cryptoService.getCryptoLogsBySymbol(symbol));
    });

    router.use(apiErrorMiddleware());

    return router;
}
