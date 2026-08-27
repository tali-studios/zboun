import { permanentRedirect } from "next/navigation";

export default function LegacyForRestaurantsLayout() {
  permanentRedirect("/for-stores");
}
