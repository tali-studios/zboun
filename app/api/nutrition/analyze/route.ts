import { NextResponse } from "next/server";
import { z } from "zod";
import {
  nutritionEstimateSchema,
  nutritionJsonSchema,
} from "@/lib/nutrition-analysis";

export const runtime = "nodejs";

const requestSchema = z
  .object({
    text: z.string().trim().max(800).optional(),
    imageDataUrl: z
      .string()
      .max(5_000_000)
      .regex(/^data:image\/(?:jpeg|png|webp);base64,/)
      .optional(),
  })
  .refine((value) => value.text || value.imageDataUrl, {
    message: "Add a food photo or description.",
  });

type RateEntry = { count: number; resetAt: number };
const rateLimits = new Map<string, RateEntry>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 12;

function requestIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = rateLimits.get(ip);
  if (!current || current.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_MAX;
}

const SYSTEM_PROMPT = `You are Zboun Nutrition AI, a cautious food nutrition estimator.
Analyze a food photo and/or text description. Estimate the visible meal's calories and macros.

Rules:
- Never claim exactness. Portion size, cooking fat, sauces, fillings, and hidden ingredients may be unknown.
- Use realistic nutrition references and return an estimate plus a plausible min/max range.
- If the image is not food or is too unclear, use low confidence, explain that briefly, and ask for a clearer photo or description.
- Do not diagnose, prescribe, or give medical advice.
- Keep detected items and assumptions concise.
- Round calories to whole kcal and macro grams to one decimal place.
- min must be <= estimate and estimate must be <= max.
- If the user provides package nutrition-label facts, prioritize those facts.
- Return only the requested JSON structure.`;

export async function POST(request: Request) {
  if (isRateLimited(requestIp(request))) {
    return NextResponse.json(
      { error: "Too many scans. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Nutrition AI is not configured yet." },
      { status: 503 },
    );
  }

  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Add a valid food photo or description." },
      { status: 400 },
    );
  }

  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string; detail: "low" | "high" } }
  > = [
    {
      type: "text",
      text:
        input.text ||
        "Estimate the nutrition in this food photo. Identify each visible item and its likely portion.",
    },
  ];

  if (input.imageDataUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: input.imageDataUrl, detail: "high" },
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_NUTRITION_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 1000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "nutrition_estimate",
            strict: true,
            schema: nutritionJsonSchema,
          },
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });

    const payload = (await response.json()) as {
      error?: { message?: string };
      choices?: Array<{ message?: { content?: string; refusal?: string } }>;
    };

    if (!response.ok) {
      console.error("[api/nutrition/analyze] provider", response.status, payload.error?.message);
      const providerMessage = (payload.error?.message || "").toLowerCase();
      if (response.status === 429 || providerMessage.includes("quota")) {
        return NextResponse.json(
          {
            error:
              "OpenAI quota exceeded. Add billing credits at platform.openai.com/settings/organization/billing, then try again.",
          },
          { status: 429 },
        );
      }
      if (response.status === 401) {
        return NextResponse.json(
          { error: "OpenAI API key is invalid. Check OPENAI_API_KEY in .env.local." },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { error: "The nutrition scan is temporarily unavailable." },
        { status: 502 },
      );
    }

    const message = payload.choices?.[0]?.message;
    if (message?.refusal) {
      return NextResponse.json(
        { error: "This image or request could not be analyzed." },
        { status: 422 },
      );
    }

    const parsed = nutritionEstimateSchema.safeParse(
      JSON.parse(message?.content || "{}"),
    );
    if (!parsed.success) {
      console.error("[api/nutrition/analyze] invalid response", parsed.error.flatten());
      return NextResponse.json(
        { error: "The nutrition estimate could not be read. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ estimate: parsed.data });
  } catch (error) {
    console.error("[api/nutrition/analyze]", error);
    return NextResponse.json(
      { error: "The nutrition scan timed out. Please try again." },
      { status: 504 },
    );
  }
}
