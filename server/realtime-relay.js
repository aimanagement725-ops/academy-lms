// Relay between a learner's browser and the realtime speech-to-speech
// provider (OpenAI Realtime API by default). The browser never holds the
// provider API key -- it only ever talks to this relay.
//
// Flow:
//   1. Client opens ws://.../api/ai/realtime?sessionId=<AIConversationSession.id>
//   2. Relay loads the session + seedPromptUsed from Postgres via Prisma
//   3. Relay opens its own upstream WS to the provider, sends the seed
//      prompt as the system/instructions turn
//   4. Audio frames stream client -> relay -> provider and back
//   5. Transcript events (both sides) are written to AIMessage as they arrive

const WebSocket = require("ws");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PROVIDER_WS_URL = "wss://api.openai.com/v1/realtime?model=gpt-realtime";

function attachRealtimeRelay(wss) {
  wss.on("connection", async (clientSocket, req) => {
    const url = new URL(req.url, "http://localhost");
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      clientSocket.close(4000, "Missing sessionId");
      return;
    }

    const session = await prisma.aIConversationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== "ACTIVE") {
      clientSocket.close(4001, "Session not found or not active");
      return;
    }

    // --- Open upstream connection to the realtime provider ---
    const upstream = new WebSocket(PROVIDER_WS_URL, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    upstream.on("open", () => {
      upstream.send(
        JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["audio", "text"],
            instructions: session.seedPromptUsed,
            voice: "alloy",
          },
        })
      );
    });

    // Provider -> client, plus transcript persistence
    upstream.on("message", async (data) => {
      clientSocket.readyState === WebSocket.OPEN && clientSocket.send(data);

      try {
        const event = JSON.parse(data.toString());
        if (event.type === "response.audio_transcript.done" && event.transcript) {
          await prisma.aIMessage.create({
            data: {
              sessionId: session.id,
              role: "ai",
              content: event.transcript,
            },
          });
        }
        if (event.type === "conversation.item.input_audio_transcription.completed" && event.transcript) {
          await prisma.aIMessage.create({
            data: {
              sessionId: session.id,
              role: "learner",
              content: event.transcript,
            },
          });
        }
      } catch {
        // Non-JSON or binary audio frame -- nothing to persist here.
      }
    });

    // Client -> provider
    clientSocket.on("message", (data) => {
      if (upstream.readyState === WebSocket.OPEN) upstream.send(data);
    });

    const cleanup = async () => {
      upstream.close();
      await prisma.aIConversationSession.update({
        where: { id: session.id },
        data: { status: "ENDED", endedAt: new Date() },
      });
    };

    clientSocket.on("close", cleanup);
    upstream.on("close", () => clientSocket.close());
    upstream.on("error", () => clientSocket.close());
  });
}

module.exports = { attachRealtimeRelay };
