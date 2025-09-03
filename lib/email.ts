import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const result = await resend.emails.send({
      from: "MuseMint <hello@rstglobal.ca>",
      to: [to],
      bcc: ["rtremblay@hotmail.com"], // fallback copy
      subject,
      html,
    });
    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}
