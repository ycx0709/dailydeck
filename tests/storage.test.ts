import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { JsonStore } from "../electron/services/storage";

const tempDirs: string[] = [];

async function makeStore() {
  const dir = await mkdtemp(join(tmpdir(), "dailydeck-test-"));
  tempDirs.push(dir);
  return new JsonStore(join(dir, "data.json"));
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("JsonStore", () => {
  it("starts with initial data when no file exists", async () => {
    const store = await makeStore();
    const data = await store.read();

    expect(data.tasks).toEqual([]);
    expect(data.settings.clipboardRecordingEnabled).toBe(true);
  });

  it("persists task changes", async () => {
    const store = await makeStore();

    await store.update((data) => ({
      ...data,
      tasks: [
        {
          id: "task-1",
          text: "Write plan",
          completed: false,
          createdAt: "2026-05-21T00:00:00.000Z",
          updatedAt: "2026-05-21T00:00:00.000Z"
        }
      ]
    }));

    const reloaded = await store.read();
    expect(reloaded.tasks).toHaveLength(1);
    expect(reloaded.tasks[0]?.text).toBe("Write plan");
  });
});
