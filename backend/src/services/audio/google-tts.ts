import { GoogleGenAI } from "@google/genai";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "../../lib/config";
import { createWavBuffer } from "./helpers";

export async function googleTts(text: string): Promise<number[]> {
  try {
    const googleGenAI = new GoogleGenAI({
      vertexai: false,
      apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const response = await googleGenAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          parts: [
            {
              text: `Say in a warm and friendly tone, speaking at a slightly quick pace: ${text}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const data =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!data) {
      throw new Error("No audio data received from Google TTS");
    }

    // Google TTS returns PCM data, we need to convert it to a proper WAV file in memory
    const pcmData = Buffer.from(data, "base64");

    // Create WAV file format in memory (no filesystem operations)
    const wavBuffer = createWavBuffer(pcmData);

    // Return as number array (same format as ElevenLabs)
    return Array.from(wavBuffer);
  } catch (error) {
    throw new Error(
      `Google TTS Failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function* googleTtsStream(
  text: string
): AsyncGenerator<number[], void, unknown> {
  try {
    const googleGenAI = new GoogleGenAI({
      vertexai: false,
      apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const response = await googleGenAI.models.generateContentStream({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          parts: [
            {
              text: `Say in a warm and friendly tone, speaking at a slightly quick pace: ${text}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    for await (const chunk of response) {
      if (chunk.data) {
        const pcmData = Buffer.from(chunk.data, "base64");
        const wavBuffer = createWavBuffer(pcmData);
        yield Array.from(wavBuffer);
      }
    }
  } catch (error) {
    throw new Error(
      `Google TTS Failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
