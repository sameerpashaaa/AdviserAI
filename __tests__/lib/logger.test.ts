/**
 * Unit tests for the structured logger utility.
 */
import { logger } from "@/lib/logger";

// Capture stdout writes
let stdoutOutput = "";
let stderrOutput = "";

const originalWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

beforeAll(() => {
  // In test env NODE_ENV=test (not production), logger uses console.log.
  // We spy on console.log/error for test assertions.
  jest.spyOn(console, "log").mockImplementation((msg: string) => {
    stdoutOutput = msg;
  });
  jest.spyOn(console, "error").mockImplementation((msg: string) => {
    stderrOutput = msg;
  });
});

afterAll(() => {
  jest.restoreAllMocks();
  process.stdout.write = originalWrite;
  process.stderr.write = originalStderrWrite;
});

beforeEach(() => {
  stdoutOutput = "";
  stderrOutput = "";
});

describe("logger", () => {
  it("should export info, warn, error, debug methods", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("should call console.log for info messages in non-production", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test info message");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("should include context in log output", () => {
    let capturedMsg = "";
    const spy = jest.spyOn(console, "log").mockImplementation((msg: string) => {
      capturedMsg = msg;
    });
    logger.info("test with context", { userId: "u-123", route: "/api/test" });
    expect(capturedMsg).toContain("test with context");
    spy.mockRestore();
  });

  it("should handle errors in logger.error", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const testError = new Error("Test error message");
    expect(() => logger.error("something failed", testError)).not.toThrow();
    spy.mockRestore();
  });

  it("should not throw when no context is provided", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    expect(() => logger.debug("just a message")).not.toThrow();
    spy.mockRestore();
  });
});
