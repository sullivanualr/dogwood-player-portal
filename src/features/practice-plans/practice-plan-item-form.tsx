import {
  createPracticePlanItem,
  updatePracticePlanItem
} from "@/features/practice-plans/actions";
import type { PracticePlanItem } from "@/features/practice-plans/queries";

const inputClassName =
  "mt-2 w-full rounded-md border border-dogwood-green/20 bg-white px-3 py-2 text-sm text-dogwood-ink outline-none focus:border-dogwood-leaf focus:ring-2 focus:ring-dogwood-leaf/20";
const labelClassName = "text-sm font-medium text-dogwood-ink";

export function PracticePlanItemForm({
  studentId,
  planId,
  item
}: {
  studentId: string;
  planId: string;
  item?: PracticePlanItem;
}) {
  const isEditing = Boolean(item);

  return (
    <form
      action={isEditing ? updatePracticePlanItem : createPracticePlanItem}
      className="grid gap-4"
    >
      <input name="studentId" type="hidden" value={studentId} />
      <input name="planId" type="hidden" value={planId} />
      {item ? <input name="itemId" type="hidden" value={item.id} /> : null}

      <div>
        <label
          className={labelClassName}
          htmlFor={`${item?.id ?? `${planId}-new`}-item-title`}
        >
          Title
        </label>
        <input
          className={inputClassName}
          defaultValue={item?.title}
          id={`${item?.id ?? `${planId}-new`}-item-title`}
          name="itemTitle"
          required
          type="text"
        />
      </div>

      <div>
        <label
          className={labelClassName}
          htmlFor={`${item?.id ?? `${planId}-new`}-instructions`}
        >
          Instructions
        </label>
        <textarea
          className={`${inputClassName} min-h-24`}
          defaultValue={item?.instructions ?? ""}
          id={`${item?.id ?? `${planId}-new`}-instructions`}
          name="instructions"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            className={labelClassName}
            htmlFor={`${item?.id ?? `${planId}-new`}-duration`}
          >
            Duration minutes
          </label>
          <input
            className={inputClassName}
            defaultValue={item?.duration_minutes ?? ""}
            id={`${item?.id ?? `${planId}-new`}-duration`}
            min={0}
            name="durationMinutes"
            type="number"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${item?.id ?? `${planId}-new`}-frequency`}
          >
            Frequency
          </label>
          <input
            className={inputClassName}
            defaultValue={item?.frequency ?? ""}
            id={`${item?.id ?? `${planId}-new`}-frequency`}
            name="frequency"
            type="text"
          />
        </div>

        <div>
          <label
            className={labelClassName}
            htmlFor={`${item?.id ?? `${planId}-new`}-sort-order`}
          >
            Sort order
          </label>
          <input
            className={inputClassName}
            defaultValue={item?.sort_order ?? 0}
            id={`${item?.id ?? `${planId}-new`}-sort-order`}
            name="sortOrder"
            type="number"
          />
        </div>
      </div>

      <div>
        <button
          className="rounded-md bg-dogwood-green px-4 py-2 text-sm font-medium text-white"
          type="submit"
        >
          {isEditing ? "Save item" : "Add item"}
        </button>
      </div>
    </form>
  );
}
