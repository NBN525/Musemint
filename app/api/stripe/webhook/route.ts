// app/api/stripe/webhook/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import type StripeNS from "stripe";
import { stripe, getWebhookSecret } from "@/lib/stripe";
import { logSaleToSheets } from "@/lib/sheets";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const rawBody = await req.text();

  let event: StripeNS.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Invalid signature: ${err?.message || "unknown"}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as StripeNS.Checkout.Session;

        const email =
          session.customer_details?.email ||
          session.customer_email ||
          "unknown@example.com";
        const amount = (session.amount_total ?? 0) / 100;
        const currency = (session.currency ?? "usd").toUpperCase();

        // Log to Google Sheets (MuseMint Sales Log or generic sheet)
        await logSaleToSheets({
          sheetUrl:
            process.env.SHEET_WEBHOOK_URL_MUSEMINT ||
            process.env.SHEET_WEBHOOK_URL ||
            "",
          payload: {
            source: "stripe",
            event: event.type,
            email,
            amount,
            currency,
            mode: session.mode,
            id: session.id,
            time: new Date().toISOString(),
          },
        });

        // Optional internal notification via Resend
        if (process.env.SALES_ALERT_TO) {
          await resend.emails.send({
            from: `MuseMint <hello@rstglobal.ca>`,
            to: [process.env.SALES_ALERT_TO],
            subject: `✅ New order — ${amount.toFixed(2)} ${currency}`,
            text: `Order ${session.id} from ${email}. Amount: ${amount.toFixed(
              2
            )} ${currency}.`,
          });
        }
        break;
      }
      default:
        // No-op for other events for now
        break;
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook handler error: ${err?.message || "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
