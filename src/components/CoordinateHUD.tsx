
"use client";

import { useEffect, useState } from "react";

export default function CoordinateHUD() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Manila",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    };

    updateTime();

    const interval = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="coordinate-hud pointer-events-none absolute bottom-4 right-4 z-50 block font-[var(--font-ibm-plex-mono)] text-[10px] leading-5 text-white/70 sm:bottom-8 sm:right-8">
      <div className="mb-2 flex items-center gap-2 font-semibold tracking-widest text-[#00F2FE] drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-neon)]" />
        GEO POSITION / LIVE
      </div>

      <div className="border-l border-[#00F2FE]/50 pl-3 text-white/80">
        <p>LAT&nbsp;&nbsp; 13°08&apos; N</p>
        <p>LON&nbsp; 123°44&apos; E</p>
        <p>ELEV&nbsp; +024.80 M</p>
        <p className="mt-2 text-[#00F2FE]/70">SYSTEM TIME / PHT</p>
        <p className="text-white/70">{time}</p>
      </div>
    </div>
  );
}
