import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from "@google/genai";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "../../lib/config";

export async function stt({
  file,
  mimeType,
}: {
  file: ArrayBuffer;
  mimeType: string;
}): Promise<string> {
  try {
    const googleGenAI = new GoogleGenAI({
      vertexai: false,
      apiKey: GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const uploadedFile = await googleGenAI.files.upload({
      file: new Blob([file], { type: mimeType }),
      config: { mimeType: mimeType },
    });
    if (!uploadedFile.uri) {
      throw new Error("Failed to upload file");
    }

    const response = await googleGenAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        createPartFromUri(uploadedFile.uri!, uploadedFile.mimeType!),
        "Exactly, return a word-for-word transcription of the audio. If there is silence, return an empty string.",
      ]),
    });

    if (!response.text) {
      throw new Error("Failed to generate content");
    }

    return response.text;
  } catch (error) {
    throw new Error(`Failed to process audio file, ${error}`);
  }
}
