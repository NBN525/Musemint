// Status callback sink. Twilio only needs a 200 OK.
export async function POST() {
  return new Response("OK");
}
export async function GET() {
  return new Response("OK");
}
