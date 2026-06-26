"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type Props = {
  toast: string | undefined | null;
  sectionName?: string | undefined | null;
  sectionsCount?: number | null;
  itemName?: string | undefined | null;
  brandName?: string | undefined | null;
};

export function RestaurantDashboardToast({ toast, sectionName, sectionsCount, itemName, brandName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(Boolean(toast));

  const clearToastParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("toast");
    params.delete("section_name");
    params.delete("sections_count");
    params.delete("item_name");
    params.delete("brand_name");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router]);

  useEffect(() => {
    if (!toast) return;
    setOpen(true);
    const done = window.setTimeout(() => {
      setOpen(false);
      clearToastParams();
    }, 4200);
    return () => window.clearTimeout(done);
  }, [toast, clearToastParams]);

  if (!toast || !open) return null;

  let heading = "";
  let message: ReactNode = null;

  if (toast === "settings_saved") {
    heading = "All set";
    message = "Your settings were saved.";
  } else if (toast === "section_created") {
    heading = "Section created";
    message = sectionName ? (
      <>
        Section <span className="font-semibold text-slate-900">“{sectionName}”</span> is ready.
      </>
    ) : (
      "Your new menu section is ready."
    );
  } else if (toast === "sections_created") {
    heading = "Sections created";
    message =
      sectionsCount && sectionsCount > 1 ? (
        <>
          <span className="font-semibold text-slate-900">{sectionsCount}</span> sections were added to your
          menu.
        </>
      ) : (
        "Your new sections are ready."
      );
  } else if (toast === "section_name_required") {
    heading = "Name required";
    message = "Enter a section name before adding.";
  } else if (toast === "brand_created") {
    heading = "Brand added";
    message = brandName ? (
      <>
        Brand <span className="font-semibold text-slate-900">“{brandName}”</span> is ready to use on menu items.
      </>
    ) : (
      "Your new brand is ready to use on menu items."
    );
  } else if (toast === "brand_name_required") {
    heading = "Brand name required";
    message = "Enter a brand name before adding.";
  } else if (toast === "brand_name_duplicate") {
    heading = "Brand already exists";
    message = "You already have a brand with that name.";
  } else if (toast === "brand_logo_invalid") {
    heading = "Invalid logo";
    message = "Upload a PNG, JPG, or WebP image under 5MB.";
  } else if (toast === "brand_create_failed") {
    heading = "Could not add brand";
    message = "Something went wrong while saving the brand. Try again.";
  } else if (toast === "item_created") {
    heading = "Item added";
    message = itemName ? (
      <>
        <span className="font-semibold text-slate-900">“{itemName}”</span> is on your menu.
      </>
    ) : (
      "Your new menu item was saved."
    );
  } else if (toast === "item_create_invalid") {
    heading = "Check the form";
    message = "Choose a section, enter an item name, and set a valid price (0 or more) before saving.";
  } else if (toast === "item_create_failed") {
    heading = "Could not save item";
    message =
      "Something went wrong while saving to the database. Confirm the section still exists and try again. If it keeps happening, contact support.";
  } else if (toast === "item_updated") {
    heading = "Changes saved";
    message = itemName ? (
      <>
        Updates to <span className="font-semibold text-slate-900">“{itemName}”</span> were saved.
      </>
    ) : (
      "Your menu item was updated."
    );
  } else if (toast === "item_update_invalid") {
    heading = "Check the form";
    message = "Enter an item name, choose a section, and set a valid price before saving.";
  } else if (toast === "item_update_failed") {
    heading = "Could not save changes";
    message = "Something went wrong while updating this item. Please try again.";
  } else if (toast === "item_update_brand_migration") {
    heading = "Brand columns missing";
    message =
      "Run the Supabase migrations add-menu-item-brand-name.sql and add-menu-brands.sql, then try saving again.";
  } else if (toast === "item_update_nutrition_migration") {
    heading = "Item saved — nutrition columns missing";
    message =
      "Other changes were saved. Run add-menu-item-nutrition.sql in Supabase, then save again to store calories and protein.";
  } else if (toast === "item_create_nutrition_migration") {
    heading = "Item added — nutrition columns missing";
    message =
      "The item was created without calories/protein. Run add-menu-item-nutrition.sql in Supabase, then edit the item to add them.";
  } else if (toast === "location_saved") {
    heading = "Branch saved";
    message = "The location was saved and is now visible to customers nearby.";
  } else if (toast === "location_deleted") {
    heading = "Branch removed";
    message = "The location was deleted from your profile.";
  } else if (toast === "location_invalid_coords") {
    heading = "Invalid coordinates";
    message = "Please pick a location on the map before saving.";
  } else if (toast === "hours_saved") {
    heading = "Hours saved";
    message = "Your opening hours were updated.";
  } else if (toast === "hours_invalid") {
    heading = "Invalid hours";
    message = "Could not save opening hours. Check each day and try again.";
  } else if (toast === "invalid_delivery_fee") {
    heading = "Invalid delivery fee";
    message = "Enter a delivery fee greater than $0.00 (for example $2.50).";
  } else if (toast === "invalid_fast_delivery_fee") {
    heading = "Invalid fast delivery fee";
    message = "When fast delivery is enabled, enter a fee greater than $0.00 (for example $5.00).";
  } else if (toast === "invalid_delivery_radius") {
    heading = "Invalid delivery range";
    message = "Enter how far you deliver in kilometres (for example 5). Must be between 1 and 50 km.";
  } else if (toast === "browse_tags_required") {
    heading = "Tags required";
    message = "For each business category you select, pick at least one tag (for example Lunch under Food & Restaurants).";
  } else {
    return null;
  }

  function dismiss() {
    setOpen(false);
    clearToastParams();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[3px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dashboard-toast-title"
      aria-describedby="dashboard-toast-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        className="w-full max-w-[min(22rem,calc(100vw-2rem))] rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-white shadow-md"
            style={{
              background:
                toast === "section_name_required" ||
                toast === "item_create_invalid" ||
                toast === "item_create_failed" ||
                toast === "invalid_delivery_fee" ||
                toast === "invalid_fast_delivery_fee" ||
                toast === "invalid_delivery_radius" ||
                toast === "browse_tags_required"
                  ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : "linear-gradient(135deg,#7854ff,#9f3bfe)",
            }}
            aria-hidden
          >
            {toast === "section_name_required" ||
            toast === "item_create_invalid" ||
            toast === "item_create_failed" ||
            toast === "invalid_delivery_fee" ||
            toast === "invalid_fast_delivery_fee" ||
            toast === "invalid_delivery_radius" ? (
              "!"
            ) : (
              "✓"
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id="dashboard-toast-title" className="text-lg font-bold tracking-tight text-slate-900">
              {heading}
            </h2>
            <p id="dashboard-toast-desc" className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="button" className="btn btn-primary rounded-xl px-6" onClick={dismiss}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
