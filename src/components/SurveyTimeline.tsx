
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ClipboardList,
  Crosshair,
  Database,
  FileCheck2,
  ArrowUpRight,
} from "lucide-react";

const stages = [
  {
    number: "01",
    title: "Initial Consultation",
    label: "PLAN / DISCOVER",
    description:
      "We discuss project requirements, site conditions, boundaries, and the survey outputs needed to support your next decision.",
    icon: ClipboardList,
    output: "Project scope and survey plan",
  },
  {
    number: "02",
    title: "Field Surveying",
    label: "FIELD / MEASURE",
    description:
      "Survey teams collect field measurements, establish control points, and document relevant site features using appropriate surveying methods.",
    icon: Crosshair,
    output: "Field observations and measurements",
  },
  {
    number: "03",
    title: "Data Processing",
    label: "PROCESS / VALIDATE",
    description:
      "Collected observations are checked, processed, and organized into consistent spatial data for mapping and technical review.",
    icon: Database,
    output: "Validated spatial data and maps",
  },
  {
    number: "04",
    title: "Final Deliverables",
    label: "DELIVER / REVIEW",
    description:
      "The agreed outputs are prepared for review and handover, with clear documentation to help clients move forward confidently.",
    icon: FileCheck2,
    output: "Survey plans and agreed outputs",
  },
];

export default function SurveyTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleStages, setVisibleStages] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      setVisibleStages(stages.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = Number(
            (entry.target as HTMLElement).dataset.stageIndex
          );

          setVisibleStages((current) =>
            Math.max(current, index + 1)
          );

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    stageRefs.current.forEach((stage) => {
      if (stage) observer.observe(stage);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      aria-labelledby="process-heading"
      className="container-shell relative z-10 py-24 md:py-32"
    >
      <div className="mb-16 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow mb-4">
            FROM FIELD TO FINISH / 001—004
          </p>

          <h2
            id="process-heading"
            className="max-w-2xl font-[var(--font-space-grotesk)] text-3xl font-medium tracking-tight md:text-5xl"
          >
            Every coordinate
            <br />
            has a <span className="text-[var(--color-neon)]">process.</span>
          </h2>
        </div>

        <p className="max-w-sm text-sm leading-6 text-white/55">
          A structured workflow built around reliable measurements,
          validated spatial data, and clear project deliverables.
        </p>
      </div>

      <div className="relative">
        {/* Timeline track */}
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-[19px] top-8 w-px bg-white/10 md:left-6"
        />

        {/* Animated progress */}
        <div
          aria-hidden="true"
          className="absolute left-[19px] top-8 w-px origin-top bg-[var(--color-neon)] transition-transform duration-700 ease-out md:left-6"
          style={{
            height: "calc(100% - 64px)",
            transform: `scaleY(${visibleStages / stages.length})`,
            boxShadow: "0 0 12px var(--color-neon)",
          }}
        />

        <div className="space-y-5 md:space-y-6">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isVisible = index < visibleStages;

            return (
              <div
                key={stage.number}
                ref={(element) => {
                  stageRefs.current[index] = element;
                }}
                data-stage-index={index}
                className={`relative grid grid-cols-[40px_minmax(0,1fr)] gap-4 transition-all duration-700 ease-out md:grid-cols-[48px_minmax(0,1fr)] md:gap-6 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 70}ms` : "0ms",
                }}
              >
                {/* Stage marker */}
                <div className="relative z-10 flex justify-center pt-7">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 md:h-12 md:w-12 ${
                      isVisible
                        ? "border-[var(--color-neon)] bg-[var(--color-neon)]/10 text-[var(--color-neon)]"
                        : "border-white/15 bg-[#0b0f19] text-white/35"
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                </div>

                {/* Stage card */}
                <article
                  className={`glass-panel group relative min-w-0 p-5 transition-all duration-300 hover:border-[var(--color-neon)]/35 sm:p-7 md:p-8 ${
                    isVisible ? "border-white/10" : "border-white/5"
                  }`}
                >
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-[var(--font-ibm-plex-mono)] text-xs tracking-wider text-[var(--color-neon)]">
                      {stage.label}
                    </span>

                    <span className="font-[var(--font-ibm-plex-mono)] text-sm text-white/30">
                      STEP_{stage.number}
                    </span>
                  </div>

                  <h3 className="font-[var(--font-space-grotesk)] text-xl font-medium sm:text-2xl">
                    {stage.title}
                  </h3>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
                    {stage.description}
                  </p>

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                    <div className="min-w-0">
                      <p className="mb-1 font-[var(--font-ibm-plex-mono)] text-[10px] tracking-wider text-white/35">
                        STAGE OUTPUT
                      </p>

                      <p className="text-xs text-white/70 sm:text-sm">
                        {stage.output}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={17}
                      aria-hidden="true"
                      className="shrink-0 text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-neon)]"
                    />
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <span className="font-[var(--font-ibm-plex-mono)] text-[10px] tracking-wider text-white/35">
          WORKFLOW / 4 STAGES
        </span>

        <a
          href="#contact"
          className="text-sm text-[var(--color-neon)] transition hover:opacity-75"
        >
          Discuss your project
          <ArrowUpRight className="ml-1 inline" size={15} />
        </a>
      </div>
    </section>
  );
}
