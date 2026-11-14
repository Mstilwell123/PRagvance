import { claimOnce } from "../kv.server";
import { GIFT_INSTALLMENT_COUNT } from "./gift-pricing";
import { addCountedInvoice, type GiftOrder, type GiftOrderStore } from "./gift-orders.server";

const INVOICE_TTL_SEC = 30 * 24 * 60 * 60;

export type InstallmentCapDeps = {
  store: GiftOrderStore;
  cancelSubscription: (subscriptionId: string, opts: { cancel_at_period_end: boolean }) => Promise<void>;
};

/**
 * Idempotent cap: count each paid invoice once, then cancel the subscription
 * at period end after GIFT_INSTALLMENT_COUNT paid invoices.
 * Returns the updated order, or null if there is no installment order.
 */
export async function countPaidInstallmentInvoice(
  input: { invoiceId: string; subscriptionId: string },
  deps: InstallmentCapDeps,
): Promise<GiftOrder | null> {
  const getBySub = deps.store.getBySubscription;
  if (!getBySub) return null;
  const existing = await getBySub(input.subscriptionId);
  if (!existing || existing.plan !== "installment") return null;

  if (!(await claimOnce(`gift-installment-invoice:${input.invoiceId}`, INVOICE_TTL_SEC))) {
    return existing;
  }

  const updated = addCountedInvoice(existing, input.invoiceId);
  if (updated.installment_paid_count! >= GIFT_INSTALLMENT_COUNT && !updated.installment_capped) {
    await deps.cancelSubscription(input.subscriptionId, { cancel_at_period_end: true });
    updated.installment_capped = true;
  }
  await deps.store.record(updated);
  return updated;
}
