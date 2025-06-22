import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenLabs = new ElevenLabsClient();

export async function tts(text: string) {
  const audio = await elevenLabs.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    text: text,
    modelId: "eleven_flash_v2",
    outputFormat: "mp3_44100_128",
  });

  const base64Audio = await audioToBase64(audio);

  return {
    audioData: base64Audio,
    format: "mp3",
    mimeType: "audio/mpeg",
  };
}

export async function audioToBase64(
  audio: ReadableStream<Uint8Array<ArrayBufferLike>>
): Promise<string> {
  // Convert the audio stream to a buffer
  const chunks = [];
  const reader = audio.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Combine all chunks into a single buffer
  const audioBuffer = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  let offset = 0;
  for (const chunk of chunks) {
    audioBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  // Convert to base64 for transmission
  const base64Audio = Buffer.from(audioBuffer).toString("base64");

  return base64Audio;
}
