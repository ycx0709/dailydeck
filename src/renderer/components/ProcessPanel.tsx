import type { ProcessUsage } from "../../shared/types";

type Props = {
  processes: ProcessUsage[];
};

export function ProcessPanel({ processes }: Props) {
  return (
    <section className="panel dark-panel">
      <div className="panel-header">
        <h2>High usage</h2>
      </div>
      <div className="process-list">
        {processes.map((process) => (
          <div className="process-row" key={`${process.name}-${process.memoryMb}`}>
            <span>{process.name}</span>
            <span>{process.cpuPercent}% CPU</span>
            <span>{process.memoryMb} MB</span>
          </div>
        ))}
        {processes.length === 0 ? <p className="empty dark-empty">No process data available.</p> : null}
      </div>
    </section>
  );
}
