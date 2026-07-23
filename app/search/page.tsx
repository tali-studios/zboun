import { getHomeRestaurants } from "@/lib/data";
import { getCustomerOrderContext } from "@/lib/customer-order-context";
import { SearchPageContent } from "@/components/search-page-content";
import { DeliveryLocationProvider } from "@/components/delivery-location-provider";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";

export default async function SearchPage() {
  const [restaurants, customerCtx] = await Promise.all([
    getHomeRestaurants(),
    getCustomerOrderContext(),
  ]);

  return (
    <>
      <DeliveryLocationProvider savedAddresses={customerCtx.savedAddresses}>
        <SearchPageContent
          restaurants={restaurants}
          isLoggedIn={customerCtx.isLoggedIn}
        />
      </DeliveryLocationProvider>
      <CustomerMobileFooterNav />
    </>
  );
}
