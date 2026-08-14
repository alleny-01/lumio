import { cn } from "@/lib/utils";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonthDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

interface CalendarProps extends React.ComponentProps<"div"> {
  selected?: Date;
}

function Calendar({
  selected = new Date(),
  className,
  ...props
}: CalendarProps) {
  const today = new Date();
  const days = buildMonthDays(selected);
  const monthLabel = selected.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "w-full rounded-sm bg-surface-container-lowest p-5 sm:p-6 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.15)]",
        className,
      )}
      {...props}
    >
      <div className="mb-4 flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
            Calendar
          </p>
          <h2 className="mt-1 text-[15px] font-medium text-on-surface sm:text-[16px]">
            {monthLabel}
          </h2>
        </div>
        <div className="rounded-sm bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
          Today:{" "}
          {today.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {weekDays.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1 text-center text-[12px]">
        {days.map((day) => {
          const isCurrentMonth = day.getMonth() === selected.getMonth();
          const isToday =
            day.getFullYear() === today.getFullYear() &&
            day.getMonth() === today.getMonth() &&
            day.getDate() === today.getDate();

          return (
            <time
              key={day.toISOString()}
              dateTime={day.toISOString().slice(0, 10)}
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "flex h-9 sm:h-10 items-center justify-center rounded-sm transition-colors",
                isCurrentMonth ? "text-on-surface" : "text-outline/40",
                isToday
                  ? "bg-primary font-medium text-white shadow-sm"
                  : "hover:bg-surface-container",
              )}
            >
              {day.getDate()}
            </time>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
