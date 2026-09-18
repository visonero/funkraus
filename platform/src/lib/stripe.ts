import Stripe from "stripe";

let cached: Stripe | null = null;

// Lazy singleton: constructing Stripe at module load time makes the whole
// build fail if the env var is momentarily unset (e.g. Vercel collecting
// route metadata before env vars are configured). Deferring to first call
// means only a request that actually needs Stripe fails, not the build.
export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return cached;
}
