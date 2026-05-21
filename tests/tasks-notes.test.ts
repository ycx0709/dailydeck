import { describe, expect, it } from "vitest";
import { createInitialData, defaultSettings } from "../src/shared/defaults";

describe("shared defaults", () => {
  it("creates isolated initial data", () => {
    const first = createInitialData();
    const second = createInitialData();

    first.tasks.push({
      id: "task-1",
      text: "Check CPU",
      completed: false,
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z"
    });

    expect(second.tasks).toEqual([]);
    expect(first.settings).toEqual(defaultSettings);
    expect(first.settings).not.toBe(defaultSettings);
  });
});
