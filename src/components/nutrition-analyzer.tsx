"use client";

import Image from "next/image";
import {
  Camera,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import type { NutritionEstimate } from "@/lib/nutrition-analysis";

type Mode = "photo" | "text";

const EXAMPLES = [
  "2 eggs, avocado toast, and a small latte",
  "Chicken shawarma plate with fries and garlic sauce",
  "One bowl of lentil soup and half a pita",
];

async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Photo must be under 12 MB.");

  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read this photo."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = document.createElement("img");
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Could not open this photo."));
    element.src = source;
  });

  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare this photo.");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

function rangeLabel(value: { min: number; max: number }, unit: string) {
  return `${Math.round(value.min)}–${Math.round(value.max)} ${unit}`;
}

export function NutritionAnalyzer() {
  const [mode, setMode] = useState<Mode>("photo");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [estimate, setEstimate] = useState<NutritionEstimate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);

  const chooseImage = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setEstimate(null);
    setPreparing(true);
    try {
      setImageDataUrl(await compressImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use this photo.");
    } finally {
      setPreparing(false);
    }
  };

  const analyze = async () => {
    if (!imageDataUrl && !description.trim()) {
      setError("Take a food photo or describe what you ate.");
      return;
    }

    setLoading(true);
    setError("");
    setEstimate(null);
    try {
      const response = await fetch("/api/nutrition/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: imageDataUrl || undefined,
          text: description.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as {
        estimate?: NutritionEstimate;
        error?: string;
      };
      if (!response.ok || !payload.estimate) {
        throw new Error(payload.error || "Could not estimate this meal.");
      }
      setEstimate(payload.estimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not estimate this meal.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageDataUrl(null);
    setDescription("");
    setEstimate(null);
    setError("");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-500 p-5 text-white shadow-xl shadow-violet-500/20 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-100">
          Zboun Nutrition AI
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
          Snap it. Know what&apos;s in it.
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-violet-100 sm:text-base">
          Take a food photo or describe your meal for an instant calorie and protein estimate.
        </p>
      </section>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("photo")}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
              mode === "photo"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Camera className="h-4 w-4" />
            Food photo
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition ${
              mode === "text"
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Send className="h-4 w-4" />
            Ask AI
          </button>
        </div>

        {mode === "photo" ? (
          <div className="mt-5">
            {imageDataUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                <Image
                  src={imageDataUrl}
                  alt="Food selected for nutrition analysis"
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 720px"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageDataUrl(null);
                    setEstimate(null);
                  }}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/75"
                  aria-label="Remove photo"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 px-4 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                  {preparing ? (
                    <LoaderCircle className="h-7 w-7 animate-spin" />
                  ) : (
                    <Camera className="h-7 w-7" />
                  )}
                </div>
                <p className="mt-3 font-bold text-slate-900">Show us your plate</p>
                <p className="mt-1 text-xs text-slate-500">
                  A clear, top-down photo gives the best estimate.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700">
                    <Camera className="h-4 w-4" />
                    Take photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={(event) => {
                        void chooseImage(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                    <ImagePlus className="h-4 w-4 text-violet-600" />
                    Upload
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        void chooseImage(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            <label className="mt-4 block">
              <span className="text-xs font-bold text-slate-700">
                Add details for a better estimate <span className="font-medium text-slate-400">(optional)</span>
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, 800))}
                maxLength={800}
                rows={3}
                placeholder="Example: grilled chicken, dressing on the side, plate is about 25 cm wide…"
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </label>
          </div>
        ) : (
          <div className="mt-5">
            <label className="block">
              <span className="text-sm font-bold text-slate-900">What did you eat?</span>
              <textarea
                autoFocus
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, 800))}
                maxLength={800}
                rows={5}
                placeholder="Describe the food, portions, cooking method, sauces, and drinks…"
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setDescription(example)}
                  className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-left text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {error ? (
          <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void analyze()}
          disabled={loading || preparing}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Analyzing your meal…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Estimate nutrition
            </>
          )}
        </button>
      </div>

      {estimate ? (
        <section className="mt-5 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
                Estimated nutrition
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900">{estimate.dishName}</h2>
              <p className="mt-1 text-sm text-slate-500">{estimate.servingSize}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                estimate.confidence === "high"
                  ? "bg-emerald-50 text-emerald-700"
                  : estimate.confidence === "medium"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
              }`}
            >
              {estimate.confidence} confidence
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Calories", value: Math.round(estimate.calories.estimate), unit: "kcal", range: estimate.calories },
              { label: "Protein", value: Math.round(estimate.proteinGrams.estimate * 10) / 10, unit: "g", range: estimate.proteinGrams },
              { label: "Carbs", value: Math.round(estimate.carbsGrams.estimate * 10) / 10, unit: "g", range: estimate.carbsGrams },
              { label: "Fat", value: Math.round(estimate.fatGrams.estimate * 10) / 10, unit: "g", range: estimate.fatGrams },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 p-3.5">
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                  {item.value}
                  <span className="ml-1 text-xs font-bold text-slate-500">{item.unit}</span>
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  likely {rangeLabel(item.range, item.unit)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">{estimate.summary}</p>

          {estimate.detectedItems.length ? (
            <div className="mt-5">
              <h3 className="text-sm font-black text-slate-900">What AI counted</h3>
              <div className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-100">
                {estimate.detectedItems.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <span className="text-right text-xs text-slate-500">{item.portion}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {estimate.assumptions.length ? (
            <div className="mt-4 rounded-2xl bg-amber-50 p-3.5">
              <p className="text-xs font-black text-amber-800">Assumptions</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-amber-800/80">
                {estimate.assumptions.map((assumption, index) => (
                  <li key={`${assumption}-${index}`}>{assumption}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {estimate.followUpQuestion ? (
            <button
              type="button"
              onClick={() => {
                setDescription(estimate.followUpQuestion || "");
                setMode("text");
                setEstimate(null);
                window.scrollTo({ top: 150, behavior: "smooth" });
              }}
              className="mt-4 w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-left text-sm font-bold text-violet-800 transition hover:bg-violet-100"
            >
              Help AI improve it: {estimate.followUpQuestion}
            </button>
          ) : null}

          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Scan another meal
          </button>
        </section>
      ) : null}

      <p className="mx-auto mt-5 max-w-2xl text-center text-[11px] leading-relaxed text-slate-400">
        AI nutrition results are estimates, not medical advice. Portions, oils, sauces, and hidden
        ingredients can significantly change the result. Photos are sent to an AI service for
        analysis, so do not upload sensitive images. Check product labels when accuracy matters.
      </p>
    </div>
  );
}
