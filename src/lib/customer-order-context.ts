import { cache } from "react";
import { getCustomerAddresses, getCustomerSession } from "@/app-actions/customer-auth";
import type { SavedAddressOption } from "@/components/order-delivery-fields";

export function resolveCustomerOrderName(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  const emailPrefix = email?.split("@")[0]?.trim();
  return emailPrefix || "";
}

export const getCustomerOrderContext = cache(async function getCustomerOrderContext(): Promise<{
  isLoggedIn: boolean;
  defaultCustomerName: string;
  savedAddresses: SavedAddressOption[];
}> {
  const session = await getCustomerSession();
  if (!session) {
    return { isLoggedIn: false, defaultCustomerName: "", savedAddresses: [] };
  }
  const savedAddresses = (await getCustomerAddresses(session.id)) as SavedAddressOption[];
  return {
    isLoggedIn: true,
    defaultCustomerName: resolveCustomerOrderName(session.name, session.email),
    savedAddresses,
  };
});
