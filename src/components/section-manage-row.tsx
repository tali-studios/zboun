"use client";

import { Check, Trash2 } from "lucide-react";
import { deleteCategoryAction, updateCategoryAction } from "@/app-actions/restaurant";

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
          className="ui-input max-w-md"
          aria-label={`Section name for ${category.name}`}
          form={formId}
        />
      </td>
      <td className="w-[1%] whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-1.5">
          <form id={formId} action={updateCategoryAction}>
            <button
              type="submit"
              title="Save section"
              aria-label={`Save ${category.name}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-600 transition hover:bg-violet-100 hover:text-violet-800"
            >
              <Check className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </button>
          </form>
          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              title="Delete section"
              aria-label={`Delete ${category.name}`}
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
