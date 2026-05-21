import si from "systeminformation";
import type { Metric, MetricStatus, ProcessUsage, SystemSnapshot } from "../../src/shared/types.js";

function statusFor(percent: number): MetricStatus {
  if (!Number.isFinite(percent)) return "unavailable";
  if (percent >= 90) return "critical";
  if (percent >= 75) return "warn";
  return "ok";
}

function percentMetric(label: string, percent: number, detail: string): Metric {
  return {
    label,
    value: `${Math.round(percent)}%`,
    detail,
    status: statusFor(percent)
  };
}

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  try {
    const [load, memory, fsSize, networkStats, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.processes()
    ]);

    const memoryPercent = (memory.used / memory.total) * 100;
    const primaryDisk = fsSize[0];
    const diskPercent = primaryDisk ? primaryDisk.use : 0;
    const network = networkStats[0];
    const rx = network ? network.rx_sec / 1024 : 0;
    const tx = network ? network.tx_sec / 1024 : 0;

    const topProcesses: ProcessUsage[] = processes.list
      .slice()
      .sort((a, b) => b.memRss - a.memRss)
      .slice(0, 6)
      .map((process) => ({
        name: process.name,
        cpuPercent: Number(process.cpu.toFixed(1)),
        memoryMb: Math.round(process.memRss / 1024)
      }));

    const notices: string[] = [];
    if (load.currentLoad >= 85) notices.push("CPU load is high.");
    if (memoryPercent >= 85) notices.push("Memory usage is high.");
    if (diskPercent >= 90) notices.push("Primary disk is nearly full.");

    return {
      capturedAt: new Date().toISOString(),
      metrics: {
        cpu: percentMetric("CPU", load.currentLoad, "Current load"),
        memory: percentMetric(
          "Memory",
          memoryPercent,
          `${Math.round(memory.used / 1024 / 1024 / 1024)} / ${Math.round(memory.total / 1024 / 1024 / 1024)} GB`
        ),
        disk: percentMetric("Disk", diskPercent, primaryDisk?.mount ?? "Primary drive"),
        network: {
          label: "Network",
          value: `${Math.round(rx)} KB/s`,
          detail: `Up ${Math.round(tx)} KB/s`,
          status: "ok"
        }
      },
      processes: topProcesses,
      notices
    };
  } catch {
    const unavailable: Metric = {
      label: "Unavailable",
      value: "--",
      detail: "Unable to read system data",
      status: "unavailable"
    };

    return {
      capturedAt: new Date().toISOString(),
      metrics: {
        cpu: { ...unavailable, label: "CPU" },
        memory: { ...unavailable, label: "Memory" },
        disk: { ...unavailable, label: "Disk" },
        network: { ...unavailable, label: "Network" }
      },
      processes: [],
      notices: ["System metrics are unavailable."]
    };
  }
}
