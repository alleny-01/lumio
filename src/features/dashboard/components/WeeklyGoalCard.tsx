import { motion } from "framer-motion";
import { Flame, Target } from "lucide-react";
import type { DashboardActivity } from "../types";

interface WeeklyGoalCardProps {
  activity: DashboardActivity[];
  weeklyStudyHours: number;
}

const weeklyGoalHours = 5;

function getActiveDays(activity: DashboardActivity[]) {
  return activity.slice(-7).filter((item) => item.minutes > 0).length;
}

export function WeeklyGoalCard({
  activity,
  weeklyStudyHours,
}: WeeklyGoalCardProps): React.JSX.Element {
  const progress = Math.min(weeklyStudyHours / weeklyGoalHours, 1);
  const activeDays = getActiveDays(activity);
  const remainingHours = Math.max(weeklyGoalHours - weeklyStudyHours, 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28, ease: "easeOut", delay: 0.04 }}
      className="rounded-sm bg-surface-container-lowest p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] transition-colors hover:border-primary/25"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-light uppercase tracking-[0.2em] text-on-surface-variant">
            Weekly goal
          </p>
          <h2 className="mt-2 text-[14px] font-medium text-on-surface">
            {weeklyStudyHours} / {weeklyGoalHours} hours
          </h2>
        </div>
        <div className="flex size-9 items-center justify-center rounded-sm bg-primary-fixed text-primary">
          <Target className="size-4" />
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.round(progress * 100)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <p className="mt-2 text-[11px] font-light text-on-surface-variant">
          {remainingHours === 0
            ? "Goal reached. Lovely pace this week."
            : `${remainingHours.toFixed(1)} hours left to hit your target.`}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-sm bg-surface-container-low px-3 py-2 text-[11px] font-light text-on-surface-variant">
        <Flame className="size-3.5 text-primary" />
        <span>{activeDays} active learning days in the last 7 days</span>
      </div>
    </motion.article>
  );
}
