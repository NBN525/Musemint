// Server component wrapper for /success
export const dynamic = "force-dynamic"; // don't prerender
export const revalidate = 0;            // no ISR caching

import SuccessClient from "./success-client";

export default function Page() {
  return <SuccessClient />;
}
