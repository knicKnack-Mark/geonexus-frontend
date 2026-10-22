
"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Ruler,
  Send,
} from "lucide-react";

const BUSINESS_EMAIL = "geonex@example.com";

const services = [
  "Geodetic Surveying",
  "Land Development",
  "Geospatial Intelligence",
  "Boundary Survey",
  "Subdivision Mapping",
  "Other / Not Sure Yet",
];

const schedules = [
  "As soon as possible",
  "Within 2 weeks",
  "Within 1 month",
  "Within 3 months",
  "Flexible / To be discussed",
];

type ProjectDetails = {
  service: string;
  location: string;
  area: string;
  unit: "hectares" | "square meters";
  schedule: string;
  name: string;
  email: string;
  notes: string;
};

const initialDetails: ProjectDetails = {
  service: "",
  location: "",
  area: "",
  unit: "hectares",
  schedule: "",
  name: "",
  email: "",
  notes: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[var(--color-neon)]";

const labelClass =
  "block text-sm font-medium text-white/80";

export default function ProjectEstimator() {
  const [step, setStep] = useState(1);
  const [details, setDetails] =
    useState<ProjectDetails>(initialDetails);
  const [error, setError] = useState("");

  const updateField = <K extends keyof ProjectDetails>(
    field: K,
    value: ProjectDetails[K],
  ) => {
    setDetails((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  };

  const validateStep = () => {
    if (step === 1) {
      if (
        !details.service ||
        !details.location.trim() ||
        !details.schedule
      ) {
        setError("Please complete the required project details.");
        return false;
      }

      if (
        details.area.trim() &&
        (!Number.isFinite(Number(details.area)) ||
          Number(details.area) <= 0)
      ) {
        setError("Enter a land area greater than zero, or leave it blank.");
        return false;
      }
    }

    if (step === 2) {
      if (!details.name.trim() || !details.email.trim()) {
        setError("Please enter your name and email address.");
        return false;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(details.email.trim())) {
        setError("Please enter a valid email address.");
        return false;
      }
    }

    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((current) => Math.min(current + 1, 3));
    }
  };

  const previousStep = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 1));
  };

  const prepareEmail = () => {
    const subject = `GeoNexus Project Inquiry — ${details.service}`;

    const body = [
      "GEONEXUS PROJECT INQUIRY",
      "",
      `Service: ${details.service}`,
      `Project location: ${details.location}`,
      `Estimated land area: ${
        details.area.trim()
          ? `${details.area} ${details.unit}`
          : "Not specified"
      }`,
      `Target schedule: ${details.schedule}`,
      "",
      "CONTACT DETAILS",
      `Name: ${details.name}`,
      `Email: ${details.email}`,
      "",
      "PROJECT NOTES",
      details.notes.trim() || "None provided",
      "",
      "Please contact me to discuss the project scope and requirements.",
    ].join("\n");

    const mailto = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  };

  return (
    <section
      id="estimator"
      className="relative scroll-mt-24 py-24 sm:py-32"
    >
      <div className="container-shell mx-auto px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* Introduction */}
          <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="eyebrow">Project estimator / 04</p>

              <h2 className="mt-5 max-w-xl text-4xl font-medium tracking-tight text-white sm:text-5xl">
                Start with the{" "}
                <span className="text-[var(--color-neon)]">
                  right coordinates.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/60">
                Tell us a little about your project. We&apos;ll use
                these details to understand your requirements and
                discuss the next steps with you.
              </p>
            </div>

            <div className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                  <MapPin className="h-4 w-4 text-[var(--color-neon)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Project-specific
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/50">
                    Share the location and scope of your site.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                  <ClipboardList className="h-4 w-4 text-[var(--color-neon)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    No fabricated pricing
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/50">
                    Final fees depend on the scope and requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estimator form */}
          <div className="glass-panel rounded-2xl p-5 sm:p-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow">
                  Inquiry / Step 0{step}
                </span>
                <span className="text-xs text-white/40">
                  {step} of 3
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`h-1 rounded-full transition-colors duration-300 ${
                      item <= step
                        ? "bg-[var(--color-neon)]"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>

            {step === 1 && (
              <div>
                <h3 className="text-2xl font-medium text-white">
                  Project details
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Tell us what you need and where the work will take
                  place.
                </p>

                <div className="mt-7 space-y-5">
                  <div>
                    <label className={labelClass} htmlFor="project-service">
                      Service needed <span className="text-[var(--color-neon)]">*</span>
                    </label>
                    <select
                      id="project-service"
                      value={details.service}
                      onChange={(event) =>
                        updateField("service", event.target.value)
                      }
                      className={inputClass}
                      required
                    >
                      <option value="" className="bg-neutral-900">
                        Select a service
                      </option>
                      {services.map((service) => (
                        <option
                          key={service}
                          value={service}
                          className="bg-neutral-900"
                        >
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="project-location">
                      Project location{" "}
                      <span className="text-[var(--color-neon)]">*</span>
                    </label>
                    <input
                      id="project-location"
                      type="text"
                      value={details.location}
                      onChange={(event) =>
                        updateField("location", event.target.value)
                      }
                      placeholder="City, municipality, or site address"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="project-area">
                      Estimated land area{" "}
                      <span className="text-white/35">(optional)</span>
                    </label>

                    <div className="mt-2 flex gap-2">
                      <div className="relative flex-1">
                        <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                        <input
                          id="project-area"
                          type="number"
                          min="0"
                          step="any"
                          value={details.area}
                          onChange={(event) =>
                            updateField("area", event.target.value)
                          }
                          placeholder="Enter area"
                          className={`${inputClass} mt-0 pl-10`}
                        />
                      </div>

                      <select
                        aria-label="Land area unit"
                        value={details.unit}
                        onChange={(event) =>
                          updateField(
                            "unit",
                            event.target.value as ProjectDetails["unit"],
                          )
                        }
                        className="w-36 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[var(--color-neon)]"
                      >
                        <option value="hectares" className="bg-neutral-900">
                          Hectares
                        </option>
                        <option value="square meters" className="bg-neutral-900">
                          Square meters
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="project-schedule">
                      Target schedule{" "}
                      <span className="text-[var(--color-neon)]">*</span>
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                      <select
                        id="project-schedule"
                        value={details.schedule}
                        onChange={(event) =>
                          updateField("schedule", event.target.value)
                        }
                        className={`${inputClass} pl-10`}
                        required
                      >
                        <option value="" className="bg-neutral-900">
                          Select a timeframe
                        </option>
                        {schedules.map((schedule) => (
                          <option
                            key={schedule}
                            value={schedule}
                            className="bg-neutral-900"
                          >
                            {schedule}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-2xl font-medium text-white">
                  Contact information
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Where can the GeoNexus team reach you about this
                  inquiry?
                </p>

                <div className="mt-7 space-y-5">
                  <div>
                    <label className={labelClass} htmlFor="contact-name">
                      Full name{" "}
                      <span className="text-[var(--color-neon)]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      value={details.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="Your name"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="contact-email">
                      Email address{" "}
                      <span className="text-[var(--color-neon)]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      value={details.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="you@example.com"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="project-notes">
                      Additional project notes{" "}
                      <span className="text-white/35">(optional)</span>
                    </label>
                    <textarea
                      id="project-notes"
                      value={details.notes}
                      onChange={(event) =>
                        updateField("notes", event.target.value)
                      }
                      placeholder="Project goals, requirements, or questions..."
                      rows={4}
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-2xl font-medium text-white">
                  Review your inquiry
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Check your details before preparing the email.
                </p>

                <div className="mt-7 space-y-0 divide-y divide-white/10 rounded-xl border border-white/10 bg-black/10 px-4">
                  {[
                    ["Service", details.service],
                    ["Location", details.location],
                    [
                      "Land area",
                      details.area.trim()
                        ? `${details.area} ${details.unit}`
                        : "Not specified",
                    ],
                    ["Schedule", details.schedule],
                    ["Name", details.name],
                    ["Email", details.email],
                    ["Notes", details.notes.trim() || "None provided"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="grid gap-1 py-4 sm:grid-cols-[120px_1fr] sm:gap-4"
                    >
                      <p className="text-xs uppercase tracking-wider text-white/40">
                        {label}
                      </p>
                      <p className="break-words text-sm leading-6 text-white/80">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex gap-3 rounded-xl border border-white/10 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-neon)]" />
                  <p className="text-xs leading-5 text-white/50">
                    This prepares an email in your default email app.
                    Your inquiry is not sent or stored by this website
                    automatically.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            {/* Navigation */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={previousStep}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <p className="text-xs text-white/35">
                  * Required fields
                </p>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-neon)] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={prepareEmail}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-neon)] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Prepare email inquiry
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
