import { motion } from "framer-motion";
import { ArrowRight, BookPlus} from "lucide-react";
import { Link } from "react-router-dom";

export function CreateCoursePrompt() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-sm bg-surface-container-lowest p-5 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)]"
    >
      <div className="absolute right-5 top-5 hidden text-primary/10 sm:block">
        <BookPlus className="size-24" strokeWidth={1} />
      </div>

      <div className="relative max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-sm bg-primary-fixed px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-on-primary-fixed">
          Instructor tools
        </div>

        <h2 className="mt-4 text-[17px] font-medium text-on-surface">
          Create a course of your own
        </h2>
        <p className="mt-2 text-[12px] font-light leading-6 text-on-surface-variant">
          Build modules, add YouTube lessons, attach resources, and publish your
          own Lumio course from Instructor Studio.
        </p>

        <Link
          to="/instructor/courses"
          className="mt-5 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-[12px] font-medium text-on-primary transition-all hover:-translate-y-0.5 hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Open Instructor Studio
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </motion.section>
  );
}
