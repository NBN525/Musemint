// app/api/stripe/webhook/route.ts
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { appendToSheet, appendToSales } from '@/lib/sheets';
import { sendSaleEmail } from '@/lib/email';

export const runtime = 'nodejs'; // Stripe SDK needs Node (not Edge)

// ---- Stripe client ----
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2024-06-20',
});

type Json = Record<string, any>;

// Optional: quick GET for sanity checks
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Stripe webhook endpoint' });
}

// ---- Main webhook ----
export async function POST(req: Request) {
  // Stripe sends a raw body; do NOT use await req.json()
  const sig = req.headers.get('stripe-signature') ?? '';
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('❌ Invalid webhook signature', err?.message || err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle supported events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const amount_total = session.amount_total ?? 0; // cents
      const currency = (session.currency ?? 'cad').toLowerCase();
      const email = session.customer_details?.email ?? '';
      const name = session.customer_details?.name ?? '';
      const session_id = session.id;
      const customer_id =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id ?? '';
      const mode = event.livemode ? 'LIVE' : 'TEST';
      const payment_status = session.payment_status ?? '';

      // 1) Log lightweight line to your general RST sheet (optional)
      try {
        const rstRow: Json = {
          ts: new Date().toISOString(),
          source: 'stripe',
          event: event.type,
          note: 'checkout.session.completed',
        };
        await appendToSheet({ table: 'rst_global', row: rstRow });
      } catch (e) {
        console.warn('RST sheet log failed:', e);
      }

      // 2) Log full sale to the dedicated MuseMint Sales sheet
      try {
        await appendToSales({
          event_type: event.type,
          email,
          name,
          amount_total,
          currency,
          payment_status,
          mode,
          session_id,
          customer_id,
          notes: 'Stripe Checkout',
        });
      } catch (e) {
        console.warn('Sales sheet log failed:', e);
      }

      // 3) Send alert email via Resend
      try {
        const to = process.env.SALES_ALERT_TO || 'hello@rstglobal.ca';
        const emailRes = await sendSaleEmail({
          to,
          amountTotalCents: amount_total,
          currency,
          sessionId: session_id,
          customerEmail: email || undefined,
          mode: mode as 'LIVE' | 'TEST',
        });
        if (!emailRes.ok) {
          console.warn('Email send failed:', emailRes);
        }
      } catch (e) {
        console.warn('Email exception:', e);
      }

      return NextResponse.json({ received: true });
    }

    // (Optional) add more cases you care about:
    // case 'payment_intent.succeeded': ...
    // case 'invoice.payment_succeeded': ...
    default:
      // Acknowledge unhandled events to stop retries
      return NextResponse.json({ received: true });
  }
}
