// /app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { welcomeEmailHTML, welcomeEmailText } from "@/lib/emailTemplates";

// Ensure Node runtime (Stripe needs the raw body)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Let Stripe SDK use its pinned version
});

const resend = new Resend(process.env.RESEND_API_KEY as string);

const EMAIL_FROM = process.env.EMAIL_FROM || "MuseMint <noreply@rstglobal.ca>";
const NEXT_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://ai.rstglobal.ca";

// IMPORTANT: use your LIVE webhook secret when receiving live events.
// If you also have a TEST endpoint, deploy another route or inject the test secret in its env.
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  let event: Stripe.Event;

  // 1) Read raw body
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  // 2) Verify signature
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // 3) React to events
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Customer info
      const customerEmail = session.customer_details?.email || undefined;
      const customerName = session.customer_details?.name || undefined;

      // Try to locate a receipt URL (from the related PaymentIntent / latest charge)
      let receiptUrl: string | null = null;
      try {
        if (session.payment_intent) {
          const pi =
            typeof session.payment_intent === "string"
              ? await stripe.paymentIntents.retrieve(session.payment_intent, {
                  expand: ["latest_charge"],
                })
              : session.payment_intent;

          const charge =
            (pi as any)?.latest_charge as Stripe.Charge | undefined;
          receiptUrl = charge?.receipt_url || null;
        }
      } catch {
        // Non-fatal if we cannot fetch the receipt
      }

      // Decide download URL (you can swap this per product in the future)
      const downloadUrl = `${NEXT_PUBLIC_BASE_URL}/files/MuseMint-Planner-V1.pdf`;

      // Optional product name (if you pass line_items, you could fetch them here)
      const productName = "MuseMint Digital Planner";

      // Send via Resend (if we have an email)
      if (customerEmail) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: [customerEmail],
          subject: "Your MuseMint download + receipt",
          html: welcomeEmailHTML({
            customerName,
            productName,
            downloadUrl,
            receiptUrl,
          }),
          text: welcomeEmailText({
            customerName,
            productName,
            downloadUrl,
            receiptUrl,
          }),
        });
      }
    }

    // You can add more handlers here (payment_intent.succeeded, etc.)

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    // Make failures visible to Stripe’s retry system
    return NextResponse.json(
      { error: `Webhook handler error: ${err?.message || String(err)}` },
      { status: 500 }
    );
  }
}
