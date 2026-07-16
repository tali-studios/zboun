"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { updateRestaurantSettingsAction, type UpdateRestaurantSettingsResult } from "@/app-actions/restaurant";
import { DashboardAlertModal } from "@/components/dashboard-alert-modal";

const PendingContext = createContext(false);

export function useStoreSettingsPending() {
  return useContext(PendingContext);
}

type AlertState = {
  heading: string;
  message: string;
  variant: "success" | "warning";
};

type Props = {
  children: ReactNode;
  className?: string;
  /** Rendered after the `<form>` (e.g. nested-form sections) but still inside pending context. */
  footer?: ReactNode;
};

function resultToAlert(result: UpdateRestaurantSettingsResult): AlertState | null {
  if (result.ok) {
    return { heading: "All set", message: "Your settings were saved.", variant: "success" };
  }
  if (result.toast === "browse_tags_required") {
    return {
      heading: "Tags required",
      message: result.message ?? "For each business category, pick at least one tag.",
      variant: "warning",
    };
  }
  if (result.toast === "invalid_delivery_fee") {
    return {
      heading: "Invalid delivery fee",
      message: "Enter a delivery fee greater than $0.00 (for example $2.50).",
      variant: "warning",
    };
  }
  if (result.toast === "invalid_fast_delivery_fee") {
    return {
      heading: "Invalid fast delivery fee",
      message: "When fast delivery is enabled, enter a fee greater than $0.00 (for example $5.00).",
      variant: "warning",
    };
  }
  if (result.toast === "invalid_delivery_radius") {
    return {
      heading: "Invalid delivery range",
      message: "Enter how far you deliver in kilometres (for example 5). Must be between 1 and 50 km.",
      variant: "warning",
    };
  }
  if (result.toast === "invalid_lbp_rate") {
    return {
      heading: "Invalid exchange rate",
      message: "Enter a valid dollar rate greater than zero.",
      variant: "warning",
    };
  }
  return {
    heading: "Could not save",
    message: result.message ?? "Something went wrong. Please try again.",
    variant: "warning",
  };
}

export function StoreSettingsForm({
  children,
  className = "flex flex-col gap-4 lg:col-span-2",
  footer,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState<AlertState | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await updateRestaurantSettingsAction(formData);
      const nextAlert = resultToAlert(result);
      if (!nextAlert) return;
      setAlert(nextAlert);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <PendingContext.Provider value={isPending}>
      <form id="restaurant-store-settings-form" onSubmit={handleSubmit} className={className}>
        {children}
        {isPending ? (
          <p className="px-5 pb-4 text-xs font-medium text-violet-600" aria-live="polite">
            Saving settings…
          </p>
        ) : null}
      </form>
      {footer}
      <DashboardAlertModal
        open={alert != null}
        heading={alert?.heading ?? ""}
        message={alert?.message ?? ""}
        variant={alert?.variant ?? "warning"}
        onClose={() => setAlert(null)}
      />
    </PendingContext.Provider>
  );
}

export function StoreSettingsSubmitButton({
  children,
  className,
  form,
}: {
  children: ReactNode;
  className?: string;
  /** Associate with a form when the button sits outside it. */
  form?: string;
}) {
  const pending = useStoreSettingsPending();
  return (
    <button type="submit" form={form} disabled={pending} className={className}>
      {pending ? "Saving…" : children}
    </button>
  );
}
