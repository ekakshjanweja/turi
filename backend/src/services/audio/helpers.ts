export function createWavBuffer(
  pcmData: Buffer,
  channels = 1,
  sampleRate = 24000,
  bitsPerSample = 16
): Buffer {
  const headerLength = 44;
  const totalLength = headerLength + pcmData.length;

  // Create buffer for the entire WAV file
  const wavBuffer = Buffer.alloc(totalLength);

  // Write WAV header
  let offset = 0;

  // RIFF header
  wavBuffer.write("RIFF", offset);
  offset += 4;
  wavBuffer.writeUInt32LE(totalLength - 8, offset);
  offset += 4;
  wavBuffer.write("WAVE", offset);
  offset += 4;

  // fmt chunk
  wavBuffer.write("fmt ", offset);
  offset += 4;
  wavBuffer.writeUInt32LE(16, offset);
  offset += 4; // fmt chunk size
  wavBuffer.writeUInt16LE(1, offset);
  offset += 2; // audio format (PCM)
  wavBuffer.writeUInt16LE(channels, offset);
  offset += 2;
  wavBuffer.writeUInt32LE(sampleRate, offset);
  offset += 4;
  wavBuffer.writeUInt32LE((sampleRate * channels * bitsPerSample) / 8, offset);
  offset += 4; // byte rate
  wavBuffer.writeUInt16LE((channels * bitsPerSample) / 8, offset);
  offset += 2; // block align
  wavBuffer.writeUInt16LE(bitsPerSample, offset);
  offset += 2;

  // data chunk
  wavBuffer.write("data", offset);
  offset += 4;
  wavBuffer.writeUInt32LE(pcmData.length, offset);
  offset += 4;

  // Copy PCM data
  pcmData.copy(wavBuffer, offset);

  return wavBuffer;
}
