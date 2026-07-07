/**
 * jest.config.ts
 *
 * Jest configuration for AdviserAI.
 *
 * Required dev dependencies (add to package.json devDependencies):
 *   jest, ts-jest, @types/jest, jest-environment-node
 *
 *   npm install -D jest ts-jest @types/jest
 */

import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const config: Config = {
  // Use ts-jest to transpile TypeScript test files
  preset: "ts-jest",

  // Run tests in a Node.js environment (not jsdom)
  testEnvironment: "node",

  // Map TypeScript path aliases (e.g. @/* → ./*) so Jest can resolve them
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}, {
    prefix: "<rootDir>/",
  }),

  // Where to look for tests
  roots: ["<rootDir>"],

  // File patterns that Jest considers test files
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts",
    "**/*.test.ts",
    "**/*.spec.ts",
  ],

  // Exclude generated / vendor directories
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // Run setup file after Jest initialises the test framework
  setupFilesAfterFramework: [], // populated by jest.setup.ts via setupFilesAfterFramework option below
  setupFilesAfterFramework: undefined as unknown as string[], // ts-jest compat

  // Actually wire up the setup file
  setupFiles: ["<rootDir>/jest.setup.ts"],

  // ts-jest transformation settings
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Relax some strict options that conflict with test helpers
          module: "CommonJS",
          esModuleInterop: true,
          // Keep strict type checking in tests
          strict: true,
        },
      },
    ],
  },

  // Collect coverage from application source files (not tests themselves)
  collectCoverageFrom: [
    "lib/**/*.ts",
    "app/**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],

  // Display individual test results with their descriptions
  verbose: true,
};

export default config;
