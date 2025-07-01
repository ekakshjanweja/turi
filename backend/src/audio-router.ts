import { Hono } from "hono";
import type { auth } from "./lib/auth";
import { stt } from "./services/audio/stt";

export const audioRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    Bindings: CloudflareBindings;
  };
}>();

audioRouter.post("/stt", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  try {
    // Get the uploaded file from the request
    const body = await c.req.parseBody();
    const audioFile = body.audio as File;

    // Validate that an audio file was uploaded
    if (!audioFile || !(audioFile instanceof File)) {
      return c.json({ message: "No audio file provided" }, 400);
    }

    // Validate file type (optional but recommended)
    const validMimeTypes = [
      "audio/wav",
      "audio/mp3",
      "audio/mpeg",
      "audio/webm",
      "audio/ogg",
      "audio/m4a",
    ];

    if (!validMimeTypes.includes(audioFile.type)) {
      console.log("Invalid file type", audioFile.type);

      return c.json(
        {
          message:
            "Invalid file type. Supported formats: WAV, MP3, WebM, OGG, M4A",
          receivedType: audioFile.type,
        },
        400
      );
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      return c.json(
        {
          message: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
          fileSize: audioFile.size,
        },
        400
      );
    }

    // Convert the file to ArrayBuffer or Blob for processing
    const audioBuffer = await audioFile.arrayBuffer();

    const transcription = await stt({
      file: audioBuffer,
      mimeType: audioFile.type,
    });

    return c.json({
      transcription,
      message: "Audio file transcribed successfully",
      fileName: audioFile.name,
      fileSize: audioFile.size,
      fileType: audioFile.type,
    });
  } catch (error) {
    console.error("Error processing audio file:", error);
    return c.json(
      {
        message: "Failed to process audio file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Optional: Add a GET endpoint to check if the service is available
audioRouter.get("/status", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  return c.json({
    status: "Audio service is available",
    supportedFormats: [
      "audio/wav",
      "audio/mp3",
      "audio/mpeg",
      "audio/webm",
      "audio/ogg",
      "audio/m4a",
    ],
    maxFileSize: "10MB",
  });
});
