
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Crosshair,
  Layers3,
  ScanLine,
} from "lucide-react";

const stats = [
  {
    id: "projects",
    value: 0,
    suffix: "",
    label: "Projects completed",
    description: "Verified project portfolio",
    icon: Layers3,
  },
  {
    id: "hectares",
    value: 0,
    suffix: " ha",
    label: "Land surveyed",
    description: "Documented survey coverage",
    icon: Crosshair,
  },
  {
    id: "experience",
    value: 0,
    suffix: "+",
    label: "Years of experience",
    description: "Professional experience",
    icon: Activity,
  },
  {
    id: "accuracy",
    value: 0,
    suffix: "%",
    label: "Quality assurance",
    description: "Target to be defined",
    icon: ScanLine,
  },
];

function CountUp({
  target,
  active,
  suffix,
}: {
  target: number;
  active: boolean;
  suffix: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const frame = window.requestAnimationFrame(() => {
      setCount(target);
    });

    return () => window.cancelAnimationFrame(frame);
  }

    let frame = 0;
    const startTime = performance.now();
    const duration = 1200;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function ProjectStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="stats"
      aria-labelledby="stats-heading"
      className="container-shell relative z-10 py-16 md:py-24"
    >
      <div className="glass-panel overflow-hidden">
        <div className="grid gap-8 border-b border-white/10 p-6 md:grid-cols-[1fr_auto] md:items-end md:p-9">
          <div>
            <p className="eyebrow mb-4">
              PROJECT METRICS / LIVE COUNTERS
            </p>

            <h2
              id="stats-heading"
              className="font-[var(--font-space-grotesk)] text-2xl font-medium md:text-4xl"
            >
              Measured with purpose.
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="h-2 w-2 rounded-full bg-[var(--color-neon)]" />
            <span>Awaiting verified company data</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.id}
                className={`p-6 transition-colors hover:bg-white/[0.025] md:p-8 ${
                  index > 0 ? "border-t border-white/10 sm:border-l" : ""
                } ${
                  index >= 2 ? "sm:border-t-0 xl:border-t-0" : ""
                } ${
                  index === 2 ? "xl:border-l" : ""
                } border-white/10`}
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-[var(--font-ibm-plex-mono)] text-[10px] tracking-widest text-white/35">
                    METRIC / 0{index + 1}
                  </span>

                  <Icon
                    size={19}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="text-[var(--color-neon)]"
                  />
                </div>

                <p className="font-[var(--font-space-grotesk)] text-4xl font-medium tracking-tight text-[var(--color-neon)] md:text-5xl">
                  <CountUp
                    target={stat.value}
                    active={active}
                    suffix={stat.suffix}
                  />
                </p>

                <h3 className="mt-4 text-sm font-medium text-white/85">
                  {stat.label}
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/40">
                  {stat.description}
                </p>

                <div className="mt-7 h-px bg-white/10">
                  <div
                    className="h-px bg-[var(--color-neon)] transition-all duration-1000"
                    style={{ width: active ? "100%" : "0%" }}
                  />
                </div>
              </article>
            );
          })}
        </div>

        <div className="border-t border-white/10 px-6 py-4 md:px-9">
          <p className="font-[var(--font-ibm-plex-mono)] text-[10px] leading-5 text-white/35">
            DATA NOTE: COUNTERS ARE UNPOPULATED UNTIL VERIFIED FIGURES
            ARE PROVIDED. NO PROJECT TOTALS OR PERFORMANCE CLAIMS ARE IMPLIED.
          </p>
        </div>
      </div>
    </section>
  );
}
