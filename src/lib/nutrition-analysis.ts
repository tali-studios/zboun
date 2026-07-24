import { z } from "zod";

const nutrientSchema = z.object({
  estimate: z.number().nonnegative(),
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
});

export const nutritionEstimateSchema = z.object({
  dishName: z.string().min(1).max(120),
  summary: z.string().min(1).max(300),
  servingSize: z.string().min(1).max(120),
  calories: nutrientSchema,
  proteinGrams: nutrientSchema,
  carbsGrams: nutrientSchema,
  fatGrams: nutrientSchema,
  confidence: z.enum(["low", "medium", "high"]),
  detectedItems: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        portion: z.string().min(1).max(100),
      }),
    )
    .max(12),
  assumptions: z.array(z.string().min(1).max(180)).max(8),
  followUpQuestion: z.string().max(180).nullable(),
});

export type NutritionEstimate = z.infer<typeof nutritionEstimateSchema>;

export const nutritionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "dishName",
    "summary",
    "servingSize",
    "calories",
    "proteinGrams",
    "carbsGrams",
    "fatGrams",
    "confidence",
    "detectedItems",
    "assumptions",
    "followUpQuestion",
  ],
  properties: {
    dishName: { type: "string" },
    summary: { type: "string" },
    servingSize: { type: "string" },
    calories: { $ref: "#/$defs/nutrient" },
    proteinGrams: { $ref: "#/$defs/nutrient" },
    carbsGrams: { $ref: "#/$defs/nutrient" },
    fatGrams: { $ref: "#/$defs/nutrient" },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    detectedItems: {
      type: "array",
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "portion"],
        properties: {
          name: { type: "string" },
          portion: { type: "string" },
        },
      },
    },
    assumptions: {
      type: "array",
      maxItems: 8,
      items: { type: "string" },
    },
    followUpQuestion: { type: ["string", "null"] },
  },
  $defs: {
    nutrient: {
      type: "object",
      additionalProperties: false,
      required: ["estimate", "min", "max"],
      properties: {
        estimate: { type: "number", minimum: 0 },
        min: { type: "number", minimum: 0 },
        max: { type: "number", minimum: 0 },
      },
    },
  },
} as const;
