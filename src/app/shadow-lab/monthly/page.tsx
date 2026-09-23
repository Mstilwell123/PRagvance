import { permanentRedirect } from "next/navigation";

/** Retired nested path — permanent redirect to flat slug. */
export default function ShadowLabMonthlyRedirect() {
  permanentRedirect("/shadow-lab-monthly");
}
