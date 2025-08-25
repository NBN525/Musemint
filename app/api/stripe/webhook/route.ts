import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { welcomeEmailHTML, welcomeEmailText } from "../../../../lib/emailTemplates";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      if (session.customer_email) {
        await resend.emails.send({
          from: "MuseMint <noreply@rstglobal.ca>",
          to: session.customer_email,
          subject: "Welcome to MuseMint 🎉",
          html: welcomeEmailHTML(session),
          text: welcomeEmailText(session),
        });
      }
      console.log("✅ Email queued for:", session.customer_email);
    } catch (error) {
      console.error("❌ Error sending email:", error);
    }
  }

  return NextResponse.json({ received: true });
}
