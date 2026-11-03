import buildConfig from "#app/config.js";
import {ConsoleLogger} from "#app/common/console_logger.js";
import {GracefulShutdown} from "#app/common/graceful_shutdown.js";
import {ExpressHttpServer} from "#app/common/express/http_server.js";
import {httpErrorMiddleware} from "#app/common/express/error.middleware.js";
import {simpleAuthBearerMiddleware} from "#app/common/express/simple_auth_bearer.middleware.js";
import {SqliteDb} from "#app/common/sqlite_db.js";

//import {DummyCryptoCmdRepo} from "#app/repositories/dummy/crypto.cmd.repo.js";
import {SqliteCryptoCmdRepo} from "#app/repositories/sqlite/crypto.cmd.repo.js";
import {SqliteCryptoQueryRepo} from "#app/repositories/sqlite/crypto.query.repo.js";

import {AdminCryptoService} from "#app/services/admin/crypto.service.js";
import {CryptoService} from "#app/services/crypto.service.js";

import buildAdminCryptoRoutes from "#app/routes/admin/crypto.routes.js";
import buildCryptoRoutes from "#app/routes/public/crypto.routes.js";

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
const cryptoQueryRepo = new SqliteCryptoQueryRepo(logger, sqliteDb);

const adminCryptoService = new AdminCryptoService(cryptoCmdRepo);
const cryptoService = new CryptoService(cryptoQueryRepo);

const http_server = new ExpressHttpServer(logger, config);
http_server.useMiddleware(simpleAuthBearerMiddleware(logger, config.app.auth_key));

http_server.useRouter('/admin/crypto/v1', buildAdminCryptoRoutes(adminCryptoService));
http_server.useRouter('/crypto/v1', buildCryptoRoutes(cryptoService));

http_server.useMiddleware(httpErrorMiddleware(logger));
await http_server.listen(config.app.port ?? 3000);

const gracefulShutdown = new GracefulShutdown(logger);
gracefulShutdown
    .add(() => http_server.close())
    .add(() => sqliteDb.close())
;
