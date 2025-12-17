import { logger } from "#utils/logger";
import { describe, expect, it } from "vitest";

describe("Logger", () => {
    it("should have all log methods", () => {
        expect(typeof logger.log).toBe("function");
        expect(typeof logger.error).toBe("function");
        expect(typeof logger.warn).toBe("function");
        expect(typeof logger.success).toBe("function");
    });
});
