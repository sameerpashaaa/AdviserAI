/**
 * Integration-style tests for the /api/health route handler.
 * We mock external dependencies (DB, Redis) to test the route logic in isolation.
 */

// Mock the DB module
jest.mock("@/lib/db", () => ({
  getDb: jest.fn(),
}));

// Mock the Redis client
jest.mock("@upstash/redis", () => ({
  Redis: jest.fn().mockImplementation(() => ({
    ping: jest.fn().mockResolvedValue("PONG"),
  })),
}));

import { getDb } from "@/lib/db";

const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;

describe("GET /api/health", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = "test_gemini_key";
    // No Redis in unit tests — unset to test graceful skipping
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("returns healthy when DB is up", async () => {
    const mockExecute = jest.fn().mockResolvedValue([{ "?column?": 1 }]);
    mockGetDb.mockReturnValue({ execute: mockExecute } as unknown as ReturnType<typeof getDb>);

    // Dynamic import to pick up mocks
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("healthy");
    expect(body.details.database.status).toBe("up");
  });

  it("returns unhealthy when DB throws", async () => {
    mockGetDb.mockReturnValue({
      execute: jest.fn().mockRejectedValue(new Error("Connection refused")),
    } as unknown as ReturnType<typeof getDb>);

    // Clear the module cache so we get a fresh import with the new mock
    jest.resetModules();
    jest.mock("@/lib/db", () => ({
      getDb: jest.fn().mockReturnValue({
        execute: jest.fn().mockRejectedValue(new Error("Connection refused")),
      }),
    }));

    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.status).toBe("unhealthy");
  });

  it("returns unhealthy when GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    const mockExecute = jest.fn().mockResolvedValue([]);
    mockGetDb.mockReturnValue({ execute: mockExecute } as unknown as ReturnType<typeof getDb>);

    jest.resetModules();
    jest.mock("@/lib/db", () => ({
      getDb: jest.fn().mockReturnValue({ execute: jest.fn().mockResolvedValue([]) }),
    }));

    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.details.gemini.status).toBe("missing_api_key");
  });
});
