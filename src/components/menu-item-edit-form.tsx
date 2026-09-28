"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ValidatedActionForm } from "@/components/validated-action-form";
import {
  beginMenuItemsScrollHold,
  endMenuItemsScrollHold,
  saveMenuItemsScrollPosition,
} from "@/components/restore-menu-items-scroll";
import { validateMenuItemFormClient } from "@/lib/menu-item-form-validation";
import type { StoreItemProfile } from "@/lib/store-item-profile";

const MenuItemEditPendingContext = createContext(false);

const SAVED_TOASTS = new Set([
  "item_updated",
  "item_update_stock_alerts_migration",
  "item_update_nutrition_migration",
]);

function redirectToastFromError(err: unknown): string | null {
  if (!isRedirectError(err)) return null;
  const url = err.digest.split(";").slice(2, -2).join(";");
  try {
    return new URL(url, window.location.origin).searchParams.get("toast");
  } catch {
    return null;
  }
}

type Props = {
  children: ReactNode;
  className?: string;
  action: (formData: FormData) => void | Promise<void>;
  itemProfile: StoreItemProfile;
  brandRequired: boolean;
  /** Checkbox that controls the edit popup; unchecked after a successful save. */
  modalToggleId?: string;
};

export function MenuItemEditForm({
  children,
  className,
  action,
  itemProfile,
  brandRequired,
  modalToggleId,
}: Props) {
  const [pending, setPending] = useState(false);
  const photosInOptions =
    itemProfile.productOptions &&
    (itemProfile.isFashionLike || itemProfile.isElectronicsLike);

  function closeModal() {
    if (!modalToggleId) return;
    const toggle = document.getElementById(modalToggleId);
    if (toggle instanceof HTMLInputElement) toggle.checked = false;
  }

  return (
    <MenuItemEditPendingContext.Provider value={pending}>
      <ValidatedActionForm
        action={async (formData) => {
          saveMenuItemsScrollPosition();
          beginMenuItemsScrollHold();
          formData.set("list_query", window.location.search);
          try {
            await action(formData);
          } catch (err) {
            if (!isRedirectError(err)) {
              endMenuItemsScrollHold(0);
              throw err;
            }
            const toast = redirectToastFromError(err);
            if (toast && SAVED_TOASTS.has(toast)) closeModal();
            throw err;
          }
          closeModal();
        }}
        className={className}
        alertHeading="Couldn’t save yet"
        onPendingChange={setPending}
        validate={(formData) =>
          validateMenuItemFormClient(formData, {
            brandRequired,
            isElectronics: itemProfile.isElectronicsLike,
            photosInOptions,
          })
        }
      >
        {children}
      </ValidatedActionForm>
    </MenuItemEditPendingContext.Provider>
  );
}

export function MenuItemEditSubmitButton({
  children,
  pendingLabel = "Saving changes…",
  className,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const pending = useContext(MenuItemEditPendingContext);
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className ?? ""} disabled:cursor-wait disabled:opacity-70`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
