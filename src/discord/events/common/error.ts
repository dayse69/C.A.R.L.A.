import { logger } from "../base/base.logger.js";
import { createEvent } from "../base/creators.js";

createEvent({
    name: "Error handler",
    event: "error",
    async run(error) {
        logger.error(error);
    },
});
