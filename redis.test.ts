import { RedisMemoryServer } from "redis-memory-server";
import { RedisClient } from "bun";
import { afterEach, it, describe, expect } from "bun:test"

const servers = new Map<string, RedisMemoryServer>();
const clients = new Map<string, RedisClient>();

async function startRedis(name: string = "default") {
    const server = await RedisMemoryServer.create();
    servers.set(name, server);

    const url = `redis://${await server.getHost()}:${await server.getPort()}`;
    const client = new RedisClient(url);

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
            client.close(); // Bun API: encerra conexão
        } catch (err) {
            console.warn("Erro ao fechar cliente:", err);
        }
        clients.delete(url);
    }

    await server.stop();
    servers.delete(name);
}

afterEach(async () => {
    // ⚠️ crash ocorre aqui após o primeiro teste
    await stopRedis("default");
});

describe("redis-memory-server with bun", () => {
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
