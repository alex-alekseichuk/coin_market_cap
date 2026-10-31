import buildConfig from "#app/config.js";
import {ConsoleLogger} from "#app/common/console_logger.js";
import {GracefulShutdown} from "#app/common/graceful_shutdown.js";
import {ExpressHttpServer} from "#app/common/express/http_server.js";
import {buildErrorMiddleware} from "#app/common/express/error_middleware.js";

import {DummyCryptoCmdRepo} from "#app/repositories/dummy/crypto.cmd.repo.js";

import {AdminCryptoService} from "#app/services/admin/crypto.service.js";

import buildAdminCryptoRoutes from "#app/routes/admin/crypto.routes.js";

const config = buildConfig();
const logger = new ConsoleLogger();

logger.debug(JSON.stringify(config, null, 2));

const gracefulShutdown = new GracefulShutdown(logger);

const http_server = new ExpressHttpServer(logger, config);
gracefulShutdown.add(() => http_server.close());

const cryptoCmdRepo = new DummyCryptoCmdRepo();
const adminCryptoService = new AdminCryptoService(cryptoCmdRepo);
const adminCryptoRouter = buildAdminCryptoRoutes(adminCryptoService);
http_server.useRouter('/admin/crypto/v1', adminCryptoRouter);
http_server.useMiddleware(buildErrorMiddleware(logger));

await http_server.listen(config.app.port ?? 3000);
