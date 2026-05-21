import type { Metric } from "../../shared/types";

type Props = {
  metric: Metric;
};

export function MetricTile({ metric }: Props) {
  return (
    <section className={`metric metric-${metric.status}`}>
      <div className="metric-label">{metric.label}</div>
      <div className="metric-value">{metric.value}</div>
      <div className="metric-detail">{metric.detail}</div>
    </section>
  );
}
