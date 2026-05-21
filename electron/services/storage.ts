import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createInitialData } from "../../src/shared/defaults";
import type { PersistedData } from "../../src/shared/types";

export class JsonStore {
  private cache: PersistedData | null = null;

  constructor(private readonly filePath: string) {}

  async read(): Promise<PersistedData> {
    if (this.cache) {
      return structuredClone(this.cache);
    }

    try {
      const raw = await readFile(this.filePath, "utf8");
      this.cache = { ...createInitialData(), ...JSON.parse(raw) } as PersistedData;
    } catch {
      this.cache = createInitialData();
      await this.write(this.cache);
    }

    return structuredClone(this.cache);
  }

  async update(mutator: (data: PersistedData) => PersistedData): Promise<PersistedData> {
    const current = await this.read();
    const next = mutator(current);
    await this.write(next);
    return structuredClone(next);
  }

  private async write(data: PersistedData): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
    await rename(tempPath, this.filePath);
    this.cache = structuredClone(data);
  }
}
