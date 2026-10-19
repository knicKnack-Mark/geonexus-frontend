
import {
  ArrowDown,
  ArrowUpRight,
  Crosshair,
  Layers3,
  ScanLine,
} from "lucide-react";

import TopographicBackground from "@/components/TopographicBackground";
import ScrollAnimations from "@/components/ScrollAnimations";
import CoordinateHUD from "@/components/CoordinateHUD";
import SurveyTimeline from "@/components/SurveyTimeline";
import FeaturedProjects from "@/components/FeaturedProjects";
import ProjectStats from "@/components/ProjectStats";
import ProjectEstimator from "@/components/ProjectEstimator";
import SiteNavigation from "@/components/SiteNavigation";









const services = [
  {
    number: "01",
    title: "Geodetic Surveying",
    description:
      "High-precision ground control, boundary verification, and topographic field surveys.",
    icon: Crosshair,
  },
  {
    number: "02",
    title: "Land Development",
    description:
      "Reliable spatial data for subdivision planning, site development, and infrastructure.",
    icon: Layers3,
  },
  {
    number: "03",
    title: "Geospatial Intelligence",
    description:
      "Transforming field measurements into actionable digital maps and spatial insights.",
    icon: ScanLine,
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      {/* Background layers */}
      <TopographicBackground />
      <ScrollAnimations />

      <SiteNavigation />


      {/* Hero */}
      <section className="container-shell relative z-10 flex min-h-[78vh] flex-col justify-center py-24">
        <CoordinateHUD />

        {/* Animated geospatial orbit */}
        <div
          aria-hidden="true"
          className="hero-orbit pointer-events-none absolute right-0 top-1/4 -z-10 hidden h-72 w-72 md:block"
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-[var(--color-neon)]/25" />

          {/* Inner rings */}
          <div className="absolute inset-8 rounded-full border border-[var(--color-neon)]/20" />
          <div className="absolute inset-16 rounded-full border border-[var(--color-neon)]/30" />

          {/* Coordinate crosshairs */}
          <div className="absolute left-1/2 top-0 h-full w-px bg-[var(--color-neon)]/20" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-[var(--color-neon)]/20" />

          {/* Rotating scanner */}
          <div className="orbit-scanner absolute inset-0 rounded-full">
            <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--color-neon)] shadow-[0_0_18px_var(--color-neon)]" />
          </div>

          {/* Center marker */}
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-neon)] shadow-[0_0_14px_var(--color-neon)]" />
        </div>

        <p className="eyebrow hero-animate mb-6">
          GEOSPATIAL ENGINEERING · 13°N 123°E
        </p>

        <h1 className="hero-animate max-w-4xl font-[var(--font-space-grotesk)] text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
          Mapping the
          <br />
          <span className="text-[var(--color-neon)]">
            ground truth.
          </span>
        </h1>

        <p className="hero-animate mt-8 max-w-xl text-base leading-7 text-white/60 md:text-lg">
          Precision surveying and geospatial intelligence for a world built
          on accurate data. From the field to the final coordinate.
        </p>

        <div className="hero-animate mt-10 flex flex-wrap gap-4">
          <a
            href="#services"
            className="bg-[var(--color-neon)] px-6 py-3 font-medium text-black transition hover:brightness-110"
          >
            Explore our services{" "}
            <ArrowDown className="ml-2 inline" size={17} />
          </a>

          <a
            href="#contact"
            className="border border-white/15 px-6 py-3 text-white/80 transition hover:border-white/40 hover:text-white"
          >
            Discuss a project
          </a>
        </div>

        <div className="hero-animate mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6 font-[var(--font-ibm-plex-mono)] text-xs text-white/40">
          <span>STATUS: READY</span>
          <span>PRECISION: HIGH</span>
          <span>DATA: SPATIAL</span>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="container-shell relative z-10 py-24 scroll-mt-24"
      >
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-4">WHAT WE DO / 001—003</p>
            <h2 className="font-[var(--font-space-grotesk)] text-3xl md:text-5xl">
              Built on precision.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-white/55">
            Every project begins with reliable measurements and ends with
            information you can use to make confident decisions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.number}
                className="glass-panel service-card group p-7 transition duration-300 hover:-translate-y-1 hover:border-[var(--color-neon)]/40"
              >
                <div className="mb-12 flex items-center justify-between">
                  <span className="font-[var(--font-ibm-plex-mono)] text-xs text-white/35">
                    {service.number}
                  </span>

                  <Icon
                    size={23}
                    strokeWidth={1.4}
                    aria-hidden="true"
                    className="text-[var(--color-neon)]"
                  />
                </div>

                <h3 className="mb-3 font-[var(--font-space-grotesk)] text-xl">
                  {service.title}
                </h3>

                <p className="text-sm leading-6 text-white/55">
                  {service.description}
                </p>

                <div className="mt-8 h-px w-full bg-white/10 transition group-hover:bg-[var(--color-neon)]/50" />
              </article>
            );
          })}
        </div>
      </section>



      <SurveyTimeline />
      <FeaturedProjects />
      <ProjectStats />
      <ProjectEstimator />


      {/* Approach */}
      <section 
        id="approach"
        className="container-shell relative z-10 py-16"
      >
        <div className="glass-panel approach-animate grid gap-8 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="eyebrow mb-4">OUR APPROACH / 002</p>

            <h2 className="font-[var(--font-space-grotesk)] text-3xl md:text-4xl">
              Better data.
              <br />
              Better decisions.
            </h2>
          </div>

          <p className="self-end leading-7 text-white/60">
            We combine field expertise, modern surveying methods, and clear
            spatial deliverables to help projects move forward with confidence.
            Our workflow is designed around accuracy, transparency, and
            practical results.
          </p>
        </div>
      </section>

      {/* Contact footer */}
      <footer
        id="contact"
        className="container-shell relative z-10 mt-16 border-t border-white/10 py-10"
      >
        <p className="eyebrow mb-4">HAVE A PROJECT IN MIND?</p>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="font-[var(--font-space-grotesk)] text-3xl md:text-5xl">
            Let&apos;s map what&apos;s next.
          </h2>

          <a
            href="mailto:hello@example.com"
            className="text-[var(--color-neon)] transition hover:opacity-75"
          >
            hello@example.com{" "}
            <ArrowUpRight className="ml-1 inline" size={17} />
          </a>
        </div>

        <p className="mt-10 text-xs text-white/30">
          © 2026 GEO//NEXUS. Concept landing page.
        </p>
      </footer>
    </main>
  );
}
