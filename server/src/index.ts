import { Hono } from "hono";
import { preprocess, z } from "zod";
import fs from "node:fs/promises";

const kvStoreSchema = z.object({
  expirationDate: preprocess((arg) => new Date(arg as any), z.date()),
  value: z.record(z.string(), z.any()),
});

export type KVStore = z.TypeOf<typeof kvStoreSchema>;

const app = new Hono();

const kvCreateSchema = z.object({
  key: z.string(),
  TTL: z.number(),
  value: z.record(z.string(), z.any()),
});

app
  .get("/ping", (c) => {
    return c.json({
      ping: "pong",
    });
  })
  .post("/kv/set", async (c) => {
    const result = kvCreateSchema.safeParse(await c.req.json());
    if (!result.success) {
      return c.json(
        {
          errors: result.error.flatten(),
        },
        422 // VALIDATION ERROR
      );
    }

    const data = result.data;
    const path = `./data/${data.key}.json`;
    await Bun.write(
      path,
      JSON.stringify({
        value: data.value,
        expirationDate: new Date(Date.now() + (data.TTL * 1000)),
      })
    );

    return c.json({
      ok: true,
    });
  })
  .get("/kv/get/:id", async (c) => {
    const id = c.req.param("id");

    const path = `./data/${id}.json`;
    const store = Bun.file(path, {
      type: "application/json",
    });

    if (await store.exists()) {
      try {
        const storeData = kvStoreSchema.parse(await store.json());

        if (new Date().getTime() <= storeData.expirationDate.getTime()) {
          return c.json({
            data: storeData.value,
          });
        } else {
          // delete file
          await fs.unlink(path);
        }
      } catch (error) {}
    }

    return c.json(
      {
        errors: "not found",
      },
      404 // NOT FOUND
    );
  })
  .delete("/kv/delete/:id", async (c) => {
    const id = c.req.param("id");

    const path = `./data/${id}.json`;
    const store = Bun.file(path, {
      type: "application/json",
    });

    if (await store.exists()) {
      await fs.unlink(path);
      return c.json(
        {
          ok: true,
        },
        218 // NO CONTENT
      );
    }

    return c.json(
      {
        error: "not found",
      },
      404
    );
  });

export default {
  port: 3001,
  fetch: app.fetch,
};
