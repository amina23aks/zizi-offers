"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export type AnimatedTabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export function AnimatedTabs({
  items,
  label,
  className,
}: {
  items: readonly AnimatedTabItem[];
  label: string;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const id = useId();
  const active = items[activeIndex] ?? items[0];

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + items.length) % items.length);
  };

  return (
    <div className={cn("animated-tabs", className)}>
      <div className="tab-strip-wrap">
        <button type="button" className="icon-button subtle" onClick={() => move(-1)} aria-label="التبويب السابق">
          <CaretRight size={18} weight="bold" />
        </button>
        <div className="tab-strip" role="tablist" aria-label={label}>
          {items.map((item, index) => (
            <button
              key={item.id}
              id={`${id}-${item.id}-tab`}
              type="button"
              role="tab"
              aria-selected={active.id === item.id}
              aria-controls={`${id}-${item.id}-panel`}
              tabIndex={active.id === item.id ? 0 : -1}
              className={cn("tab-button", active.id === item.id && "active")}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") move(1);
                if (event.key === "ArrowRight") move(-1);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button type="button" className="icon-button subtle" onClick={() => move(1)} aria-label="التبويب التالي">
          <CaretLeft size={18} weight="bold" />
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          id={`${id}-${active.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-${active.id}-tab`}
          className="animated-tab-panel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {active.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
