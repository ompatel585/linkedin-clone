import http from "http";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { runMigrations } from "./migrations.js";
import { initSocket } from "./sockets/index.js";

const start = async () => {
    const { inMemory } = await connectDB();
    await runMigrations();

    if (inMemory || env.seedOnStart) {
        const { seedDatabase } = await import("./scripts/seed.js");
        await seedDatabase({ onlyIfEmpty: true });
    }

    const server = http.createServer(createApp());
    initSocket(server);
    server.listen(env.port, () => console.log(`Server running on port ${env.port}`));
};

start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
