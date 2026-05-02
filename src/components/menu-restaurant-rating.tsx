"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyRestaurantRatingAction, submitRestaurantRatingAction } from "@/app-actions/restaurant-rating";

const RATER_LS = "zboun_rater_id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ensureRaterId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(RATER_LS);
  if (!id || !UUID_RE.test(id)) {
    id = crypto.randomUUID();
    localStorage.setItem(RATER_LS, id);
  }
  return id;
}

type Props = {
  restaurantId: string;
  slug: string;
  avgRating: number | null;
  ratingCount: number;
  /** `cart` = light panel to match checkout / confirm card */
  variant?: "hero" | "cart";
};

export function MenuRestaurantRating({
  restaurantId,
  slug,
  avgRating,
  ratingCount,
  variant = "hero",
}: Props) {
  const router = useRouter();
  const [mine, setMine] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const rid = ensureRaterId();
    if (!rid) return;
    void getMyRestaurantRatingAction(restaurantId, rid).then(setMine);
  }, [restaurantId]);

  async function submit(value: number) {
    const rid = ensureRaterId();
    if (!rid) return;
    setPending(true);
    const fd = new FormData();
    fd.set("restaurant_id", restaurantId);
    fd.set("slug", slug);
    fd.set("rater_id", rid);
    fd.set("rating", String(value));
    const res = await submitRestaurantRatingAction(fd);
    setPending(false);
    if (res.ok) {
      setMine(value);
      router.refresh();
    } else {
      window.alert("Could not save your rating. Please try again.");
    }
  }

  const highlight = hover ?? mine ?? 0;

  const isCart = variant === "cart";

  const shell = isCart
    ? "mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
    : "mt-3 rounded-2xl bg-black/35 px-3 py-3 backdrop-blur-md sm:mt-4 sm:px-4";

  return (
    <div className={shell}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {avgRating != null && ratingCount > 0 ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isCart
                  ? "border border-amber-200 bg-amber-50 text-amber-950"
                  : "bg-black/30 text-white"
              }`}
            >
              <svg
                className={`h-4 w-4 ${isCart ? "text-amber-500" : "text-amber-300"}`}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {avgRating.toFixed(1)}
              <span className={`font-normal ${isCart ? "text-amber-800/80" : "text-white/75"}`}>
                ({ratingCount})
              </span>
            </span>
          ) : (
            <span className={`text-xs font-medium ${isCart ? "text-slate-600" : "text-white/80"}`}>
              No ratings yet — tap a star below.
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 sm:max-w-md">
          <p
            className={`text-[11px] font-bold uppercase tracking-wide ${
              isCart ? "text-slate-500" : "text-white/85"
            }`}
          >
            Rate this restaurant
          </p>
          <p className={`mt-0.5 text-[11px] ${isCart ? "text-slate-500" : "text-white/65"}`}>
            Tap a star to save (you can change it anytime).
          </p>
          <div className="mt-2 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                disabled={pending}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                onClick={() => submit(n)}
                className={`rounded-md p-1 transition hover:scale-110 disabled:opacity-50 ${
                  isCart ? "text-amber-400" : "text-amber-300"
                }`}
                aria-label={`Rate ${n} out of 5`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-8 w-8 sm:h-7 sm:w-7 ${
                    n <= highlight
                      ? "fill-current"
                      : isCart
                        ? "fill-slate-200"
                        : "fill-white/25"
                  }`}
                  aria-hidden
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
