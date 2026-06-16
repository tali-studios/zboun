"use client";

import { deleteCategoryAction, updateCategoryAction } from "@/app-actions/restaurant";

type Props = {
  category: {
    id: string;
    name: string;
  };
};

export function SectionManageRow({ category }: Props) {
  const formId = `update-category-${category.id}`;

  return (
    <tr>
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
        <div className="flex items-center gap-2">
          <form id={formId} action={updateCategoryAction}>
            <button
              type="submit"
              title="Save section"
              aria-label={`Save ${category.name}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm text-white shadow-sm transition hover:bg-violet-700"
            >
              💾
            </button>
          </form>
          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              title="Delete section"
              aria-label={`Delete ${category.name}`}
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
