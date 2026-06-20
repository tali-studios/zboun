import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomerOrders } from "@/app-actions/orders";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { BackToTopButton } from "@/components/back-to-top-button";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";
import { CustomerOrdersList } from "@/components/customer-orders-list";

export const dynamic = "force-dynamic";

export default async function CustomerOrdersPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/orders");

  const orders = await getCustomerOrders();

  return (
    <>
      <div className="min-h-screen bg-[#f2f2f7] pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
        <CustomerDesktopNav title="My Orders" />

        <header className="sticky top-0 z-30 flex h-14 items-center justify-center border-b border-slate-200/60 bg-white/95 px-4 backdrop-blur md:hidden">
          <p className="text-[15px] font-semibold text-slate-900">Orders</p>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-5">
          {orders.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
                <svg
                  className="h-8 w-8 text-violet-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-800">No orders yet</p>
              <p className="text-sm text-slate-500">Browse restaurants and place your first order!</p>
              <Link
                href="/"
                className="mt-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                Browse restaurants
              </Link>
            </div>
          ) : (
            <CustomerOrdersList orders={orders} />
          )}
        </div>
      </div>

      <CustomerMobileFooterNav />
      <BackToTopButton />
    </>
  );
}
