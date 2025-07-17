import { google } from "@ai-sdk/google";
import { generateText, type CoreMessage } from "ai";
import dedent from "dedent";

interface EmailWithDetails {
  id: string;
  subject?: string;
  from?: string;
  date?: string;
}

export async function resolveOrdinalEmailReferenceAI(
  reference: string,
  lastEmailList: EmailWithDetails[],
  messages: CoreMessage[]
): Promise<string | null> {
  if (!lastEmailList || lastEmailList.length === 0) return null;

  // Create detailed email context for better resolution
  const emailDetails = lastEmailList
    .map((email, index) => {
      const subject = email.subject || "No subject";
      const from = email.from || "Unknown sender";
      const date = email.date || "Unknown date";
      return `${index}. Subject: "${subject}" | From: ${from} | Date: ${date} | ID: ${email.id}`;
    })
    .join("\n");

  const msg = dedent`
  You are an AI that maps a user's natural language reference to an email's index in a list.
  
  Available emails (${lastEmailList.length} total, indexed 0 to ${lastEmailList.length - 1}):
  ${emailDetails}
  
  Based on the user's reference, determine the correct index using these rules:
  
  1.  **Contextual / Vague (Default to 0):**
      *   Affirmations: "yes", "yeah", "sure", "okay"
      *   Pronouns: "that", "it", "the one"
      *   General commands: "read that", "the one you mentioned", "read it"
  
  2.  **Ordinal:**
      *   "first", "1st", "top", "latest", "newest", "the first", "the first one", "first email", "first one" = 0
      *   "second", "2nd", "next", "the second", "the second one", "second email", "second one" = 1
      *   "third", "3rd", "the third", "the third one", "third email", "third one" = 2
      *   "fourth", "4th", "the fourth", "the fourth one", "fourth email", "fourth one" = 3
      *   "fifth", "5th", "the fifth", "the fifth one", "fifth email", "fifth one" = 4
      *   "last", "bottom", "oldest", "the last", "the last one", "last email", "last one" = ${lastEmailList.length - 1}
  
  3.  **Content-based references:**
      *   "email from [sender name]" - match by sender
      *   "email about [subject keyword]" - match by subject
      *   "the [adjective] one" - use context to determine which
  
  4.  **Position-based phrases:**
      *   "read the second one" = 1
      *   "read the first email" = 0
      *   "show me the third" = 2
  
  Consider the conversation context to understand which email the user is likely referring to.
  If the user's intent is unclear, return 0. 
  
  IMPORTANT: Return ONLY the integer index (0, 1, 2, etc.), nothing else.
  
  User's reference: "${reference}"
  
  Recent conversation context:
  ${messages
    .slice(-5)
    .map(
      (message, idx) =>
        `${idx + 1}. ${typeof message.content === "string" ? message.content : JSON.stringify(message.content)}`
    )
    .join("\n")}
  `;

  // Create a copy of messages to avoid modifying the original
  const contextMessages = [...messages];
  contextMessages.push({ role: "user", content: msg });

  const aiResult = await generateText({
    model: google("gemini-2.0-flash"),
    messages: contextMessages,
  });

  const idx = parseInt(aiResult.text.trim(), 10);
  if (!isNaN(idx) && idx >= 0 && idx < lastEmailList.length) {
    return lastEmailList[idx]?.id || null;
  }

  // Fallback to first email if AI response is unclear
  return lastEmailList[0]?.id || null;
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
