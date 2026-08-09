"use client";

import { useEffect, useState } from "react";
import { useLiveSessionStore } from "@/lib/live-session-store";

export default function SessionTimer() {
  const startedAt = useLiveSessionStore((s) => s.startedAt);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return <span className="text-sm text-muted tabular-nums">{mm}:{ss}</span>;
}
