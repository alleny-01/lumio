import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DashboardHeroProps {
  firstName: string;
  weeklyStudyHours: number;
}

type WelcomeMessage = string;

export function DashboardHero({
  firstName,
  weeklyStudyHours,
}: DashboardHeroProps): React.JSX.Element {
  const welcomeMessages: WelcomeMessage[] = [
    `Welcome back ${firstName}, Ready to crush some goals today?`,
    `Hey there ${firstName}, Let's make today productive and rewarding.`,
    `Good to see you ${firstName}, Keep up the great work and stay focused.`,
    `Hello ${firstName}, Your dedication is inspiring. Let's keep it going.`,
    `Hi there ${firstName}, Remember, every small step counts towards your success.`,
    'Hey, keep pushing forward! Your learning journey is worth it.',
    `Yo ${firstName}, Let's make today a productive one!`,
    `Wagwan ${firstName}, Ready to tackle some new challenges today?`,
    `Greetings ${firstName}, Your commitment to learning is commendable. Keep it up!`,
    `Sup ${firstName}, Let's make today a step closer to your goals.`,
  ];
  const [messageIndex] = useState(() =>
    Math.floor(Math.random() * welcomeMessages.length),
  );
  const welcomeMessage = welcomeMessages[messageIndex] ?? "";
  const [typedWelcomeMessage, setTypedWelcomeMessage] = useState("");

  useEffect(() => {
    let nextIndex = 0;
    let intervalId: number | undefined;
    const startTypingId = window.setTimeout(() => {
      setTypedWelcomeMessage("");
      intervalId = window.setInterval(() => {
      nextIndex += 1;
      setTypedWelcomeMessage(welcomeMessage.slice(0, nextIndex));
      if (nextIndex >= welcomeMessage.length) {
        window.clearInterval(intervalId);
      }
      }, 35);
    }, 0);

    return () => {
      window.clearTimeout(startTypingId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [welcomeMessage]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-sm px-2 bg-surface-container-lowest py-6 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.35)] transition-all hover:bg-surface-container-low hover:shadow-[0_18px_36px_-28px_rgba(53,37,205,0.35)] sm:py-7"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(15,23,42,0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15,23,42,0.2) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col gap-3 pl-4 sm:pl-5">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        >
          <motion.h1
            className="w-fit rounded-sm border border-outline-variant/25 bg-surface-container-low/70 px-3 py-2 text-[14px] font-normal tracking-tight text-on-surface shadow-[0_12px_24px_-20px_rgba(53,37,205,0.45)] sm:text-[14px]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            aria-label={welcomeMessage}
          >
            <span aria-hidden="true">
              {typedWelcomeMessage}
              {typedWelcomeMessage.length < welcomeMessage.length && (
                <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-primary align-middle sm:h-5" />
              )}
            </span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-xl rounded-sm border border-outline-variant/25 bg-surface-container-low/70 px-3 py-2 text-[10px] font-light leading-relaxed text-on-surface-variant shadow-[0_10px_22px_-20px_rgba(15,23,42,0.3)]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
          >
            You logged{" "}
            <span className="inline-flex items-center  font-medium text-primary">
              {weeklyStudyHours} study hours
            </span>{" "}
            this week. Keep showing up and your progress graph will do the
            bragging for you.
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  );
}
