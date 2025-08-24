# bun-redis-memory-server-repro

Minimal reproduction of a crash when using [redis-memory-server](https://github.com/mhassan1/redis-memory-server/) together with [Bun](https://bun.sh) on **Windows**.

The crash happens right after the first `afterEach` teardown (`server.stop()`), with:

Process finished with exit code -1073740940 (0xC0000374)

This exit code corresponds to **heap corruption** on Windows.

---

## Steps to Reproduce

1. Install dependencies:
   ```bash
   bun install
   ```
2. Run the test suite:
   ```bash
   bun test
   ```

## Expected behavior

Both tests should pass successfully:

- First test starts a Redis server, writes/reads a value, and tears it down.

- Second test should do the same with a fresh Redis server.

## Actual behavior

The first test runs fine.

During afterEach teardown (server.stop()), Bun crashes with exit code:

```bash
Process finished with exit code -1073740940 (0xC0000374)
```

## Environment

OS: Windows 11 (x64)
Bun: 1.2.20
redis-memory-server: ^0.13.0
Redis binary: downloaded automatically by redis-memory-server
Node.js: not used (running only on Bun)