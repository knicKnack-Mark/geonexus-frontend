
import {
  ArrowUpRight,
  Building2,
  Crosshair,
  Layers3,
} from "lucide-react";

const projects = [
  {
    number: "PRJ / 001",
    category: "BOUNDARY SURVEY",
    title: "Boundary & Land Verification",
    description:
      "A concept showcase for property boundary verification, ground control, and spatial documentation.",
    deliverables: ["Boundary mapping", "Control points"],
    icon: Crosshair,
    type: "boundary",
    accent: "rgba(0, 242, 254, 0.16)",
  },
  {
    number: "PRJ / 002",
    category: "SUBDIVISION MAPPING",
    title: "Subdivision & Parcel Planning",
    description:
      "A concept showcase for parcel layouts, lot configuration, and development planning.",
    deliverables: ["Parcel layouts", "Site mapping"],
    icon: Layers3,
    type: "subdivision",
    accent: "rgba(77, 124, 254, 0.18)",
  },
  {
    number: "PRJ / 003",
    category: "LAND DEVELOPMENT",
    title: "Site Development Intelligence",
    description:
      "A concept showcase for terrain interpretation, site measurements, and spatial planning.",
    deliverables: ["Site analysis", "Terrain data"],
    icon: Building2,
    type: "development",
    accent: "rgba(0, 242, 180, 0.14)",
  },
];

