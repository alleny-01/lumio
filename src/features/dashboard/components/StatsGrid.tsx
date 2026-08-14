import {
  GraduationCap,
  ChartColumnBig,
  Layers3,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import type { DashboardStat } from "../types";

function RingChart({ value, accent }: { value: number; accent: string }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - circumference * value;

  return (
    <svg
      className="h-12 w-12 -rotate-90"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <circle
        cx="24"
        cy="24"
        r={radius}
        className="fill-none stroke-surface-container-high"
        strokeWidth="5"
      />
      <circle
        cx="24"
        cy="24"
        r={radius}
        className={`fill-none stroke-current ${accent}`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function StatIcon({ stat }: { stat: DashboardStat }) {
  if (stat.id === "study-time")
    return <Clock className="size-4" strokeWidth={1}/>;
  if (stat.id === "avg-grade")
    return <ChartColumnBig className="size-4" strokeWidth={1}/>;
  if (stat.id === "modules")
    return <Layers3 className="size-4" strokeWidth={1}/>;
  return <GraduationCap className="size-4" strokeWidth={1}/>;
}

export function StatsGrid({ stats }: { stats: DashboardStat[] }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {stats.map((stat) => (
        <motion.article
          key={stat.id}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
          className="rounded-sm bg-surface-container-lowest p-4 shadow-[0_8px_20px_-18px_rgba(15,23,42,0.35)] transition-all hover:border-primary/25 hover:bg-surface-container-low hover:shadow-[0_18px_36px_-28px_rgba(53,37,205,0.35)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-sm bg-surface-container text-on-surface ${stat.accent}`}>
                <StatIcon stat={stat} />
              </div>
              <p className="text-[10px] whitespace-nowrap font-light">
                {stat.label}
              </p>
              <p className="mt-0.5 text-[12px] font-medium tracking-[-0.02em] text-on-surface">
                {stat.value}
              </p>
            </div>

            {stat.chartType === "ring" ? (
              <RingChart
                value={stat.progress ?? 0}
                accent={stat.accent}
              />
            ) : null
            }
          </div>
        </motion.article>
      ))}
    </section>
  );
}
