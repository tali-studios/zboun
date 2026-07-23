import { Gift } from "lucide-react";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { CustomerMobileTopBar } from "@/components/customer-mobile-top-bar";

export default function ButlerPage() {
  return (
    <>
      <div className="flex min-h-screen flex-col bg-white pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <CustomerMobileTopBar title="Butler" />

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
            <Gift className="h-10 w-10 text-violet-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900">Butler Service</h2>
          <p className="max-w-md text-slate-600">
            Your personal shopping assistant. Coming soon to help you with special requests and custom
            orders.
          </p>
        </div>
      </div>
      <CustomerMobileFooterNav />
    </>
  );
}
