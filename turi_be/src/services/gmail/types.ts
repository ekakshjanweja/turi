import { z } from "zod";

export const SearchEmailsSchema = z.object({
  query: z
    .string()
    .describe("Gmail search query (e.g., 'from:example@gmail.com')"),
  maxResults: z
    .number()
    .optional()
    .describe("Maximum number of results to return"),
});

export type SearchEmails = z.infer<typeof SearchEmailsSchema>;
