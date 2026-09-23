import { permanentRedirect } from "next/navigation";

/** Retired nested path — permanent redirect to flat slug. */
export default function ShadowLabGroupRedirect() {
  permanentRedirect("/shadow-lab-group");
}