function ProjectVisual({
  type,
  accent,
}: {
  type: string;
  accent: string;
}) {
  return (
    <div
      className="project-visual relative aspect-[16/10] overflow-hidden border-b border-white/10"
      style={{
        background: `radial-gradient(ellipse at 50% 45%, ${accent}, transparent 70%), #090e18`,
      }}
    >
      {/* Technical coordinate grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <svg
        viewBox="0 0 600 360"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-[1deg] motion-reduce:transition-none"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`line-${type}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity=".95" />
            <stop offset="100%" stopColor="#00f2fe" stopOpacity=".2" />
          </linearGradient>
        </defs>

        {type === "boundary" && (
          <>
            <path
              d="M115 75 L390 55 L475 145 L420 285 L165 300 L85 180 Z"
              stroke={`url(#line-${type})`}
              strokeWidth="2"
            />
            <path
              d="M150 105 L370 88 L435 155 L390 255 L185 270 L120 180 Z"
              stroke="#00f2fe"
              strokeOpacity=".35"
            />
            <path
              d="M85 180 L270 165 L475 145 M270 165 L285 292"
              stroke="#00f2fe"
              strokeOpacity=".5"
              strokeDasharray="5 6"
            />
            {[
              [115, 75],
              [390, 55],
              [475, 145],
              [420, 285],
              [165, 300],
              [85, 180],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="#00f2fe" />
                <circle
                  cx={x}
                  cy={y}
                  r="10"
                  stroke="#00f2fe"
                  strokeOpacity=".4"
                />
              </g>
            ))}
          </>
        )}

        {type === "subdivision" && (
          <g transform="rotate(-8 300 180)">
            <path
              d="M120 70 L460 70 L460 292 L120 292 Z"
              stroke="#00f2fe"
              strokeOpacity=".7"
              strokeWidth="2"
            />
            {Array.from({ length: 5 }, (_, i) => (
              <path
                key={`v-${i}`}
                d={`M${180 + i * 52} 70 L${180 + i * 52} 292`}
                stroke="#00f2fe"
                strokeOpacity=".65"
              />
            ))}
            {[125, 180, 235].map((y) => (
              <path
                key={y}
                d={`M120 ${y} L460 ${y}`}
                stroke="#00f2fe"
                strokeOpacity=".55"
              />
            ))}
            <path
              d="M120 70 L235 125 L235 292 M286 70 L338 180 L338 292"
              stroke="#a5f3fc"
              strokeOpacity=".65"
              strokeDasharray="4 5"
            />
            <circle cx="338" cy="180" r="8" fill="#00f2fe" />
          </g>
        )}

        {type === "development" && (
          <>
            {Array.from({ length: 9 }, (_, i) => {
              const y = 60 + i * 29;
              return (
                <path
                  key={i}
                  d={`M65 ${y} Q170 ${y - 55} 285 ${y} T535 ${y - 8}`}
                  stroke="#00f2fe"
                  strokeOpacity={0.16 + i * 0.055}
                />
              );
            })}
            <path
              d="M170 105 L330 75 L425 140 L390 245 L225 275 L150 200 Z"
              stroke="#00f2fe"
              strokeWidth="2"
              fill="#00f2fe"
              fillOpacity=".04"
            />
            <path
              d="M205 130 L325 108 L390 155 L360 220 L235 242 L190 192 Z"
              stroke="#00f2fe"
              strokeOpacity=".65"
              strokeDasharray="5 5"
            />
            <path
              d="M285 95 L285 260 M145 175 L415 175"
              stroke="#00f2fe"
              strokeOpacity=".35"
            />
            <circle cx="285" cy="175" r="7" fill="#00f2fe" />
            <circle cx="285" cy="175" r="17" stroke="#00f2fe" strokeOpacity=".5" />
          </>
        )}
      </svg>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[300%] motion-reduce:transition-none"
      />

      <div className="absolute left-4 top-4 flex items-center gap-2 border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-sm transition-colors duration-300 group-hover:border-[var(--color-neon)]/40">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-neon)] group-hover:animate-pulse" />
        <span className="font-[var(--font-ibm-plex-mono)] text-[9px] tracking-wider text-white/70">
          CONCEPT VISUAL
        </span>
      </div>

      <div className="absolute bottom-4 right-4 font-[var(--font-ibm-plex-mono)] text-[9px] text-white/45">
        GEO / SPATIAL
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="container-shell relative z-10 py-24 md:py-32"
    >
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-4">
            SELECTED WORK / 001—003
          </p>

          <h2
            id="projects-heading"
            className="font-[var(--font-space-grotesk)] text-3xl font-medium tracking-tight md:text-5xl"
          >
            Spatial work.
            <br />
            <span className="text-[var(--color-neon)]">
              Tangible outcomes.
            </span>
          </h2>
        </div>

        <p className="max-w-md text-sm leading-6 text-white/55">
          Explore the types of surveying and geospatial projects GeoNexus
          can support, from property boundaries to development planning.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const Icon = project.icon;

          return (
            <article
              key={project.number}
              className="glass-panel group min-w-0 overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.01] hover:border-[var(--color-neon)]/45 hover:shadow-[0_20px_60px_rgba(0,242,254,0.12)] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <ProjectVisual
                type={project.type}
                accent={project.accent}
              />

              <div className="p-6 sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="font-[var(--font-ibm-plex-mono)] text-[10px] tracking-wider text-white/40">
                    {project.number}
                  </span>

                  <Icon
                    size={19}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="text-[var(--color-neon)] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 motion-reduce:transition-none"
                  />
                </div>

                <p className="mb-3 font-[var(--font-ibm-plex-mono)] text-[10px] tracking-wider text-[var(--color-neon)]">
                  {project.category}
                </p>

                <h3 className="font-[var(--font-space-grotesk)] text-xl font-medium transition-colors duration-300 group-hover:text-[var(--color-neon)]">
                  {project.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/55">
                  {project.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {project.deliverables.map((deliverable) => (
                    <span
                      key={deliverable}
                      className="border border-white/10 px-2.5 py-1.5 text-[10px] text-white/55 transition-colors duration-300 group-hover:border-[var(--color-neon)]/20 group-hover:text-white/75"
                    >
                      {deliverable}
                    </span>
                  ))}
                </div>

                <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-xs text-white/35">
                    Project category
                  </span>

                  <a
                    href="#contact"
                    aria-label={`Discuss a ${project.category.toLowerCase()} project`}
                    className="inline-flex items-center gap-1.5 text-xs text-white/70 transition-colors hover:text-[var(--color-neon)]"
                  >
                    Discuss project
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                    />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
