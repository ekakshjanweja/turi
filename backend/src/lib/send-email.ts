import {
  Resend,
  type CreateEmailResponseSuccess,
  type ErrorResponse,
} from "resend";
import { RESEND_API_KEY } from "./config";

const resend = new Resend(RESEND_API_KEY);

export async function sendEmail({
  from,
  to,
  subject,
  html,
}: {
  from?: string;
  to: string | string[];
  subject: string;
  html: string;
}): Promise<CreateEmailResponseSuccess | ErrorResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: from || "Turi Mail <no-reply@turi.stormej.me>",
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("No data returned from Resend");
    }

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
}
