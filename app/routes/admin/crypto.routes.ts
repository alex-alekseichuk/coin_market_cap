import { Router, Request, Response } from "express";
import {AdminCryptoService} from "#app/services/admin/crypto.service.js";

export default function buildAdminCryptoRoutes(adminCryptoService: AdminCryptoService, router?: Router): Router{
    router = router ?? Router();

    router.get("/", (req: Request, res: Response) => {
        res.json(adminCryptoService.getAll());
    });

    router.get("/:id", (req: Request, res: Response) => {
        const id = String(req.params.id);

        res.json(adminCryptoService.getById(id));
    });

    router.post("/", (req: Request, res: Response) => {
        const user = adminCryptoService.create(req.body);

        res.status(201).json(user);
    });

    router.patch("/:id", (req: Request, res: Response) => {
        const id = String(req.params.id);

        res.json(adminCryptoService.update(id, req.body));
    });

    router.delete("/:id", (req: Request, res: Response) => {
        const id = String(req.params.id);

        adminCryptoService.delete(id);

        res.status(204).send();
    });

    return router;
}
