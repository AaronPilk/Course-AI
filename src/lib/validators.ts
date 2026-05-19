import { z } from "zod";

export const difficultyEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "mixed",
]);

export const createProjectSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().max(80).optional().nullable(),
  difficulty: difficultyEnum.optional().nullable(),
  audience: z.string().max(500).optional().nullable(),
  learning_goals: z.string().max(2000).optional().nullable(),
  tags: z.array(z.string().max(40)).max(20).optional().default([]),
  estimated_minutes: z.number().int().positive().max(100000).optional().nullable(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z
    .enum([
      "draft",
      "ingesting",
      "outline_ready",
      "generating",
      "review",
      "published",
      "archived",
    ])
    .optional(),
});

export const addUrlSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().max(300).optional(),
});

export const addTextSourceSchema = z.object({
  title: z.string().max(300),
  text: z.string().min(50).max(500_000),
  author: z.string().max(200).optional(),
  url: z.string().url().optional(),
  license: z.string().max(200).optional(),
});
