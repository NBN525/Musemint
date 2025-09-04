// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Price for your Supporter Pass (or product)
export const PRICE_ID = process.env.STRIPE_PRICE_ID!;

/** Choose the correct webhook secret based on mode */
export function getWebhookSecret(): string {
  const mode = (process.env.STRIPE_WEBHOOK_MODE || "live").toLowerCase(); // "test" | "live"
  return mode === "test"
    ? (process.env.STRIPE_WEBHOOK_SECRET_TEST || "")
    : (process.env.STRIPE_WEBHOOK_SECRET || "");
}
