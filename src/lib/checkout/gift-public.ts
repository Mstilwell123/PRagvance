/** Client-safe flag. Must be exactly "true". Default off — no visible gift-page change. */
export function isGiftCheckoutUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED?.trim().toLowerCase() === "true";
}

/**
 * Black Friday display. Default on (current behavior). Off only when explicitly "false".
 * Server apply uses the same rule via GIFT_BLACK_FRIDAY_ENABLED / this public var.
 */
export function isGiftBlackFridayUiEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_GIFT_BLACK_FRIDAY_ENABLED;
  if (v === undefined || v.trim() === "") return true;
  return v.trim().toLowerCase() !== "false";
}

/** Installment UI. Default off. On only when exactly "true". */
export function isGiftInstallmentUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GIFT_INSTALLMENTS_ENABLED?.trim().toLowerCase() === "true";
}
