import {Router, Request, Response} from "express";
import {AdminCryptoService} from "#app/services/admin/crypto.service.js";
import {apiErrorMiddleware} from "#app/common/express/error.middleware.js";

export default function buildAdminCryptoRoutes(
        adminCryptoService: AdminCryptoService,
        router?: Router,
    ): Router{
    router = router ?? Router();

    router.get("/", async (req: Request, res: Response) => {
        res.json(await adminCryptoService.getAll());
    });

    router.get("/:id", async (req: Request, res: Response) => {
        const id = String(req.params.id);

        res.json(await adminCryptoService.getById(id));
    });

    router.post("/", async (req: Request, res: Response) => {
        const user = await adminCryptoService.create(req.body);

        res.status(201).json(user);
    });

    router.patch("/:id", async (req: Request, res: Response) => {
        const id = String(req.params.id);

        res.json(await adminCryptoService.update(id, req.body));
    });

    router.delete("/:id", async (req: Request, res: Response) => {
        const id = String(req.params.id);

        await adminCryptoService.delete(id);

        res.status(204).send();
    });

    router.use(apiErrorMiddleware());

    return router;
}
