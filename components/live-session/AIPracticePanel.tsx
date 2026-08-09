"use client";

import { useEffect, useState } from "react";
import { useRealtimeVoice } from "@/lib/useRealtimeVoice";
import { X, Mic } from "lucide-react";

export default function AIPracticePanel({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) {
  const [aiSessionId, setAiSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ai/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionPlanId: sessionId }),
    })
      .then((r) => r.json())
      .then((data) => setAiSessionId(data.aiSessionId));
  }, [sessionId]);

  const { status } = useRealtimeVoice(aiSessionId);

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50">
      <div className="bg-surface rounded-card shadow-card w-full max-w-md p-8 text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink">
          <X size={18} />
        </button>

        <div
          className={`mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center ${
            status === "listening" ? "bg-accent text-white" : "bg-accent-soft text-accent"
          }`}
        >
          <Mic size={26} />
        </div>

        <h2 className="font-display text-xl text-ink mb-1">AI Practice Partner</h2>
        <p className="text-sm text-muted">
          {status === "connecting" && "Connecting…"}
          {status === "listening" && "Listening — speak naturally."}
          {status === "error" && "Couldn't connect. Check your microphone permissions."}
          {status === "idle" && "Session ended."}
        </p>
      </div>
    </div>
  );
}
