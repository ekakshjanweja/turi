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

export function detectEndChatIntent(input: string): boolean {
  const endPatterns = [
    // Basic goodbyes and endings
    /^(bye|goodbye|exit|quit|end|stop|close|finish|done|thanks?(?:\s+(?:you|bye|goodbye))?|that'?s\s+all|i'?m\s+done|see\s+you|talk\s+to\s+you\s+later|ttyl|catch\s+you\s+later|farewell|adios|au\s+revoir|ciao)\.?!?$/i,

    // Chat/conversation specific endings
    /^(bye|goodbye|exit|quit|end|stop|close|finish|done)\s+(chat|conversation|session|talk|speaking)\.?!?$/i,
    /^(end|stop|close)\s+(the\s+)?(chat|conversation|session)\.?!?$/i,
    /^(i\s+)?(want\s+to\s+|need\s+to\s+|have\s+to\s+)?(end|stop|close|finish|quit|exit)\s+(this\s+)?(chat|conversation|session|talk)\.?!?$/i,

    // Thank you variations with endings
    /^(thank\s+you\s+)?(that'?s\s+)?(all|enough|it)\s+(for\s+)?(now|today|tonight)\.?!?$/i,

    // "Okay that's all" variations
    /^(okay|ok|alright|right)\s+(that'?s\s+)?(all|it|enough|good)\.?!?$/i,
    /^(okay|ok|alright|perfect|great|awesome|cool|nice)\s*,?\s*(that'?s\s+)?(all|it|enough|done|good)\s*(for\s+now|today|tonight)?\.?!?$/i,
    /^(okay|ok|alright)\s+(i'?m\s+)?(done|finished|good)\.?!?$/i,
    /^(perfect|great|awesome|excellent|wonderful|amazing)\s*,?\s*(thanks?|thank\s+you)\s*(bye|goodbye)?\.?!?$/i,
    /^(sounds?\s+good|looks?\s+good)\s*,?\s*(thanks?|thank\s+you|bye|goodbye)\.?!?$/i,

    // Hindi/Hinglish phrases
    /^(bas|बस)\.?!?$/i, // "enough" / "that's it"
    /^(bas|बस)\s+(khatam|khatm|खतम|ho\s+gaya|हो\s+गया)\.?!?$/i, // "bas khatam" / "bas ho gaya"
    /^(theek\s+hai|thik\s+hai|ठीक\s+है)\s+(bas|बस)\.?!?$/i, // "theek hai bas"
    /^(accha|अच्छा)\s+(bas|बस|thanks?|dhanyawad|धन्यवाद)\.?!?$/i, // "accha bas"
    /^(okay|ok)\s+(bas|बस|theek\s+hai|thik\s+hai|ठीक\s+है)\.?!?$/i, // "okay bas"
    /^(dhanyawad|dhanyawaad|धन्यवाद|shukriya|शुक्रिया)\.?!?$/i, // "thank you" in Hindi
    /^(alvida|अलविदा|namaste|नमस्ते)\.?!?$/i, // "goodbye" / "namaste"
    /^(chalo|चलो)\s+(bye|alvida|अलविदा)\.?!?$/i, // "chalo bye"
    /^(bas|बस)\s+(karo|करो|kar\s+do|कर\s+दो)\.?!?$/i, // "bas karo"
    /^(khatam|khatm|खतम|ho\s+gaya|हो\s+गया|done\s+hai|done\s+है)\.?!?$/i, // "khatam" / "ho gaya"
    /^(okay|ok)\s+(cool|theek\s+hai|thik\s+hai|ठीक\s+है)\s*(bye|alvida|अलविदा)?\.?!?$/i, // "okay cool"
  ];

  const trimmedInput = input.trim();
  return endPatterns.some((pattern) => pattern.test(trimmedInput));
}
