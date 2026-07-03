"use client";

import { Check, Trash2 } from "lucide-react";
import { ImageUploadField } from "@/components/image-upload-field";
import { deleteBrandAction, updateBrandAction } from "@/app-actions/restaurant";

type Props = {
  brand: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  rowBg?: string;
};

export function BrandManageRow({ brand, rowBg = "bg-white" }: Props) {
  const formId = `update-brand-${brand.id}`;

  return (
    <tr className={`align-top transition-colors hover:bg-violet-50/30 ${rowBg}`}>
      <td className="px-4 py-3.5">
        <form id={formId} action={updateBrandAction} className="hidden" aria-hidden>
          <input type="hidden" name="id" value={brand.id} />
          <input type="hidden" name="current_logo_url" value={brand.logo_url ?? ""} />
        </form>
        <ImageUploadField
          name="logo_file"
          label=""
          uploadAriaLabel={`Change logo for ${brand.name}`}
          initialImageUrl={brand.logo_url}
          optional
          compact
          formId={formId}
        />
      </td>
      <td className="px-4 py-3.5">
        <label className="block space-y-1" htmlFor={`brand-name-${brand.id}`}>
          <span className="sr-only">Brand name for {brand.name}</span>
          <input
            id={`brand-name-${brand.id}`}
            name="name"
            required
            defaultValue={brand.name}
            placeholder="Brand name shown to customers"
            className="ui-input max-w-md"
            form={formId}
          />
        </label>
      </td>
      <td className="w-[1%] whitespace-nowrap px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <button
            type="submit"
            form={formId}
            title={`Save ${brand.name}`}
            aria-label={`Save ${brand.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-600 transition hover:bg-violet-100 hover:text-violet-800"
          >
            <Check className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </button>
          <form action={deleteBrandAction}>
            <input type="hidden" name="id" value={brand.id} />
            <button
              type="submit"
              title={`Delete ${brand.name}`}
              aria-label={`Delete ${brand.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
