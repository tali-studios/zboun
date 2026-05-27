import { getCustomerAddresses, getCustomerSession } from "@/app-actions/customer-auth";
import type { SavedAddressOption } from "@/components/order-delivery-fields";

export async function getCustomerOrderContext(): Promise<{
  isLoggedIn: boolean;
  defaultCustomerName: string;
  savedAddresses: SavedAddressOption[];
}> {
  const session = await getCustomerSession();
  if (!session) {
    return { isLoggedIn: false, defaultCustomerName: "", savedAddresses: [] };
  }
  const savedAddresses = (await getCustomerAddresses()) as SavedAddressOption[];
  return {
    isLoggedIn: true,
    defaultCustomerName: session.name,
    savedAddresses,
  };
}
