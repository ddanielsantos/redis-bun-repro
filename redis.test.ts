import { afterEach, it, describe, expect } from "bun:test";
import { Redis } from "ioredis";
import RedisMemoryServer from "redis-memory-server";

const servers = new Map<string, RedisMemoryServer>();
const clients = new Map<string, Redis>();

async function startRedis(name: string = "default") {
    const server = await RedisMemoryServer.create();
    servers.set(name, server);

    const url = `redis://${await server.getHost()}:${await server.getPort()}`;
    const client = new Redis(url);

    clients.set(url, client);
    return { server, client };
}

async function stopRedis(name: string = "default") {
    const server = servers.get(name);
    if (!server) return;

    const url = `redis://${await server.getHost()}:${await server.getPort()}`;
    const client = clients.get(url);

    if (client) {
        try {
            client.quit();
        } catch (err) {
            console.log("Error closing client:", err);
        }
        clients.delete(url);
    }

    await server.stop();
    servers.delete(name);
}

afterEach(async () => {
    await stopRedis("default");
});

describe("redis-testcontainers-node", () => {
    it("should start redis", async () => {
        const { client } = await startRedis("default");
        await client.set("foo", "bar");
        const val = await client.get("foo");
        expect(val).toBe("bar");
    });

    it("should start redis again", async () => {
        const { client } = await startRedis("default");
        await client.set("hello", "world");
        const val = await client.get("hello");
        expect(val).toBe("world");
    });
});