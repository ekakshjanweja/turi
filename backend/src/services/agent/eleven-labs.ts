import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenLabs = new ElevenLabsClient();

export async function elevenLabsTts(text: string): Promise<number[]> {
  const audio = await elevenLabs.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    text: text,
    modelId: "eleven_flash_v2",
    outputFormat: "mp3_44100_128",
  });

  const chunks = [];
  const reader = audio.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const audioBuffer = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  let offset = 0;
  for (const chunk of chunks) {
    audioBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  return Array.from(audioBuffer);
}
