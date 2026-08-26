"use client";

import type { ReactNode } from "react";
import { ValidatedActionForm } from "@/components/validated-action-form";
import { validateMenuItemFormClient } from "@/lib/menu-item-form-validation";
import type { StoreItemProfile } from "@/lib/store-item-profile";

type Props = {
  children: ReactNode;
  className?: string;
  action: (formData: FormData) => void | Promise<void>;
  itemProfile: StoreItemProfile;
  brandRequired: boolean;
};

export function MenuItemEditForm({
  children,
  className,
  action,
  itemProfile,
  brandRequired,
}: Props) {
  const photosInOptions =
    itemProfile.productOptions &&
    (itemProfile.isFashionLike || itemProfile.isElectronicsLike);

  return (
    <ValidatedActionForm
      action={action}
      className={className}
      alertHeading="Couldn’t save yet"
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
  );
}
