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
    if (result.toast === "social_links_pending_migration") {
      return {
        heading: "Settings saved — social links pending",
        message:
          result.message ??
          "Run supabase/add-restaurant-social-links.sql in Supabase, then save your Instagram and other social links again.",
        variant: "warning",
      };
    }
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
  if (result.toast === "invalid_social_url") {
    return {
      heading: "Check social links",
      message:
        result.message ??
        "Each social link must match its platform (Instagram for Instagram, TikTok for TikTok, and so on).",
      variant: "warning",
    };
  }
  if (result.toast === "store_images_required") {
    return {
      heading: "Logo & banner required",
      message: result.message ?? "Upload a store logo and banner image, then save again.",
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
    if (isPending) return;
    const form = event.currentTarget;
    const formData = new FormData(form);

    const phone = String(formData.get("phone") ?? "").trim();
    if (!phone) {
      setAlert({
        heading: "WhatsApp / phone required",
        message: "Enter the WhatsApp or phone number customers use to reach you.",
        variant: "warning",
      });
      return;
    }

    const logoFile = formData.get("logo_file");
    const bannerFile = formData.get("banner_file");
    const currentLogo = String(formData.get("current_logo_url") ?? "").trim();
    const currentBanner = String(formData.get("current_banner_url") ?? "").trim();
    const hasLogo = currentLogo || (logoFile instanceof File && logoFile.size > 0);
    const hasBanner = currentBanner || (bannerFile instanceof File && bannerFile.size > 0);
    if (!hasLogo || !hasBanner) {
      setAlert({
        heading: "Logo & banner required",
        message: "Upload a store logo and banner image, then save again.",
        variant: "warning",
      });
      return;
    }

    const lbpRate = Number(formData.get("lbp_rate") ?? "");
    if (!Number.isFinite(lbpRate) || lbpRate <= 0) {
      setAlert({
        heading: "Invalid exchange rate",
        message: "Enter a valid dollar rate greater than zero.",
        variant: "warning",
      });
      return;
    }

    const deliveryFee = Number(formData.get("delivery_fee_usd") ?? "");
    if (!Number.isFinite(deliveryFee) || deliveryFee <= 0) {
      setAlert({
        heading: "Invalid delivery fee",
        message: "Enter a delivery fee greater than $0.00 (for example $2.50).",
        variant: "warning",
      });
      return;
    }

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
      <form
        id="restaurant-store-settings-form"
        onSubmit={handleSubmit}
        className={className}
        aria-busy={isPending}
      >
        {children}
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
  pendingLabel = "Saving…",
}: {
  children: ReactNode;
  className?: string;
  /** Associate with a form when the button sits outside it. */
  form?: string;
  pendingLabel?: string;
}) {
  const pending = useStoreSettingsPending();
  return (
    <button
      type="submit"
      form={form}
      disabled={pending}
      aria-busy={pending}
      className={`${className ?? ""} disabled:cursor-wait disabled:opacity-70`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
