import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function resolveOrdinalEmailReferenceAI(
  reference: string,
  lastEmailList: { id: string }[]
): Promise<string | null> {
  if (!lastEmailList || lastEmailList.length === 0) return null;
  // Use AI to resolve the index
  const prompt = `Given the user said: "${reference}", and there are ${
    lastEmailList.length
  } emails in the list (indexed from 0 to ${
    lastEmailList.length - 1
  }), what is the zero-based index of the email they mean? Only return the number.`;
  const aiResult = await generateText({
    model: google("gemini-2.0-flash"),
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that extracts a single integer index from a user's ordinal or positional reference to an item in a list.",
      },
      { role: "user", content: prompt },
    ],
  });
  const idx = parseInt(aiResult.text.trim(), 10);
  if (!isNaN(idx) && idx >= 0 && idx < lastEmailList.length) {
    return lastEmailList[idx]?.id || null;
  }
  return null;
}
