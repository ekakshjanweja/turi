import { GoogleGenAI } from "@google/genai";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "../../lib/config";

export async function tts({
  text,
}: {
  text: string;
}): Promise<number[] | undefined> {
  try {
    const googleGenAI = new GoogleGenAI({
      vertexai: false,
      apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const response = await googleGenAI.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        { parts: [{ text: `Say in a warm and friendly tone: ${text}` }] },
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

    if (!data) return undefined;

    const audioBuffer = Uint8Array.from(Buffer.from(data, "base64"));

    return Array.from(audioBuffer);
  } catch (error) {
    throw error;
  }
}
