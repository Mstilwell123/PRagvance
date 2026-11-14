/** Client-safe flag. Must be exactly "true". Default off — no visible gift-page change. */
export function isGiftCheckoutUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED?.trim().toLowerCase() === "true";
}
