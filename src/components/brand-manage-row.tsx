"use client";

import { ImageUploadField } from "@/components/image-upload-field";
import { deleteBrandAction, updateBrandAction } from "@/app-actions/restaurant";

type Props = {
  brand: {
    id: string;
    name: string;
    logo_url: string | null;
  };
};

export function BrandManageRow({ brand }: Props) {
  const formId = `update-brand-${brand.id}`;

  return (
    <tr className="align-top">
      <td className="px-4 py-4">
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
      <td className="px-4 py-4">
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
      <td className="w-[1%] whitespace-nowrap px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            type="submit"
            form={formId}
            title={`Save ${brand.name}`}
            aria-label={`Save ${brand.name}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm text-white shadow-sm transition hover:bg-violet-700"
          >
            💾
          </button>
          <form action={deleteBrandAction}>
            <input type="hidden" name="id" value={brand.id} />
            <button
              type="submit"
              title={`Delete ${brand.name}`}
              aria-label={`Delete ${brand.name}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm text-white shadow-sm transition hover:bg-red-700"
            >
              🗑
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
