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
    ? "mt-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80"
    : "mt-3 rounded-2xl bg-black/35 px-4 py-4 backdrop-blur-md sm:mt-4";

  const starBtnBase =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition hover:scale-105 active:scale-95 disabled:opacity-45 disabled:hover:scale-100";

  return (
    <div className={shell}>
      <div className="flex flex-col gap-3">
        <header className="min-w-0">
          <p
            className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
              isCart ? "text-slate-600" : "text-white/90"
            }`}
          >
            Rate this restaurant
          </p>
          <p className={`mt-1 text-xs leading-snug ${isCart ? "text-slate-500" : "text-white/70"}`}>
            Tap a star to save (you can change it anytime).
          </p>
        </header>

        <div
          className={`min-h-[1.5rem] text-sm leading-snug ${isCart ? "text-slate-600" : "text-white/85"}`}
        >
          {avgRating != null && ratingCount > 0 ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isCart
                  ? "border border-amber-200/90 bg-amber-50 text-amber-950"
                  : "bg-black/30 text-white"
              }`}
            >
              <svg
                className={`h-4 w-4 shrink-0 ${isCart ? "text-amber-500" : "text-amber-300"}`}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {avgRating.toFixed(1)}
              <span className={`font-normal ${isCart ? "text-amber-900/75" : "text-white/75"}`}>
                ({ratingCount})
              </span>
            </span>
          ) : (
            <span className={isCart ? "font-medium text-slate-600" : "font-medium text-white/85"}>
              No ratings yet — tap a star below.
            </span>
          )}
        </div>

        <div
          className={`flex w-full max-w-full flex-wrap justify-center gap-1 border-t pt-3 sm:justify-start ${
            isCart ? "border-slate-100" : "border-white/10"
          }`}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= highlight;
            return (
              <button
                key={n}
                type="button"
                disabled={pending}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                onClick={() => submit(n)}
                className={`${starBtnBase} ${
                  isCart
                    ? filled
                      ? "text-amber-500 hover:text-amber-400"
                      : "text-slate-400 hover:text-amber-400/90"
                    : filled
                      ? "text-amber-400 hover:text-amber-300"
                      : "text-white/50 hover:text-amber-200/90"
                }`}
                aria-label={`Rate ${n} out of 5`}
              >
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
