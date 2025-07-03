import { GoogleGenAI } from "@google/genai";
import { GOOGLE_GENERATIVE_AI_API_KEY } from "../../lib/config";
import wav from "wav";
import { readFileSync, createWriteStream } from "fs";

export async function googleTts({
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

    const audioBuffer = Buffer.from(data, "base64");

    await saveWaveFile("out.wav", audioBuffer);

    const wavFileBuffer = readFileSync("out.wav");

    const audioFile = Array.from(wavFileBuffer);
    return audioFile;
  } catch (error) {
    throw error;
  }
}

async function saveWaveFile(
  filename: string,
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  return new Promise((resolve, reject) => {
    const fileStream = createWriteStream(filename);
    const writer = new wav.Writer({
      sampleRate: rate,
      channels: channels,
      bitDepth: sampleWidth * 8,
    });

    writer.pipe(fileStream);

    writer.on("finish", resolve);
    writer.on("error", reject);
    fileStream.on("error", reject);

    writer.write(pcmData);
    writer.end();
  });
}
