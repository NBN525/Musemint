// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

export const runtime = "nodejs"; 
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // 👤 Customer info
      const customerEmail = session.customer_details?.email || "unknown@example.com";

      // 📧 Send receipt via Resend
      await resend.emails.send({
        from: process.env.RECEIPT_FROM!,
        to: customerEmail,
        bcc: [process.env.RECEIPT_BCC!],
        subject: "✅ Thanks for your purchase – RST Global",
        html: `
          <h2>Payment Confirmed</h2>
          <p>Hello,</p>
          <p>We’ve received your payment of <strong>${(session.amount_total! / 100).toFixed(2)} ${session.currency?.toUpperCase()}</strong>.</p>
          <p>Your product: <strong>${session.metadata?.product || "RST Planner"}</strong></p>
          <p>You’ll receive further instructions shortly. If you have questions, contact us at ${process.env.RECEIPT_FROM}.</p>
          <br/>
          <p>— RST Global Team</p>
        `,
      });

      console.log("✅ Receipt email sent to:", customerEmail);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error handling webhook:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
