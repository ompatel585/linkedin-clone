import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["backend/tests/**/*.test.js"],
        environment: "node",
        hookTimeout: 120000,
        testTimeout: 30000,
        fileParallelism: false,
        env: { NODE_ENV: "test" },
    },
});
