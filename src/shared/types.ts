export type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export type ClipboardItem = {
  id: string;
  text: string;
  pinned: boolean;
  createdAt: string;
  lastCopiedAt: string;
};

export type AppSettings = {
  clipboardRecordingEnabled: boolean;
  clipboardMaxItems: number;
  launchAtLogin: boolean;
};

export type MetricStatus = "ok" | "warn" | "critical" | "unavailable";

export type Metric = {
  label: string;
  value: string;
  detail: string;
  status: MetricStatus;
};

export type ProcessUsage = {
  name: string;
  cpuPercent: number;
  memoryMb: number;
};

export type SystemSnapshot = {
  capturedAt: string;
  metrics: {
    cpu: Metric;
    memory: Metric;
    disk: Metric;
    network: Metric;
  };
  processes: ProcessUsage[];
  notices: string[];
};

export type PersistedData = {
  tasks: Task[];
  notes: Note[];
  clipboardItems: ClipboardItem[];
  settings: AppSettings;
};
