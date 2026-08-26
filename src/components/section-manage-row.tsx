"use client";

import { Check, Trash2 } from "lucide-react";
import { deleteCategoryAction, updateCategoryAction } from "@/app-actions/restaurant";
import { ConfirmDeleteForm } from "@/components/confirm-delete-form";
import { ValidatedActionForm } from "@/components/validated-action-form";

type Props = {
  category: {
    id: string;
    name: string;
  };
  rowBg?: string;
};

export function SectionManageRow({ category, rowBg = "bg-white" }: Props) {
  const formId = `update-category-${category.id}`;

  return (
    <tr className={`transition-colors hover:bg-violet-50/30 ${rowBg}`}>
      <td className="px-4 py-3">
        <input type="hidden" name="id" value={category.id} form={formId} />
        <input
          name="name"
          defaultValue={category.name}
          placeholder="Section name shown to customers"
          className="ui-input h-11 max-w-md"
          aria-label={`Section name for ${category.name}`}
          form={formId}
        />
      </td>
      <td className="w-[1%] whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-1.5">
          <ValidatedActionForm
            id={formId}
            action={updateCategoryAction}
            alertHeading="Couldn’t save section"
            validate={(formData) => {
              const name = String(formData.get("name") ?? "").trim();
              if (!name) return "Enter a section name before saving.";
              return null;
            }}
          >
            <button
              type="submit"
              title="Save section"
              aria-label={`Save ${category.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-600 transition hover:bg-violet-100 hover:text-violet-800"
            >
              <Check className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </button>
          </ValidatedActionForm>
          <ConfirmDeleteForm
            action={deleteCategoryAction}
            heading="Delete section?"
            message={`Please confirm deleting “${category.name}”. Items in this section may need to be moved first. This cannot be undone.`}
            confirmLabel="Yes, delete"
            triggerTitle="Delete section"
            triggerAriaLabel={`Delete ${category.name}`}
            triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
            hiddenFields={<input type="hidden" name="id" value={category.id} />}
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </ConfirmDeleteForm>
        </div>
      </td>
    </tr>
  );
}
