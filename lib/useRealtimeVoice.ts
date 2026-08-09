"use client";

import { useEffect, useRef, useState } from "react";

// Handles the browser side of the voice partner: captures mic audio,
// streams it to our relay (server/realtime-relay.js) over WebSocket, and
// plays back the audio the AI returns. This is a working baseline --
// production hardening (echo cancellation tuning, reconnect/backoff,
// interruption handling, VAD-based turn-taking) should be layered on top.

export function useRealtimeVoice(aiSessionId: string | null) {
  const [status, setStatus] = useState<"idle" | "connecting" | "listening" | "error">("idle");
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!aiSessionId) return;

    let cancelled = false;
    setStatus("connecting");

    async function connect() {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${protocol}://${window.location.host}/api/ai/realtime?sessionId=${aiSessionId}`);
      wsRef.current = ws;

      const audioCtx = new AudioContext({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;

      ws.onopen = async () => {
        if (cancelled) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(audioCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);
          const pcm16 = floatTo16BitPCM(input);
          ws.send(
            JSON.stringify({
              type: "input_audio_buffer.append",
              audio: base64FromArrayBuffer(pcm16.buffer),
            })
          );
        };

        setStatus("listening");
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "response.audio.delta" && msg.delta) {
            const buffer = base64ToArrayBuffer(msg.delta);
            const audioBuffer = await audioCtx.decodeAudioData(buffer.slice(0));
            const src = audioCtx.createBufferSource();
            src.buffer = audioBuffer;
            src.connect(audioCtx.destination);
            src.start();
          }
        } catch {
          // ignore non-JSON / control frames
        }
      };

      ws.onerror = () => setStatus("error");
      ws.onclose = () => setStatus("idle");
    }

    connect();

    return () => {
      cancelled = true;
      wsRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, [aiSessionId]);

  return { status };
}

function floatTo16BitPCM(input: Float32Array) {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function base64FromArrayBuffer(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
