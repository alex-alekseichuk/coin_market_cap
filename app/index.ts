import buildConfig from "#app/config.js";
import {ConsoleLogger} from "#app/common/console_logger.js";
import {GracefulShutdown} from "#app/common/graceful_shutdown.js";
import {ExpressHttpServer} from "#app/common/express/http_server.js";
import {buildErrorMiddleware} from "#app/common/express/error_middleware.js";

//import {DummyCryptoCmdRepo} from "#app/repositories/dummy/crypto.cmd.repo.js";
import {SqliteCryptoCmdRepo} from "#app/repositories/sqlite/crypto.cmd.repo.js";

import {AdminCryptoService} from "#app/services/admin/crypto.service.js";

import buildAdminCryptoRoutes from "#app/routes/admin/crypto.routes.js";
import {SqliteDb} from "#app/common/sqlite_db.js";

const config = buildConfig();
const logger = new ConsoleLogger();

logger.debug(JSON.stringify(config, null, 2));

// const cryptoCmdRepo = new DummyCryptoCmdRepo();
const sqliteDb = new SqliteDb(logger);
if (!await sqliteDb.open()) {
    process.exit(1);
}
const cryptoCmdRepo = new SqliteCryptoCmdRepo(logger, sqliteDb);
await cryptoCmdRepo.init();

const adminCryptoService = new AdminCryptoService(cryptoCmdRepo);

const http_server = new ExpressHttpServer(logger, config);

http_server.useRouter('/admin/crypto/v1', buildAdminCryptoRoutes(adminCryptoService));

http_server.useMiddleware(buildErrorMiddleware(logger));
await http_server.listen(config.app.port ?? 3000);

const gracefulShutdown = new GracefulShutdown(logger);
gracefulShutdown
    .add(() => http_server.close())
    .add(() => sqliteDb.close())
;
