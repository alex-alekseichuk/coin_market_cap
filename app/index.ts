import buildConfig from '#app/services/config.js';
import {ConsoleLogger} from "#app/common/interfaces/logger.js";

const config = buildConfig();
const logger = new ConsoleLogger();

logger.info(JSON.stringify(config, null, 2));
